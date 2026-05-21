import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabaseServer = await createClient();
    const { data: { user } } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient();

    // 取得 7 天內的紀錄，並依時間倒序
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: sessions, error } = await supabaseAdmin
      .from('search_sessions')
      .select(`
        id,
        created_at,
        passenger_count,
        trip_type,
        cabin_class,
        departure_date,
        return_date,
        search_routes (
          origin,
          destination,
          destination_city_zh,
          sort_order
        )
      `)
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(10); // 取最新的 10 筆

    if (error) {
      console.error('Failed to fetch history:', error);
      return NextResponse.json({ success: false, error: '資料庫讀取失敗' }, { status: 500 });
    }

    return NextResponse.json({ success: true, history: sessions });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json({ success: false, error: '伺服器錯誤' }, { status: 500 });
  }
}
