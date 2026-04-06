import { useState } from "react";
import Navbar from "@/components/Navbar";
import HomePage from "@/pages/HomePage";
import CategoriesPage from "@/pages/CategoriesPage";
import MyAdsPage from "@/pages/MyAdsPage";
import FavoritesPage from "@/pages/FavoritesPage";
import MessagesPage from "@/pages/MessagesPage";
import ProfilePage from "@/pages/ProfilePage";
import AboutPage from "@/pages/AboutPage";

export default function Index() {
  const [activePage, setActivePage] = useState("home");
  const adImages: Record<number, string> = {
    1: "https://cdn.poehali.dev/projects/c5b32207-6753-4064-911c-737bcd163c5b/files/50cd05da-fd53-4214-a3f1-3ab582f7a5ff.jpg",
    2: "https://cdn.poehali.dev/projects/c5b32207-6753-4064-911c-737bcd163c5b/files/ff215b10-9cd0-4c03-b8ca-9a690beffcef.jpg",
    3: "https://cdn.poehali.dev/projects/c5b32207-6753-4064-911c-737bcd163c5b/files/3ecfc90b-a24f-45bc-afa3-80611bd63a4e.jpg",
  };

  const renderPage = () => {
    switch (activePage) {
      case "home": return <HomePage onNavigate={setActivePage} adImages={adImages} />;
      case "categories": return <CategoriesPage adImages={adImages} />;
      case "my-ads": return <MyAdsPage adImages={adImages} />;
      case "favorites": return <FavoritesPage adImages={adImages} onNavigate={setActivePage} />;
      case "messages": return <MessagesPage />;
      case "profile": return <ProfilePage />;
      case "about": return <AboutPage />;
      default: return <HomePage onNavigate={setActivePage} adImages={adImages} />;
    }
  };

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar activePage={activePage} onNavigate={setActivePage} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {renderPage()}
      </main>

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