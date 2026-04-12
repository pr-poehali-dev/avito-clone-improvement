import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import AdCard from "@/components/AdCard";
import { getViewHistory, Ad, formatTimeAgo } from "@/lib/adsApi";

interface HistoryPageProps {
  onNavigate: (page: string) => void;
}

export default function HistoryPage({ onNavigate }: HistoryPageProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getViewHistory(60)
      .then(r => setAds(r.ads))
      .catch(() => setAds([]))
      .finally(() => setLoading(false));
  }, []);

  // Группируем по дате просмотра
  const grouped: Record<string, Ad[]> = {};
  ads.forEach(ad => {
    const date = ad.viewed_at ? new Date(ad.viewed_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" }) : "Сегодня";
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(ad);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <Icon name="ChevronLeft" size={16} />
          Назад
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold">История просмотров</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Объявления, которые вы смотрели</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
              <div className="h-36 bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : ads.length === 0 ? (
        <div className="text-center py-24 glass-card rounded-2xl">
          <div className="text-6xl mb-4">👀</div>
          <h3 className="font-display text-xl font-bold mb-2">История пуста</h3>
          <p className="text-muted-foreground mb-6">Откройте любое объявление — оно появится здесь</p>
          <button
            onClick={() => onNavigate("home")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            <Icon name="Search" size={16} />
            Смотреть объявления
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([date, dateAds]) => (
            <div key={date}>
              <div className="flex items-center gap-2 mb-4">
                <Icon name="Calendar" size={15} className="text-muted-foreground" />
                <span className="text-sm font-semibold text-muted-foreground">{date}</span>
                <span className="text-xs text-muted-foreground/60">· {dateAds.length} объявл.</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {dateAds.map(ad => (
                  <div key={ad.id} className="relative">
                    <AdCard ad={ad} onNavigate={onNavigate} viewed />
                    {ad.viewed_at && (
                      <div className="absolute bottom-[72px] right-3 text-xs text-muted-foreground/70 bg-white/80 backdrop-blur px-1.5 py-0.5 rounded">
                        {formatTimeAgo(ad.viewed_at)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}