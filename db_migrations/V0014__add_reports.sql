CREATE TABLE IF NOT EXISTS t_p16851207_avito_clone_improvem.reports (
    id SERIAL PRIMARY KEY,
    reporter_id INTEGER NOT NULL REFERENCES t_p16851207_avito_clone_improvem.users(id),
    ad_id INTEGER NULL REFERENCES t_p16851207_avito_clone_improvem.ads(id),
    target_user_id INTEGER NULL REFERENCES t_p16851207_avito_clone_improvem.users(id),
    reason VARCHAR(100) NOT NULL,
    details TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    admin_reply TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON t_p16851207_avito_clone_improvem.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_ad ON t_p16851207_avito_clone_improvem.reports(ad_id);
