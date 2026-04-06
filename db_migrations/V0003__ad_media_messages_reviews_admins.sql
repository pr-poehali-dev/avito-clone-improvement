CREATE TABLE IF NOT EXISTS t_p16851207_avito_clone_improvem.ad_media (
    id SERIAL PRIMARY KEY,
    ad_id INTEGER NOT NULL REFERENCES t_p16851207_avito_clone_improvem.ads(id),
    url TEXT NOT NULL,
    media_type VARCHAR(10) NOT NULL DEFAULT 'photo',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS ad_media_ad_id_idx ON t_p16851207_avito_clone_improvem.ad_media(ad_id);

CREATE TABLE IF NOT EXISTS t_p16851207_avito_clone_improvem.messages (
    id SERIAL PRIMARY KEY,
    ad_id INTEGER REFERENCES t_p16851207_avito_clone_improvem.ads(id),
    sender_id INTEGER NOT NULL REFERENCES t_p16851207_avito_clone_improvem.users(id),
    receiver_id INTEGER NOT NULL REFERENCES t_p16851207_avito_clone_improvem.users(id),
    text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS messages_sender_idx ON t_p16851207_avito_clone_improvem.messages(sender_id);
CREATE INDEX IF NOT EXISTS messages_receiver_idx ON t_p16851207_avito_clone_improvem.messages(receiver_id);
CREATE INDEX IF NOT EXISTS messages_ad_idx ON t_p16851207_avito_clone_improvem.messages(ad_id);

CREATE TABLE IF NOT EXISTS t_p16851207_avito_clone_improvem.reviews (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL REFERENCES t_p16851207_avito_clone_improvem.users(id),
    target_user_id INTEGER NOT NULL REFERENCES t_p16851207_avito_clone_improvem.users(id),
    ad_id INTEGER REFERENCES t_p16851207_avito_clone_improvem.ads(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    text TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS reviews_target_idx ON t_p16851207_avito_clone_improvem.reviews(target_user_id);

CREATE TABLE IF NOT EXISTS t_p16851207_avito_clone_improvem.admins (
    user_id INTEGER PRIMARY KEY REFERENCES t_p16851207_avito_clone_improvem.users(id),
    created_at TIMESTAMP DEFAULT NOW()
);
