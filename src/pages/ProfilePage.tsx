import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { User, updateProfile, changePassword } from "@/lib/auth";
import { getUserStats, getMySubscriptions } from "@/lib/adsApi";
import { uploadAvatar } from "@/lib/uploadApi";

interface ProfilePageProps {
  user: User | null;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
  onUserUpdate?: (u: User) => void;
  theme?: string;
  onToggleTheme?: () => void;
}

export default function ProfilePage({ user, onLogout, onNavigate, onUserUpdate, theme, onToggleTheme }: ProfilePageProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveOk, setSaveOk] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState("");
  const [pwOk, setPwOk] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || "Пользователь",
    email: user?.email || "",
    phone: user?.phone || "",
    city: user?.city || "",
    about: user?.about || "",
  });
  const [stats, setStats] = useState({
    active_ads: 0, sold_ads: 0, reviews_count: 0, avg_rating: 0, joined_at: "",
    unread_messages: 0,
  });
  const [subsCount, setSubsCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      getUserStats().then(s => setStats(s)).catch(() => {});
      getMySubscriptions().then(r => setSubsCount(r.subscriptions.length)).catch(() => {});
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
    { label: "Подписок", value: String(subsCount), icon: "Bell", action: () => onNavigate?.("subscriptions") },
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
      desc: stats.unread_messages > 0 ? `${stats.unread_messages} непрочитанных` : "Переписка с покупателями",
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
      icon: "History",
      label: "История просмотров",
      desc: "Объявления, которые вы смотрели",
      action: () => onNavigate?.("history"),
      color: "bg-amber-100 text-amber-600",
    },
    {
      icon: "Bell",
      label: "Подписки",
      desc: "Уведомления о новых объявлениях",
      action: () => onNavigate?.("subscriptions"),
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      icon: "Shield",
      label: "Безопасность",
      desc: "Смена пароля",
      action: () => setShowPasswordForm(true),
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const url = await uploadAvatar(file);
      // Ключ уже уникальный в S3 — просто используем URL как есть
      setAvatarUrl(url);
      if (user && onUserUpdate) onUserUpdate({ ...user, avatar_url: url });
    } catch (err) {
      console.error("Avatar upload error:", err);
    } finally {
      setAvatarUploading(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

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
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg group"
              title="Изменить фото"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Аватар" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                  <span className="text-white font-display font-bold text-2xl">
                    {profile.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {avatarUploading
                  ? <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <Icon name="Camera" size={18} className="text-white" />
                }
              </div>
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
            {saveError && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">
                <Icon name="AlertCircle" size={14} className="shrink-0" />
                {saveError}
              </div>
            )}
            {saveOk && (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
                <Icon name="CheckCircle" size={14} className="shrink-0" />
                Профиль обновлён!
              </div>
            )}
            <button
              onClick={async () => {
                setSaving(true); setSaveError(""); setSaveOk(false);
                try {
                  await updateProfile({ name: profile.name, city: profile.city, phone: profile.phone, about: profile.about });
                  setSaveOk(true);
                  setTimeout(() => { setEditing(false); setSaveOk(false); }, 1500);
                } catch (e: unknown) {
                  setSaveError(e instanceof Error ? e.message : "Ошибка сохранения");
                } finally {
                  setSaving(false);
                }
              }}
              disabled={saving}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />Сохраняю...</> : "Сохранить изменения"}
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

      {/* Theme toggle */}
      {onToggleTheme && (
        <div className="glass-card rounded-2xl px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${theme === "dark" ? "bg-indigo-100 text-indigo-600" : "bg-amber-100 text-amber-500"}`}>
              <Icon name={theme === "dark" ? "Moon" : "Sun"} size={18} />
            </div>
            <div>
              <div className="font-semibold text-sm">{theme === "dark" ? "Тёмная тема" : "Светлая тема"}</div>
              <div className="text-xs text-muted-foreground">Переключить оформление</div>
            </div>
          </div>
          <button
            onClick={onToggleTheme}
            aria-label="Переключить тему"
            className={`relative w-12 h-6 rounded-full transition-colors duration-500 focus:outline-none ${theme === "dark" ? "bg-indigo-500" : "bg-muted"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-500 ${theme === "dark" ? "translate-x-6" : "translate-x-0"}`}>
              <Icon name={theme === "dark" ? "Moon" : "Sun"} size={11} className={theme === "dark" ? "text-indigo-600" : "text-amber-400"} />
            </span>
          </button>
        </div>
      )}

      {/* Logout */}
      <button
        onClick={onLogout}
        className="flex items-center gap-2 w-full px-5 py-3 border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 transition-colors font-semibold"
      >
        <Icon name="LogOut" size={16} />
        Выйти из аккаунта
      </button>

      {/* Password change modal */}
      {showPasswordForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowPasswordForm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Icon name="Shield" size={18} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-base">Смена пароля</h3>
                <p className="text-xs text-muted-foreground">Минимум 6 символов</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: "current", label: "Текущий пароль", placeholder: "Введите текущий пароль" },
                { key: "next", label: "Новый пароль", placeholder: "Минимум 6 символов" },
                { key: "confirm", label: "Повторите новый пароль", placeholder: "Повторите пароль" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">{f.label}</label>
                  <input
                    type="password"
                    value={pwForm[f.key as keyof typeof pwForm]}
                    onChange={e => { setPwForm(p => ({ ...p, [f.key]: e.target.value })); setPwError(""); }}
                    placeholder={f.placeholder}
                    className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-white"
                  />
                </div>
              ))}

              {pwError && (
                <div className="flex items-center gap-1.5 text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-xl">
                  <Icon name="AlertCircle" size={14} className="shrink-0" />
                  {pwError}
                </div>
              )}
              {pwOk && (
                <div className="flex items-center gap-1.5 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl">
                  <Icon name="CheckCircle" size={14} className="shrink-0" />
                  Пароль успешно изменён!
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-5">
              <button
                disabled={pwSaving}
                onClick={async () => {
                  if (!pwForm.current || !pwForm.next || !pwForm.confirm) { setPwError("Заполните все поля"); return; }
                  if (pwForm.next !== pwForm.confirm) { setPwError("Пароли не совпадают"); return; }
                  if (pwForm.next.length < 6) { setPwError("Минимум 6 символов"); return; }
                  setPwSaving(true); setPwError("");
                  try {
                    await changePassword(pwForm.current, pwForm.next);
                    setPwOk(true);
                    setPwForm({ current: "", next: "", confirm: "" });
                    setTimeout(() => { setShowPasswordForm(false); setPwOk(false); }, 1500);
                  } catch (e: unknown) {
                    setPwError(e instanceof Error ? e.message : "Ошибка");
                  } finally { setPwSaving(false); }
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {pwSaving ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
                Сохранить
              </button>
              <button
                onClick={() => { setShowPasswordForm(false); setPwForm({ current: "", next: "", confirm: "" }); setPwError(""); }}
                className="px-4 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted/60"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}