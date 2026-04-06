import AdCard from "@/components/AdCard";
import Icon from "@/components/ui/icon";
import { ads } from "@/data/mockData";

interface FavoritesPageProps {
  adImages: Record<number, string>;
  onNavigate: (page: string) => void;
}

export default function FavoritesPage({ adImages, onNavigate }: FavoritesPageProps) {
  const favorites = ads.filter(a => a.favorite);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Избранное</h1>
        <p className="text-muted-foreground mt-1">
          {favorites.length > 0 ? `${favorites.length} сохранённых объявления` : "Пока ничего не сохранено"}
        </p>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {favorites.map((ad, i) => (
            <div key={ad.id} className={`animate-fade-in delay-${(i + 1) * 100}`}>
              <AdCard ad={ad} imageUrl={adImages[ad.id]} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Icon name="Heart" size={40} className="text-rose-400" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">Избранное пусто</h2>
          <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
            Нажмите сердечко на любом объявлении, чтобы сохранить его сюда
          </p>
          <button
            onClick={() => onNavigate("home")}
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Перейти к объявлениям
          </button>
        </div>
      )}
    </div>
  );
}
