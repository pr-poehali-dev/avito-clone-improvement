import Icon from "@/components/ui/icon";

interface AdBannerProps {
  variant?: "horizontal" | "square";
  slot?: string;
}

const banners = [
  {
    id: 1,
    label: "Реклама",
    title: "Продвиньте своё объявление",
    subtitle: "Поднимите объявление в топ — больше просмотров за 24 часа",
    cta: "Подключить продвижение",
    gradient: "from-violet-600 via-purple-600 to-cyan-500",
    icon: "TrendingUp",
    href: "#",
  },
  {
    id: 2,
    label: "Партнёр",
    title: "Безопасная доставка",
    subtitle: "Отправляйте и получайте товары по всей России через наших партнёров",
    cta: "Узнать подробнее",
    gradient: "from-emerald-500 to-teal-600",
    icon: "Package",
    href: "#",
  },
  {
    id: 3,
    label: "Реклама",
    title: "Застрахуй сделку",
    subtitle: "Покупай уверенно — деньги вернём если товар не соответствует описанию",
    cta: "Подробнее",
    gradient: "from-amber-500 to-orange-600",
    icon: "Shield",
    href: "#",
  },
];

const squareBanners = [
  {
    id: 1,
    label: "Реклама",
    title: "ТОП размещение",
    subtitle: "×10 просмотров",
    gradient: "from-violet-600 to-purple-700",
    icon: "Zap",
  },
  {
    id: 2,
    label: "Партнёр",
    title: "Доставка по РФ",
    subtitle: "от 99 ₽",
    gradient: "from-cyan-500 to-blue-600",
    icon: "Truck",
  },
];

export default function AdBanner({ variant = "horizontal", slot = "0" }: AdBannerProps) {
  const idx = parseInt(slot) % banners.length;

  if (variant === "square") {
    const b = squareBanners[parseInt(slot) % squareBanners.length];
    return (
      <div className={`relative rounded-2xl bg-gradient-to-br ${b.gradient} p-5 text-white overflow-hidden cursor-pointer hover:opacity-90 transition-opacity`}>
        <div className="absolute top-2 right-2">
          <span className="text-[10px] bg-white/20 text-white/80 px-1.5 py-0.5 rounded font-medium">{b.label}</span>
        </div>
        <Icon name={b.icon} size={28} className="text-white/80 mb-2" />
        <div className="font-bold text-sm">{b.title}</div>
        <div className="text-xs text-white/80 mt-0.5">{b.subtitle}</div>
      </div>
    );
  }

  const b = banners[idx];
  return (
    <div className={`relative rounded-2xl bg-gradient-to-r ${b.gradient} p-6 text-white overflow-hidden cursor-pointer hover:opacity-95 transition-opacity`}>
      <div className="absolute top-3 left-3">
        <span className="text-[10px] bg-white/20 text-white/70 px-2 py-0.5 rounded font-medium">{b.label}</span>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-center opacity-10">
        <Icon name={b.icon} size={80} className="text-white" />
      </div>
      <div className="relative pt-4">
        <div className="flex items-center gap-2 mb-1">
          <Icon name={b.icon} size={18} className="text-white/80" />
          <h3 className="font-bold text-lg">{b.title}</h3>
        </div>
        <p className="text-sm text-white/80 mb-4 max-w-md">{b.subtitle}</p>
        <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/20 hover:bg-white/30 transition-colors rounded-xl text-sm font-semibold backdrop-blur">
          {b.cta}
          <Icon name="ArrowRight" size={14} />
        </button>
      </div>
    </div>
  );
}
