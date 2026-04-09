import Icon from "@/components/ui/icon";

export interface Report {
  id: number; reason: string; details: string | null; status: string; admin_reply: string | null;
  created_at: string; reporter_name: string; reporter_id: number;
  ad_title: string | null; ad_id: number | null; target_name: string | null; target_id: number | null;
}

export interface UserActivity {
  id: number; name: string; email: string; reg_date: string;
  ads_count: number; messages_count: number; reviews_count: number; last_active: string | null;
}

interface AdminReportsTabProps {
  reports: Report[];
  reportsFilter: string;
  replyModal: Report | null;
  replyText: string;
  onFilterChange: (status: string) => void;
  onOpenReply: (report: Report) => void;
  onCloseReply: () => void;
  onReplyTextChange: (text: string) => void;
  onResolve: (id: number, reply: string, status: string) => void;
}

interface AdminActivityTabProps {
  activity: UserActivity[];
}

export function AdminReportsTab({
  reports, reportsFilter, replyModal, replyText,
  onFilterChange, onOpenReply, onCloseReply, onReplyTextChange, onResolve,
}: AdminReportsTabProps) {
  return (
    <>
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          {[["open", "Открытые"], ["resolved", "Решённые"], ["dismissed", "Отклонённые"], ["all", "Все"]].map(([s, l]) => (
            <button key={s} onClick={() => onFilterChange(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${reportsFilter === s ? "bg-rose-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {l}
            </button>
          ))}
        </div>
        {reports.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Icon name="Flag" size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Жалоб нет</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r.id} className="glass-card rounded-2xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.status === "open" ? "bg-rose-100 text-rose-600" : r.status === "resolved" ? "bg-emerald-100 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
                        {r.status === "open" ? "Открыта" : r.status === "resolved" ? "Решена" : "Отклонена"}
                      </span>
                      <span className="text-xs font-semibold">{r.reason}</span>
                      <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString("ru-RU")}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      От: <span className="font-medium text-foreground">{r.reporter_name}</span>
                      {r.ad_title && <> · Объявление: <span className="font-medium text-foreground">«{r.ad_title}»</span></>}
                      {r.target_name && <> · На пользователя: <span className="font-medium text-foreground">{r.target_name}</span></>}
                    </div>
                    {r.details && <p className="text-xs text-muted-foreground mt-1 italic">«{r.details}»</p>}
                    {r.admin_reply && (
                      <div className="mt-2 px-3 py-2 bg-emerald-50 rounded-xl text-xs text-emerald-700">
                        <span className="font-semibold">Ответ: </span>{r.admin_reply}
                      </div>
                    )}
                  </div>
                  {r.status === "open" && (
                    <button onClick={() => onOpenReply(r)}
                      className="shrink-0 px-3 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-semibold hover:opacity-90">
                      Ответить
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reply modal */}
      {replyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="font-display text-lg font-bold mb-1">Ответ на жалобу</h3>
            <p className="text-sm text-muted-foreground mb-1">Причина: <span className="font-medium text-foreground">{replyModal.reason}</span></p>
            {replyModal.details && <p className="text-xs text-muted-foreground mb-3 italic">«{replyModal.details}»</p>}
            <textarea rows={3} value={replyText} onChange={e => onReplyTextChange(e.target.value)}
              placeholder="Ответ пользователю (необязательно)..."
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 resize-none mb-4"
            />
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => onResolve(replyModal.id, replyText, "resolved")}
                className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl font-semibold text-sm hover:bg-emerald-600">
                Решена
              </button>
              <button onClick={() => onResolve(replyModal.id, replyText, "dismissed")}
                className="flex-1 py-2.5 bg-muted text-muted-foreground rounded-xl font-semibold text-sm hover:bg-muted/80">
                Отклонить жалобу
              </button>
              <button onClick={onCloseReply}
                className="px-4 py-2.5 border border-border rounded-xl text-muted-foreground hover:bg-muted/60 text-sm">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AdminActivityTab({ activity }: AdminActivityTabProps) {
  return (
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
  );
}
