import { useState } from "react";
import Icon from "@/components/ui/icon";
import { formatPrice } from "@/data/mockData";

interface Ad {
  id: number;
  title: string;
  price: number;
  location: string;
  category: string;
  date: string;
  image: string;
  hot: boolean;
  favorite: boolean;
  views: number;
  description: string;
}

interface AdCardProps {
  ad: Ad;
  imageUrl?: string;
}

const categoryEmojis: Record<string, string> = {
  electronics: "💻",
  transport: "🚗",
  realty: "🏠",
  clothes: "👗",
  home: "🛋️",
  sport: "🏋️",
  beauty: "✨",
  kids: "🧸",
  animals: "🐾",
  services: "🔧",
  hobby: "🎨",
  food: "🛒",
};

export default function AdCard({ ad, imageUrl }: AdCardProps) {
  const [isFavorite, setIsFavorite] = useState(ad.favorite);

  return (
    <div className="glass-card hover-scale rounded-2xl overflow-hidden group cursor-pointer">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-muted to-muted/50">
        {imageUrl ? (
          <img src={imageUrl} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">{categoryEmojis[ad.category] || "📦"}</span>
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {ad.hot && <span className="badge-hot">🔥 Горячее</span>}
        </div>
        {/* Favorite */}
        <button
          onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <Icon
            name="Heart"
            size={15}
            className={isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground"}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-xl font-bold text-primary mb-1">
          {formatPrice(ad.price)}
        </div>
        <h3 className="font-semibold text-foreground text-sm line-clamp-2 mb-3 leading-snug">
          {ad.title}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Icon name="MapPin" size={11} />
            {ad.location}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Icon name="Eye" size={11} />
              {ad.views}
            </span>
            <span>{ad.date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
