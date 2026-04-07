import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import AdCard from "@/components/AdCard";
import SearchBar from "@/components/SearchBar";
import { categories, subcategories } from "@/data/mockData";
import { listAds, Ad, formatTimeAgo, ListFilters } from "@/lib/adsApi";

interface CategoriesPageProps {
  adImages?: Record<number, string>;
  onNavigate?: (page: string) => void;
}

export default function CategoriesPage({ adImages, onNavigate }: CategoriesPageProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadAds = async (category?: string, sub?: string, extra: ListFilters = {}) => {
    setLoading(true);
    try {
      const searchExtra = sub ? { ...extra, search: sub } : extra;
      const res = await listAds({ category, ...searchExtra });
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
    if (selected === id) {
      setSelected(null);
      setSelectedSub(null);
      loadAds();
    } else {
      setSelected(id);
      setSelectedSub(null);
      loadAds(id);
    }
  };

  const handleSubClick = (sub: string) => {
    const next = selectedSub === sub ? null : sub;
    setSelectedSub(next);
    loadAds(selected || undefined, next || undefined);
  };

  const handleSearch = (_: string, f: { city: string; category: string; minPrice: string; maxPrice: string }) => {
    loadAds(f.category || selected || undefined, selectedSub || undefined, {
      city: f.city,
      min_price: f.minPrice,
      max_price: f.maxPrice,
    });
  };

  const selectedCat = categories.find(c => c.id === selected);
  const subs = selected ? (subcategories[selected] || []) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">Категории</h1>
        <p className="text-muted-foreground">Выбери раздел и найди нужное</p>
      </div>

      <SearchBar onSearch={handleSearch} />

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
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md shrink-0`}>
              <Icon name={cat.icon} size={20} className="text-white" />
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

      {/* Subcategories — показываем если категория выбрана */}
      {selected && subs.length > 0 && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${selectedCat?.color} flex items-center justify-center`}>
              <Icon name={selectedCat?.icon || "Tag"} size={14} className="text-white" />
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

      {/* Results */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold">
            {selectedSub
              ? `${selectedCat?.name} · ${selectedSub}`
              : selectedCat
              ? selectedCat.name
              : "Все объявления"}
            <span className="ml-2 text-base font-normal text-muted-foreground">{total} шт.</span>
          </h2>
          {(selected || selectedSub) && (
            <button
              onClick={() => { setSelected(null); setSelectedSub(null); loadAds(); }}
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
                <AdCard ad={{ ...ad, date: formatTimeAgo(ad.created_at) }} onNavigate={onNavigate} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground glass-card rounded-2xl">
            <Icon name="SearchX" size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Объявлений не найдено</p>
            <p className="text-sm mt-1">Попробуйте выбрать другую подкатегорию или сбросить фильтры</p>
          </div>
        )}
      </div>
    </div>
  );
}
