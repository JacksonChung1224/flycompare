# FlyCompare — 機票多點統整比價平台

> 在單一畫面中同時搜尋並比較多個目的地的機票結果，不需跳頁、不需開其他分頁。

---

## ✨ 功能特色

- **多目的地並列比較** — 最多同時搜尋 6 條航線，結果並排呈現
- **即時航班資料** — 透過 Duffel API 取得真實航空公司即時票價
- **6 大指標卡片** — 航空公司、起降時間、飛行時長、票價（TWD）、行李額度、碳排放
- **航班比較功能** — 勾選任 2 張卡片，底部 Compare Bar 自動計算價差與時間差
- **機場自動補全** — 支援 50+ 熱門機場，中英文 / IATA 碼搜尋
- **Dark / Light 主題** — 預設深色模式，一鍵切換
- **RWD 響應式設計** — 桌面 3 欄 / 平板 2 欄 / 手機 1 欄
- **搜尋紀錄存檔** — Supabase 自動存檔每次搜尋結果

---

## 🛠️ 技術架構

| 層級 | 技術 |
|------|------|
| 前端框架 | Next.js 16 (App Router, Turbopack) |
| UI 元件 | Tailwind CSS v4 + shadcn/ui (base-ui) |
| 語言 | TypeScript |
| 機票 API | Duffel API (@duffel/api SDK) |
| 資料庫 | Supabase (PostgreSQL + RLS) |
| 部署 | Vercel |

---

## 📁 專案結構

```
src/
├── app/
│   ├── api/
│   │   ├── airports/search/route.ts   # 機場搜尋 API
│   │   └── flights/
│   │       ├── search/route.ts        # 航班搜尋 API（POST）
│   │       └── results/route.ts       # 結果查詢 API（GET）
│   ├── globals.css                     # 色票 + 主題
│   ├── layout.tsx                      # 全域 Layout
│   └── page.tsx                        # 主頁面
├── components/
│   ├── ui/                             # shadcn/ui 元件
│   ├── SearchForm.tsx                  # 搜尋表單（核心）
│   ├── FlightCard.tsx                  # 航班結果卡片
│   ├── ResultsGrid.tsx                 # 結果並列區
│   ├── CompareBar.tsx                  # 底部比較列
│   ├── SkeletonCard.tsx                # Loading 骨架屏
│   └── ThemeToggle.tsx                 # 主題切換按鈕
└── lib/
    ├── types.ts                        # TypeScript 型別定義
    ├── duffel.ts                       # Duffel Client + helpers
    ├── supabase.ts                     # Supabase Client
    ├── airports-data.ts                # 機場資料庫
    └── utils.ts                        # 工具函式
```

---

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

建立 `.env.local` 檔案：

```env
# Duffel API (server-side only)
DUFFEL_ACCESS_TOKEN=your_duffel_token_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. 設定 Supabase 資料表

在 Supabase Dashboard 的 SQL Editor 中執行以下 schema：

```sql
-- search_sessions
CREATE TABLE search_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  passenger_count INT NOT NULL DEFAULT 1,
  trip_type TEXT NOT NULL DEFAULT 'roundtrip',
  cabin_class TEXT NOT NULL DEFAULT 'economy',
  departure_date DATE NOT NULL,
  return_date DATE
);

-- search_routes
CREATE TABLE search_routes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES search_sessions(id) ON DELETE CASCADE,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  destination_city_zh TEXT,
  sort_order INT DEFAULT 0
);

-- flight_results
CREATE TABLE flight_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id UUID REFERENCES search_routes(id) ON DELETE CASCADE,
  airline_code TEXT NOT NULL,
  airline_name_zh TEXT,
  flight_number TEXT,
  departure_time TIMESTAMPTZ,
  arrival_time TIMESTAMPTZ,
  flight_duration_minutes INT,
  price_twd INT NOT NULL,
  price_currency_original TEXT,
  price_original NUMERIC,
  checked_baggage_kg INT,
  checked_baggage_pieces INT,
  carry_on_kg INT,
  carry_on_pieces INT,
  carbon_emissions_kg NUMERIC,
  stops INT DEFAULT 0,
  duffel_offer_id TEXT,
  fetched_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE search_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "anon_all" ON search_sessions FOR ALL USING (true);
CREATE POLICY "anon_all" ON search_routes FOR ALL USING (true);
CREATE POLICY "anon_all" ON flight_results FOR ALL USING (true);
```

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器前往 http://localhost:3000

---

## 🌐 部署至 Vercel

1. Push 至 GitHub
2. 在 Vercel Dashboard import 專案
3. 新增以下 Environment Variables：
   - `DUFFEL_ACCESS_TOKEN`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy

---

## 📝 匯率說明

本平台使用固定匯率將外幣轉換為新台幣顯示，支援 17 種常見幣別。
卡片中同時顯示原始幣別與金額以供參考。

| 幣別 | 匯率 (≈ TWD) |
|------|:---:|
| USD | 31 |
| EUR | 34 |
| JPY | 0.21 |
| KRW | 0.023 |
| GBP | 39 |
| SGD | 23 |
| THB | 0.87 |

---

## License

MIT
