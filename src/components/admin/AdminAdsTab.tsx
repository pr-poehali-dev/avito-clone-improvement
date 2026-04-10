import { useState } from "react";
import Icon from "@/components/ui/icon";
import { formatPrice } from "@/components/AdCard";

export interface AdminAd {
  id: number; title: string; price: number; status: string;
  views: number; created_at: string; seller: string; user_id: number; category: string;
}

interface AdminAdsTabProps {
  ads: AdminAd[];
  search: string;
  statusFilter: string;
  onSearch: (v: string) => void;
  onStatusFilter: (s: string) => void;
  onApprove: (adId: number) => void;
  onDelete: (adId: number) => void;
  onReject: (ad: { id: number; title: string }) => void;
  onViewAd?: (adId: number) => void;
  onViewUser?: (userId: number) => void;
}

const statusLabels: Record<string, { label: string; cls: string }> = {
  active: { label: "Активно", cls: "bg-emerald-100 text-emerald-600" },
  pending: { label: "На проверке", cls: "bg-blue-100 text-blue-600" },
  paused: { label: "На паузе", cls: "bg-yellow-100 text-yellow-700" },
  archived: { label: "Архив", cls: "bg-gray-100 text-gray-500" },
  rejected: { label: "Отклонено", cls: "bg-rose-100 text-rose-600" },
  deleted: { label: "Удалено", cls: "bg-rose-100 text-rose-600" },
};

export default function AdminAdsTab({ ads, search, statusFilter, onSearch, onStatusFilter, onApprove, onDelete, onReject, onViewAd, onViewUser }: AdminAdsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
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
              onClick={() => onStatusFilter(s)}
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
                    <button
                      onClick={() => onViewAd?.(a.id)}
                      className="font-medium line-clamp-1 max-w-[200px] text-left hover:text-violet-600 transition-colors"
                      title="Открыть объявление"
                    >
                      {a.title}
                    </button>
                    <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString("ru-RU")}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <button
                      onClick={() => onViewUser?.(a.user_id)}
                      className="text-muted-foreground hover:text-violet-600 transition-colors"
                      title="Открыть профиль"
                    >
                      {a.seller}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold hidden md:table-cell">{formatPrice(a.price)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${sl.cls}`}>
                      {sl.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onViewAd?.(a.id)}
                        title="Открыть объявление"
                        className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors"
                      >
                        <Icon name="ExternalLink" size={14} />
                      </button>
                      {a.status === "pending" && (
                        <>
                          <button
                            onClick={() => onApprove(a.id)}
                            title="Одобрить"
                            className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors"
                          >
                            <Icon name="Check" size={14} />
                          </button>
                          <button
                            onClick={() => onReject({ id: a.id, title: a.title })}
                            title="Отклонить"
                            className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors"
                          >
                            <Icon name="X" size={14} />
                          </button>
                        </>
                      )}
                      {a.status !== "deleted" && (
                        <button
                          onClick={() => onDelete(a.id)}
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
  );
}