import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import AdCard from "@/components/AdCard";
import { getHotAds, Ad } from "@/lib/adsApi";

interface HotAdsBlockProps {
  onNavigate: (page: string) => void;
  viewedIds: Set<number>;
}

export default function HotAdsBlock({ onNavigate, viewedIds }: HotAdsBlockProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHotAds(4)
      .then(r => setAds(r.ads))
      .catch(() => setAds([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && ads.length === 0) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <span>🔥</span>
          Горячие объявления
        </h2>
        <span className="text-xs bg-rose-100 text-rose-600 font-semibold px-3 py-1 rounded-full flex items-center gap-1">
          <Icon name="TrendingUp" size={12} />
          Популярно сейчас
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ads.map((ad, i) => (
            <div key={ad.id} className={`animate-fade-in delay-${(i % 4 + 1) * 100}`}>
              <AdCard ad={{ ...ad, hot: true }} onNavigate={onNavigate} viewed={viewedIds.has(ad.id)} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
