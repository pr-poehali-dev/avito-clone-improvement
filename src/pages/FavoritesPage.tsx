import { useState, useEffect } from "react";
import AdCard from "@/components/AdCard";
import Icon from "@/components/ui/icon";
import { getFavoriteIds, subscribeFavorites } from "@/lib/favorites";
import { listAds, Ad } from "@/lib/adsApi";

interface FavoritesPageProps {
  adImages?: Record<number, string>;
  onNavigate: (page: string) => void;
}

export default function FavoritesPage({ onNavigate }: FavoritesPageProps) {
  const [favoriteAds, setFavoriteAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const ids = getFavoriteIds();
    if (ids.length === 0) {
      setFavoriteAds([]);
      setLoading(false);
      return;
    }
    // Загружаем все объявления и фильтруем по ID из localStorage
    try {
      const res = await listAds({ limit: 100 });
      const map = new Map(res.ads.map(a => [a.id, a]));
      const favs = ids.map(id => map.get(id)).filter(Boolean) as Ad[];
      setFavoriteAds(favs);
    } catch {
      setFavoriteAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Перезагружаем при изменении избранного
    const unsub = subscribeFavorites(load);
    return unsub;
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Избранное</h1>
        <p className="text-muted-foreground mt-1">
          {loading ? "Загружаем..." : favoriteAds.length > 0
            ? `${favoriteAds.length} сохранённых объявлений`
            : "Пока ничего не сохранено"}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
              <div className="h-48 bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-muted rounded w-1/2" />
                <div className="h-4 bg-muted rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : favoriteAds.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {favoriteAds.map((ad, i) => (
            <div key={ad.id} className={`animate-fade-in delay-${(i % 4 + 1) * 100}`}>
              <AdCard
                ad={ad}
                onNavigate={onNavigate}
                onFavoriteChange={load}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 glass-card rounded-2xl">
          <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Icon name="Heart" size={40} className="text-rose-400" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Избранное пусто</h2>
          <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
            Нажмите ❤️ на любом объявлении, чтобы сохранить его сюда
          </p>
          <button
            onClick={() => onNavigate("home")}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Перейти к объявлениям
          </button>
        </div>
      )}
    </div>
  );
}
