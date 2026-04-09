import { useState, useEffect } from "react";
import SearchBar from "@/components/SearchBar";
import AdCard from "@/components/AdCard";
import Icon from "@/components/ui/icon";
import { categories } from "@/data/mockData";
import { listAds, getSiteStats, getViewedIds, Ad, ListFilters } from "@/lib/adsApi";
import { getToken } from "@/lib/auth";
import RecommendationsBlock from "@/components/RecommendationsBlock";
import HotAdsBlock from "@/components/HotAdsBlock";
import AdBanner from "@/components/AdBanner";

interface HomePageProps {
  onNavigate: (page: string) => void;
  adImages: Record<number, string>;
  onAuthClick: () => void;
}

export default function HomePage({ onNavigate, adImages, onAuthClick }: HomePageProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ListFilters>({});
  const [siteStats, setSiteStats] = useState<{ total_users: number; total_cities: number; total_deals: number } | null>(null);
  const [viewedIds, setViewedIds] = useState<Set<number>>(new Set());

  const stats = [
    { label: "Объявлений", icon: "FileText", color: "text-violet-600", value: total.toLocaleString("ru-RU") },
    { label: "Пользователей", icon: "Users", color: "text-cyan-600", value: siteStats ? siteStats.total_users.toLocaleString("ru-RU") : "..." },
    { label: "Городов", icon: "MapPin", color: "text-pink-600", value: siteStats ? siteStats.total_cities.toLocaleString("ru-RU") : "..." },
    { label: "Сделок", icon: "TrendingUp", color: "text-emerald-600", value: siteStats ? siteStats.total_deals.toLocaleString("ru-RU") : "..." },
  ];

  const loadAds = async (f: ListFilters = {}) => {
    setLoading(true);
    try {
      const res = await listAds(f);
      setAds(res.ads);
      setTotal(res.total);
    } catch {
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
    getSiteStats().then(s => setSiteStats(s)).catch(() => {});
    if (getToken()) {
      getViewedIds().then(r => setViewedIds(new Set(r.ids))).catch(() => {});
    }
  }, []);

  const handleSearch = (query: string, f: { city: string; category: string; minPrice: string; maxPrice: string }) => {
    const newFilters: ListFilters = {
      search: query,
      city: f.city,
      category: f.category,
      min_price: f.minPrice,
      max_price: f.maxPrice,
    };
    setFilters(newFilters);
    loadAds(newFilters);
  };

  // Для демо-заглушек когда объявлений ещё нет
  const demoAds = ads.length > 0 ? ads : [];

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative pt-12 pb-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold mb-5 animate-fade-in">
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse" />
            Новая доска объявлений России
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 animate-fade-in delay-100">
            Найди всё что нужно<br />
            <span className="gradient-text">за пару секунд</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto animate-fade-in delay-200">
            Объявления от реальных людей. Без комиссий, без лишних вопросов.
          </p>
        </div>

        <div className="max-w-3xl mx-auto animate-fade-in delay-300">
          <SearchBar onSearch={handleSearch} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mt-8">
          {stats.map((stat, i) => (
            <div key={stat.label} className={`glass-card rounded-2xl p-4 text-center animate-fade-in delay-${(i + 4) * 100}`}>
              <Icon name={stat.icon} size={20} className={`${stat.color} mx-auto mb-1`} />
              <div className="font-display font-bold text-xl">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Категории</h2>
          <button
            onClick={() => onNavigate("categories")}
            className="flex items-center gap-1 text-sm text-violet-600 font-semibold hover:opacity-70 transition-opacity"
          >
            Все категории <Icon name="ChevronRight" size={15} />
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.slice(0, 12).map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => { setFilters({ category: cat.id }); loadAds({ category: cat.id }); onNavigate("categories"); }}
              className={`category-card p-4 flex flex-col items-center gap-2 text-center animate-fade-in delay-${(i % 6 + 1) * 100}`}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md`}>
                <Icon name={cat.icon} size={20} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-foreground leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Ads */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">
            Свежие объявления
            {total > 0 && <span className="ml-2 text-base font-normal text-muted-foreground">{total}</span>}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : demoAds.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {demoAds.map((ad, i) => (
              <div key={ad.id} className={`animate-fade-in delay-${(i % 4 + 1) * 100}`}>
                <AdCard ad={ad} onNavigate={onNavigate} viewed={viewedIds.has(ad.id)} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 glass-card rounded-2xl">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="font-display text-xl font-bold mb-2">Объявлений пока нет</h3>
            <p className="text-muted-foreground mb-6">Станьте первым — разместите объявление прямо сейчас</p>
            <button
              onClick={() => onNavigate("my-ads")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              <Icon name="Plus" size={16} />
              Подать объявление
            </button>
          </div>
        )}
      </section>

      {/* Рекламный баннер #1 */}
      <AdBanner variant="horizontal" slot="0" />

      {/* Горячие объявления */}
      <HotAdsBlock onNavigate={onNavigate} viewedIds={viewedIds} />

      {/* Рекламный баннер #2 */}
      <AdBanner variant="horizontal" slot="1" />

      {/* Рекомендации */}
      <RecommendationsBlock onNavigate={onNavigate} viewedIds={viewedIds} />

      {/* CTA banner */}
      <section>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500 p-8 sm:p-12 text-white text-center">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 left-8 text-6xl">📦</div>
            <div className="absolute bottom-4 right-8 text-6xl">💰</div>
            <div className="absolute top-8 right-24 text-4xl">✨</div>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-3 relative">
            Продайте то, что не нужно
          </h2>
          <p className="text-white/80 mb-6 relative">
            Разместите объявление за 2 минуты — быстро и удобно
          </p>
          <button
            onClick={() => onNavigate("my-ads")}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-violet-700 rounded-2xl font-bold text-lg hover:bg-white/90 transition-colors shadow-xl"
          >
            <Icon name="Plus" size={20} />
            Подать объявление
          </button>
        </div>
      </section>
    </div>
  );
}