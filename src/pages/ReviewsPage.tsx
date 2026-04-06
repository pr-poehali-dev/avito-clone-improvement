import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { getReviews, createReview } from "@/lib/messagesApi";
import { User } from "@/lib/auth";

interface ReviewsPageProps {
  userId: number;
  onBack: () => void;
  currentUser: User | null;
  onAuthClick: () => void;
}

export default function ReviewsPage({ userId, onBack, currentUser, onAuthClick }: ReviewsPageProps) {
  const [data, setData] = useState<Awaited<ReturnType<typeof getReviews>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hovered, setHovered] = useState(0);

  const load = async () => {
    try {
      const res = await getReviews(userId);
      setData(res);
    } catch {
      // pass
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { onAuthClick(); return; }
    setSaving(true);
    setError("");
    try {
      await createReview({ target_user_id: userId, rating, text });
      setText(""); setRating(5); setShowForm(false);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  };

  const stars = (n: number, size = 16) =>
    Array.from({ length: 5 }, (_, i) => (
      <Icon
        key={i}
        name="Star"
        size={size}
        className={i < n ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}
      />
    ));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
      >
        <Icon name="ChevronLeft" size={18} />
        Назад
      </button>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Profile header */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-2xl">
                  {data?.user?.name?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
              <div className="flex-1">
                <h1 className="font-display text-2xl font-bold">{data?.user?.name || "Пользователь"}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Icon name="Calendar" size={13} />
                    На сайте с {data?.user?.created_at ? new Date(data.user.created_at).toLocaleDateString("ru-RU", { month: "long", year: "numeric" }) : "..."}
                  </span>
                  <span className="flex items-center gap-1">
                    <Icon name="FileText" size={13} />
                    {data?.user?.ads_count ?? 0} объявлений
                  </span>
                </div>
              </div>
            </div>

            {/* Rating summary */}
            <div className="mt-4 flex items-center gap-4 p-4 bg-amber-50 rounded-xl">
              <div className="text-center">
                <div className="font-display text-4xl font-bold text-amber-500">
                  {data?.avg_rating ? data.avg_rating.toFixed(1) : "—"}
                </div>
                <div className="flex gap-0.5 mt-1 justify-center">{stars(Math.round(data?.avg_rating ?? 0), 14)}</div>
              </div>
              <div className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{data?.total ?? 0}</span>{" "}
                {(data?.total ?? 0) === 1 ? "отзыв" : (data?.total ?? 0) < 5 ? "отзыва" : "отзывов"}
              </div>
            </div>
          </div>

          {/* Leave review */}
          {currentUser && currentUser.id !== userId && (
            <div>
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full py-3 border-2 border-dashed border-violet-200 hover:border-violet-400 text-violet-600 rounded-2xl font-semibold text-sm transition-all hover:bg-violet-50"
                >
                  + Оставить отзыв
                </button>
              ) : (
                <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-5 border-2 border-violet-200 space-y-4 animate-fade-in">
                  <h3 className="font-display text-lg font-bold gradient-text">Оставить отзыв</h3>

                  {/* Star rating */}
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Оценка</label>
                    <div className="flex gap-1.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          onMouseEnter={() => setHovered(i + 1)}
                          onMouseLeave={() => setHovered(0)}
                          onClick={() => setRating(i + 1)}
                          className="transition-transform hover:scale-110"
                        >
                          <Icon
                            name="Star"
                            size={28}
                            className={
                              i < (hovered || rating)
                                ? "text-amber-400 fill-amber-400"
                                : "text-gray-200 fill-gray-200"
                            }
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm font-medium text-muted-foreground self-center">
                        {["", "Ужасно", "Плохо", "Нормально", "Хорошо", "Отлично"][hovered || rating]}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Комментарий</label>
                    <textarea
                      rows={3}
                      value={text}
                      onChange={e => setText(e.target.value)}
                      placeholder="Расскажите о своём опыте..."
                      className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white resize-none"
                    />
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
                      <Icon name="AlertCircle" size={14} className="shrink-0" />
                      {error}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {saving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Icon name="Send" size={14} />}
                      Опубликовать
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted/60"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Reviews list */}
          <div className="space-y-4">
            {(data?.reviews.length ?? 0) === 0 ? (
              <div className="text-center py-12 text-muted-foreground glass-card rounded-2xl">
                <Icon name="MessageSquare" size={40} className="mx-auto mb-3 opacity-30" />
                <p className="font-medium">Отзывов пока нет</p>
                <p className="text-sm mt-1">Будьте первым, кто оставит отзыв</p>
              </div>
            ) : (
              data?.reviews.map(r => (
                <div key={r.id} className="glass-card rounded-2xl p-5 animate-fade-in">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 flex items-center justify-center shrink-0">
                        <span className="text-white font-bold text-xs">{r.author_name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{r.author_name}</div>
                        <div className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ru-RU")}</div>
                      </div>
                    </div>
                    <div className="flex gap-0.5">{stars(r.rating, 14)}</div>
                  </div>
                  {r.text && <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{r.text}</p>}
                  {r.ad_title && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-violet-600 bg-violet-50 rounded-lg px-3 py-1.5">
                      <Icon name="Tag" size={11} />
                      {r.ad_title}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
