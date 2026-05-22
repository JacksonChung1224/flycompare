// ============================================================
// 全專案共用 TypeScript 型別定義
// ============================================================

// --- 資料庫型別 ---

export interface SearchSession {
  id: string;
  passenger_count: number;
  trip_type: 'oneway' | 'roundtrip';
  cabin_class: CabinClass;
  departure_date: string;
  return_date: string | null;
  created_at: string;
}

export interface SearchRoute {
  id: string;
  session_id: string;
  origin: string;
  destination: string;
  destination_city_zh: string;
  departure_date?: string;
  return_date?: string;
  sort_order: number;
}

export interface FlightResult {
  id: string;
  route_id: string;
  airline_code: string;
  airline_name_zh: string;
  flight_number: string;
  departure_time: string;
  arrival_time: string;
  flight_duration_minutes: number;
  price_twd: number;
  price_currency_original: string;
  price_original: number;
  checked_baggage_kg: number | null;
  checked_baggage_pieces: number | null;
  carry_on_kg: number | null;
  carry_on_pieces: number | null;
  carbon_emissions_kg: number | null;
  stops: number;
  duffel_offer_id: string;
  fetched_at: string;
  source: 'duffel' | 'serpapi';
}

// --- API 請求/回應型別 ---

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';
export type TripType = 'oneway' | 'roundtrip';

export interface RouteInput {
  origin: string;
  destination: string;
  cityZh: string;
  departureDate: string;
  returnDate?: string;
}

export interface SearchRequest {
  routes: RouteInput[];
  departureDate?: string;   // 保留作為向下相容 (舊的歷史紀錄)
  returnDate?: string;      // 保留作為向下相容
  passengerCount: number;
  cabinClass: CabinClass;
  tripType: TripType;
}

export interface RouteResult {
  route: SearchRoute;
  flights: FlightResult[];
  error?: string;
}

export interface SearchResponse {
  success: boolean;
  sessionId?: string;
  results?: RouteResult[];
  error?: string;
}

// --- 機場型別 ---

export interface Airport {
  code: string;
  nameZh: string;
  nameEn?: string;
  cityZh: string;
  cityEn?: string;
  countryZh: string;
  countryEn?: string;
  keywords?: string[];
}

// --- 前端狀態型別 ---

export interface RouteSearchState {
  routeId: string;
  origin: string;
  destination: string;
  cityZh: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  flights: FlightResult[];
  error?: string;
}

export interface CompareSelection {
  routeIndex: number;
  flight: FlightResult;
}
