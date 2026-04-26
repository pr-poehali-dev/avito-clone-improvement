CREATE TABLE t_p16851207_avito_clone_improvem.support_tickets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES t_p16851207_avito_clone_improvem.users(id),
    subject VARCHAR(255) NOT NULL DEFAULT 'Обращение в поддержку',
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    unread_admin INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE t_p16851207_avito_clone_improvem.support_messages (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES t_p16851207_avito_clone_improvem.support_tickets(id),
    sender_id INTEGER REFERENCES t_p16851207_avito_clone_improvem.users(id),
    is_admin BOOLEAN NOT NULL DEFAULT FALSE,
    text TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_support_tickets_user ON t_p16851207_avito_clone_improvem.support_tickets(user_id);
CREATE INDEX idx_support_messages_ticket ON t_p16851207_avito_clone_improvem.support_messages(ticket_id);
