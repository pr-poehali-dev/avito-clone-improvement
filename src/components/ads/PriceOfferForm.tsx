import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { offerPrice, getMyOffers, formatPrice } from "@/lib/adsApi";

interface PriceOfferFormProps {
  adId: number;
  adPrice: number;
  onAuthClick: () => void;
  isAuth: boolean;
}

const STATUS_CONFIG = {
  pending:  { label: "На рассмотрении",  icon: "Clock",       color: "text-amber-600",  bg: "bg-amber-50 border-amber-200" },
  accepted: { label: "Принято!",          icon: "CheckCircle", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
  rejected: { label: "Отклонено",         icon: "XCircle",     color: "text-rose-600",    bg: "bg-rose-50 border-rose-200" },
};

export default function PriceOfferForm({ adId, adPrice, onAuthClick, isAuth }: PriceOfferFormProps) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [existingOffer, setExistingOffer] = useState<{ id: number; offered_price: number; status: string } | null>(null);
  const [loadingOffer, setLoadingOffer] = useState(false);

  useEffect(() => {
    if (!isAuth) return;
    setLoadingOffer(true);
    getMyOffers()
      .then(r => {
        const found = r.offers.find(o => o.ad_id === adId);
        if (found) setExistingOffer({ id: found.id, offered_price: found.offered_price, status: found.status });
      })
      .catch(() => {})
      .finally(() => setLoadingOffer(false));
  }, [isAuth, adId]);

  const quickAmounts = [
    { label: "-5%",  value: Math.round(adPrice * 0.95) },
    { label: "-10%", value: Math.round(adPrice * 0.90) },
    { label: "-15%", value: Math.round(adPrice * 0.85) },
    { label: "-20%", value: Math.round(adPrice * 0.80) },
  ];

  const handleSubmit = async () => {
    if (!isAuth) { onAuthClick(); return; }
    const p = parseInt(price);
    if (!p || p <= 0) { setError("Введите корректную цену"); return; }
    if (p >= adPrice) { setError("Предложение должно быть ниже цены продавца"); return; }
    setSending(true);
    setError("");
    try {
      const res = await offerPrice(adId, p, message);
      setExistingOffer({ id: res.offer_id, offered_price: p, status: "pending" });
      setOpen(false);
      setPrice("");
      setMessage("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка отправки");
    } finally {
      setSending(false);
    }
  };

  if (loadingOffer) return null;

  // Показываем статус существующего оффера
  if (existingOffer) {
    const cfg = STATUS_CONFIG[existingOffer.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
    return (
      <div className={`flex items-center gap-3 px-4 py-3 border rounded-xl text-sm ${cfg.bg}`}>
        <Icon name={cfg.icon} size={16} className={`shrink-0 ${cfg.color}`} />
        <div className="flex-1">
          <div className={`font-semibold ${cfg.color}`}>{cfg.label}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Ваше предложение: <b>{formatPrice(existingOffer.offered_price)} ₽</b>
            {existingOffer.status === "rejected" && (
              <button
                onClick={() => setExistingOffer(null)}
                className="ml-2 underline hover:no-underline"
              >
                Предложить снова
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => isAuth ? setOpen(true) : onAuthClick()}
          className="w-full py-2.5 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted/60 transition-colors flex items-center justify-center gap-2"
        >
          <Icon name="Tag" size={15} />
          Предложить свою цену
        </button>
      ) : (
        <div className="space-y-3 p-4 border border-violet-200 bg-violet-50/50 dark:bg-violet-950/20 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Предложить цену</span>
            <span className="text-xs text-muted-foreground">Цена продавца: <b>{formatPrice(adPrice)} ₽</b></span>
          </div>

          {/* Быстрые суммы */}
          <div className="flex gap-1.5 flex-wrap">
            {quickAmounts.map(q => (
              <button
                key={q.label}
                type="button"
                onClick={() => { setPrice(String(q.value)); setError(""); }}
                className={`flex-1 min-w-0 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  price === String(q.value)
                    ? "bg-violet-600 text-white border-violet-600"
                    : "border-border bg-white hover:bg-violet-50 hover:border-violet-300 text-foreground"
                }`}
              >
                <div>{q.label}</div>
                <div className="text-[10px] opacity-70 mt-0.5">{formatPrice(q.value)} ₽</div>
              </button>
            ))}
          </div>

          {/* Своя сумма */}
          <div className="relative">
            <input
              type="number"
              min="1"
              max={adPrice - 1}
              value={price}
              onChange={e => { setPrice(e.target.value); setError(""); }}
              placeholder="Или введите свою цену, ₽"
              className="w-full border border-border rounded-xl px-4 py-2.5 pr-10 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-white dark:bg-card transition-all"
            />
            {price && (
              <button
                type="button"
                onClick={() => setPrice("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <Icon name="X" size={14} />
              </button>
            )}
          </div>

          {/* Скидка */}
          {price && parseInt(price) > 0 && parseInt(price) < adPrice && (
            <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
              <Icon name="TrendingDown" size={12} />
              Скидка {Math.round((1 - parseInt(price) / adPrice) * 100)}% от цены продавца
            </div>
          )}

          <textarea
            rows={2}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Комментарий для продавца (необязательно)"
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-white dark:bg-card resize-none transition-all"
          />

          {error && (
            <p className="text-xs text-rose-600 flex items-center gap-1">
              <Icon name="AlertCircle" size={12} /> {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={sending || !price}
              className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-1.5 transition-opacity"
            >
              {sending
                ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Icon name="Send" size={13} />}
              Отправить предложение
            </button>
            <button
              onClick={() => { setOpen(false); setPrice(""); setMessage(""); setError(""); }}
              className="px-4 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted/60 transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
