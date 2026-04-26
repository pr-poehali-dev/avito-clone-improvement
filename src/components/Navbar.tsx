import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import Logo from "@/components/Logo";
import { User } from "@/lib/auth";
import { getFavoriteIds, subscribeFavorites } from "@/lib/favorites";
import { getToken } from "@/lib/auth";
import NotificationBell from "@/components/NotificationBell";
import CitySelect, { RUSSIAN_CITIES } from "@/components/CitySelect";
import { categories } from "@/data/mockData";

const ADS_URL =
  "https://functions.poehali.dev/20fb4d0c-9d4b-45b1-b857-f639e2beaa7a";

interface NavbarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  user: User | null;
  onAuthClick: () => void;
  onPostAd: () => void;
  onSearch?: (query: string, filters?: { city: string; category: string; minPrice: string; maxPrice: string }) => void;
  theme?: string;
  onToggleTheme?: () => void;
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
  onSearch,
  theme,
  onToggleTheme,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const [favCount, setFavCount] = useState(() => getFavoriteIds().length);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCity, setSearchCity] = useState("Все города");
  const [searchCategory, setSearchCategory] = useState("");
  const [searchMinPrice, setSearchMinPrice] = useState("");
  const [searchMaxPrice, setSearchMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [cityInputValue, setCityInputValue] = useState("Все города");
  const [cityDropOpen, setCityDropOpen] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const searchPanelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);

  const filteredCities = citySearch.trim()
    ? RUSSIAN_CITIES.filter(c => c.toLowerCase().includes(citySearch.toLowerCase()))
    : RUSSIAN_CITIES;

  const selectCity = (city: string) => {
    setSearchCity(city);
    setCityInputValue(city);
    setCityDropOpen(false);
    setCitySearch("");
  };

  // Закрытие панели поиска при клике вне
  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: MouseEvent) => {
      if (searchPanelRef.current && !searchPanelRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchOpen]);

  // Ctrl+K / Cmd+K открывает поиск
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      if (e.key === "Escape") { setSearchOpen(false); setShowFilters(false); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

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

          {/* Search trigger button */}
          <button
            onClick={() => { setSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 50); }}
            className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all border border-transparent hover:border-border"
          >
            <Icon name="Search" size={15} />
            <span className="text-muted-foreground/50">Поиск</span>
          </button>



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
                  <div className="w-7 h-7 rounded-lg overflow-hidden bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shrink-0">
                    {user.avatar_url
                      ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      : <span className="text-white font-bold text-xs">{user.name.charAt(0).toUpperCase()}</span>
                    }
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

      {/* Search panel (desktop dropdown) */}
      {searchOpen && (
        <div
          ref={searchPanelRef}
          className="hidden md:block absolute left-0 right-0 top-full z-50 bg-white border-b border-border shadow-xl animate-fade-in"
        >
          <div className="max-w-4xl mx-auto px-6 py-2">
            {/* Main row */}
            <form
              onSubmit={e => {
                e.preventDefault();
                onNavigate("categories");
                onSearch?.(searchQuery, { city: searchCity, category: searchCategory, minPrice: searchMinPrice, maxPrice: searchMaxPrice });
                setSearchOpen(false);
                setShowFilters(false);
              }}
            >
              <div className="flex gap-1.5 bg-muted/40 rounded-xl border border-border px-1.5 py-1.5 items-center">
                {/* City selector с поиском */}
                <div className="relative flex items-center gap-1.5 pl-2 pr-2 border-r border-border shrink-0">
                  <Icon name="MapPin" size={13} className="text-violet-500 shrink-0" />
                  <input
                    ref={cityInputRef}
                    type="text"
                    value={cityDropOpen ? citySearch : cityInputValue}
                    onChange={e => { setCitySearch(e.target.value); setCityDropOpen(true); }}
                    onFocus={() => { setCityDropOpen(true); setCitySearch(""); }}
                    onBlur={() => setTimeout(() => { setCityDropOpen(false); setCitySearch(""); }, 150)}
                    placeholder="Город"
                    className="text-sm outline-none bg-transparent text-muted-foreground w-[110px] cursor-pointer"
                  />
                  {cityDropOpen && filteredCities.length > 0 && (
                    <div className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-card border border-border rounded-xl shadow-2xl z-[200] overflow-hidden animate-fade-in">
                      <div className="max-h-60 overflow-y-auto py-1">
                        {filteredCities.map((city, idx) => (
                          <button
                            key={`${city}-${idx}`}
                            type="button"
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => selectCity(city)}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-violet-50 dark:hover:bg-violet-900/30 transition-colors ${
                              searchCity === city ? "text-violet-700 font-semibold bg-violet-50 dark:bg-violet-900/20" : "text-foreground"
                            }`}
                          >
                            {city}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Что ищете?"
                  className="flex-1 outline-none bg-transparent text-sm placeholder:text-muted-foreground min-w-0"
                />
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${showFilters ? "bg-violet-100 text-violet-700" : "text-muted-foreground hover:bg-muted/60"}`}
                >
                  <Icon name="SlidersHorizontal" size={13} />
                  Фильтры
                  {(searchCategory || searchMinPrice || searchMaxPrice) && (
                    <span className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
                  )}
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1 px-4 py-1.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
                >
                  <Icon name="Search" size={14} />
                  Найти
                </button>
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setShowFilters(false); }}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted/60 text-muted-foreground shrink-0"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>

              {/* Filters */}
              {showFilters && (
                <div className="mt-2 p-3 bg-muted/30 rounded-xl border border-border animate-fade-in">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Категория</label>
                      <select
                        value={searchCategory}
                        onChange={e => setSearchCategory(e.target.value)}
                        className="w-full border border-border rounded-lg px-2 py-1.5 text-sm bg-white outline-none focus:border-violet-400 transition-colors"
                      >
                        <option value="">Все категории</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Цена от, ₽</label>
                      <input
                        type="number"
                        value={searchMinPrice}
                        onChange={e => setSearchMinPrice(e.target.value)}
                        placeholder="0"
                        className="w-full border border-border rounded-lg px-2 py-1.5 text-sm bg-white outline-none focus:border-violet-400 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">Цена до, ₽</label>
                      <input
                        type="number"
                        value={searchMaxPrice}
                        onChange={e => setSearchMaxPrice(e.target.value)}
                        placeholder="Любая"
                        className="w-full border border-border rounded-lg px-2 py-1.5 text-sm bg-white outline-none focus:border-violet-400 transition-colors"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => { setSearchCategory(""); setSearchMinPrice(""); setSearchMaxPrice(""); setSearchCity("Все города"); }}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Сбросить фильтры
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

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
          {onToggleTheme && (
            <button
              onClick={() => { onToggleTheme(); setMobileOpen(false); }}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-muted/60 transition-all mb-1"
            >
              <Icon name={theme === "dark" ? "Sun" : "Moon"} size={16} />
              {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
            </button>
          )}
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