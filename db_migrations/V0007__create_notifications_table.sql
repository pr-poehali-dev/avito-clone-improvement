CREATE TABLE IF NOT EXISTS t_p16851207_avito_clone_improvem.notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p16851207_avito_clone_improvem.users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    ad_id INTEGER NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON t_p16851207_avito_clone_improvem.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON t_p16851207_avito_clone_improvem.notifications(user_id, is_read);
