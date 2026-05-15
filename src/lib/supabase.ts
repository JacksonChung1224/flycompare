import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================
// Supabase Client（前端用，使用 anon key）
// 使用 lazy initialization 避免 build 時因缺少環境變數而報錯
// ============================================================
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    _supabase = createClient(url, anonKey);
  }
  return _supabase;
}

// 保持向後兼容的 export（用於前端元件）
export const supabase = typeof window !== 'undefined'
  ? (() => {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (url && anonKey) {
        return createClient(url, anonKey);
      }
      return null;
    })()
  : null;

// ============================================================
// Supabase Admin Client（後端用，使用 service role key）
// 僅在 server-side 使用，絕不暴露給前端
// ============================================================
export function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set');
  }
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
