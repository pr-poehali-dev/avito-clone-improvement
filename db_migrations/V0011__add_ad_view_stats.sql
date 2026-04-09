CREATE TABLE IF NOT EXISTS t_p16851207_avito_clone_improvem.ad_view_stats (
    id SERIAL PRIMARY KEY,
    ad_id INTEGER NOT NULL REFERENCES t_p16851207_avito_clone_improvem.ads(id),
    stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
    views_count INTEGER NOT NULL DEFAULT 0,
    UNIQUE(ad_id, stat_date)
);

CREATE INDEX IF NOT EXISTS idx_ad_view_stats_ad ON t_p16851207_avito_clone_improvem.ad_view_stats(ad_id);
