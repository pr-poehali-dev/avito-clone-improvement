CREATE TABLE IF NOT EXISTS t_p16851207_avito_clone_improvem.viewed_ads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p16851207_avito_clone_improvem.users(id),
    ad_id INTEGER NOT NULL REFERENCES t_p16851207_avito_clone_improvem.ads(id),
    viewed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, ad_id)
);

CREATE INDEX IF NOT EXISTS idx_viewed_ads_user ON t_p16851207_avito_clone_improvem.viewed_ads(user_id);
CREATE INDEX IF NOT EXISTS idx_viewed_ads_viewed_at ON t_p16851207_avito_clone_improvem.viewed_ads(viewed_at);
