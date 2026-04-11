import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { categories } from "@/data/mockData";
import CitySelect from "@/components/CitySelect";
import { categoryConfig } from "@/data/categoryConfig";

export interface SearchFilters {
  city: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  sortBy: string;
  condition: string;
  maxMileage: string;
  minYear: string;
  maxYear: string;
  brand: string;
  bodyType: string;
  transmission: string;
  fuel: string;
  drive: string;
  size: string;
  gender: string;
  priceType: string;
}

const EMPTY_FILTERS: SearchFilters = {
  city: "Все города", category: "", minPrice: "", maxPrice: "",
  sortBy: "date", condition: "", maxMileage: "", minYear: "", maxYear: "",
  brand: "", bodyType: "", transmission: "", fuel: "", drive: "",
  size: "", gender: "", priceType: "",
};

interface SearchBarProps {
  onSearch?: (query: string, filters: SearchFilters) => void;
  activeCategory?: string;
}

const inputCls = "w-full border border-border rounded-xl px-3 py-2.5 text-sm bg-muted/30 outline-none focus:border-violet-400 transition-colors";
const labelCls = "block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide";

export default function SearchBar({ onSearch, activeCategory }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  // Когда категория меняется снаружи — синхронизируем
  useEffect(() => {
    if (activeCategory !== undefined) {
      setFilters(f => ({ ...f, category: activeCategory }));
    }
  }, [activeCategory]);

  const set = (key: keyof SearchFilters, value: string) =>
    setFilters(f => ({ ...f, [key]: value }));

  const handleSearch = () => onSearch?.(query, filters);

  const handleReset = () => {
    setFilters({ ...EMPTY_FILTERS, category: activeCategory || "" });
    setQuery("");
  };

  const cat = filters.category || activeCategory || "";
  const cfg = cat ? categoryConfig[cat] : null;

  // Считаем активных фильтров (кроме города и сортировки по умолчанию)
  const activeCount = [
    filters.condition, filters.maxMileage, filters.minYear, filters.maxYear,
    filters.brand, filters.bodyType, filters.transmission, filters.fuel,
    filters.drive, filters.size, filters.gender, filters.priceType,
    filters.minPrice, filters.maxPrice,
    filters.city !== "Все города" ? filters.city : "",
    filters.sortBy !== "date" ? filters.sortBy : "",
  ].filter(Boolean).length;

  return (
    <div className="w-full relative z-20">
      {/* Main search row */}
      <div className="flex gap-2 search-glow bg-white rounded-2xl border border-border p-2 transition-all duration-200">
        <div className="flex items-center gap-2 px-3 border-r border-border text-sm text-muted-foreground min-w-0">
          <Icon name="MapPin" size={15} className="text-violet-500 shrink-0" />
          <CitySelect value={filters.city} onChange={v => set("city", v)} compact />
        </div>

        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          placeholder="Поиск по объявлениям..."
          className="flex-1 outline-none bg-transparent text-sm placeholder:text-muted-foreground"
        />

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            showFilters || activeCount > 0
              ? "bg-violet-100 text-violet-700"
              : "text-muted-foreground hover:bg-muted/60"
          }`}
        >
          <Icon name="SlidersHorizontal" size={14} />
          <span className="hidden sm:inline">Фильтры</span>
          {activeCount > 0 && (
            <span className="w-4 h-4 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
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
        <div className="mt-3 bg-white rounded-2xl border border-border p-5 animate-fade-in shadow-lg">

          {/* Базовые фильтры */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* Категория */}
            <div>
              <label className={labelCls}>Категория</label>
              <select value={filters.category} onChange={e => set("category", e.target.value)} className={inputCls}>
                <option value="">Все категории</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Цена от */}
            <div>
              <label className={labelCls}>Цена от, ₽</label>
              <input type="number" value={filters.minPrice} onChange={e => set("minPrice", e.target.value)}
                placeholder="0" className={inputCls} />
            </div>

            {/* Цена до */}
            <div>
              <label className={labelCls}>Цена до, ₽</label>
              <input type="number" value={filters.maxPrice} onChange={e => set("maxPrice", e.target.value)}
                placeholder="Любая" className={inputCls} />
            </div>

            {/* Сортировка */}
            <div>
              <label className={labelCls}>Сортировка</label>
              <select value={filters.sortBy} onChange={e => set("sortBy", e.target.value)} className={inputCls}>
                <option value="date">Новые сначала</option>
                <option value="price_asc">Дешевле сначала</option>
                <option value="price_desc">Дороже сначала</option>
                <option value="views">Популярные</option>
              </select>
            </div>
          </div>

          {/* Умные фильтры по категории */}
          {cfg && (
            <div className="mt-4 pt-4 border-t border-border/60">
              <div className="flex items-center gap-2 mb-3">
                <Icon name="Sparkles" size={13} className="text-violet-500" />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Параметры {categories.find(c => c.id === cat)?.name}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">

                {/* Состояние — для товаров (не услуги/животные/еда) */}
                {cfg.showCondition && (
                  <div>
                    <label className={labelCls}>Состояние</label>
                    <select value={filters.condition} onChange={e => set("condition", e.target.value)} className={inputCls}>
                      <option value="">Любое</option>
                      <option value="new">Новое</option>
                      <option value="used">Б/У</option>
                    </select>
                  </div>
                )}

                {/* Бесплатно — для животных */}
                {cfg.allowFree && (
                  <div>
                    <label className={labelCls}>Цена</label>
                    <select value={filters.priceType} onChange={e => set("priceType", e.target.value)} className={inputCls}>
                      <option value="">Любая</option>
                      <option value="free">Бесплатно</option>
                      <option value="fixed">Платно</option>
                    </select>
                  </div>
                )}

                {/* Пробег — только транспорт */}
                {cfg.showMileage && (
                  <div>
                    <label className={labelCls}>Пробег до, км</label>
                    <input type="number" value={filters.maxMileage} onChange={e => set("maxMileage", e.target.value)}
                      placeholder="200 000" className={inputCls} />
                  </div>
                )}

                {/* Год выпуска — транспорт + хобби */}
                {cfg.extraFields.some(f => f.key === "year") && (
                  <>
                    <div>
                      <label className={labelCls}>Год от</label>
                      <input type="number" value={filters.minYear} onChange={e => set("minYear", e.target.value)}
                        placeholder="2010" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Год до</label>
                      <input type="number" value={filters.maxYear} onChange={e => set("maxYear", e.target.value)}
                        placeholder="2024" className={inputCls} />
                    </div>
                  </>
                )}

                {/* Бренд / марка */}
                {cfg.extraFields.some(f => f.key === "brand") && (
                  <div>
                    <label className={labelCls}>{cat === "transport" ? "Марка" : "Бренд"}</label>
                    <input type="text" value={filters.brand} onChange={e => set("brand", e.target.value)}
                      placeholder={cat === "transport" ? "Toyota, BMW..." : "Nike, Apple..."}
                      className={inputCls} />
                  </div>
                )}

                {/* Тип кузова */}
                {cfg.extraFields.some(f => f.key === "body_type") && (
                  <div>
                    <label className={labelCls}>Тип кузова</label>
                    <select value={filters.bodyType} onChange={e => set("bodyType", e.target.value)} className={inputCls}>
                      <option value="">Любой</option>
                      {["Седан","Хэтчбек","Универсал","Внедорожник","Кроссовер","Минивэн","Купе","Кабриолет","Пикап","Фургон"].map(o =>
                        <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                )}

                {/* КПП */}
                {cfg.extraFields.some(f => f.key === "transmission") && (
                  <div>
                    <label className={labelCls}>Коробка</label>
                    <select value={filters.transmission} onChange={e => set("transmission", e.target.value)} className={inputCls}>
                      <option value="">Любая</option>
                      {["Автомат","Механика","Робот","Вариатор"].map(o =>
                        <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                )}

                {/* Топливо */}
                {cfg.extraFields.some(f => f.key === "fuel") && (
                  <div>
                    <label className={labelCls}>Топливо</label>
                    <select value={filters.fuel} onChange={e => set("fuel", e.target.value)} className={inputCls}>
                      <option value="">Любое</option>
                      {["Бензин","Дизель","Газ","Гибрид","Электро"].map(o =>
                        <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                )}

                {/* Привод */}
                {cfg.extraFields.some(f => f.key === "drive") && (
                  <div>
                    <label className={labelCls}>Привод</label>
                    <select value={filters.drive} onChange={e => set("drive", e.target.value)} className={inputCls}>
                      <option value="">Любой</option>
                      {["Передний","Задний","Полный"].map(o =>
                        <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                )}

                {/* Размер — одежда, спорт */}
                {cfg.extraFields.some(f => f.key === "size") && (
                  <div>
                    <label className={labelCls}>Размер</label>
                    {cat === "clothes" ? (
                      <select value={filters.size} onChange={e => set("size", e.target.value)} className={inputCls}>
                        <option value="">Любой</option>
                        {["XS","S","M","L","XL","XXL","XXXL"].map(o =>
                          <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type="text" value={filters.size} onChange={e => set("size", e.target.value)}
                        placeholder="L, 52..." className={inputCls} />
                    )}
                  </div>
                )}

                {/* Для кого — одежда */}
                {cfg.extraFields.some(f => f.key === "gender") && (
                  <div>
                    <label className={labelCls}>Для кого</label>
                    <select value={filters.gender} onChange={e => set("gender", e.target.value)} className={inputCls}>
                      <option value="">Любой</option>
                      {["Женщинам","Мужчинам","Детям","Унисекс"].map(o =>
                        <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 mt-5">
            <button
              onClick={handleSearch}
              className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Применить фильтры
            </button>
            <button
              onClick={handleReset}
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
