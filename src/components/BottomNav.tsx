import Icon from "@/components/ui/icon";
import { User } from "@/lib/auth";
import { getFavoriteIds, subscribeFavorites } from "@/lib/favorites";
import { useState, useEffect } from "react";

interface BottomNavProps {
  activePage: string;
  onNavigate: (page: string) => void;
  user: User | null;
  onAuthClick: () => void;
  unreadMsgs: number;
  onBack?: () => void;
}

const items = [
  { id: "home", icon: "Home", label: "Главная" },
  { id: "categories", icon: "LayoutGrid", label: "Категории" },
  { id: "my-ads", icon: "Plus", label: "Подать", special: true, authRequired: true },
  { id: "favorites", icon: "Heart", label: "Избранное", favBadge: true },
  { id: "messages", icon: "MessageCircle", label: "Сообщения", msgBadge: true, authRequired: true },
];

export default function BottomNav({ activePage, onNavigate, user, onAuthClick, unreadMsgs, onBack }: BottomNavProps) {
  const [favCount, setFavCount] = useState(() => getFavoriteIds().length);

  useEffect(() => {
    setFavCount(getFavoriteIds().length);
    return subscribeFavorites(() => setFavCount(getFavoriteIds().length));
  }, []);

  const handleTap = (id: string, authRequired?: boolean) => {
    if (authRequired && !user) { onAuthClick(); return; }
    onNavigate(id);
  };

  if (activePage === "ad" && onBack) {
    return (
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-card/95 backdrop-blur-md border-t border-border/50 safe-area-bottom">
        <div className="flex items-center px-3 py-2 gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted/60 transition-colors shrink-0"
          >
            <Icon name="ChevronLeft" size={18} />
            Назад
          </button>
          <button
            onClick={() => onNavigate("home")}
            className="w-10 h-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/60 transition-colors shrink-0"
          >
            <Icon name="Home" size={18} />
          </button>
          <button
            onClick={() => onNavigate("messages")}
            className="relative w-10 h-10 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:bg-muted/60 transition-colors shrink-0"
          >
            <Icon name="MessageCircle" size={18} />
            {unreadMsgs > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold px-0.5">
                {unreadMsgs > 9 ? "9+" : unreadMsgs}
              </span>
            )}
          </button>
          <button
            onClick={() => onNavigate("categories")}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white text-sm font-semibold"
          >
            <Icon name="LayoutGrid" size={16} />
            Все объявления
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-card/95 backdrop-blur-md border-t border-border/50 safe-area-bottom">
      <div className="flex items-center justify-around px-1 py-1">
        {items.map(item => {
          const isActive = activePage === item.id;
          const badge = item.msgBadge && user && unreadMsgs > 0 ? unreadMsgs
            : item.favBadge && favCount > 0 ? favCount : 0;

          if (item.special) {
            return (
              <button
                key={item.id}
                onClick={() => handleTap(item.id, item.authRequired)}
                className="flex flex-col items-center justify-center w-14 h-14"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg -mt-4">
                  <Icon name={item.icon} size={22} className="text-white" />
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => handleTap(item.id, item.authRequired)}
              className="relative flex flex-col items-center justify-center gap-0.5 w-16 py-2"
            >
              <div className={`relative transition-all ${isActive ? "scale-110" : ""}`}>
                <Icon
                  name={item.icon}
                  size={22}
                  className={isActive ? "text-violet-600" : "text-muted-foreground"}
                />
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold px-0.5">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] leading-none font-medium ${isActive ? "text-violet-600" : "text-muted-foreground"}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-violet-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}