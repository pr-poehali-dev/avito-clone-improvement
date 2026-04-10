-- Один отзыв от одного автора одному продавцу (если нет дублей)
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_one_per_seller
  ON t_p16851207_avito_clone_improvem.reviews (author_id, target_user_id);
