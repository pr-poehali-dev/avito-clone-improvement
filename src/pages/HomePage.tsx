import SearchBar from "@/components/SearchBar";
import AdCard from "@/components/AdCard";
import Icon from "@/components/ui/icon";
import { ads, categories } from "@/data/mockData";

interface HomePageProps {
  onNavigate: (page: string) => void;
  adImages: Record<number, string>;
}

const stats = [
  { label: "Объявлений", value: "2.4М", icon: "FileText", color: "text-violet-600" },
  { label: "Пользователей", value: "890K", icon: "Users", color: "text-cyan-600" },
  { label: "Городов", value: "1 200+", icon: "MapPin", color: "text-pink-600" },
  { label: "Сделок в день", value: "48K", icon: "TrendingUp", color: "text-emerald-600" },
];

export default function HomePage({ onNavigate, adImages }: HomePageProps) {
  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="relative pt-12 pb-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold mb-5 animate-fade-in">
            <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></span>
            Новая доска объявлений России
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 animate-fade-in delay-100">
            Найди всё что нужно<br />
            <span className="gradient-text">за пару секунд</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto animate-fade-in delay-200">
            Миллионы объявлений от проверенных продавцов. Без комиссий, без лишних вопросов.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-3xl mx-auto animate-fade-in delay-300">
          <SearchBar />
        </div>

        {/* Stats */}
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
            Все категории
            <Icon name="ChevronRight" size={15} />
          </button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.slice(0, 12).map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => onNavigate("categories")}
              className={`category-card p-4 flex flex-col items-center gap-2 text-center animate-fade-in delay-${(i % 6 + 1) * 100}`}
            >
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-md`}>
                <Icon name={cat.icon} size={20} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-foreground leading-tight">{cat.name}</span>
              <span className="text-xs text-muted-foreground">{cat.count.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Hot ads */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold">Горячие предложения</h2>
            <span className="badge-hot">🔥 Хит</span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ads.filter(a => a.hot).map((ad, i) => (
            <div key={ad.id} className={`animate-fade-in delay-${(i + 1) * 100}`}>
              <AdCard ad={ad} imageUrl={adImages[ad.id]} />
            </div>
          ))}
        </div>
      </section>

      {/* All recent ads */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold">Свежие объявления</h2>
          <div className="flex gap-2">
            {["Все", "Электроника", "Авто", "Недвижимость"].map((tag) => (
              <button
                key={tag}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tag === "Все"
                    ? "bg-violet-600 text-white"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ads.map((ad, i) => (
            <div key={ad.id} className={`animate-fade-in delay-${(i % 4 + 1) * 100}`}>
              <AdCard ad={ad} imageUrl={adImages[ad.id]} />
            </div>
          ))}
        </div>
      </section>

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
            Разместите объявление за 2 минуты — бесплатно и без регистрации
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
