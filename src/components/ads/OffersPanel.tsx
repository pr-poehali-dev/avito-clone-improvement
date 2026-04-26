import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { getOffers, acceptOffer, rejectOffer, formatPrice } from "@/lib/adsApi";

interface Offer {
  id: number;
  offered_price: number;
  message: string;
  status: string;
  created_at: string;
  buyer_name: string;
}

interface OffersPanelProps {
  adId: number;
  adPrice: number;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "только что";
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} ч назад`;
  return `${Math.floor(h / 24)} дн назад`;
}

const statusBadge: Record<string, { label: string; className: string }> = {
  pending:  { label: "Ожидает",  className: "bg-amber-100 text-amber-700" },
  accepted: { label: "Принято",  className: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Отклонено", className: "bg-rose-100 text-rose-600" },
};

export default function OffersPanel({ adId, adPrice }: OffersPanelProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [open, setOpen] = useState(false);

  const load = () => {
    getOffers(adId)
      .then(r => setOffers(r.offers))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [adId]);

  const pending = offers.filter(o => o.status === "pending");
  const rest = offers.filter(o => o.status !== "pending");

  const handle = async (offerId: number, action: "accept" | "reject") => {
    setProcessing(offerId);
    try {
      if (action === "accept") await acceptOffer(offerId);
      else await rejectOffer(offerId);
      load();
    } finally {
      setProcessing(null);
    }
  };

  if (loading || offers.length === 0) return null;

  const sorted = [...pending, ...rest];

  return (
    <div className="border border-violet-200 rounded-2xl overflow-hidden">
      {/* Header — кликабельный аккордеон */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-violet-50 dark:bg-violet-950/20 hover:bg-violet-100/60 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon name="Tag" size={16} className="text-violet-600" />
          <span className="text-sm font-semibold text-violet-700">Предложения цены</span>
          {pending.length > 0 && (
            <span className="flex items-center justify-center min-w-[20px] h-5 bg-violet-600 text-white text-[10px] font-bold rounded-full px-1">
              {pending.length}
            </span>
          )}
        </div>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={16} className="text-violet-500" />
      </button>

      {open && (
        <div className="divide-y divide-border/50">
          {sorted.map(offer => {
            const badge = statusBadge[offer.status] || statusBadge.pending;
            const discount = Math.round((1 - offer.offered_price / adPrice) * 100);
            return (
              <div key={offer.id} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base">{formatPrice(offer.offered_price)} ₽</span>
                      {discount > 0 && (
                        <span className="text-xs bg-rose-100 text-rose-600 font-semibold px-1.5 py-0.5 rounded-full">
                          -{discount}%
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                      <Icon name="User" size={10} />
                      {offer.buyer_name}
                      <span className="opacity-50">·</span>
                      {timeAgo(offer.created_at)}
                    </div>
                    {offer.message && (
                      <p className="text-sm text-foreground mt-1.5 bg-muted/40 rounded-lg px-3 py-2 italic">
                        «{offer.message}»
                      </p>
                    )}
                  </div>
                </div>

                {offer.status === "pending" && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handle(offer.id, "accept")}
                      disabled={processing === offer.id}
                      className="flex-1 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-1.5 transition-opacity"
                    >
                      {processing === offer.id
                        ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <Icon name="Check" size={13} />}
                      Принять
                    </button>
                    <button
                      onClick={() => handle(offer.id, "reject")}
                      disabled={processing === offer.id}
                      className="flex-1 py-2 border border-rose-300 text-rose-600 bg-rose-50 rounded-xl text-xs font-bold hover:bg-rose-100 disabled:opacity-60 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Icon name="X" size={13} />
                      Отклонить
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
