CREATE TABLE IF NOT EXISTS t_p16851207_avito_clone_improvem.subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p16851207_avito_clone_improvem.users(id),
    type VARCHAR(20) NOT NULL DEFAULT 'category',
    value VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, type, value)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON t_p16851207_avito_clone_improvem.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_type_value ON t_p16851207_avito_clone_improvem.subscriptions(type, value);
