import type { FlightResult, CabinClass, TripType } from './types';
import { convertToTWD, getAirlineNameZh } from './duffel';

// ============================================================
// SerpApi Google Flights 搜尋模組
// ============================================================

const SERPAPI_BASE_URL = 'https://serpapi.com/search.json';

/**
 * 將 SerpApi 的 cabin class 對應到 Google Flights 的 travel_class 數字
 */
function mapTravelClass(cabinClass: CabinClass): number {
  switch (cabinClass) {
    case 'economy': return 1;
    case 'premium_economy': return 2;
    case 'business': return 3;
    case 'first': return 4;
    default: return 1;
  }
}

function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  // 支援格式: "6:35 PM", "18:35", "下午6:35", "上午 6:35"
  const match = timeStr.match(/(?:(上午|下午)\s*)?(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
  if (!match) {
    console.warn(`Unrecognized time format from SerpApi: ${timeStr}`);
    return { hours: 0, minutes: 0 };
  }

  const zhPeriod = match[1]; // 上午 or 下午
  let hours = parseInt(match[2], 10);
  const minutes = parseInt(match[3], 10);
  const enPeriod = match[4]?.toUpperCase();

  const isPM = enPeriod === 'PM' || zhPeriod === '下午';
  const isAM = enPeriod === 'AM' || zhPeriod === '上午';

  if (isPM && hours !== 12) hours += 12;
  if (isAM && hours === 12) hours = 0;

  return { hours, minutes };
}

/**
 * 將 SerpApi 時間 + 基準日期 → ISO 8601 字串（當地時間）
 * 例: "6:35 PM" + "2026-05-30" → "2026-05-30T18:35:00"
 *
 * dayOffset 用於處理跨日航班
 */
function buildISOTime(dateStr: string, timeStr: string, dayOffset: number = 0): string {
  const { hours, minutes } = parseTimeString(timeStr);
  const date = new Date(`${dateStr}T00:00:00`);
  date.setDate(date.getDate() + dayOffset);

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(hours).padStart(2, '0');
  const min = String(minutes).padStart(2, '0');

  return `${y}-${m}-${d}T${h}:${min}:00`;
}

/**
 * 從 flight_number "BA 334" 提取航空公司 IATA 代碼 "BA"
 */
function extractAirlineCode(flightNumber: string): string {
  if (!flightNumber) return 'ZZ';
  // 格式可能是 "BA 334" 或 "CX0450"
  const match = flightNumber.match(/^([A-Z0-9]{2})\s*/);
  return match ? match[1] : flightNumber.slice(0, 2).toUpperCase();
}

/**
 * 計算抵達日期相對於出發日期的偏移天數
 * 基於出發時間 + 飛行總時長計算
 */
function calculateArrivalDayOffset(
  departureTimeStr: string,
  totalDurationMinutes: number
): number {
  const { hours, minutes } = parseTimeString(departureTimeStr);
  const depMinutesFromMidnight = hours * 60 + minutes;
  const arrMinutesFromMidnight = depMinutesFromMidnight + totalDurationMinutes;
  return Math.floor(arrMinutesFromMidnight / (24 * 60));
}

// ============================================================
// SerpApi 回應型別定義
// ============================================================
interface SerpApiAirport {
  name: string;
  id: string;
  time: string; // "6:35 PM"
}

interface SerpApiSegment {
  departure_airport: SerpApiAirport;
  arrival_airport: SerpApiAirport;
  duration: number; // minutes
  airline: string;
  airline_logo?: string;
  flight_number: string;
  travel_class: string;
  airplane?: string;
  legroom?: string;
  extensions?: string[];
  often_delayed_by_over_30_min?: boolean;
  overnight?: boolean;
}

interface SerpApiLayover {
  duration: number;
  name: string;
  id: string;
  overnight?: boolean;
}

interface SerpApiCarbonEmissions {
  this_flight: number; // grams
  typical_for_this_route: number;
  difference_percent: number;
}

interface SerpApiFlightGroup {
  flights: SerpApiSegment[];
  layovers?: SerpApiLayover[];
  total_duration: number; // minutes
  price: number;
  type?: string;
  airline_logo?: string;
  carbon_emissions?: SerpApiCarbonEmissions;
  departure_token?: string;
  extensions?: string[];
}

interface SerpApiResponse {
  best_flights?: SerpApiFlightGroup[];
  other_flights?: SerpApiFlightGroup[];
  price_insights?: {
    lowest_price: number;
    typical_price_range: [number, number];
  };
  search_metadata?: {
    status: string;
  };
  error?: string;
}

// ============================================================
// 主要搜尋函式
// ============================================================
export async function searchFlightsViaSerpApi(params: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  tripType: TripType;
  cabinClass: CabinClass;
  passengers: number;
  routeId: string;
}): Promise<FlightResult[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    console.warn('SERPAPI_API_KEY not set, skipping SerpApi search');
    return [];
  }

  try {
    // 建構 URL 參數
    const searchParams = new URLSearchParams({
      engine: 'google_flights',
      departure_id: params.origin,
      arrival_id: params.destination,
      outbound_date: params.departureDate,
      type: params.tripType === 'roundtrip' ? '1' : '2',
      travel_class: mapTravelClass(params.cabinClass).toString(),
      adults: params.passengers.toString(),
      currency: 'TWD',
      hl: 'zh-TW',
      api_key: apiKey,
    });

    if (params.tripType === 'roundtrip' && params.returnDate) {
      searchParams.set('return_date', params.returnDate);
    }

    const url = `${SERPAPI_BASE_URL}?${searchParams.toString()}`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(15000), // 15 秒超時
    });

    if (!response.ok) {
      console.error(`SerpApi HTTP error: ${response.status}`);
      return [];
    }

    const data: SerpApiResponse = await response.json();

    if (data.error) {
      console.error('SerpApi error:', data.error);
      return [];
    }

    // 合併 best_flights + other_flights
    const allFlights: SerpApiFlightGroup[] = [
      ...(data.best_flights || []),
      ...(data.other_flights || []),
    ];

    if (allFlights.length === 0) {
      return [];
    }

    // 轉換為 FlightResult 格式
    const results: FlightResult[] = allFlights
      .filter((fg) => fg.flights && fg.flights.length > 0 && fg.price)
      .map((fg) => {
        const firstSegment = fg.flights[0];
        const lastSegment = fg.flights[fg.flights.length - 1];

        // 航空公司
        const airlineCode = extractAirlineCode(firstSegment.flight_number);
        const flightNumber = firstSegment.flight_number.replace(/\s+/g, '');

        // 時間處理
        const departureTimeStr = firstSegment.departure_airport.time;
        const arrivalTimeStr = lastSegment.arrival_airport.time;

        // 計算抵達日偏移
        const arrivalDayOffset = calculateArrivalDayOffset(
          departureTimeStr,
          fg.total_duration
        );

        const departureTime = buildISOTime(params.departureDate, departureTimeStr, 0);
        const arrivalTime = buildISOTime(params.departureDate, arrivalTimeStr, arrivalDayOffset);

        // 票價（SerpApi 以 currency=TWD 回傳）
        const priceTwd = Math.round(fg.price);
        // 同時保留原始幣別資訊
        const priceOriginal = fg.price;

        // 碳排放（SerpApi 回傳單位為公克，轉為公斤）
        const carbonKg = fg.carbon_emissions?.this_flight
          ? Math.round(fg.carbon_emissions.this_flight / 1000)
          : null;

        // 停靠次數
        const stops = fg.flights.length - 1;

        return {
          id: '',
          route_id: params.routeId,
          airline_code: airlineCode,
          airline_name_zh: getAirlineNameZh(airlineCode),
          flight_number: flightNumber,
          departure_time: departureTime,
          arrival_time: arrivalTime,
          flight_duration_minutes: fg.total_duration,
          price_twd: priceTwd,
          price_currency_original: 'TWD',
          price_original: priceOriginal,
          checked_baggage_kg: null,
          checked_baggage_pieces: null,
          carry_on_kg: null,
          carry_on_pieces: null,
          carbon_emissions_kg: carbonKg,
          stops,
          duffel_offer_id: `serpapi_${flightNumber}_${params.departureDate}`,
          fetched_at: new Date().toISOString(),
          source: 'serpapi' as const,
        };
      });

    return results;
  } catch (error) {
    console.error('SerpApi search error:', error);
    return [];
  }
}
