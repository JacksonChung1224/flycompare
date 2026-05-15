import { type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase';
import type { SearchRoute, FlightResult, RouteResult } from '@/lib/types';

// 強制動態路由（不快取）
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    if (!sessionId) {
      return Response.json(
        { success: false, error: '缺少 sessionId 參數' },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // 取得 session 資訊
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('search_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return Response.json(
        { success: false, error: '找不到該搜尋記錄' },
        { status: 404 }
      );
    }

    // 取得所有 routes
    const { data: routes, error: routeError } = await supabaseAdmin
      .from('search_routes')
      .select('*')
      .eq('session_id', sessionId)
      .order('sort_order', { ascending: true });

    if (routeError || !routes) {
      return Response.json(
        { success: false, error: '取得航線資料失敗' },
        { status: 500 }
      );
    }

    // 取得每條航線的航班結果
    const results: RouteResult[] = [];

    for (const route of routes as SearchRoute[]) {
      const { data: flights, error: flightError } = await supabaseAdmin
        .from('flight_results')
        .select('*')
        .eq('route_id', route.id)
        .order('price_twd', { ascending: true });

      if (flightError) {
        console.error(`Failed to get flights for route ${route.id}:`, flightError);
        results.push({
          route,
          flights: [],
          error: '取得航班結果失敗',
        });
      } else {
        results.push({
          route,
          flights: (flights || []) as FlightResult[],
        });
      }
    }

    return Response.json({
      success: true,
      sessionId,
      results,
    });
  } catch (error) {
    console.error('Results API error:', error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '伺服器錯誤',
      },
      { status: 500 }
    );
  }
}
