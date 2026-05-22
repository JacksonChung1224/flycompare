import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, error: '未授權' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return Response.json({ success: true, favorites: data });
  } catch (error) {
    console.error('Failed to fetch favorites:', error);
    return Response.json({ success: false, error: '取得收藏失敗' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, error: '未授權' }, { status: 401 });
    }

    const body = await request.json();
    const { flight_id, flight_data } = body;

    if (!flight_id || !flight_data) {
      return Response.json({ success: false, error: '缺少必要欄位' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('user_favorites')
      .insert({
        user_id: user.id,
        flight_id,
        flight_data,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // unique violation
        return Response.json({ success: true, message: '已經收藏過了' });
      }
      throw error;
    }

    return Response.json({ success: true, favorite: data });
  } catch (error) {
    console.error('Failed to add favorite:', error);
    return Response.json({ success: false, error: '新增收藏失敗' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return Response.json({ success: false, error: '未授權' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const flight_id = searchParams.get('flight_id');

    if (!flight_id) {
      return Response.json({ success: false, error: '缺少 flight_id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', user.id)
      .eq('flight_id', flight_id);

    if (error) {
      throw error;
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to remove favorite:', error);
    return Response.json({ success: false, error: '移除收藏失敗' }, { status: 500 });
  }
}
