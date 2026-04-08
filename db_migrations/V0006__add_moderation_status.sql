-- Обновляем статусы объявлений: добавляем pending (на модерации) и rejected (отклонено)
-- Существующие объявления со статусом active остаются active
-- Все новые объявления создаются со статусом pending

ALTER TABLE t_p16851207_avito_clone_improvem.ads 
ALTER COLUMN status SET DEFAULT 'pending';

-- Добавляем поле moderation_comment для комментария модератора
ALTER TABLE t_p16851207_avito_clone_improvem.ads 
ADD COLUMN IF NOT EXISTS moderation_comment TEXT NULL;
