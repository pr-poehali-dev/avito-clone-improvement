import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import AdCard from "@/components/AdCard";
import SearchBar from "@/components/SearchBar";
import { categories } from "@/data/mockData";
import { listAds, Ad, formatTimeAgo, ListFilters } from "@/lib/adsApi";

interface CategoriesPageProps {
  adImages?: Record<number, string>;
}

export default function CategoriesPage({ adImages }: CategoriesPageProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadAds = async (category?: string, extra: ListFilters = {}) => {
    setLoading(true);
    try {
      const res = await listAds({ category, ...extra });
      setAds(res.ads);
      setTotal(res.total);
    } catch {
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAds(); }, []);

  const handleCategoryClick = (id: string) => {
    const next = selected === id ? null : id;
    setSelected(next);
    loadAds(next || undefined);
  };

  const handleSearch = (_: string, f: { city: string; category: string; minPrice: string; maxPrice: string }) => {
    loadAds(f.category || selected || undefined, {
      city: f.city,
      min_price: f.minPrice,
      max_price: f.maxPrice,
    });
  };

  const selectedCat = categories.find(c => c.id === selected);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">Категории</h1>
        <p className="text-muted-foreground">Выбери раздел и найди нужное</p>
      </div>

      <SearchBar onSearch={handleSearch} />

      {/* Category grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryClick(cat.id)}
            className={`category-card p-5 flex items-center gap-4 text-left animate-fade-in delay-${(i % 4 + 1) * 100} ${
              selected === cat.id ? "ring-2 ring-violet-500 bg-violet-50" : ""
            }`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md shrink-0`}>
              <Icon name={cat.icon} size={22} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm text-foreground">{cat.name}</div>
            </div>
            {selected === cat.id && (
              <Icon name="Check" size={16} className="ml-auto text-violet-600 shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold">
            {selectedCat ? selectedCat.name : "Все объявления"}
            <span className="ml-2 text-base font-normal text-muted-foreground">{total} шт.</span>
          </h2>
          {selected && (
            <button
              onClick={() => { setSelected(null); loadAds(); }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="X" size={14} />
              Сбросить
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {ads.map((ad, i) => (
              <div key={ad.id} className={`animate-fade-in delay-${(i % 4 + 1) * 100}`}>
                <AdCard ad={{ ...ad, date: formatTimeAgo(ad.created_at) }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Icon name="SearchX" size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Объявлений не найдено</p>
            <p className="text-sm mt-1">Попробуйте изменить фильтры или выбрать другую категорию</p>
          </div>
        )}
      </div>
    </div>
  );
}
