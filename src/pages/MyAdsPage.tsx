import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { MediaItem } from "@/components/MediaUploader";
import { myAds, createAd, deleteAd, pauseAd, markSold, Ad } from "@/lib/adsApi";
import MyAdCard from "@/components/ads/MyAdCard";
import AdCreateForm from "@/components/ads/AdCreateForm";

interface MyAdsPageProps {
  adImages?: Record<number, string>;
  openForm?: boolean;
  onFormOpened?: () => void;
  onNavigate?: (page: string) => void;
}

const emptyForm = { title: "", price: "", description: "", category: "", city: "" };

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

  const handleMarkSold = async (id: number, soldOnOmo: boolean) => {
    try {
      await markSold(id, soldOnOmo);
      setAds(prev => prev.map(a => a.id === id ? { ...a, status: "sold", sold_on_omo: soldOnOmo } : a));
      setActiveCount(prev => Math.max(0, prev - 1));
    } catch {
      alert("Не удалось отметить объявление как проданное");
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
        <AdCreateForm
          formData={formData}
          media={media}
          saving={saving}
          error={error}
          onFieldChange={set}
          onMediaChange={setMedia}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setFormData(emptyForm); setMedia([]); }}
        />
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
              onMarkSold={handleMarkSold}
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
