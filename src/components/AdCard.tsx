import { useState } from "react";
import Icon from "@/components/ui/icon";
import { isFavorite, toggleFavorite, notifyFavorites } from "@/lib/favorites";

export interface AdCardData {
  id: number;
  title: string;
  price: number;
  city?: string;
  location?: string;
  category: string;
  date?: string;
  created_at?: string;
  image_url?: string | null;
  image?: string;
  hot?: boolean;
  favorite?: boolean;
  views: number;
  description?: string;
  seller_name?: string;
  status?: string;
}

interface AdCardProps {
  ad: AdCardData;
  onDelete?: (id: number) => void;
  showDeleteBtn?: boolean;
  onNavigate?: (page: string) => void;
  onFavoriteChange?: () => void;
}

export const formatPrice = (price: number): string =>
  price.toLocaleString("ru-RU") + " ₽";

const categoryEmojis: Record<string, string> = {
  electronics: "💻", transport: "🚗", realty: "🏠", clothes: "👗",
  home: "🛋️", sport: "🏋️", beauty: "✨", kids: "🧸",
  animals: "🐾", services: "🔧", hobby: "🎨", food: "🛒",
};

export default function AdCard({ ad, onDelete, showDeleteBtn, onNavigate, onFavoriteChange }: AdCardProps) {
  const [fav, setFav] = useState(() => isFavorite(ad.id));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const imageUrl = ad.image_url || ad.image || null;
  const location = ad.city || ad.location || "";
  const dateLabel = ad.date || "";

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = toggleFavorite(ad.id);
    setFav(next);
    notifyFavorites();
    onFavoriteChange?.();
  };

  return (
    <div
      className="glass-card hover-scale rounded-2xl overflow-hidden group cursor-pointer"
      onClick={() => onNavigate && onNavigate(`ad:${ad.id}`)}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-muted to-muted/50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={ad.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">{categoryEmojis[ad.category] || "📦"}</span>
          </div>
        )}

        {ad.hot && (
          <div className="absolute top-3 left-3">
            <span className="badge-hot">🔥 Горячее</span>
          </div>
        )}

        <button
          onClick={handleFav}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          title={fav ? "Убрать из избранного" : "Добавить в избранное"}
        >
          <Icon
            name="Heart"
            size={15}
            className={fav ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-xl font-bold text-primary mb-1">{formatPrice(ad.price)}</div>
        <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-3 leading-snug">{ad.title}</h3>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Icon name="MapPin" size={11} />
            {location || "—"}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Icon name="Eye" size={11} />
              {ad.views}
            </span>
            {dateLabel && <span>{dateLabel}</span>}
          </div>
        </div>

        {ad.seller_name && (
          <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
            <Icon name="User" size={11} />
            {ad.seller_name}
          </div>
        )}

        {/* Delete controls */}
        {showDeleteBtn && onDelete && (
          <div className="mt-3 pt-3 border-t border-border/50" onClick={e => e.stopPropagation()}>
            {confirmDelete ? (
              <div className="flex gap-2">
                <button
                  onClick={() => onDelete(ad.id)}
                  className="flex-1 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600 transition-colors"
                >
                  Да, снять
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-1.5 border border-border rounded-lg text-xs text-muted-foreground hover:bg-muted/60 transition-colors"
                >
                  Отмена
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full py-1.5 border border-rose-200 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-50 transition-colors"
              >
                Снять с публикации
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
