-- 請在 Supabase Dashboard 的 SQL Editor 中執行以下指令：

-- 1. 建立 user_favorites 資料表
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    flight_id TEXT NOT NULL,
    flight_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, flight_id)
);

-- 2. 開啟 RLS (Row Level Security)
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- 3. 設定存取政策：使用者只能看到、新增、刪除自己的收藏
CREATE POLICY "Users can view their own favorites" 
ON public.user_favorites FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorites" 
ON public.user_favorites FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" 
ON public.user_favorites FOR DELETE 
USING (auth.uid() = user_id);
