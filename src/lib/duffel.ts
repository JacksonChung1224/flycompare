import { Duffel } from '@duffel/api';
import type { CabinClass, TripType, RouteInput } from './types';

// ============================================================
// Duffel Client 初始化（僅在 server-side 使用）
// 使用 lazy initialization 避免 build 時因缺少環境變數而報錯
// ============================================================
let _duffel: Duffel | null = null;

export function getDuffel(): Duffel {
  if (!_duffel) {
    const token = process.env.DUFFEL_ACCESS_TOKEN;
    if (!token) {
      throw new Error('DUFFEL_ACCESS_TOKEN is not set');
    }
    _duffel = new Duffel({ token });
  }
  return _duffel;
}

// ============================================================
// Helper: 建立 slices（航段）
// ============================================================
export function buildSlices(
  route: RouteInput,
  departureDate: string,
  returnDate: string | undefined,
  tripType: TripType
) {
  const slices: Array<{
    origin: string;
    destination: string;
    departure_date: string;
    arrival_time: null;
    departure_time: null;
  }> = [
    {
      origin: route.origin,
      destination: route.destination,
      departure_date: departureDate,
      arrival_time: null,
      departure_time: null,
    },
  ];

  if (tripType === 'roundtrip' && returnDate) {
    slices.push({
      origin: route.destination,
      destination: route.origin,
      departure_date: returnDate,
      arrival_time: null,
      departure_time: null,
    });
  }

  return slices;
}

// ============================================================
// Helper: 建立 passengers 陣列
// ============================================================
export function buildPassengers(count: number) {
  return Array.from({ length: count }, () => ({
    type: 'adult' as const,
  }));
}

// ============================================================
// Helper: ISO 8601 Duration → 分鐘
// 例: "PT2H30M" → 150, "PT14H5M" → 845
// ============================================================
export function parseDurationToMinutes(duration: string | null): number {
  if (!duration) return 0;

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  return hours * 60 + minutes;
}

// ============================================================
// Helper: 原始幣別轉換為 TWD
// 固定匯率（1 USD ≈ 31 TWD）
// ============================================================
const EXCHANGE_RATES: Record<string, number> = {
  USD: 31,
  EUR: 34,
  GBP: 39,
  JPY: 0.21,
  KRW: 0.023,
  THB: 0.87,
  SGD: 23,
  HKD: 4,
  AUD: 20,
  CAD: 23,
  CNY: 4.3,
  MYR: 7,
  PHP: 0.55,
  VND: 0.0013,
  IDR: 0.002,
  INR: 0.37,
  TWD: 1,
};

export function convertToTWD(amount: number, currency: string): number {
  const rate = EXCHANGE_RATES[currency.toUpperCase()] || 31; // 預設用 USD 匯率
  return Math.round(amount * rate);
}

// ============================================================
// Helper: 航空公司中文名稱對照表
// ============================================================
const AIRLINE_NAMES_ZH: Record<string, string> = {
  // 台灣航空公司
  CI: '中華航空',
  BR: '長榮航空',
  JX: '星宇航空',
  B7: '立榮航空',
  AE: '華信航空',
  IT: '台灣虎航',
  // 日本航空公司
  JL: '日本航空',
  NH: '全日空',
  MM: '樂桃航空',
  '7C': '濟州航空',
  BC: '天馬航空',
  // 韓國航空公司
  KE: '大韓航空',
  OZ: '韓亞航空',
  TW: '德威航空',
  LJ: '真航空',
  ZE: '易斯達航空',
  // 東南亞航空公司
  TG: '泰國航空',
  SQ: '新加坡航空',
  TR: '酷航',
  VJ: '越捷航空',
  VN: '越南航空',
  MH: '馬來西亞航空',
  AK: '亞洲航空',
  PR: '菲律賓航空',
  GA: '印尼嘉魯達航空',
  // 港澳中國航空公司
  CX: '國泰航空',
  HX: '香港航空',
  NX: '澳門航空',
  CA: '中國國際航空',
  MU: '中國東方航空',
  CZ: '中國南方航空',
  HU: '海南航空',
  '3U': '四川航空',
  // 其他常見航空公司
  EK: '阿聯酋航空',
  QR: '卡達航空',
  TK: '土耳其航空',
  LH: '漢莎航空',
  BA: '英國航空',
  AF: '法國航空',
  AA: '美國航空',
  UA: '聯合航空',
  DL: '達美航空',
  QF: '澳洲航空',
  // Duffel 測試航空公司
  ZZ: 'Duffel Airways',
};

export function getAirlineNameZh(iataCode: string): string {
  return AIRLINE_NAMES_ZH[iataCode] || iataCode;
}

// ============================================================
// Duffel cabin_class 對照
// ============================================================
export function mapCabinClass(cabinClass: CabinClass): 'economy' | 'premium_economy' | 'business' | 'first' {
  return cabinClass;
}
