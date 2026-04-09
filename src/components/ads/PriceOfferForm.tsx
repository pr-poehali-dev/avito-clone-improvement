import { useState } from "react";
import Icon from "@/components/ui/icon";
import { offerPrice } from "@/lib/adsApi";
import { formatPrice } from "@/components/AdCard";

interface PriceOfferFormProps {
  adId: number;
  adPrice: number;
  onAuthClick: () => void;
  isAuth: boolean;
}

export default function PriceOfferForm({ adId, adPrice, onAuthClick, isAuth }: PriceOfferFormProps) {
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!isAuth) { onAuthClick(); return; }
    const p = parseInt(price);
    if (!p || p <= 0) { setError("Введите корректную цену"); return; }
    setSending(true);
    setError("");
    try {
      await offerPrice(adId, p, message);
      setSent(true);
      setOpen(false);
      setTimeout(() => setSent(false), 5000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка отправки");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
        <Icon name="CheckCircle" size={15} className="shrink-0" />
        Предложение отправлено продавцу!
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
        <div className="space-y-3 p-4 border border-violet-200 bg-violet-50/50 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Предложить цену</span>
            <span className="text-xs text-muted-foreground">Цена продавца: {formatPrice(adPrice)}</span>
          </div>
          <div className="relative">
            <input
              type="number"
              min="1"
              value={price}
              onChange={e => { setPrice(e.target.value); setError(""); }}
              placeholder="Ваша цена, ₽"
              className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-white"
              autoFocus
            />
          </div>
          <textarea
            rows={2}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Комментарий (необязательно)"
            className="w-full border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-white resize-none"
          />
          {error && (
            <p className="text-xs text-rose-600 flex items-center gap-1">
              <Icon name="AlertCircle" size={12} /> {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={sending}
              className="flex-1 py-2 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {sending ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Icon name="Send" size={13} />}
              Отправить
            </button>
            <button
              onClick={() => { setOpen(false); setPrice(""); setMessage(""); setError(""); }}
              className="px-4 py-2 border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted/60"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
