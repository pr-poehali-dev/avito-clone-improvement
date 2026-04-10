import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { getSimilarAds, Ad, formatTimeAgo } from "@/lib/adsApi";
import { formatPrice } from "@/components/AdCard";

interface SimilarAdsProps {
  adId: number;
  category: string;
  onNavigate: (page: string) => void;
}

export default function SimilarAds({ adId, onNavigate }: SimilarAdsProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSimilarAds(adId, 6)
      .then(r => setAds(r.ads))
      .catch(() => setAds([]))
      .finally(() => setLoading(false));
  }, [adId]);

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-5">
        <div className="h-5 w-40 bg-muted rounded-lg animate-pulse mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="rounded-xl overflow-hidden">
              <div className="h-28 bg-muted animate-pulse" />
              <div className="p-2 space-y-1">
                <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (ads.length === 0) return null;

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon name="Layers" size={17} className="text-violet-600" />
        <h3 className="font-semibold">Похожие объявления</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ads.map(ad => (
          <button
            key={ad.id}
            onClick={() => onNavigate(`ad:${ad.id}`)}
            className="text-left rounded-xl overflow-hidden border border-border hover:border-violet-300 hover:shadow-md transition-all group"
          >
            <div className="h-28 bg-muted overflow-hidden relative">
              {ad.image_url
                ? <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                : <div className="w-full h-full flex items-center justify-center text-3xl opacity-40">📦</div>
              }
            </div>
            <div className="p-2">
              <div className="flex items-baseline gap-1 mb-0.5">
                <span className="font-bold text-sm text-primary">{formatPrice(ad.price)}</span>
                {ad.bargain && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1 rounded-full font-semibold">Торг</span>}
              </div>
              <p className="text-xs text-foreground line-clamp-2 leading-snug">{ad.title}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{ad.city} · {formatTimeAgo(ad.created_at)}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
