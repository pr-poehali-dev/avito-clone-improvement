import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import AdCard from "@/components/AdCard";
import { getRecommendations, Ad } from "@/lib/adsApi";
import { categories } from "@/data/mockData";

interface RecommendationsBlockProps {
  onNavigate: (page: string) => void;
  viewedIds: Set<number>;
}

export default function RecommendationsBlock({ onNavigate, viewedIds }: RecommendationsBlockProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [basedOn, setBasedOn] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecommendations(8)
      .then(r => { setAds(r.ads); setBasedOn(r.based_on); })
      .catch(() => setAds([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && ads.length === 0) return null;

  const getCatName = (id: string) => categories.find(c => c.id === id)?.name || id;

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Icon name="Sparkles" size={22} className="text-violet-500" />
            {basedOn.length > 0 ? "Рекомендуем для вас" : "Популярное сейчас"}
          </h2>
          {basedOn.length > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              На основе ваших просмотров: {basedOn.map(getCatName).join(", ")}
            </p>
          )}
        </div>
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
              <AdCard ad={ad} onNavigate={onNavigate} viewed={viewedIds.has(ad.id)} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
