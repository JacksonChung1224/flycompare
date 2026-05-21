// src/lib/route-mapping.ts

// 台灣主要機場的直飛或常見航點對應表
// 'ALL' 代表不限制（大部分航班都會從桃園飛）
export const ROUTE_MAP: Record<string, string[] | 'ALL'> = {
  // 桃園 (TPE)
  'TPE': 'ALL',
  
  // 松山 (TSA) - 主要是東北亞與兩岸
  'TSA': ['HND', 'GMP', 'SHA', 'PVG', 'FOC', 'XMN', 'WUH', 'CTU'],
  
  // 高雄 (KHH)
  'KHH': [
    // 日本
    'NRT', 'KIX', 'OKA', 'FUK', 'NGO',
    // 韓國
    'ICN', 'GMP', 'PUS',
    // 港澳
    'HKG', 'MFM',
    // 東南亞
    'BKK', 'DMK', 'SGN', 'HAN', 'DAD', 'KUL', 'SIN', 'MNL', 'CEB',
    // 中國
    'PVG'
  ],
  
  // 台中 (RMQ)
  'RMQ': [
    'NRT', 'ICN', 'PUS', 'HKG', 'MFM', 'SGN', 'HAN', 'DAD'
  ]
};

/**
 * 判斷是否為建議的航線 (用於過濾熱門目的地清單)
 * @param origin 出發地代碼 (例如: RMQ)
 * @param destination 目的地代碼 (例如: NRT)
 * @returns 是否建議 (true/false)
 */
export function isRecommendedRoute(origin?: string, destination?: string): boolean {
  if (!origin || !destination) return true; // 如果其中一方尚未選擇，預設全部顯示

  const allowedDestinations = ROUTE_MAP[origin];
  if (!allowedDestinations) return true; // 如果出發地不在列表中，預設不限制
  if (allowedDestinations === 'ALL') return true;

  return allowedDestinations.includes(destination);
}
