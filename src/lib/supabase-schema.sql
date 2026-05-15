-- ============================================================
-- 機票比價平台 Supabase Schema
-- 三張資料表: search_sessions, search_routes, flight_results
-- ============================================================

-- 啟用 UUID 擴充（Supabase 預設已啟用，保險起見）
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 資料表 1: search_sessions（使用者搜尋記錄）
-- ============================================================
CREATE TABLE IF NOT EXISTS search_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  passenger_count INTEGER NOT NULL CHECK (passenger_count BETWEEN 1 AND 9),
  trip_type TEXT NOT NULL CHECK (trip_type IN ('oneway', 'roundtrip')),
  cabin_class TEXT NOT NULL CHECK (cabin_class IN ('economy', 'premium_economy', 'business', 'first')),
  departure_date DATE NOT NULL,
  return_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 資料表 2: search_routes（每次搜尋的多航線）
-- ============================================================
CREATE TABLE IF NOT EXISTS search_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES search_sessions(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  destination_city_zh TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- 索引：加速按 session_id 查詢
CREATE INDEX IF NOT EXISTS idx_search_routes_session_id ON search_routes(session_id);

-- ============================================================
-- 資料表 3: flight_results（航班結果）
-- ============================================================
CREATE TABLE IF NOT EXISTS flight_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES search_routes(id) ON DELETE CASCADE,
  airline_code TEXT NOT NULL,
  airline_name_zh TEXT NOT NULL,
  flight_number TEXT NOT NULL,
  departure_time TIMESTAMPTZ NOT NULL,
  arrival_time TIMESTAMPTZ NOT NULL,
  flight_duration_minutes INTEGER NOT NULL,
  price_twd INTEGER NOT NULL,
  price_currency_original TEXT NOT NULL,
  price_original NUMERIC NOT NULL,
  checked_baggage_kg INTEGER,
  checked_baggage_pieces INTEGER,
  carry_on_kg INTEGER,
  carry_on_pieces INTEGER,
  carbon_emissions_kg NUMERIC,
  stops INTEGER NOT NULL DEFAULT 0,
  duffel_offer_id TEXT NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 索引：加速按 route_id 查詢
CREATE INDEX IF NOT EXISTS idx_flight_results_route_id ON flight_results(route_id);

-- ============================================================
-- 啟用 Row Level Security (RLS)
-- ============================================================
ALTER TABLE search_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_results ENABLE ROW LEVEL SECURITY;

-- RLS 政策：允許匿名使用者讀取和插入
-- search_sessions
CREATE POLICY "Allow anonymous read search_sessions"
  ON search_sessions FOR SELECT
  TO anon USING (true);

CREATE POLICY "Allow anonymous insert search_sessions"
  ON search_sessions FOR INSERT
  TO anon WITH CHECK (true);

-- search_routes
CREATE POLICY "Allow anonymous read search_routes"
  ON search_routes FOR SELECT
  TO anon USING (true);

CREATE POLICY "Allow anonymous insert search_routes"
  ON search_routes FOR INSERT
  TO anon WITH CHECK (true);

-- flight_results
CREATE POLICY "Allow anonymous read flight_results"
  ON flight_results FOR SELECT
  TO anon USING (true);

CREATE POLICY "Allow anonymous insert flight_results"
  ON flight_results FOR INSERT
  TO anon WITH CHECK (true);

-- ============================================================
-- Seed Data：熱門航線參考
-- ============================================================
-- 注意：這些是參考用的範例航線，不是獨立資料表
-- 實際搜尋時由前端直接提供航線資訊
-- 以下 INSERT 僅供測試用途，需先有 search_session

-- 如需測試，可手動建立一筆 session 後插入：
-- INSERT INTO search_sessions (passenger_count, trip_type, cabin_class, departure_date)
-- VALUES (1, 'roundtrip', 'economy', '2025-07-01');
--
-- 然後用回傳的 session id 插入 routes：
-- INSERT INTO search_routes (session_id, origin, destination, destination_city_zh, sort_order) VALUES
--   ('<session_id>', 'TPE', 'NRT', '東京', 0),
--   ('<session_id>', 'TPE', 'KIX', '大阪', 1),
--   ('<session_id>', 'TPE', 'ICN', '首爾', 2),
--   ('<session_id>', 'TPE', 'BKK', '曼谷', 3),
--   ('<session_id>', 'TPE', 'SIN', '新加坡', 4);
