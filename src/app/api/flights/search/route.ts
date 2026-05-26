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
import { searchFlightsViaSerpApi } from '@/lib/serpapi';
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
    if (body.routes.some((r) => !r.departureDate)) {
      return Response.json(
        { success: false, error: '所有航線都必須選擇出發日期' },
        { status: 400 }
      );
    }
    if (body.tripType === 'roundtrip' && body.routes.some((r) => !r.returnDate)) {
      return Response.json(
        { success: false, error: '來回行程的航線必須選擇回程日期' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();
    
    // 取得當前使用者 (來自 cookies)
    // 這裡我們不使用 supabaseAdmin 來取 auth，而是建立一個針對請求的 server client
    // 雖然 API route 內操作 Supabase 直接用 service role 也可，但要知道「是誰發出請求」，必須從 request headers/cookies 解析 token
    let userId = null;
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabaseServer = await createClient();
      const { data: { user } } = await supabaseServer.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch (e) {
      console.error('Failed to get user session:', e);
    }

    // 1. 建立 search_session
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('search_sessions')
      .insert({
        user_id: userId,
        passenger_count: body.passengerCount,
        trip_type: body.tripType,
        cabin_class: body.cabinClass,
        departure_date: body.routes[0].departureDate,
        return_date: body.routes[0].returnDate || null,
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
      departure_date: route.departureDate,
      return_date: route.returnDate || null,
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

    // 3. 用 Promise.allSettled() 並行處理所有航線
    const duffelClient = getDuffel();
    const results: RouteResult[] = [];

    // 平行處理所有航線，避免 for 迴圈阻塞
    const routePromises = routes.map(async (route: SearchRoute, index: number) => {
      const routeInput = body.routes[index];

      // Duffel Promise
      const duffelPromise = duffelClient.offerRequests.create({
        slices: buildSlices(routeInput, body.tripType),
        passengers: buildPassengers(body.passengerCount),
        cabin_class: body.cabinClass,
        return_offers: true,
      });

      // SerpApi Promise
      const serpapiPromise = searchFlightsViaSerpApi({
        origin: routeInput.origin,
        destination: routeInput.destination,
        departureDate: routeInput.departureDate,
        returnDate: routeInput.returnDate,
        tripType: body.tripType,
        cabinClass: body.cabinClass,
        passengers: body.passengerCount,
        routeId: route.id,
      });

      // 等待兩個來源
      const [duffelResult, serpapiResult] = await Promise.allSettled([
        duffelPromise,
        serpapiPromise,
      ]);

      let flightResults: FlightResult[] = [];

      // 處理 Duffel 結果
      if (duffelResult.status === 'fulfilled') {
        const offerRequest = duffelResult.value.data;
        const offers = offerRequest.offers || [];

        const duffelFlights: FlightResult[] = offers.map((offer) => {
          const firstSlice = offer.slices[0];
          const segments = firstSlice?.segments || [];
          const firstSegment = segments[0];
          const lastSegment = segments[segments.length - 1];

          const carrier = firstSegment?.operating_carrier || firstSegment?.marketing_carrier;
          const airlineCode = carrier?.iata_code || 'ZZ';
          const flightNumber = `${firstSegment?.marketing_carrier?.iata_code || airlineCode}${firstSegment?.marketing_carrier_flight_number || ''}`;

          const departureTime = firstSegment?.departing_at || '';
          const arrivalTime = lastSegment?.arriving_at || '';
          const durationMinutes = parseDurationToMinutes(firstSlice?.duration || null);

          const priceOriginal = parseFloat(offer.total_amount);
          const priceCurrency = offer.total_currency;
          const priceTwd = convertToTWD(priceOriginal, priceCurrency);

          const passengerBaggages = firstSegment?.passengers?.[0]?.baggages || [];
          const checkedBaggage = passengerBaggages.find((b) => b.type === 'checked');
          const carryOnBaggage = passengerBaggages.find((b) => b.type === 'carry_on');

          const carbonEmissions = offer.total_emissions_kg
            ? parseFloat(offer.total_emissions_kg)
            : null;

          const stops = segments.length - 1;

          let return_flight: any = undefined;
          if (offer.slices.length > 1) {
            const retSlice = offer.slices[1];
            const retSegments = retSlice.segments || [];
            if (retSegments.length > 0) {
              const firstRetSegment = retSegments[0];
              const lastRetSegment = retSegments[retSegments.length - 1];
              const retCarrier = firstRetSegment?.operating_carrier || firstRetSegment?.marketing_carrier;
              const retAirlineCode = retCarrier?.iata_code || 'ZZ';
              const retFlightNumber = `${firstRetSegment?.marketing_carrier?.iata_code || retAirlineCode}${firstRetSegment?.marketing_carrier_flight_number || ''}`.replace(/\s+/g, '');
              
              return_flight = {
                airline_code: retAirlineCode,
                airline_name_zh: getAirlineNameZh(retAirlineCode),
                flight_number: retFlightNumber,
                departure_time: firstRetSegment?.departing_at || '',
                arrival_time: lastRetSegment?.arriving_at || '',
                flight_duration_minutes: parseDurationToMinutes(retSlice?.duration || null),
                stops: retSegments.length - 1
              };
            }
          }

          return {
            id: '',
            route_id: route.id,
            airline_code: airlineCode,
            airline_name_zh: getAirlineNameZh(airlineCode),
            flight_number: flightNumber.replace(/\s+/g, ''),
            departure_time: departureTime,
            arrival_time: arrivalTime,
            flight_duration_minutes: durationMinutes,
            price_twd: priceTwd,
            price_currency_original: priceCurrency,
            price_original: priceOriginal,
            checked_baggage_kg: null,
            checked_baggage_pieces: checkedBaggage?.quantity ?? null,
            carry_on_kg: null,
            carry_on_pieces: carryOnBaggage?.quantity ?? null,
            carbon_emissions_kg: carbonEmissions,
            stops,
            return_flight,
            duffel_offer_id: offer.id,
            fetched_at: new Date().toISOString(),
            source: 'duffel' as const,
          };
        });

        flightResults = [...flightResults, ...duffelFlights];
      } else {
        console.error(`Duffel Route ${route.origin}->${route.destination} failed:`, duffelResult.reason);
      }

      // 處理 SerpApi 結果
      if (serpapiResult.status === 'fulfilled') {
        flightResults = [...flightResults, ...serpapiResult.value];
      } else {
        console.error(`SerpApi Route ${route.origin}->${route.destination} failed:`, serpapiResult.reason);
      }

      // 去重與排序 (以 航班編號 + 出發時間 為 key)
      const uniqueFlights = new Map<string, FlightResult>();
      for (const flight of flightResults) {
        // SerpApi 的時間字串可能會差個幾分鐘或格式些微不同，這裡只取日期+小時來簡化判斷
        const depTimePrefix = flight.departure_time.substring(0, 13); // "YYYY-MM-DDTHH"
        const key = `${flight.flight_number}_${depTimePrefix}`;
        
        if (!uniqueFlights.has(key)) {
          uniqueFlights.set(key, flight);
        } else {
          // 若重複，保留 Duffel (因為有行李、offer_id 可供後續訂票)
          const existing = uniqueFlights.get(key)!;
          if (existing.source === 'serpapi' && flight.source === 'duffel') {
            uniqueFlights.set(key, flight);
          }
        }
      }

      const sortedUniqueFlights = Array.from(uniqueFlights.values())
        .sort((a, b) => a.price_twd - b.price_twd)
        .slice(0, 10); // 取前 10 筆最便宜的

      if (sortedUniqueFlights.length > 0) {
        const insertData = sortedUniqueFlights.map((f) => ({
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
          source: f.source,
        }));

        const { data: inserted, error: insertError } = await supabaseAdmin
          .from('flight_results')
          .insert(insertData)
          .select();

        if (insertError) {
          console.error('Failed to insert flight results:', insertError);
        }

        return {
          route,
          flights: inserted ? (inserted as FlightResult[]) : sortedUniqueFlights,
        };
      } else {
        return {
          route,
          flights: [],
          error: `${route.origin} → ${route.destination} 沒有找到符合條件的航班`,
        };
      }
    });

    const settledRoutes = await Promise.allSettled(routePromises);
    for (const settled of settledRoutes) {
      if (settled.status === 'fulfilled') {
        results.push(settled.value);
      } else {
        results.push({
          route: routes[0], // fallback
          flights: [],
          error: '查詢該航線時發生內部錯誤',
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
