import { useState } from "react";
import Icon from "@/components/ui/icon";
import { cities, categories } from "@/data/mockData";

interface SearchBarProps {
  onSearch?: (query: string, filters: { city: string; category: string; minPrice: string; maxPrice: string }) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("Все города");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch?.(query, { city, category, minPrice, maxPrice });
  };

  return (
    <div className="w-full">
      {/* Main search */}
      <div className="flex gap-2 search-glow bg-white rounded-2xl border border-border p-2 transition-all duration-200">
        <div className="flex items-center gap-2 px-3 border-r border-border text-sm text-muted-foreground min-w-0">
          <Icon name="MapPin" size={15} className="text-violet-500 shrink-0" />
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-transparent outline-none font-medium text-foreground cursor-pointer min-w-0 max-w-28"
          >
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="Поиск по объявлениям..."
          className="flex-1 outline-none bg-transparent text-sm placeholder:text-muted-foreground"
        />

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            showFilters
              ? "bg-violet-100 text-violet-700"
              : "text-muted-foreground hover:bg-muted/60"
          }`}
        >
          <Icon name="SlidersHorizontal" size={14} />
          <span className="hidden sm:inline">Фильтры</span>
        </button>

        <button
          onClick={handleSearch}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-md whitespace-nowrap"
        >
          <Icon name="Search" size={15} />
          <span className="hidden sm:inline">Найти</span>
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="mt-3 bg-white rounded-2xl border border-border p-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                Категория
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-muted/30 outline-none focus:border-violet-400 transition-colors"
              >
                <option value="">Все категории</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Min price */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                Цена от, ₽
              </label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="0"
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-muted/30 outline-none focus:border-violet-400 transition-colors"
              />
            </div>

            {/* Max price */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                Цена до, ₽
              </label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Любая"
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-muted/30 outline-none focus:border-violet-400 transition-colors"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSearch}
              className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Применить фильтры
            </button>
            <button
              onClick={() => { setCategory(""); setMinPrice(""); setMaxPrice(""); setCity("Все города"); }}
              className="px-4 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted/60 transition-colors"
            >
              Сбросить
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
