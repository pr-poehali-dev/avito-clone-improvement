CREATE TABLE IF NOT EXISTS t_p16851207_avito_clone_improvem.price_offers (
    id SERIAL PRIMARY KEY,
    ad_id INTEGER NOT NULL REFERENCES t_p16851207_avito_clone_improvem.ads(id),
    buyer_id INTEGER NOT NULL REFERENCES t_p16851207_avito_clone_improvem.users(id),
    offered_price INTEGER NOT NULL,
    message TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_offers_ad ON t_p16851207_avito_clone_improvem.price_offers(ad_id);
CREATE INDEX IF NOT EXISTS idx_price_offers_buyer ON t_p16851207_avito_clone_improvem.price_offers(buyer_id);
