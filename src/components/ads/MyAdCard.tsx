import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { Ad, formatTimeAgo } from "@/lib/adsApi";
import { formatPrice } from "@/components/AdCard";
import SoldDialog from "@/components/ads/SoldDialog";

const categoryEmojis: Record<string, string> = {
  electronics: "💻", transport: "🚗", realty: "🏠", clothes: "👗",
  home: "🛋️", sport: "🏋️", beauty: "✨", kids: "🧸",
  animals: "🐾", services: "🔧", hobby: "🎨", food: "🛒",
};

interface MyAdCardProps {
  ad: Ad;
  onDelete: (id: number) => void;
  onPause: (id: number) => void;
  onMarkSold: (id: number, soldOnOmo: boolean) => void;
  onNavigate?: (page: string) => void;
  className?: string;
}

export default function MyAdCard({ ad, onDelete, onPause, onMarkSold, onNavigate, className }: MyAdCardProps) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [showSoldDialog, setShowSoldDialog] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isPaused = ad.status === "paused";
  const isPending = ad.status === "pending";
  const isRejected = ad.status === "rejected";
  const isSold = ad.status === "sold";
  const isArchived = ad.status === "archived";

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const handleSoldConfirm = (soldOnOmo: boolean) => {
    setShowSoldDialog(false);
    onMarkSold(ad.id, soldOnOmo);
  };

  const isInactive = isPaused || isPending || isRejected || isSold || isArchived;

  return (
    <>
      {showSoldDialog && (
        <SoldDialog ad={ad} onConfirm={handleSoldConfirm} onClose={() => setShowSoldDialog(false)} />
      )}
      <div className={`glass-card rounded-2xl overflow-hidden ${isInactive ? "opacity-80" : ""} ${className || ""}`}>
        {/* Image */}
        <div
          className="relative h-44 bg-muted flex items-center justify-center cursor-pointer"
          onClick={() => onNavigate?.(`ad:${ad.id}`)}
        >
          {ad.image_url ? (
            <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl">{categoryEmojis[ad.category] || "📦"}</span>
          )}
          {isPaused && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">На паузе</span>
            </div>
          )}
          {isPending && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">На проверке</span>
            </div>
          )}
          {isRejected && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">Отклонено</span>
            </div>
          )}
          {isSold && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center">
                <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full block mb-1">Продано</span>
                {ad.sold_on_omo && (
                  <span className="bg-violet-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">на OMO</span>
                )}
              </div>
            </div>
          )}
          {/* Меню */}
          {!isSold && !isArchived && (
            <div ref={menuRef} className="absolute top-2 right-2" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setOpen(v => !v)}
                className="w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
              >
                <Icon name="MoreVertical" size={15} className="text-foreground" />
              </button>
              {open && (
                <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-xl border border-border/50 py-1 min-w-[190px] z-30 animate-fade-in">
                  {!isPending && !isRejected && (
                    <>
                      <button
                        onClick={() => { setOpen(false); setShowSoldDialog(true); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors"
                      >
                        <Icon name="CheckCircle" size={15} className="text-emerald-600" />
                        <span>Отметить как продано</span>
                      </button>
                      <div className="my-1 border-t border-border/40" />
                      <button
                        onClick={() => { setOpen(false); onPause(ad.id); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors"
                      >
                        <Icon name={isPaused ? "Play" : "Pause"} size={15} className={isPaused ? "text-emerald-600" : "text-yellow-600"} />
                        <span>{isPaused ? "Возобновить" : "Приостановить"}</span>
                      </button>
                      <div className="my-1 border-t border-border/40" />
                    </>
                  )}
                  {!confirm ? (
                    <button
                      onClick={() => setConfirm(true)}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Icon name="Trash2" size={15} />
                      Удалить объявление
                    </button>
                  ) : (
                    <div className="px-4 py-2 space-y-2">
                      <p className="text-xs text-muted-foreground">Точно удалить?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setOpen(false); setConfirm(false); onDelete(ad.id); }}
                          className="flex-1 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600"
                        >Да</button>
                        <button
                          onClick={() => setConfirm(false)}
                          className="flex-1 py-1.5 border border-border rounded-lg text-xs hover:bg-muted/50"
                        >Нет</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-lg font-bold text-primary mb-1">{formatPrice(ad.price)}</div>
          <h3
            className="font-semibold text-sm line-clamp-2 mb-2 leading-snug cursor-pointer hover:text-violet-600 transition-colors"
            onClick={() => onNavigate?.(`ad:${ad.id}`)}
          >{ad.title}</h3>
          {isPending && (
            <div className="flex items-center gap-1.5 mb-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-2.5 py-1.5">
              <Icon name="Clock" size={12} />
              Объявление на проверке
            </div>
          )}
          {isRejected && (
            <div className="mb-2 text-xs text-rose-600 bg-rose-50 rounded-lg px-2.5 py-1.5">
              <div className="flex items-center gap-1.5 font-semibold mb-0.5">
                <Icon name="XCircle" size={12} />
                Отклонено модерацией
              </div>
              {ad.moderation_comment && (
                <div className="text-rose-500 mt-0.5">{ad.moderation_comment}</div>
              )}
            </div>
          )}
          {isSold && (
            <div className="flex items-center gap-1.5 mb-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-2.5 py-1.5">
              <Icon name="CheckCircle" size={12} />
              {ad.sold_on_omo ? "Продано на OMO" : "Продано (не на OMO)"}
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Icon name="MapPin" size={11} />{ad.city || "—"}
            </span>
            <span className="flex items-center gap-1">
              <Icon name="Eye" size={11} />{ad.views}
            </span>
            <span>{formatTimeAgo(ad.created_at)}</span>
          </div>
        </div>
      </div>
    </>
  );
}
