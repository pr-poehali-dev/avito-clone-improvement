import { useState } from "react";
import Icon from "@/components/ui/icon";
import Logo from "@/components/Logo";
import { User } from "@/lib/auth";

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
  { id: "my-ads", label: "Мои объявления", icon: "FileText", authRequired: true },
  { id: "favorites", label: "Избранное", icon: "Heart", authRequired: true },
  { id: "messages", label: "Сообщения", icon: "MessageCircle", badge: 3, authRequired: true },
  { id: "profile", label: "Профиль", icon: "User", authRequired: true },
];

export default function Navbar({ activePage, onNavigate, user, onAuthClick, onPostAd }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id: string, authRequired?: boolean) => {
    if (authRequired && !user) {
      onAuthClick();
      setMobileOpen(false);
      return;
    }
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 glass-card border-b border-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => onNavigate("home")} className="flex items-center">
            <Logo size={36} showText />
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
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
                {item.badge && user && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
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
                <button
                  onClick={() => handleNav("profile")}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted/60 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium truncate max-w-24">{user.name.split(" ")[0]}</span>
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
          {navItems.map((item) => (
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
              {item.authRequired && !user && (
                <span className="ml-auto">
                  <Icon name="Lock" size={12} className="text-muted-foreground opacity-50" />
                </span>
              )}
              {item.badge && user && (
                <span className="ml-auto w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          {user ? (
            <button
              onClick={() => { onPostAd(); setMobileOpen(false); }}
              className="flex items-center justify-center gap-1.5 w-full mt-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold text-sm"
            >
              <Icon name="Plus" size={15} />
              Подать объявление
            </button>
          ) : (
            <button
              onClick={() => { onAuthClick(); setMobileOpen(false); }}
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