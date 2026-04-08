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
import { User, getMe, logout, getToken } from "@/lib/auth";

export default function Index() {
  const [activePage, setActivePage] = useState("home");
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  // Параметры текущей страницы
  const [pageParam, setPageParam] = useState<number | null>(null);
  const [openAdForm, setOpenAdForm] = useState(false);

  useEffect(() => {
    if (getToken()) {
      getMe()
        .then(u => setUser(u))
        .catch(() => {})
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    setShowAuth(false);
  };

  const handlePostAd = () => {
    if (!user) { setShowAuth(true); return; }
    setOpenAdForm(true);
    setActivePage("my-ads");
  };

  const handleNavigate = (page: string) => {
    // Поддержка "ad:123" и "reviews:123"
    if (page.startsWith("ad:")) {
      setPageParam(parseInt(page.split(":")[1]));
      setActivePage("ad");
      return;
    }
    if (page.startsWith("reviews:")) {
      setPageParam(parseInt(page.split(":")[1]));
      setActivePage("reviews");
      return;
    }
    const protectedPages = ["my-ads", "favorites", "messages", "profile", "admin"];
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
      case "categories": return <CategoriesPage onNavigate={handleNavigate} />;
      case "my-ads": return <MyAdsPage openForm={openAdForm} onFormOpened={() => setOpenAdForm(false)} onNavigate={handleNavigate} />;
      case "favorites": return <FavoritesPage adImages={{}} onNavigate={handleNavigate} />;
      case "messages": return <MessagesPage user={user} onAuthClick={() => setShowAuth(true)} />;
      case "profile": return <ProfilePage user={user} onLogout={handleLogout} onNavigate={handleNavigate} />;
      case "about": return <AboutPage />;
      case "admin": return <AdminPage />;
      case "ad": return pageParam ? (
        <AdPage
          adId={pageParam}
          onBack={() => { setActivePage("home"); setPageParam(null); }}
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
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {renderPage()}
      </main>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

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
                {["Правила", "Конфиденциальность", "Помощь"].map(l => (
                  <button key={l} className="block text-muted-foreground hover:text-violet-600 transition-colors">{l}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-border/40 text-center text-xs text-muted-foreground">
            © 2024–2026 OMO · Маркет объявлений. Все права защищены.
          </div>
        </div>
      </footer>
    </div>
  );
}