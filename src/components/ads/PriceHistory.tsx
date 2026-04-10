import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { getPriceHistory } from "@/lib/adsApi";
import { formatPrice } from "@/components/AdCard";

interface PriceHistoryProps {
  adId: number;
  currentPrice: number;
}

export default function PriceHistory({ adId, currentPrice }: PriceHistoryProps) {
  const [history, setHistory] = useState<Array<{ price: number; changed_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPriceHistory(adId)
      .then(r => setHistory(r.history))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [adId]);

  if (loading || history.length <= 1) return null;

  const minPrice = Math.min(...history.map(h => h.price));
  const maxPrice = Math.max(...history.map(h => h.price));
  const range = maxPrice - minPrice || 1;
  const firstPrice = history[0]?.price ?? currentPrice;
  const diff = currentPrice - firstPrice;
  const diffPct = firstPrice > 0 ? Math.round((diff / firstPrice) * 100) : 0;

  const formatDate = (d: string) => new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon name="TrendingDown" size={17} className="text-violet-600" />
          <h3 className="font-semibold text-sm">История цены</h3>
        </div>
        {diff !== 0 && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${diff < 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-600"}`}>
            {diff < 0 ? "↓" : "↑"} {Math.abs(diffPct)}%
          </span>
        )}
      </div>

      {/* Мини-график */}
      <div className="flex items-end gap-1 h-16 mb-3">
        {history.map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <div
              className="w-full rounded-t-sm transition-all"
              style={{
                height: `${Math.max(8, ((h.price - minPrice) / range) * 52 + 8)}px`,
                background: h.price === currentPrice
                  ? "linear-gradient(to top, #7c3aed, #06b6d4)"
                  : "#e5e7eb"
              }}
            />
            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded hidden group-hover:block whitespace-nowrap z-10">
              {formatPrice(h.price)}
            </div>
          </div>
        ))}
      </div>

      {/* Таблица */}
      <div className="space-y-1.5">
        {[...history].reverse().slice(0, 4).map((h, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{formatDate(h.changed_at)}</span>
            <span className={`font-semibold ${h.price === currentPrice ? "text-violet-600" : "text-foreground"}`}>
              {formatPrice(h.price)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
