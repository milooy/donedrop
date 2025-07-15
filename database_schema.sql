-- Supabase 데이터베이스 스키마 for donedrop
-- RLS (Row Level Security) 적용하여 사용자별 데이터 분리

-- 1. todos 테이블 (메인 할일들)
CREATE TABLE todos (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  color VARCHAR(10) NOT NULL CHECK (color IN ('yellow', 'pink', 'blue')),
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. inbox_todos 테이블 (인박스 할일들)
CREATE TABLE inbox_todos (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  color VARCHAR(10) NOT NULL CHECK (color IN ('yellow', 'pink', 'blue')),
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. completed_todos 테이블 (완료된 할일들)
CREATE TABLE completed_todos (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  color VARCHAR(10) NOT NULL CHECK (color IN ('yellow', 'pink', 'blue')),
  is_pinned BOOLEAN DEFAULT FALSE,
  pinned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. user_settings 테이블 (사용자 설정)
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_color VARCHAR(10) DEFAULT 'yellow' CHECK (selected_color IN ('yellow', 'pink', 'blue')),
  inbox_selected_color VARCHAR(10) DEFAULT 'yellow' CHECK (inbox_selected_color IN ('yellow', 'pink', 'blue')),
  coins INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. rituals 테이블 (리추얼 항목들)
CREATE TABLE rituals (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ritual_completions 테이블 (일별 리추얼 완료 기록)
CREATE TABLE ritual_completions (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed_ritual_ids BIGINT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- RLS 정책 설정
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE completed_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ritual_completions ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 조회/수정 가능
CREATE POLICY "Users can view own todos" ON todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own todos" ON todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own todos" ON todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own todos" ON todos FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own inbox_todos" ON inbox_todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own inbox_todos" ON inbox_todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own inbox_todos" ON inbox_todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own inbox_todos" ON inbox_todos FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own completed_todos" ON completed_todos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completed_todos" ON completed_todos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own completed_todos" ON completed_todos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own completed_todos" ON completed_todos FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own settings" ON user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own rituals" ON rituals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own rituals" ON rituals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rituals" ON rituals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own rituals" ON rituals FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own ritual_completions" ON ritual_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own ritual_completions" ON ritual_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ritual_completions" ON ritual_completions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ritual_completions" ON ritual_completions FOR DELETE USING (auth.uid() = user_id);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 설정
CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_inbox_todos_updated_at BEFORE UPDATE ON inbox_todos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rituals_updated_at BEFORE UPDATE ON rituals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ritual_completions_updated_at BEFORE UPDATE ON ritual_completions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();