import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import {
  getDuffel,
  buildSlices,
  buildPassengers,
  parseDurationToMinutes,
  convertToTWD,
  getAirlineNameZh,
} from '@/lib/duffel';
import type { SearchRequest, FlightResult, RouteResult, SearchRoute } from '@/lib/types';

// 強制動態路由（不快取）
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body: SearchRequest = await request.json();

    // 驗證必要欄位
    if (!body.routes || body.routes.length === 0) {
      return Response.json(
        { success: false, error: '至少需要一個搜尋航線' },
        { status: 400 }
      );
    }
    if (!body.departureDate) {
      return Response.json(
        { success: false, error: '請選擇出發日期' },
        { status: 400 }
      );
    }
    if (body.tripType === 'roundtrip' && !body.returnDate) {
      return Response.json(
        { success: false, error: '來回行程需要選擇回程日期' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 1. 建立 search_session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('search_sessions')
      .insert({
        passenger_count: body.passengerCount,
        trip_type: body.tripType,
        cabin_class: body.cabinClass,
        departure_date: body.departureDate,
        return_date: body.returnDate || null,
      })
      .select()
      .single();

    if (sessionError || !session) {
      console.error('Failed to create search session:', sessionError);
      return Response.json(
        { success: false, error: '建立搜尋記錄失敗' },
        { status: 500 }
      );
    }

    // 2. 為每條航線建立 search_route
    const routeInserts = body.routes.map((route, index) => ({
      session_id: session.id,
      origin: route.origin,
      destination: route.destination,
      destination_city_zh: route.cityZh,
      sort_order: index,
    }));

    const { data: routes, error: routeError } = await supabaseAdmin
      .from('search_routes')
      .insert(routeInserts)
      .select();

    if (routeError || !routes) {
      console.error('Failed to create search routes:', routeError);
      return Response.json(
        { success: false, error: '建立搜尋航線失敗' },
        { status: 500 }
      );
    }

    // 3. 用 Promise.allSettled() 並行呼叫 Duffel API
    const duffelClient = getDuffel();
    const duffelPromises = routes.map((route: SearchRoute, index: number) => {
      const routeInput = body.routes[index];
      return duffelClient.offerRequests.create({
        slices: buildSlices(routeInput, body.departureDate, body.returnDate, body.tripType),
        passengers: buildPassengers(body.passengerCount),
        cabin_class: body.cabinClass,
        return_offers: true,
      });
    });

    const settledResults = await Promise.allSettled(duffelPromises);

    // 4. 處理每條航線的結果
    const results: RouteResult[] = [];

    for (let i = 0; i < settledResults.length; i++) {
      const settled = settledResults[i];
      const route = routes[i] as SearchRoute;

      if (settled.status === 'rejected') {
        console.error(`Route ${route.origin}->${route.destination} failed:`, settled.reason);
        results.push({
          route,
          flights: [],
          error: `查詢 ${route.origin} → ${route.destination} 失敗: ${settled.reason?.message || '未知錯誤'}`,
        });
        continue;
      }

      const offerRequest = settled.value.data;
      const offers = offerRequest.offers || [];

      // 按價格排序，取前 5 筆最便宜的
      const sortedOffers = offers
        .sort((a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount))
        .slice(0, 5);

      const flightResults: FlightResult[] = sortedOffers.map((offer) => {
        // 取第一個 slice 的資訊（去程）
        const firstSlice = offer.slices[0];
        const segments = firstSlice?.segments || [];
        const firstSegment = segments[0];
        const lastSegment = segments[segments.length - 1];

        // 航空公司資訊
        const carrier = firstSegment?.operating_carrier || firstSegment?.marketing_carrier;
        const airlineCode = carrier?.iata_code || 'ZZ';
        const flightNumber = `${firstSegment?.marketing_carrier?.iata_code || airlineCode}${firstSegment?.marketing_carrier_flight_number || ''}`;

        // 起降時間
        const departureTime = firstSegment?.departing_at || '';
        const arrivalTime = lastSegment?.arriving_at || '';

        // 飛行時長
        const durationMinutes = parseDurationToMinutes(firstSlice?.duration || null);

        // 票價
        const priceOriginal = parseFloat(offer.total_amount);
        const priceCurrency = offer.total_currency;
        const priceTwd = convertToTWD(priceOriginal, priceCurrency);

        // 行李資訊 - 從第一個 segment 的第一個 passenger 取得
        const passengerBaggages = firstSegment?.passengers?.[0]?.baggages || [];
        const checkedBaggage = passengerBaggages.find((b) => b.type === 'checked');
        const carryOnBaggage = passengerBaggages.find((b) => b.type === 'carry_on');

        // 碳排放
        const carbonEmissions = offer.total_emissions_kg
          ? parseFloat(offer.total_emissions_kg)
          : null;

        // 停靠次數
        const stops = segments.length - 1;

        return {
          id: '', // 由 Supabase 自動生成
          route_id: route.id,
          airline_code: airlineCode,
          airline_name_zh: getAirlineNameZh(airlineCode),
          flight_number: flightNumber,
          departure_time: departureTime,
          arrival_time: arrivalTime,
          flight_duration_minutes: durationMinutes,
          price_twd: priceTwd,
          price_currency_original: priceCurrency,
          price_original: priceOriginal,
          checked_baggage_kg: null, // Duffel baggages 只回傳 quantity，不一定有 weight
          checked_baggage_pieces: checkedBaggage?.quantity ?? null,
          carry_on_kg: null,
          carry_on_pieces: carryOnBaggage?.quantity ?? null,
          carbon_emissions_kg: carbonEmissions,
          stops,
          duffel_offer_id: offer.id,
          fetched_at: new Date().toISOString(),
        } as FlightResult;
      });

      // 5. 寫入 Supabase flight_results
      if (flightResults.length > 0) {
        const insertData = flightResults.map((f) => ({
          route_id: f.route_id,
          airline_code: f.airline_code,
          airline_name_zh: f.airline_name_zh,
          flight_number: f.flight_number,
          departure_time: f.departure_time,
          arrival_time: f.arrival_time,
          flight_duration_minutes: f.flight_duration_minutes,
          price_twd: f.price_twd,
          price_currency_original: f.price_currency_original,
          price_original: f.price_original,
          checked_baggage_kg: f.checked_baggage_kg,
          checked_baggage_pieces: f.checked_baggage_pieces,
          carry_on_kg: f.carry_on_kg,
          carry_on_pieces: f.carry_on_pieces,
          carbon_emissions_kg: f.carbon_emissions_kg,
          stops: f.stops,
          duffel_offer_id: f.duffel_offer_id,
        }));

        const { data: inserted, error: insertError } = await supabaseAdmin
          .from('flight_results')
          .insert(insertData)
          .select();

        if (insertError) {
          console.error('Failed to insert flight results:', insertError);
        }

        // 用 Supabase 回傳的含 id 資料更新結果
        if (inserted) {
          results.push({ route, flights: inserted as FlightResult[] });
        } else {
          results.push({ route, flights: flightResults });
        }
      } else {
        results.push({
          route,
          flights: [],
          error: `${route.origin} → ${route.destination} 沒有找到符合條件的航班`,
        });
      }
    }

    return Response.json({
      success: true,
      sessionId: session.id,
      results,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '伺服器錯誤',
      },
      { status: 500 }
    );
  }
}
