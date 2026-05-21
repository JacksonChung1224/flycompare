import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import { addDays, subDays, format, parseISO, startOfDay, endOfDay } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const dateStr = searchParams.get('date');
    const currentPriceStr = searchParams.get('currentPrice'); // 目前搜尋結果中的最低價

    if (!origin || !destination || !dateStr || !currentPriceStr) {
      return Response.json(
        { success: false, error: '缺少必要參數 (origin, destination, date, currentPrice)' },
        { status: 400 }
      );
    }

    const currentPrice = parseFloat(currentPriceStr);
    const targetDate = parseISO(dateStr);
    
    // 我們尋找目標日期前後 3 天的歷史搜尋紀錄
    const startDate = subDays(targetDate, 3);
    const endDate = addDays(targetDate, 3);

    const supabaseAdmin = createAdminClient();

    // 取得過去 14 天內，其他使用者查詢過的相同航線最低價
    // 注意：這裡使用 supabase 的 inner join 來過濾 search_routes
    const { data: flights, error } = await supabaseAdmin
      .from('flight_results')
      .select(`
        price_twd,
        departure_time,
        search_routes!inner(origin, destination)
      `)
      .eq('search_routes.origin', origin)
      .eq('search_routes.destination', destination)
      .gte('departure_time', startOfDay(startDate).toISOString())
      .lte('departure_time', endOfDay(endDate).toISOString())
      .gte('created_at', subDays(new Date(), 14).toISOString()) // 只參考近 14 天內的搜尋，確保票價時效性
      .order('price_twd', { ascending: true });

    if (error) {
      console.error('Error fetching price insights:', error);
      return Response.json({ success: false, error: '資料庫查詢失敗' }, { status: 500 });
    }

    if (!flights || flights.length === 0) {
      return Response.json({ success: true, insight: null, message: '無歷史數據' });
    }

    // 將資料依據「日期」分組，找出每一天的歷史最低價
    const dailyLowest = new Map<string, number>();

    flights.forEach((f: any) => {
      // departure_time 格式為 "2026-06-05T08:30:00"
      const dateKey = f.departure_time.split('T')[0];
      const price = f.price_twd;
      
      if (!dailyLowest.has(dateKey) || price < dailyLowest.get(dateKey)!) {
        dailyLowest.set(dateKey, price);
      }
    });

    // 尋找比目前查詢更便宜的日期 (至少要便宜 300 元才有提示的意義)
    const SIGNIFICANT_SAVINGS_THRESHOLD = 300;
    
    let bestAlternative = null;
    let maxSavings = 0;

    for (const [date, price] of Array.from(dailyLowest.entries())) {
      // 忽略原日期
      if (date === dateStr) continue;

      const savings = currentPrice - price;
      if (savings > SIGNIFICANT_SAVINGS_THRESHOLD && savings > maxSavings) {
        maxSavings = savings;
        bestAlternative = {
          date,
          price,
          savings,
        };
      }
    }

    if (bestAlternative) {
      return Response.json({
        success: true,
        insight: {
          originalDate: dateStr,
          originalPrice: currentPrice,
          alternativeDate: bestAlternative.date,
          alternativePrice: bestAlternative.price,
          savings: bestAlternative.savings,
        }
      });
    }

    return Response.json({ success: true, insight: null, message: '目前日期已是最佳價格' });

  } catch (error) {
    console.error('Price insights API error:', error);
    return Response.json(
      { success: false, error: '伺服器內部錯誤' },
      { status: 500 }
    );
  }
}
