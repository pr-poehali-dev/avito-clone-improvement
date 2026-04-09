import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { getNotifications, markNotificationsRead, Notification, formatTimeAgo } from "@/lib/adsApi";

interface NotificationBellProps {
  onNavigate: (page: string) => void;
}

export default function NotificationBell({ onNavigate }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unread_count);
    } catch {
      // не авторизован — тихо игнорируем
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleOpen = async () => {
    setOpen(v => !v);
    if (!open && unreadCount > 0) {
      await markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    }
  };

  const handleNotifClick = (n: Notification) => {
    setOpen(false);
    if (n.ad_id) onNavigate(`ad:${n.ad_id}`);
    else onNavigate("my-ads");
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted/60 transition-colors"
      >
        <Icon name="Bell" size={19} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-2xl border border-border/50 z-50 animate-fade-in overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
            <span className="font-semibold text-sm">Уведомления</span>
            {notifications.some(n => !n.is_read) && (
              <button
                onClick={async () => { await markNotificationsRead(); setNotifications(p => p.map(n => ({ ...n, is_read: true }))); setUnreadCount(0); }}
                className="text-xs text-violet-600 hover:underline"
              >
                Прочитать все
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              <Icon name="BellOff" size={28} className="mx-auto mb-2 opacity-30" />
              Уведомлений нет
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-border/30">
              {notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleNotifClick(n)}
                  className={`w-full text-left px-4 py-3.5 hover:bg-muted/30 transition-colors ${!n.is_read ? "bg-violet-50/60" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      n.type === "approved" ? "bg-emerald-100" :
                      n.type === "rejected" ? "bg-rose-100" :
                      n.type === "message" ? "bg-cyan-100" :
                      n.type === "review" ? "bg-amber-100" :
                      n.type === "price_offer" ? "bg-violet-100" :
                      n.type === "subscription" ? "bg-indigo-100" :
                      "bg-muted"
                    }`}>
                      <Icon
                        name={
                          n.type === "approved" ? "CheckCircle" :
                          n.type === "rejected" ? "XCircle" :
                          n.type === "message" ? "MessageCircle" :
                          n.type === "review" ? "Star" :
                          n.type === "price_offer" ? "Tag" :
                          n.type === "subscription" ? "Bell" :
                          "Bell"
                        }
                        size={16}
                        className={
                          n.type === "approved" ? "text-emerald-600" :
                          n.type === "rejected" ? "text-rose-500" :
                          n.type === "message" ? "text-cyan-600" :
                          n.type === "review" ? "text-amber-500" :
                          n.type === "price_offer" ? "text-violet-600" :
                          n.type === "subscription" ? "text-indigo-600" :
                          "text-muted-foreground"
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{n.title}</span>
                        {!n.is_read && <span className="w-2 h-2 bg-violet-500 rounded-full shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.text}</p>
                      <span className="text-[11px] text-muted-foreground/70 mt-1 block">{formatTimeAgo(n.created_at)}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}