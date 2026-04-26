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

const PAGE_SIZE = 10;

export default function HomePage({ onNavigate, adImages, onAuthClick }: HomePageProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ListFilters>({});
  const [siteStats, setSiteStats] = useState<{ total_users: number; total_cities: number; total_deals: number } | null>(null);
  const [viewedIds, setViewedIds] = useState<Set<number>>(new Set());
  const [cityAds, setCityAds] = useState<Ad[]>([]);
  const [userCity, setUserCity] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("date");

  const stats = [
    { label: "Объявлений", icon: "FileText", color: "text-violet-600", value: total.toLocaleString("ru-RU") },
    { label: "Пользователей", icon: "Users", color: "text-cyan-600", value: siteStats ? siteStats.total_users.toLocaleString("ru-RU") : "..." },
    { label: "Городов", icon: "MapPin", color: "text-pink-600", value: siteStats ? siteStats.total_cities.toLocaleString("ru-RU") : "..." },
    { label: "Сделок", icon: "TrendingUp", color: "text-emerald-600", value: siteStats ? siteStats.total_deals.toLocaleString("ru-RU") : "..." },
  ];

  const loadAds = async (f: ListFilters = {}, resetPage = true) => {
    setLoading(true);
    try {
      const storedCity = localStorage.getItem("om_user_city") || "";
      const res = await listAds({
        ...f,
        limit: PAGE_SIZE,
        offset: 0,
        ...(!f.city && storedCity ? { user_city: storedCity } : {}),
      });
      setAds(res.ads);
      setTotal(res.total);
      if (resetPage) setPage(1);
    } catch {
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const storedCity = localStorage.getItem("om_user_city") || "";
      const nextPage = page + 1;
      const res = await listAds({
        ...filters,
        limit: PAGE_SIZE,
        offset: (nextPage - 1) * PAGE_SIZE,
        ...(!filters.city && storedCity ? { user_city: storedCity } : {}),
      });
      setAds(prev => [...prev, ...res.ads]);
      setPage(nextPage);
    } catch {
      // pass
    } finally {
      setLoadingMore(false);
    }
  };

  const refreshViewed = () => {
    if (getToken()) getViewedIds().then(r => setViewedIds(new Set(r.ids))).catch(() => {});
  };

  useEffect(() => {
    loadAds();
    getSiteStats().then(s => setSiteStats(s)).catch(() => {});
    refreshViewed();

    const storedCity = localStorage.getItem("om_user_city");
    if (storedCity) {
      setUserCity(storedCity);
      listAds({ city: storedCity, limit: 4 }).then(r => setCityAds(r.ads)).catch(() => {});
    }

    window.addEventListener("om:viewed_updated", refreshViewed);
    return () => window.removeEventListener("om:viewed_updated", refreshViewed);
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
    setTimeout(() => {
      document.getElementById("fresh-ads")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const hasMore = ads.length < total;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative pt-12 pb-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold mb-5 animate-fade-in dark:bg-violet-900/40 dark:text-violet-300">
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
      <section id="fresh-ads">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="font-display text-2xl font-bold">
            Свежие объявления
            {total > 0 && <span className="ml-2 text-base font-normal text-muted-foreground">{total}</span>}
          </h2>
          <div className="flex items-center gap-1.5">
            {[
              { value: "date", label: "Новые", icon: "Clock" },
              { value: "price_asc", label: "Дешевле", icon: "TrendingDown" },
              { value: "price_desc", label: "Дороже", icon: "TrendingUp" },
              { value: "views", label: "Популярные", icon: "Eye" },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => {
                  setSortBy(opt.value);
                  const f = { ...filters, sort_by: opt.value };
                  setFilters(f);
                  loadAds(f);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  sortBy === opt.value
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon name={opt.icon} size={11} />
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-36 bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : ads.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {ads.map((ad, i) => (
                <div key={ad.id} className={`animate-fade-in delay-${(i % 5 + 1) * 100}`}>
                  <AdCard ad={ad} onNavigate={onNavigate} viewed={viewedIds.has(ad.id)} />
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 px-8 py-3 border border-violet-300 text-violet-700 rounded-xl font-semibold text-sm hover:bg-violet-50 transition-colors disabled:opacity-60 dark:border-violet-700 dark:text-violet-400 dark:hover:bg-violet-900/30"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-violet-300 border-t-violet-600 rounded-full animate-spin" />
                      Загружаем...
                    </>
                  ) : (
                    <>
                      <Icon name="ChevronDown" size={16} />
                      Загрузить ещё ({total - ads.length})
                    </>
                  )}
                </button>
              </div>
            )}
          </>
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

      {/* Объявления в городе пользователя */}
      {userCity && cityAds.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-bold flex items-center gap-2">
              <Icon name="MapPin" size={20} className="text-pink-500" />
              В городе {userCity}
            </h2>
            <button
              onClick={() => { setFilters({ city: userCity }); loadAds({ city: userCity }); onNavigate("categories"); }}
              className="flex items-center gap-1 text-sm text-violet-600 font-semibold hover:opacity-70 transition-opacity"
            >
              Все <Icon name="ChevronRight" size={15} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {cityAds.map((ad, i) => (
              <div key={ad.id} className={`animate-fade-in delay-${(i % 4 + 1) * 100}`}>
                <AdCard ad={ad} onNavigate={onNavigate} viewed={viewedIds.has(ad.id)} />
              </div>
            ))}
          </div>
        </section>
      )}

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