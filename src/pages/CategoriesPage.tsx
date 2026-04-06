import { useState } from "react";
import Icon from "@/components/ui/icon";
import AdCard from "@/components/AdCard";
import SearchBar from "@/components/SearchBar";
import { categories, ads } from "@/data/mockData";

interface CategoriesPageProps {
  adImages: Record<number, string>;
}

export default function CategoriesPage({ adImages }: CategoriesPageProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const filteredAds = selected ? ads.filter(a => a.category === selected) : ads;
  const selectedCat = categories.find(c => c.id === selected);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold mb-2">Категории</h1>
        <p className="text-muted-foreground">Выбери раздел и найди нужное</p>
      </div>

      {/* Search */}
      <SearchBar />

      {/* Category grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat, i) => (
          <button
            key={cat.id}
            onClick={() => setSelected(selected === cat.id ? null : cat.id)}
            className={`category-card p-5 flex items-center gap-4 text-left animate-fade-in transition-all ${
              selected === cat.id ? "ring-2 ring-violet-500 bg-violet-50" : ""
            } delay-${(i % 4 + 1) * 100}`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md shrink-0`}>
              <Icon name={cat.icon} size={22} className="text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm text-foreground">{cat.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{cat.count.toLocaleString()} объявлений</div>
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
            <span className="ml-2 text-base font-normal text-muted-foreground">
              {filteredAds.length} шт.
            </span>
          </h2>
          {selected && (
            <button
              onClick={() => setSelected(null)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="X" size={14} />
              Сбросить
            </button>
          )}
        </div>

        {filteredAds.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredAds.map((ad, i) => (
              <div key={ad.id} className={`animate-fade-in delay-${(i % 4 + 1) * 100}`}>
                <AdCard ad={ad} imageUrl={adImages[ad.id]} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Icon name="SearchX" size={48} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">В этой категории пока нет объявлений</p>
          </div>
        )}
      </div>
    </div>
  );
}
