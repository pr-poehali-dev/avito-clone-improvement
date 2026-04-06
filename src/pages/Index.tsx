import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import AuthModal from "@/components/AuthModal";
import HomePage from "@/pages/HomePage";
import CategoriesPage from "@/pages/CategoriesPage";
import MyAdsPage from "@/pages/MyAdsPage";
import FavoritesPage from "@/pages/FavoritesPage";
import MessagesPage from "@/pages/MessagesPage";
import ProfilePage from "@/pages/ProfilePage";
import AboutPage from "@/pages/AboutPage";
import { User, getMe, logout, getToken } from "@/lib/auth";

export default function Index() {
  const [activePage, setActivePage] = useState("home");
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);



  // Восстанавливаем сессию при загрузке
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
    setActivePage("my-ads");
  };

  const handleNavigate = (page: string) => {
    const protectedPages = ["my-ads", "favorites", "messages", "profile"];
    if (protectedPages.includes(page) && !user) {
      setShowAuth(true);
      return;
    }
    setActivePage(page);
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
      case "categories": return <CategoriesPage />;
      case "my-ads": return <MyAdsPage />;
      case "favorites": return <FavoritesPage adImages={{}} onNavigate={handleNavigate} />;
      case "messages": return <MessagesPage />;
      case "profile": return <ProfilePage user={user} onLogout={handleLogout} />;
      case "about": return <AboutPage />;
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

      {/* Auth modal */}
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
              <span className="text-white font-bold text-xs">ОМ</span>
            </div>
            <span className="font-semibold text-foreground">ОбъявоМаркет</span>
          </div>
          <div>© 2024–2026 ОбъявоМаркет. Все права защищены.</div>
          <div className="flex gap-4">
            {["Правила", "Конфиденциальность", "Помощь"].map(link => (
              <button key={link} className="hover:text-violet-600 transition-colors">{link}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}