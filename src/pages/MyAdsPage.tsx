import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import MediaUploader, { MediaItem } from "@/components/MediaUploader";
import { categories } from "@/data/mockData";
import { myAds, createAd, deleteAd, pauseAd, Ad, formatTimeAgo } from "@/lib/adsApi";
import { formatPrice } from "@/components/AdCard";
import CitySelect from "@/components/CitySelect";

interface MyAdsPageProps {
  adImages?: Record<number, string>;
  openForm?: boolean;
  onFormOpened?: () => void;
  onNavigate?: (page: string) => void;
}

const emptyForm = { title: "", price: "", description: "", category: "", city: "" };

const categoryEmojis: Record<string, string> = {
  electronics: "💻", transport: "🚗", realty: "🏠", clothes: "👗",
  home: "🛋️", sport: "🏋️", beauty: "✨", kids: "🧸",
  animals: "🐾", services: "🔧", hobby: "🎨", food: "🛒",
};

function MyAdCard({ ad, onDelete, onPause, onNavigate, className }: {
  ad: Ad;
  onDelete: (id: number) => void;
  onPause: (id: number) => void;
  onNavigate?: (page: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isPaused = ad.status === "paused";
  const isPending = ad.status === "pending";
  const isRejected = ad.status === "rejected";

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className={`glass-card rounded-2xl overflow-hidden ${(isPaused || isPending || isRejected) ? "opacity-75" : ""} ${className || ""}`}>
      {/* Image */}
      <div
        className="relative h-44 bg-muted flex items-center justify-center cursor-pointer"
        onClick={() => onNavigate?.(`ad:${ad.id}`)}
      >
        {ad.image_url ? (
          <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl">{categoryEmojis[ad.category] || "📦"}</span>
        )}
        {isPaused && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">На паузе</span>
          </div>
        )}
        {isPending && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">На проверке</span>
          </div>
        )}
        {isRejected && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">Отклонено</span>
          </div>
        )}
        {/* Меню */}
        <div ref={menuRef} className="absolute top-2 right-2">
          <button
            onClick={() => setOpen(v => !v)}
            className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
          >
            <Icon name="MoreVertical" size={15} className="text-foreground" />
          </button>
          {open && (
            <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-xl border border-border/50 py-1 min-w-[180px] z-30 animate-fade-in">
              {!isPending && !isRejected && (
                <>
                  <button
                    onClick={() => { setOpen(false); onPause(ad.id); }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <Icon name={isPaused ? "Play" : "Pause"} size={15} className={isPaused ? "text-emerald-600" : "text-yellow-600"} />
                    <span>{isPaused ? "Возобновить" : "Приостановить"}</span>
                  </button>
                  <div className="my-1 border-t border-border/40" />
                </>
              )}
              {!confirm ? (
                <button
                  onClick={() => setConfirm(true)}
                  className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Icon name="Trash2" size={15} />
                  Удалить объявление
                </button>
              ) : (
                <div className="px-4 py-2 space-y-2">
                  <p className="text-xs text-muted-foreground">Точно удалить?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setOpen(false); setConfirm(false); onDelete(ad.id); }}
                      className="flex-1 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600"
                    >Да</button>
                    <button
                      onClick={() => setConfirm(false)}
                      className="flex-1 py-1.5 border border-border rounded-lg text-xs hover:bg-muted/50"
                    >Нет</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-lg font-bold text-primary mb-1">{formatPrice(ad.price)}</div>
        <h3
          className="font-semibold text-sm line-clamp-2 mb-2 leading-snug cursor-pointer hover:text-violet-600 transition-colors"
          onClick={() => onNavigate?.(`ad:${ad.id}`)}
        >{ad.title}</h3>
        {isPending && (
          <div className="flex items-center gap-1.5 mb-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-2.5 py-1.5">
            <Icon name="Clock" size={12} />
            Объявление на проверке
          </div>
        )}
        {isRejected && (
          <div className="mb-2 text-xs text-rose-600 bg-rose-50 rounded-lg px-2.5 py-1.5">
            <div className="flex items-center gap-1.5 font-semibold mb-0.5">
              <Icon name="XCircle" size={12} />
              Отклонено модерацией
            </div>
            {ad.moderation_comment && (
              <div className="text-rose-500 mt-0.5">{ad.moderation_comment}</div>
            )}
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Icon name="MapPin" size={11} />{ad.city || "—"}
          </span>
          <span className="flex items-center gap-1">
            <Icon name="Eye" size={11} />{ad.views}
          </span>
          <span>{formatTimeAgo(ad.created_at)}</span>
        </div>
      </div>
    </div>
  );
}

export default function MyAdsPage({ adImages, openForm, onFormOpened, onNavigate }: MyAdsPageProps) {
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (openForm) {
      setShowForm(true);
      onFormOpened?.();
    }
  }, [openForm]);
  const [tab, setTab] = useState<"active" | "archived" | "paused">("active");
  const [formData, setFormData] = useState(emptyForm);
  const [ads, setAds] = useState<Ad[]>([]);
  const [activeCount, setActiveCount] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const loadAds = async (status: "active" | "archived" | "paused" = "active") => {
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
      setTab("paused");
      await loadAds("paused");
      setTimeout(() => setSuccess(false), 6000);
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
      alert("Не удалось удалить объявление");
    }
  };

  const handlePause = async (id: number) => {
    try {
      const res = await pauseAd(id);
      setAds(prev => prev.map(a => a.id === id ? { ...a, status: res.new_status } : a));
      if (res.new_status === "paused") {
        setActiveCount(prev => Math.max(0, prev - 1));
      } else {
        setActiveCount(prev => prev + 1);
      }
    } catch {
      alert("Не удалось изменить статус объявления");
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
        <div className="flex items-center gap-3 px-5 py-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-blue-700 animate-fade-in">
          <Icon name="Clock" size={18} className="shrink-0" />
          <div>
            <span className="font-semibold block">Объявление на проверке</span>
            <span className="text-blue-600 text-sm">После одобрения модератором оно появится на сайте</span>
          </div>
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
              <CitySelect value={formData.city} onChange={v => set("city", v)} placeholder="Выберите город" />
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
      <div className="flex gap-2 flex-wrap">
        {([
          ["active", `Активные (${activeCount})`],
          ["paused", "На паузе"],
          ["archived", "Архив"],
        ] as const).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t as "active" | "archived" | "paused")}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t
                ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            {label}
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
            <MyAdCard
              key={ad.id}
              ad={ad}
              onDelete={handleDelete}
              onPause={handlePause}
              onNavigate={onNavigate}
              className={`animate-fade-in delay-${(i % 3 + 1) * 100}`}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Icon name={tab === "active" ? "FileText" : tab === "paused" ? "PauseCircle" : "Archive"} size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">
            {tab === "active" ? "У вас пока нет активных объявлений" : tab === "paused" ? "Нет объявлений на паузе" : "Архив пуст"}
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