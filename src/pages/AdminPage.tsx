import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { adminCall } from "@/lib/messagesApi";
import { formatPrice } from "@/components/AdCard";

interface Stats {
  total_users: number; active_ads: number; total_ads: number;
  total_messages: number; total_reviews: number; total_views: number;
  new_users_week: number; new_ads_week: number;
}

interface AdminUser {
  id: number; name: string; email: string; created_at: string;
  ads_count: number; is_admin: boolean; is_banned: boolean;
}

interface AdminAd {
  id: number; title: string; price: number; status: string;
  views: number; created_at: string; seller: string; user_id: number; category: string;
}

type Tab = "stats" | "users" | "ads";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [ads, setAds] = useState<AdminAd[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [forbidden, setForbidden] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    const data = await adminCall("stats");
    if (data.error === "Доступ запрещён") { setForbidden(true); }
    else { setStats(data); }
    setLoading(false);
  };

  const loadUsers = async (q = "") => {
    setLoading(true);
    const data = await adminCall("users", q ? { search: q } : {});
    if (!data.error) setUsers(data.users || []);
    setLoading(false);
  };

  const loadAds = async (q = "") => {
    setLoading(true);
    const data = await adminCall("ads", q ? { search: q } : {});
    if (!data.error) setAds(data.ads || []);
    setLoading(false);
  };

  useEffect(() => { loadStats(); }, []);

  useEffect(() => {
    if (tab === "users") loadUsers(search);
    if (tab === "ads") loadAds(search);
  }, [tab]);

  const handleSearch = (v: string) => {
    setSearch(v);
    if (tab === "users") loadUsers(v);
    if (tab === "ads") loadAds(v);
  };

  const handleBan = async (userId: number, banned: boolean) => {
    await adminCall(banned ? "ban_user" : "unban_user", {}, { user_id: userId });
    loadUsers(search);
  };

  const handleDeleteAd = async (adId: number) => {
    if (!confirm("Удалить объявление?")) return;
    await adminCall("delete_ad", {}, { id: adId });
    loadAds(search);
  };

  const handleMakeAdmin = async (userId: number) => {
    if (!confirm("Назначить администратором?")) return;
    await adminCall("make_admin", {}, { user_id: userId });
    loadUsers(search);
  };

  if (forbidden) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="font-display text-2xl font-bold mb-2">Доступ запрещён</h2>
        <p className="text-muted-foreground">Этот раздел доступен только администраторам</p>
      </div>
    );
  }

  const statCards = stats ? [
    { label: "Пользователей", value: stats.total_users, icon: "Users", color: "text-violet-600", bg: "bg-violet-50", sub: `+${stats.new_users_week} за неделю` },
    { label: "Активных объявлений", value: stats.active_ads, icon: "FileText", color: "text-emerald-600", bg: "bg-emerald-50", sub: `${stats.total_ads} всего` },
    { label: "Сообщений", value: stats.total_messages, icon: "MessageCircle", color: "text-cyan-600", bg: "bg-cyan-50", sub: "" },
    { label: "Отзывов", value: stats.total_reviews, icon: "Star", color: "text-amber-600", bg: "bg-amber-50", sub: "" },
    { label: "Просмотров", value: stats.total_views, icon: "Eye", color: "text-pink-600", bg: "bg-pink-50", sub: "" },
    { label: "Новых объявлений", value: stats.new_ads_week, icon: "TrendingUp", color: "text-indigo-600", bg: "bg-indigo-50", sub: "за неделю" },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
          <Icon name="Shield" size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold">Админ-панель</h1>
          <p className="text-muted-foreground text-sm">Управление платформой</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {([["stats", "BarChart2", "Статистика"], ["users", "Users", "Пользователи"], ["ads", "FileText", "Объявления"]] as const).map(([id, icon, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === id ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Icon name={icon} size={15} />
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Stats */}
      {tab === "stats" && !loading && stats && (
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
      )}

      {/* Users */}
      {tab === "users" && !loading && (
        <div className="space-y-4">
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Поиск по имени или email..."
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-white"
          />
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Пользователь</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-center px-4 py-3 hidden md:table-cell">Объявлений</th>
                  <th className="text-center px-4 py-3">Статус</th>
                  <th className="text-center px-4 py-3">Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-cyan-400 flex items-center justify-center shrink-0">
                          <span className="text-white font-bold text-xs">{u.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="font-medium">{u.name}</div>
                          {u.is_admin && <span className="text-xs text-violet-600 font-semibold">Админ</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{u.email}</td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">{u.ads_count}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.is_banned ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>
                        {u.is_banned ? "Заблокирован" : "Активен"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleBan(u.id, !u.is_banned)}
                          title={u.is_banned ? "Разблокировать" : "Заблокировать"}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${u.is_banned ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600" : "bg-rose-50 hover:bg-rose-100 text-rose-600"}`}
                        >
                          <Icon name={u.is_banned ? "UserCheck" : "UserX"} size={14} />
                        </button>
                        {!u.is_admin && (
                          <button
                            onClick={() => handleMakeAdmin(u.id)}
                            title="Сделать админом"
                            className="w-8 h-8 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-600 flex items-center justify-center transition-colors"
                          >
                            <Icon name="Shield" size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">Пользователи не найдены</div>
            )}
          </div>
        </div>
      )}

      {/* Ads */}
      {tab === "ads" && !loading && (
        <div className="space-y-4">
          <input
            type="text"
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-white"
          />
          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Объявление</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Продавец</th>
                  <th className="text-right px-4 py-3">Цена</th>
                  <th className="text-center px-4 py-3 hidden md:table-cell">Просмотры</th>
                  <th className="text-center px-4 py-3">Статус</th>
                  <th className="text-center px-4 py-3">Удалить</th>
                </tr>
              </thead>
              <tbody>
                {ads.map(a => (
                  <tr key={a.id} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium line-clamp-1 max-w-[200px]">{a.title}</div>
                      <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString("ru-RU")}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{a.seller}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatPrice(a.price)}</td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">{a.views}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        a.status === "active" ? "bg-emerald-100 text-emerald-600"
                        : a.status === "archived" ? "bg-gray-100 text-gray-500"
                        : "bg-rose-100 text-rose-600"
                      }`}>
                        {a.status === "active" ? "Активно" : a.status === "archived" ? "Архив" : "Удалено"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {a.status !== "deleted" && (
                        <button
                          onClick={() => handleDeleteAd(a.id)}
                          className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center mx-auto transition-colors"
                        >
                          <Icon name="Trash2" size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {ads.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">Объявления не найдены</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
