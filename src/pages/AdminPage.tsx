import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { adminCall } from "@/lib/messagesApi";
import AdminStatsTab from "@/components/admin/AdminStatsTab";
import AdminUsersTab, { AdminUser } from "@/components/admin/AdminUsersTab";
import AdminAdsTab, { AdminAd } from "@/components/admin/AdminAdsTab";
import { AdminReportsTab, AdminActivityTab, Report, UserActivity } from "@/components/admin/AdminReportsTab";
import AdminSupportTab from "@/components/admin/AdminSupportTab";

interface Stats {
  total_users: number; active_ads: number; total_ads: number;
  total_messages: number; total_reviews: number; total_views: number;
  new_users_week: number; new_ads_week: number;
}

type Tab = "stats" | "users" | "ads" | "activity" | "reports" | "support";

interface AdminPageProps {
  onNavigate?: (page: string, param?: number) => void;
}

export default function AdminPage({ onNavigate }: AdminPageProps) {
  const [tab, setTab] = useState<Tab>("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [ads, setAds] = useState<AdminAd[]>([]);
  const [activity, setActivity] = useState<UserActivity[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [reportsFilter, setReportsFilter] = useState("open");
  const [replyModal, setReplyModal] = useState<Report | null>(null);
  const [replyText, setReplyText] = useState("");
  const [openReportsCount, setOpenReportsCount] = useState(0);
  const [openSupportCount, setOpenSupportCount] = useState(0);
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

  const loadSupportCount = async () => {
    const { adminTicketsCount } = await import("@/lib/supportApi");
    const res = await adminTicketsCount();
    setOpenSupportCount(res.count || 0);
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

  const loadActivity = async () => {
    setLoading(true);
    const data = await adminCall("user_activity");
    if (!data.error) setActivity(data.activity || []);
    setLoading(false);
  };

  const loadReports = async (status = reportsFilter) => {
    setLoading(true);
    const data = await adminCall("reports", { status });
    if (!data.error) { setReports(data.reports || []); setOpenReportsCount(data.open_count || 0); }
    setLoading(false);
  };

  const handleResolve = async (id: number, reply: string, status: string) => {
    await adminCall("resolve_report", {}, { id, reply, status });
    setReplyModal(null);
    setReplyText("");
    loadReports();
  };

  useEffect(() => { loadStats(); loadSupportCount(); }, []);

  useEffect(() => {
    if (tab === "users") loadUsers(search);
    if (tab === "ads") loadAds(search, statusFilter);
    if (tab === "activity") loadActivity();
    if (tab === "reports") loadReports();
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
        {([["stats", "BarChart2", "Статистика"], ["users", "Users", "Пользователи"], ["ads", "FileText", "Объявления"], ["activity", "Activity", "Активность"], ["reports", "Flag", "Жалобы"], ["support", "Headphones", "Поддержка"]] as const).map(([id, icon, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === id ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Icon name={icon} size={15} />
            {label}
            {id === "reports" && openReportsCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1">
                {openReportsCount}
              </span>
            )}
            {id === "support" && openSupportCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1">
                {openSupportCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
      )}

      {tab === "stats" && !loading && stats && (
        <AdminStatsTab stats={stats} />
      )}

      {tab === "users" && !loading && (
        <AdminUsersTab
          users={users}
          search={search}
          onSearch={handleSearch}
          onBan={handleBan}
          onMakeAdmin={handleMakeAdmin}
          onViewUser={onNavigate ? (userId) => onNavigate("reviews", userId) : undefined}
        />
      )}

      {tab === "ads" && !loading && (
        <AdminAdsTab
          ads={ads}
          search={search}
          statusFilter={statusFilter}
          onSearch={handleSearch}
          onStatusFilter={handleStatusFilter}
          onApprove={handleApprove}
          onDelete={handleDeleteAd}
          onReject={(ad) => { setRejectModal(ad); setRejectComment(""); }}
          onViewAd={onNavigate ? (adId) => onNavigate("ad", adId) : undefined}
          onViewUser={onNavigate ? (userId) => onNavigate("reviews", userId) : undefined}
        />
      )}

      {tab === "reports" && !loading && (
        <AdminReportsTab
          reports={reports}
          reportsFilter={reportsFilter}
          replyModal={replyModal}
          replyText={replyText}
          onFilterChange={(s) => { setReportsFilter(s); loadReports(s); }}
          onOpenReply={(r) => { setReplyModal(r); setReplyText(""); }}
          onCloseReply={() => setReplyModal(null)}
          onReplyTextChange={setReplyText}
          onResolve={handleResolve}
        />
      )}

      {tab === "activity" && !loading && (
        <AdminActivityTab activity={activity} />
      )}

      {tab === "support" && (
        <AdminSupportTab />
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