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

interface UserActivity {
  id: number; name: string; email: string; reg_date: string;
  ads_count: number; messages_count: number; reviews_count: number; last_active: string | null;
}

type Tab = "stats" | "users" | "ads" | "activity";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [ads, setAds] = useState<AdminAd[]>([]);
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [forbidden, setForbidden] = useState(false);
  const [rejectModal, setRejectModal] = useState<{ id: number; title: string } | null>(null);
  const [rejectComment, setRejectComment] = useState("");

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

  const loadAds = async (q = "", status = statusFilter) => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (q) params.search = q;
    if (status) params.status = status;
    const data = await adminCall("ads", params);
    if (!data.error) setAds(data.ads || []);
    setLoading(false);
  };

  useEffect(() => { loadStats(); }, []);

  const loadActivity = async () => {
    setLoading(true);
    const data = await adminCall("user_activity");
    if (!data.error) setActivity(data.activity || []);
    setLoading(false);
  };

  useEffect(() => {
    if (tab === "users") loadUsers(search);
    if (tab === "ads") loadAds(search, statusFilter);
    if (tab === "activity") loadActivity();
  }, [tab]);

  const handleSearch = (v: string) => {
    setSearch(v);
    if (tab === "users") loadUsers(v);
    if (tab === "ads") loadAds(v, statusFilter);
  };

  const handleStatusFilter = (s: string) => {
    setStatusFilter(s);
    loadAds(search, s);
  };

  const handleBan = async (userId: number, banned: boolean) => {
    await adminCall(banned ? "ban_user" : "unban_user", {}, { user_id: userId });
    loadUsers(search);
  };

  const handleDeleteAd = async (adId: number) => {
    if (!confirm("Удалить объявление?")) return;
    await adminCall("delete_ad", {}, { id: adId });
    loadAds(search, statusFilter);
  };

  const handleMakeAdmin = async (userId: number) => {
    if (!confirm("Назначить администратором?")) return;
    await adminCall("make_admin", {}, { user_id: userId });
    loadUsers(search);
  };

  const handleApprove = async (adId: number) => {
    await adminCall("approve_ad", {}, { id: adId });
    loadAds(search, statusFilter);
    loadStats();
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    await adminCall("reject_ad", {}, { id: rejectModal.id, comment: rejectComment || "Объявление не соответствует правилам" });
    setRejectModal(null);
    setRejectComment("");
    loadAds(search, statusFilter);
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

  const statusLabels: Record<string, { label: string; cls: string }> = {
    active: { label: "Активно", cls: "bg-emerald-100 text-emerald-600" },
    pending: { label: "На проверке", cls: "bg-blue-100 text-blue-600" },
    paused: { label: "На паузе", cls: "bg-yellow-100 text-yellow-700" },
    archived: { label: "Архив", cls: "bg-gray-100 text-gray-500" },
    rejected: { label: "Отклонено", cls: "bg-rose-100 text-rose-600" },
    deleted: { label: "Удалено", cls: "bg-rose-100 text-rose-600" },
  };

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
        {([["stats", "BarChart2", "Статистика"], ["users", "Users", "Пользователи"], ["ads", "FileText", "Объявления"], ["activity", "Activity", "Активность"]] as const).map(([id, icon, label]) => (
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
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={search}
              onChange={e => handleSearch(e.target.value)}
              placeholder="Поиск по названию..."
              className="flex-1 min-w-[180px] border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-white"
            />
            <div className="flex gap-1.5 flex-wrap">
              {[
                ["pending", "На проверке"],
                ["active", "Активные"],
                ["rejected", "Отклонённые"],
                ["paused", "На паузе"],
                ["", "Все"],
              ].map(([s, label]) => (
                <button
                  key={s}
                  onClick={() => handleStatusFilter(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    statusFilter === s
                      ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {statusFilter === "pending" && ads.length > 0 && (
            <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700">
              <Icon name="Clock" size={16} className="shrink-0" />
              <span>{ads.length} объявлений ждут проверки</span>
            </div>
          )}

          <div className="glass-card rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Объявление</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Продавец</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">Цена</th>
                  <th className="text-center px-4 py-3">Статус</th>
                  <th className="text-center px-4 py-3">Действия</th>
                </tr>
              </thead>
              <tbody>
                {ads.map(a => {
                  const sl = statusLabels[a.status] || { label: a.status, cls: "bg-gray-100 text-gray-500" };
                  return (
                    <tr key={a.id} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium line-clamp-1 max-w-[200px]">{a.title}</div>
                        <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString("ru-RU")}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{a.seller}</td>
                      <td className="px-4 py-3 text-right font-semibold hidden md:table-cell">{formatPrice(a.price)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sl.cls}`}>
                          {sl.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {a.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(a.id)}
                                title="Одобрить"
                                className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors"
                              >
                                <Icon name="Check" size={14} />
                              </button>
                              <button
                                onClick={() => { setRejectModal({ id: a.id, title: a.title }); setRejectComment(""); }}
                                title="Отклонить"
                                className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors"
                              >
                                <Icon name="X" size={14} />
                              </button>
                            </>
                          )}
                          {a.status !== "deleted" && (
                            <button
                              onClick={() => handleDeleteAd(a.id)}
                              title="Удалить"
                              className="w-8 h-8 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors"
                            >
                              <Icon name="Trash2" size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {ads.length === 0 && (
              <div className="text-center py-10 text-muted-foreground text-sm">Объявления не найдены</div>
            )}
          </div>
        </div>
      )}

      {/* Activity */}
      {tab === "activity" && !loading && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50 flex items-center gap-2">
            <Icon name="Activity" size={16} className="text-violet-600" />
            <span className="font-semibold text-sm">История активности пользователей</span>
            <span className="ml-auto text-xs text-muted-foreground">{activity.length} записей</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Пользователь</th>
                  <th className="text-center px-4 py-3">Объявл.</th>
                  <th className="text-center px-4 py-3 hidden sm:table-cell">Сообщ.</th>
                  <th className="text-center px-4 py-3 hidden md:table-cell">Отзывы</th>
                  <th className="text-right px-4 py-3">Последняя активность</th>
                </tr>
              </thead>
              <tbody>
                {activity.map(a => (
                  <tr key={a.id} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium">{a.name}</div>
                      <div className="text-xs text-muted-foreground">{a.email}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-semibold ${a.ads_count > 0 ? "text-violet-600" : "text-muted-foreground"}`}>{a.ads_count}</span>
                    </td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className={`font-semibold ${a.messages_count > 0 ? "text-cyan-600" : "text-muted-foreground"}`}>{a.messages_count}</span>
                    </td>
                    <td className="px-4 py-3 text-center hidden md:table-cell">
                      <span className={`font-semibold ${a.reviews_count > 0 ? "text-amber-600" : "text-muted-foreground"}`}>{a.reviews_count}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {a.last_active ? new Date(a.last_active).toLocaleDateString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                    </td>
                  </tr>
                ))}
                {activity.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">Нет данных</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-display text-lg font-bold mb-1">Отклонить объявление</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">«{rejectModal.title}»</p>
            <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
              Причина отклонения
            </label>
            <textarea
              rows={3}
              value={rejectComment}
              onChange={e => setRejectComment(e.target.value)}
              placeholder="Укажите причину для пользователя..."
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
              >
                Отклонить
              </button>
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 py-2.5 border border-border rounded-xl text-muted-foreground hover:bg-muted/60 transition-colors"
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