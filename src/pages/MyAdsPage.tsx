import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import AdCard from "@/components/AdCard";
import MediaUploader, { MediaItem } from "@/components/MediaUploader";
import { categories } from "@/data/mockData";
import { myAds, createAd, deleteAd, Ad, formatTimeAgo } from "@/lib/adsApi";

interface MyAdsPageProps {
  adImages?: Record<number, string>;
}

const emptyForm = { title: "", price: "", description: "", category: "", city: "" };

export default function MyAdsPage({ adImages }: MyAdsPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [formData, setFormData] = useState(emptyForm);
  const [ads, setAds] = useState<Ad[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const loadAds = async (status: "active" | "archived" = "active") => {
    setLoading(true);
    try {
      const res = await myAds(status);
      setAds(res.ads);
      setActiveCount(res.active_count);
      setTotalViews(res.total_views);
    } catch {
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAds(tab); }, [tab]);

  const set = (k: string, v: string) => { setFormData(f => ({ ...f, [k]: v })); setError(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      setError("Заполните заголовок и категорию");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const readyMedia = media.filter(m => m.url && !m.uploading);
      await createAd({
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.price) || 0,
        category: formData.category,
        city: formData.city,
        image_url: readyMedia[0]?.url || undefined,
        media_urls: readyMedia.map(m => ({ url: m.url, type: m.type })),
      });
      setSuccess(true);
      setFormData(emptyForm);
      setMedia([]);
      setShowForm(false);
      setTab("active");
      await loadAds("active");
      setTimeout(() => setSuccess(false), 4000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка при публикации");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAd(id);
      setAds(prev => prev.filter(a => a.id !== id));
      setActiveCount(prev => Math.max(0, prev - 1));
    } catch {
      alert("Не удалось снять объявление");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Мои объявления</h1>
          <p className="text-muted-foreground mt-1">Управляй своими публикациями</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(""); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg"
        >
          <Icon name={showForm ? "X" : "Plus"} size={16} />
          {showForm ? "Закрыть" : "Новое объявление"}
        </button>
      </div>

      {/* Success toast */}
      {success && (
        <div className="flex items-center gap-3 px-5 py-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 animate-fade-in">
          <Icon name="CheckCircle" size={18} className="shrink-0" />
          <span className="font-semibold">Объявление опубликовано!</span>
          <span className="text-emerald-600 text-sm">Оно появилось на главной странице</span>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 animate-fade-in border-2 border-violet-200">
          <h2 className="font-display text-xl font-bold mb-5 gradient-text">Создать объявление</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Media — занимает всю ширину */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                Фото и видео
              </label>
              <MediaUploader value={media} onChange={setMedia} />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Заголовок *</label>
              <input
                type="text"
                value={formData.title}
                onChange={e => set("title", e.target.value)}
                placeholder="Например: iPhone 15 Pro 256GB"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Цена, ₽</label>
              <input
                type="number"
                min="0"
                value={formData.price}
                onChange={e => set("price", e.target.value)}
                placeholder="0"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Категория *</label>
              <select
                value={formData.category}
                onChange={e => set("category", e.target.value)}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
              >
                <option value="">Выберите категорию</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Город</label>
              <input
                type="text"
                value={formData.city}
                onChange={e => set("city", e.target.value)}
                placeholder="Ваш город"
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">Описание</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={e => set("description", e.target.value)}
                placeholder="Расскажите подробнее: состояние, комплектация, причина продажи..."
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
              <Icon name="AlertCircle" size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-5">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Публикую...</>
              ) : (
                <><Icon name="Send" size={16} />Опубликовать объявление</>
              )}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setFormData(emptyForm); setMedia([]); }}
              className="px-5 py-3 border border-border rounded-xl text-muted-foreground hover:bg-muted/60 transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-emerald-50 rounded-2xl p-4 text-center">
          <div className="font-display text-2xl font-bold text-emerald-600">{activeCount}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Активных</div>
        </div>
        <div className="bg-violet-50 rounded-2xl p-4 text-center">
          <div className="font-display text-2xl font-bold text-violet-600">{totalViews.toLocaleString("ru-RU")}</div>
          <div className="text-xs text-muted-foreground mt-0.5">Просмотров</div>
        </div>
        <div className="bg-cyan-50 rounded-2xl p-4 text-center">
          <div className="font-display text-2xl font-bold text-cyan-600">0</div>
          <div className="text-xs text-muted-foreground mt-0.5">Откликов</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["active", "archived"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t
                ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {t === "active" ? `Активные (${activeCount})` : "Архив"}
          </button>
        ))}
      </div>

      {/* Ads list */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
              <div className="h-48 bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : ads.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {ads.map((ad, i) => (
            <div key={ad.id} className={`animate-fade-in delay-${(i % 3 + 1) * 100}`}>
              <AdCard
                ad={{ ...ad, date: formatTimeAgo(ad.created_at) }}
                showDeleteBtn={tab === "active"}
                onDelete={handleDelete}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Icon name={tab === "active" ? "FileText" : "Archive"} size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">
            {tab === "active" ? "У вас пока нет активных объявлений" : "Архив пуст"}
          </p>
          {tab === "active" && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Создать первое объявление
            </button>
          )}
        </div>
      )}
    </div>
  );
}