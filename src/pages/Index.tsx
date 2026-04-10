import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Logo from "@/components/Logo";
import AuthModal from "@/components/AuthModal";
import HomePage from "@/pages/HomePage";
import CategoriesPage from "@/pages/CategoriesPage";
import MyAdsPage from "@/pages/MyAdsPage";
import FavoritesPage from "@/pages/FavoritesPage";
import MessagesPage from "@/pages/MessagesPage";
import ProfilePage from "@/pages/ProfilePage";
import AboutPage from "@/pages/AboutPage";
import AdPage from "@/pages/AdPage";
import ReviewsPage from "@/pages/ReviewsPage";
import AdminPage from "@/pages/AdminPage";
import HistoryPage from "@/pages/HistoryPage";
import SubscriptionsPage from "@/pages/SubscriptionsPage";
import SupportButton from "@/components/SupportButton";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/ui/icon";
import { User, getMe, logout, getToken } from "@/lib/auth";

const ADS_URL = "https://functions.poehali.dev/20fb4d0c-9d4b-45b1-b857-f639e2beaa7a";

export default function Index() {
  const [activePage, setActivePage] = useState("home");
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [pageParam, setPageParam] = useState<number | null>(null);
  const [openAdForm, setOpenAdForm] = useState(false);
  const [unreadMsgs, setUnreadMsgs] = useState(0);
  const [globalSearch, setGlobalSearch] = useState("");
  const [globalFilters, setGlobalFilters] = useState<{ city: string; category: string; minPrice: string; maxPrice: string } | undefined>();
  const [prevPage, setPrevPage] = useState("home");

  useEffect(() => {
    if (getToken()) {
      getMe()
        .then(u => { setUser(u); if (u?.city) localStorage.setItem("om_user_city", u.city); })
        .catch(() => {})
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) { setUnreadMsgs(0); return; }
    const fetch = async () => {
      try {
        const token = getToken();
        const res = await window.fetch(`${ADS_URL}/?action=unread`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const d = await res.json();
        setUnreadMsgs(d.count || 0);
      } catch { /* ignore */ }
    };
    fetch();
    const iv = setInterval(fetch, 30000);
    return () => clearInterval(iv);
  }, [user]);

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    setShowAuth(false);
    if (u.city) localStorage.setItem("om_user_city", u.city);
  };

  // Динамический title страницы
  useEffect(() => {
    const titles: Record<string, string> = {
      home: "OMO — Маркет объявлений",
      categories: "Категории — OMO",
      "my-ads": "Мои объявления — OMO",
      favorites: "Избранное — OMO",
      messages: "Сообщения — OMO",
      profile: "Профиль — OMO",
      about: "О платформе — OMO",
      admin: "Админ-панель — OMO",
      history: "История просмотров — OMO",
      subscriptions: "Подписки — OMO",
    };
    document.title = titles[activePage] || "OMO — Маркет объявлений";
  }, [activePage]);

  const handlePostAd = () => {
    if (!user) { setShowAuth(true); return; }
    setOpenAdForm(true);
    setActivePage("my-ads");
  };

  const handleNavigate = (page: string) => {
    // Поддержка "ad:123" и "reviews:123"
    if (page.startsWith("ad:")) {
      setPrevPage(activePage);
      setPageParam(parseInt(page.split(":")[1]));
      setActivePage("ad");
      return;
    }
    if (page.startsWith("reviews:")) {
      setPageParam(parseInt(page.split(":")[1]));
      setActivePage("reviews");
      return;
    }
    const protectedPages = ["my-ads", "favorites", "messages", "profile", "admin", "history", "subscriptions"];
    if (protectedPages.includes(page) && !user) {
      setShowAuth(true);
      return;
    }
    setActivePage(page);
    setPageParam(null);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setActivePage("home");
  };

  const renderPage = () => {
    if (authLoading) {
      return (
        <div className="flex items-center justify-center py-32">
          <div className="w-10 h-10 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
        </div>
      );
    }
    switch (activePage) {
      case "home": return <HomePage onNavigate={handleNavigate} adImages={{}} onAuthClick={() => setShowAuth(true)} />;
      case "categories": return <CategoriesPage onNavigate={handleNavigate} initialSearch={globalSearch} initialFilters={globalFilters} onSearchConsumed={() => { setGlobalSearch(""); setGlobalFilters(undefined); }} />;
      case "my-ads": return <MyAdsPage openForm={openAdForm} onFormOpened={() => setOpenAdForm(false)} onNavigate={handleNavigate} />;
      case "favorites": return <FavoritesPage adImages={{}} onNavigate={handleNavigate} />;
      case "messages": return <MessagesPage user={user} onAuthClick={() => setShowAuth(true)} />;
      case "profile": return <ProfilePage user={user} onLogout={handleLogout} onNavigate={handleNavigate} onUserUpdate={setUser} />;
      case "about": return <AboutPage />;
      case "admin": return <AdminPage onNavigate={(page, param) => { if (param) { setPageParam(param); } handleNavigate(page); }} />;
      case "history": return <HistoryPage onNavigate={handleNavigate} />;
      case "subscriptions": return <SubscriptionsPage onNavigate={handleNavigate} />;
      case "ad": return pageParam ? (
        <AdPage
          adId={pageParam}
          onBack={() => {
            window.dispatchEvent(new Event("om:viewed_updated"));
            setActivePage(prevPage || "home");
            setPageParam(null);
          }}
          onNavigate={handleNavigate}
          user={user}
          onAuthClick={() => setShowAuth(true)}
        />
      ) : null;
      case "reviews": return pageParam ? (
        <ReviewsPage
          userId={pageParam}
          onBack={() => { setActivePage("home"); setPageParam(null); }}
          currentUser={user}
          onAuthClick={() => setShowAuth(true)}
        />
      ) : null;
      default: return <HomePage onNavigate={handleNavigate} adImages={{}} onAuthClick={() => setShowAuth(true)} />;
    }
  };

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        user={user}
        onAuthClick={() => setShowAuth(true)}
        onPostAd={handlePostAd}
        onSearch={(q, f) => { setGlobalSearch(q); setGlobalFilters(f); handleNavigate("categories"); }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-8">
        {renderPage()}
      </main>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      <SupportButton />

      <BottomNav
        activePage={activePage}
        onNavigate={handleNavigate}
        user={user}
        onAuthClick={() => setShowAuth(true)}
        unreadMsgs={unreadMsgs}
      />

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-8">
            <div className="space-y-2">
              <Logo size={32} showText />
              <p className="text-xs text-muted-foreground max-w-xs">
                Современная доска объявлений. Покупай и продавай легко.
              </p>
            </div>
            <div className="flex flex-wrap gap-8 text-sm">
              <div className="space-y-2">
                <div className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Навигация</div>
                {["Главная", "Категории"].map(l => (
                  <button key={l} onClick={() => handleNavigate(l === "Главная" ? "home" : "categories")}
                    className="block text-muted-foreground hover:text-violet-600 transition-colors">{l}</button>
                ))}
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-xs uppercase tracking-wide text-muted-foreground">Компания</div>
                {[["О платформе", "about"]].map(([l, p]) => (
                  <button key={l} onClick={() => handleNavigate(p)}
                    className="block text-muted-foreground hover:text-violet-600 transition-colors">{l}</button>
                ))}
                {[
                  ["Правила", "https://poehali.dev/help"],
                  ["Конфиденциальность", "https://poehali.dev/help"],
                  ["Помощь", "https://poehali.dev/help"],
                ].map(([l, href]) => (
                  <a key={l} href={href} target="_blank" rel="noopener noreferrer"
                    className="block text-muted-foreground hover:text-violet-600 transition-colors">{l}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>© 2024–2026 OMO · Маркет объявлений. Все права защищены.</span>
            <a href="https://t.me/+QgiLIa1gFRY4Y2Iy" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 hover:text-violet-600 transition-colors">
              <Icon name="Send" size={12} />
              Telegram-сообщество
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}