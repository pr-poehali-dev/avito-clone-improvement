CREATE TABLE IF NOT EXISTS t_p16851207_avito_clone_improvem.ads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p16851207_avito_clone_improvem.users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(50) NOT NULL,
    city VARCHAR(100),
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    views INTEGER NOT NULL DEFAULT 0,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ads_user_id_idx ON t_p16851207_avito_clone_improvem.ads(user_id);
CREATE INDEX IF NOT EXISTS ads_category_idx ON t_p16851207_avito_clone_improvem.ads(category);
CREATE INDEX IF NOT EXISTS ads_status_idx ON t_p16851207_avito_clone_improvem.ads(status);
