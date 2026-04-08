import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import Logo from "@/components/Logo";
import { User } from "@/lib/auth";
import { getFavoriteIds, subscribeFavorites } from "@/lib/favorites";
import { getToken } from "@/lib/auth";
import NotificationBell from "@/components/NotificationBell";

const ADS_URL =
  "https://functions.poehali.dev/20fb4d0c-9d4b-45b1-b857-f639e2beaa7a";

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  user: User | null;
  onAuthClick: () => void;
  onPostAd: () => void;
}

const navItems = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "categories", label: "Категории", icon: "LayoutGrid" },
  {
    id: "my-ads",
    label: "Мои объявления",
    icon: "FileText",
    authRequired: true,
  },
  {
    id: "favorites",
    label: "Избранное",
    icon: "Heart",
    authRequired: false,
    favBadge: true,
  },
  {
    id: "messages",
    label: "Сообщения",
    icon: "MessageCircle",
    authRequired: true,
    msgBadge: true,
  },
];

export default function Navbar({
  activePage,
  onNavigate,
  user,
  onAuthClick,
  onPostAd,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const [favCount, setFavCount] = useState(() => getFavoriteIds().length);

  // Счётчик непрочитанных сообщений
  useEffect(() => {
    if (!user) {
      setUnreadMsgs(0);
      return;
    }
    const fetchUnread = async () => {
      try {
        const token = getToken();
        const res = await fetch(`${ADS_URL}/?action=unread`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setUnreadMsgs(data.count || 0);
      } catch {
        // pass
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // каждые 30 сек
    return () => clearInterval(interval);
  }, [user]);

  // Счётчик избранного
  useEffect(() => {
    setFavCount(getFavoriteIds().length);
    const unsub = subscribeFavorites(() =>
      setFavCount(getFavoriteIds().length),
    );
    return unsub;
  }, []);

  // Сбрасываем счётчик при переходе в messages
  const handleNav = (id: string, authRequired?: boolean) => {
    if (authRequired && !user) {
      onAuthClick();
      setMobileOpen(false);
      return;
    }
    if (id === "messages") setUnreadMsgs(0);
    onNavigate(id);
    setMobileOpen(false);
  };

  const getBadge = (item: (typeof navItems)[0]) => {
    if (item.msgBadge && user && unreadMsgs > 0) return unreadMsgs;
    if (item.favBadge && favCount > 0) return favCount;
    return 0;
  };

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => onNavigate("home")}
            className="flex items-center"
          >
            <Logo size={36} showText />
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const badge = getBadge(item);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id, item.authRequired)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activePage === item.id
                      ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon name={item.icon} size={15} />
                  {item.label}
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold px-1">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <button
                  onClick={onPostAd}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg"
                >
                  <Icon name="Plus" size={15} />
                  Подать объявление
                </button>
                <NotificationBell onNavigate={onNavigate} />
                <button
                  onClick={() => handleNav("profile")}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted/60 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium truncate max-w-24">
                    {user.name.split(" ")[0]}
                  </span>
                </button>
              </>
            ) : (
              <button
                onClick={onAuthClick}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg"
              >
                <Icon name="LogIn" size={15} />
                Войти
              </button>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-muted/60 transition-colors"
            >
              <Icon name={mobileOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 py-2 px-4 animate-fade-in">
          {navItems.map((item) => {
            const badge = getBadge(item);
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id, item.authRequired)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                  activePage === item.id
                    ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                <Icon name={item.icon} size={16} />
                {item.label}
                {item.authRequired && !user ? (
                  <span className="ml-auto">
                    <Icon
                      name="Lock"
                      size={12}
                      className="text-muted-foreground opacity-50"
                    />
                  </span>
                ) : badge > 0 ? (
                  <span className="ml-auto min-w-[20px] h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold px-1">
                    {badge > 99 ? "99+" : badge}
                  </span>
                ) : null}
              </button>
            );
          })}
          {user ? (
            <button
              onClick={() => {
                onPostAd();
                setMobileOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 w-full mt-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold text-sm"
            >
              <Icon name="Plus" size={15} />
              Подать объявление
            </button>
          ) : (
            <button
              onClick={() => {
                onAuthClick();
                setMobileOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 w-full mt-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold text-sm"
            >
              <Icon name="LogIn" size={15} />
              Войти / Зарегистрироваться
            </button>
          )}
        </div>
      )}
    </nav>
  );
}