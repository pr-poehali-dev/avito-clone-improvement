import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "categories", label: "Категории", icon: "LayoutGrid" },
  { id: "my-ads", label: "Мои объявления", icon: "FileText" },
  { id: "favorites", label: "Избранное", icon: "Heart" },
  { id: "messages", label: "Сообщения", icon: "MessageCircle", badge: 3 },
  { id: "profile", label: "Профиль", icon: "User" },
  { id: "about", label: "О платформе", icon: "Info" },
];

export default function Navbar({ activePage, onNavigate }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 glass-card border-b border-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => onNavigate("home")}
              className="flex items-center gap-2 group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg pulse-glow">
                <span className="text-white font-display font-bold text-sm">ОМ</span>
              </div>
              <span className="font-display font-bold text-xl tracking-wide hidden sm:block">
                <span className="gradient-text">Объяво</span>
                <span className="text-foreground">Маркет</span>
              </span>
            </button>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activePage === item.id
                      ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon name={item.icon} size={15} />
                  {item.label}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* CTA + mobile toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate("my-ads")}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg"
              >
                <Icon name="Plus" size={15} />
                Подать объявление
              </button>
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
                onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-1 ${
                  activePage === item.id
                    ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                <Icon name={item.icon} size={16} />
                {item.label}
                {item.badge && (
                  <span className="ml-auto w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={() => { onNavigate("my-ads"); setMobileOpen(false); }}
              className="flex items-center justify-center gap-1.5 w-full mt-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold text-sm"
            >
              <Icon name="Plus" size={15} />
              Подать объявление
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
