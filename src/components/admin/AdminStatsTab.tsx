import Icon from "@/components/ui/icon";

interface Stats {
  total_users: number; active_ads: number; total_ads: number;
  total_messages: number; total_reviews: number; total_views: number;
  new_users_week: number; new_ads_week: number;
}

interface AdminStatsTabProps {
  stats: Stats;
}

export default function AdminStatsTab({ stats }: AdminStatsTabProps) {
  const statCards = [
    { label: "Пользователей", value: stats.total_users, icon: "Users", color: "text-violet-600", bg: "bg-violet-50", sub: `+${stats.new_users_week} за неделю` },
    { label: "Активных объявлений", value: stats.active_ads, icon: "FileText", color: "text-emerald-600", bg: "bg-emerald-50", sub: `${stats.total_ads} всего` },
    { label: "Сообщений", value: stats.total_messages, icon: "MessageCircle", color: "text-cyan-600", bg: "bg-cyan-50", sub: "" },
    { label: "Отзывов", value: stats.total_reviews, icon: "Star", color: "text-amber-600", bg: "bg-amber-50", sub: "" },
    { label: "Просмотров", value: stats.total_views, icon: "Eye", color: "text-pink-600", bg: "bg-pink-50", sub: "" },
    { label: "Новых объявлений", value: stats.new_ads_week, icon: "TrendingUp", color: "text-indigo-600", bg: "bg-indigo-50", sub: "за неделю" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {statCards.map(s => (
        <div key={s.label} className={`${s.bg} rounded-2xl p-5`}>
          <div className="flex items-center gap-2 mb-2">
            <Icon name={s.icon} size={18} className={s.color} />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{s.label}</span>
          </div>
          <div className={`font-display text-3xl font-bold ${s.color}`}>{s.value.toLocaleString("ru-RU")}</div>
          {s.sub && <div className="text-xs text-muted-foreground mt-1">{s.sub}</div>}
        </div>
      ))}
    </div>
  );
}
