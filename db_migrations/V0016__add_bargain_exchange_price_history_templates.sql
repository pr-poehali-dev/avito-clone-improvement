-- Поля торг/обмен в объявлениях
ALTER TABLE t_p16851207_avito_clone_improvem.ads
  ADD COLUMN IF NOT EXISTS bargain BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS exchange BOOLEAN DEFAULT FALSE;

-- История цен объявления
CREATE TABLE IF NOT EXISTS t_p16851207_avito_clone_improvem.price_history (
  id SERIAL PRIMARY KEY,
  ad_id INTEGER NOT NULL REFERENCES t_p16851207_avito_clone_improvem.ads(id),
  price INTEGER NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_price_history_ad ON t_p16851207_avito_clone_improvem.price_history(ad_id, changed_at DESC);

-- Шаблоны объявлений пользователя
CREATE TABLE IF NOT EXISTS t_p16851207_avito_clone_improvem.ad_templates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES t_p16851207_avito_clone_improvem.users(id),
  name VARCHAR(100) NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_ad_templates_user ON t_p16851207_avito_clone_improvem.ad_templates(user_id);

-- Верификация телефона
ALTER TABLE t_p16851207_avito_clone_improvem.users
  ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS phone_code VARCHAR(6),
  ADD COLUMN IF NOT EXISTS phone_code_expires TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
