import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { getAdViewStats } from "@/lib/adsApi";

type Period = "day" | "3days" | "week" | "month";

interface ViewStatsChartProps {
  adId: number;
}

const PERIODS: { value: Period; label: string }[] = [
  { value: "day", label: "День" },
  { value: "3days", label: "3 дня" },
  { value: "week", label: "Неделя" },
  { value: "month", label: "Месяц" },
];

export default function ViewStatsChart({ adId }: ViewStatsChartProps) {
  const [period, setPeriod] = useState<Period>("week");
  const [stats, setStats] = useState<Array<{ date: string; views: number }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getAdViewStats(adId, period)
      .then(r => setStats(r.stats))
      .catch(() => setStats([]))
      .finally(() => setLoading(false));
  }, [adId, period]);

  const maxViews = Math.max(...stats.map(s => s.views), 1);
  const totalViews = stats.reduce((s, r) => s + r.views, 0);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon name="BarChart2" size={17} className="text-violet-600" />
          <h3 className="font-semibold text-sm">Просмотры объявления</h3>
        </div>
        <div className="flex gap-1">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                period === p.value
                  ? "bg-violet-600 text-white"
                  : "text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <span className="text-2xl font-bold text-violet-600">{totalViews}</span>
        <span className="text-xs text-muted-foreground ml-1.5">просмотров за период</span>
      </div>

      {loading ? (
        <div className="h-24 bg-muted rounded-xl animate-pulse" />
      ) : stats.length === 0 ? (
        <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
          Нет данных за этот период
        </div>
      ) : (
        <div className="flex items-end gap-1 h-24">
          {stats.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
              <div className="relative w-full">
                <div
                  className="w-full bg-gradient-to-t from-violet-600 to-cyan-400 rounded-t-sm transition-all duration-300 group-hover:opacity-80"
                  style={{ height: `${Math.max(4, (s.views / maxViews) * 80)}px` }}
                />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs px-1.5 py-0.5 rounded hidden group-hover:block whitespace-nowrap z-10">
                  {s.views}
                </div>
              </div>
              {stats.length <= 10 && (
                <span className="text-[9px] text-muted-foreground leading-none">{formatDate(s.date)}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
