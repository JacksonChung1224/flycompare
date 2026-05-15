import { type NextRequest } from 'next/server';
import { AIRPORTS } from '@/lib/airports-data';

// 強制動態路由
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q')?.trim().toLowerCase() || '';

  if (!query) {
    // 沒有搜尋字時，回傳台灣機場 + 熱門目的地前 10 個
    const defaults = AIRPORTS.filter(
      (a) => a.countryZh === '台灣' || ['NRT', 'KIX', 'ICN', 'BKK', 'SIN', 'HKG'].includes(a.code)
    );
    return Response.json({ airports: defaults });
  }

  // 模糊搜尋：比對 IATA code、中文名、英文名、城市名、國家名
  const results = AIRPORTS.filter((airport) => {
    const searchFields = [
      airport.code.toLowerCase(),
      airport.nameZh,
      airport.nameEn.toLowerCase(),
      airport.cityZh,
      airport.cityEn.toLowerCase(),
      airport.countryZh,
      airport.countryEn.toLowerCase(),
    ];

    return searchFields.some((field) => field.includes(query));
  });

  return Response.json({ airports: results.slice(0, 15) });
}
