import Icon from "@/components/ui/icon";

export interface AdminUser {
  id: number; name: string; email: string; created_at: string;
  ads_count: number; is_admin: boolean; is_banned: boolean;
}

interface AdminUsersTabProps {
  users: AdminUser[];
  search: string;
  onSearch: (v: string) => void;
  onBan: (userId: number, banned: boolean) => void;
  onMakeAdmin: (userId: number) => void;
}

export default function AdminUsersTab({ users, search, onSearch, onBan, onMakeAdmin }: AdminUsersTabProps) {
  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={e => onSearch(e.target.value)}
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
                      onClick={() => onBan(u.id, !u.is_banned)}
                      title={u.is_banned ? "Разблокировать" : "Заблокировать"}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${u.is_banned ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-600" : "bg-rose-50 hover:bg-rose-100 text-rose-600"}`}
                    >
                      <Icon name={u.is_banned ? "UserCheck" : "UserX"} size={14} />
                    </button>
                    {!u.is_admin && (
                      <button
                        onClick={() => onMakeAdmin(u.id)}
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
  );
}
