import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import AdCard from "@/components/AdCard";
import SearchBar, { SearchFilters } from "@/components/SearchBar";
import AdBanner from "@/components/AdBanner";
import { categories, subcategories } from "@/data/mockData";
import { listAds, Ad, formatTimeAgo, ListFilters, getViewedIds } from "@/lib/adsApi";

interface CategoriesPageProps {
  adImages?: Record<number, string>;
  onNavigate?: (page: string) => void;
  initialSearch?: string;
  initialFilters?: { city: string; category: string; minPrice: string; maxPrice: string };
  onSearchConsumed?: () => void;
}

export default function CategoriesPage({ adImages, onNavigate, initialSearch, initialFilters, onSearchConsumed }: CategoriesPageProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [viewedIds, setViewedIds] = useState<Set<number>>(new Set());
  const [activeFilters, setActiveFilters] = useState<SearchFilters | null>(null);

  const refreshViewed = () => getViewedIds().then(r => setViewedIds(new Set(r.ids))).catch(() => {});

  useEffect(() => {
    refreshViewed();
    window.addEventListener("focus", refreshViewed);
    window.addEventListener("om:viewed_updated", refreshViewed);
    return () => {
      window.removeEventListener("focus", refreshViewed);
      window.removeEventListener("om:viewed_updated", refreshViewed);
    };
  }, []);

  const getUserCity = () => localStorage.getItem("om_user_city") || "";

  const buildFilters = (category?: string, sub?: string, extra: ListFilters = {}): ListFilters => {
    const userCity = getUserCity();
    return {
      category,
      subcategory: sub || undefined,
      ...extra,
      ...(!extra.city && userCity ? { user_city: userCity } : {}),
    };
  };

  const loadAds = async (category?: string, sub?: string, extra: ListFilters = {}) => {
    setLoading(true);
    try {
      const res = await listAds(buildFilters(category, sub, extra));
      setAds(res.ads);
      setTotal(res.total);
    } catch {
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialSearch || initialFilters) {
      const extra: ListFilters = {};
      if (initialSearch) extra.search = initialSearch;
      if (initialFilters?.city && initialFilters.city !== "Все города") extra.city = initialFilters.city;
      if (initialFilters?.category) { setSelected(initialFilters.category); extra.category = initialFilters.category; }
      if (initialFilters?.minPrice) extra.min_price = initialFilters.minPrice;
      if (initialFilters?.maxPrice) extra.max_price = initialFilters.maxPrice;
      loadAds(initialFilters?.category || undefined, undefined, extra);
      onSearchConsumed?.();
    } else {
      loadAds();
    }
  }, []);

  const handleCategoryClick = (id: string) => {
    const next = selected === id ? null : id;
    setSelected(next);
    setSelectedSub(null);
    setActiveFilters(null);
    loadAds(next || undefined);
  };

  const handleSubClick = (sub: string) => {
    const next = selectedSub === sub ? null : sub;
    setSelectedSub(next);
    if (activeFilters) {
      handleSearch("", { ...activeFilters, category: selected || "" });
    } else {
      loadAds(selected || undefined, next || undefined);
    }
  };

  const handleSearch = (query: string, f: SearchFilters) => {
    setActiveFilters(f);
    const cat = f.category || selected || undefined;
    if (f.category && f.category !== selected) {
      setSelected(f.category);
      setSelectedSub(null);
    }
    const extra: ListFilters = {
      search: query || undefined,
      city: f.city !== "Все города" ? f.city || undefined : undefined,
      min_price: f.minPrice || undefined,
      max_price: f.maxPrice || undefined,
      sort_by: f.sortBy !== "date" ? f.sortBy : undefined,
      condition: f.condition || undefined,
      max_mileage: f.maxMileage || undefined,
      min_year: f.minYear || undefined,
      max_year: f.maxYear || undefined,
      brand: f.brand || undefined,
      body_type: f.bodyType || undefined,
      transmission: f.transmission || undefined,
      fuel: f.fuel || undefined,
      drive: f.drive || undefined,
      size: f.size || undefined,
      gender: f.gender || undefined,
      price_type: f.priceType || undefined,
      subcategory: selectedSub || undefined,
    };
    loadAds(cat, selectedSub || undefined, extra);
  };

  const handleReset = () => {
    setSelected(null);
    setSelectedSub(null);
    setActiveFilters(null);
    loadAds();
  };

  const selectedCat = categories.find(c => c.id === selected);
  const subs = selected ? (subcategories[selected] || []) : [];

  // Текущая сортировка для отображения
  const sortLabel: Record<string, string> = {
    date: "Новые", price_asc: "Дешевле", price_desc: "Дороже", views: "Популярные",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">Категории</h1>
        <p className="text-muted-foreground">Выбери раздел и найди нужное</p>
      </div>

      <SearchBar onSearch={handleSearch} activeCategory={selected || ""} />

      {/* Category grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`category-card p-4 flex items-center gap-3 text-left animate-fade-in delay-${(i % 4 + 1) * 100} transition-all ${
              selected === cat.id ? "ring-2 ring-violet-500 bg-violet-50/80" : ""
            }`}
          >
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md shrink-0 text-xl`}>
              {(cat as { emoji?: string }).emoji ?? <Icon name={cat.icon} size={20} className="text-white" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm text-foreground leading-tight">{cat.name}</div>
            </div>
            {selected === cat.id
              ? <Icon name="ChevronDown" size={14} className="text-violet-600 shrink-0" />
              : <Icon name="ChevronRight" size={14} className="text-muted-foreground shrink-0" />
            }
          </button>
        ))}
      </div>

      {/* Subcategories */}
      {selected && subs.length > 0 && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${selectedCat?.color} flex items-center justify-center text-sm`}>
              {(selectedCat as { emoji?: string } | undefined)?.emoji ?? <Icon name={selectedCat?.icon || "Tag"} size={14} className="text-white" />}
            </div>
            <h3 className="font-semibold text-base">{selectedCat?.name} — подкатегории</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {subs.map(sub => (
              <button
                key={sub}
                onClick={() => handleSubClick(sub)}
                className={`px-3.5 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  selectedSub === sub
                    ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-md"
                    : "bg-muted hover:bg-muted/80 text-foreground"
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results header */}
      <div>
        <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="font-display text-xl font-bold">
              {selectedSub
                ? `${selectedCat?.name} · ${selectedSub}`
                : selectedCat
                ? selectedCat.name
                : "Все объявления"}
              <span className="ml-2 text-base font-normal text-muted-foreground">{total} шт.</span>
            </h2>
            {activeFilters?.sortBy && activeFilters.sortBy !== "date" && (
              <span className="flex items-center gap-1 text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full font-medium">
                <Icon name="ArrowUpDown" size={11} />
                {sortLabel[activeFilters.sortBy]}
              </span>
            )}
          </div>

          {(selected || selectedSub || activeFilters) && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="X" size={14} />
              Сбросить всё
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : ads.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
            {ads.map((ad, i) => (
              <div key={ad.id} className={`animate-fade-in delay-${(i % 4 + 1) * 100}`}>
                <AdCard
                  ad={{ ...ad, date: formatTimeAgo(ad.created_at) }}
                  onNavigate={onNavigate}
                  viewed={viewedIds.has(ad.id)}
                />
              </div>
            ))}
            {ads.length > 0 && ads.length % 8 === 0 && (
              <div className="sm:col-span-2 lg:col-span-3 xl:col-span-4">
                <AdBanner />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 glass-card rounded-2xl">
            <Icon name="SearchX" size={48} className="mx-auto mb-4 opacity-30" />
            <h3 className="font-display text-xl font-bold mb-2">Ничего не найдено</h3>
            <p className="text-muted-foreground text-sm mb-4">Попробуйте изменить фильтры или поисковый запрос</p>
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:opacity-90"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>
    </div>
  );
}