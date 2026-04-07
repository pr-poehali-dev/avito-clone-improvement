import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { User } from "@/lib/auth";
import { getUserStats } from "@/lib/adsApi";

interface ProfilePageProps {
  user: User | null;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
}

export default function ProfilePage({ user, onLogout, onNavigate }: ProfilePageProps) {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || "Пользователь",
    email: user?.email || "",
    phone: user?.phone || "",
    city: user?.city || "",
    about: user?.about || "",
  });
  const [stats, setStats] = useState({
    active_ads: 0, sold_ads: 0, reviews_count: 0, avg_rating: 0, joined_at: "",
  });

  useEffect(() => {
    if (user) {
      getUserStats().then(s => setStats(s)).catch(() => {});
    }
  }, [user]);

  const joinedDate = stats.joined_at
    ? new Date(stats.joined_at).toLocaleDateString("ru-RU", { month: "long", year: "numeric" })
    : "недавно";

  const statCards = [
    { label: "Объявлений", value: String(stats.active_ads), icon: "FileText", action: () => onNavigate?.("my-ads") },
    { label: "Продано", value: String(stats.sold_ads), icon: "CheckCircle", action: () => onNavigate?.("my-ads") },
    { label: "Отзывов", value: String(stats.reviews_count), icon: "Star", action: () => user && onNavigate?.(`reviews:${user.id}`) },
    { label: "Рейтинг", value: stats.avg_rating > 0 ? stats.avg_rating.toFixed(1) : "—", icon: "TrendingUp", action: () => user && onNavigate?.(`reviews:${user.id}`) },
  ];

  const menuItems = [
    {
      icon: "FileText",
      label: "Мои объявления",
      desc: `${stats.active_ads} активных`,
      action: () => onNavigate?.("my-ads"),
      color: "bg-violet-100 text-violet-600",
    },
    {
      icon: "Star",
      label: "Мои отзывы",
      desc: `${stats.reviews_count} отзывов · рейтинг ${stats.avg_rating > 0 ? stats.avg_rating.toFixed(1) : "—"}`,
      action: () => user && onNavigate?.(`reviews:${user.id}`),
      color: "bg-amber-100 text-amber-600",
    },
    {
      icon: "MessageCircle",
      label: "Сообщения",
      desc: "Переписка с покупателями",
      action: () => onNavigate?.("messages"),
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      icon: "Heart",
      label: "Избранное",
      desc: "Сохранённые объявления",
      action: () => onNavigate?.("favorites"),
      color: "bg-rose-100 text-rose-600",
    },
    {
      icon: "Bell",
      label: "Уведомления",
      desc: "Push-уведомления и email",
      action: undefined,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      icon: "Shield",
      label: "Безопасность",
      desc: "Пароль и двухфакторная аутентификация",
      action: undefined,
      color: "bg-emerald-100 text-emerald-600",
    },
    {
      icon: "HelpCircle",
      label: "Помощь и поддержка",
      desc: "Ответы на частые вопросы",
      action: () => onNavigate?.("about"),
      color: "bg-slate-100 text-slate-600",
    },
    {
      icon: "LayoutDashboard",
      label: "Панель администратора",
      desc: "Только для администраторов",
      action: () => onNavigate?.("admin"),
      color: "bg-fuchsia-100 text-fuchsia-600",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Профиль</h1>
        <p className="text-muted-foreground mt-1">Управляй аккаунтом</p>
      </div>

      {/* Profile card */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start gap-5">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg">
              <span className="text-white font-display font-bold text-2xl">
                {profile.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border-2 border-violet-200 rounded-full flex items-center justify-center hover:bg-violet-50 transition-colors">
              <Icon name="Camera" size={12} className="text-violet-600" />
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-display text-xl font-bold">{profile.name}</h2>
              <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                <Icon name="Shield" size={10} />
                Верифицирован
              </span>
            </div>
            {profile.city && <p className="text-muted-foreground text-sm mb-1">{profile.city}</p>}
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Icon name="Calendar" size={11} />
              На OMO с {joinedDate}
            </p>
          </div>

          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-1.5 px-4 py-2 border border-violet-200 text-violet-700 rounded-xl text-sm font-semibold hover:bg-violet-50 transition-colors shrink-0"
          >
            <Icon name={editing ? "X" : "Edit3"} size={14} />
            {editing ? "Отмена" : "Изменить"}
          </button>
        </div>

        {/* Stats — кликабельные */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          {statCards.map(stat => (
            <button
              key={stat.label}
              onClick={stat.action}
              className="bg-muted/50 hover:bg-muted/80 rounded-xl p-3 text-center transition-colors group"
            >
              <div className="font-display font-bold text-lg gradient-text group-hover:opacity-80">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Edit form */}
      {editing && (
        <div className="glass-card rounded-2xl p-6 animate-fade-in">
          <h3 className="font-semibold mb-4">Редактировать профиль</h3>
          <div className="space-y-4">
            {[
              { key: "name", label: "Имя", type: "text" },
              { key: "email", label: "Email", type: "email" },
              { key: "phone", label: "Телефон", type: "tel" },
              { key: "city", label: "Город", type: "text" },
            ].map(field => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">{field.label}</label>
                <input
                  type={field.type}
                  value={profile[field.key as keyof typeof profile]}
                  onChange={e => setProfile({ ...profile, [field.key]: e.target.value })}
                  className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 transition-colors bg-white"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">О себе</label>
              <textarea
                rows={3}
                value={profile.about}
                onChange={e => setProfile({ ...profile, about: e.target.value })}
                className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 transition-colors bg-white resize-none"
              />
            </div>
            <button
              onClick={() => setEditing(false)}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Сохранить изменения
            </button>
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="glass-card rounded-2xl overflow-hidden">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            onClick={item.action}
            disabled={!item.action}
            className={`flex items-center gap-4 w-full px-5 py-4 text-left transition-colors ${
              item.action ? "hover:bg-muted/40 cursor-pointer" : "opacity-60 cursor-default"
            } ${i > 0 ? "border-t border-border/50" : ""}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
              <Icon name={item.icon} size={18} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
            {item.action && <Icon name="ChevronRight" size={16} className="text-muted-foreground" />}
          </button>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="flex items-center gap-2 w-full px-5 py-3 border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 transition-colors font-semibold"
      >
        <Icon name="LogOut" size={16} />
        Выйти из аккаунта
      </button>
    </div>
  );
}
