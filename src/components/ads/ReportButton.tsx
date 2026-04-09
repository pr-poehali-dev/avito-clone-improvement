import { useState } from "react";
import Icon from "@/components/ui/icon";
import { formatTimeAgo } from "@/lib/adsApi";
import { getToken } from "@/lib/auth";

const ADS_URL = "https://functions.poehali.dev/20fb4d0c-9d4b-45b1-b857-f639e2beaa7a";

const REASONS = [
  "Мошенничество / обман",
  "Запрещённый товар",
  "Недостоверная информация",
  "Дубликат объявления",
  "Спам",
  "Неприемлемый контент",
  "Другое",
];

interface ReportButtonProps {
  adId: number;
  sellerId: number;
  isAuth: boolean;
  onAuthClick: () => void;
}

export default function ReportButton({ adId, sellerId, isAuth, onAuthClick }: ReportButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!isAuth) { onAuthClick(); return; }
    if (!reason) { setError("Выберите причину"); return; }
    setSending(true);
    setError("");
    try {
      const token = getToken();
      const res = await fetch(`${ADS_URL}/?action=send_report`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ ad_id: adId, target_user_id: sellerId, reason, details }),
      });
      if (!res.ok) throw new Error("Ошибка");
      setSent(true);
      setOpen(false);
    } catch {
      setError("Не удалось отправить жалобу");
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground bg-muted/40 rounded-xl">
        <Icon name="CheckCircle" size={13} className="text-emerald-500" />
        Жалоба принята, спасибо
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => isAuth ? setOpen(true) : onAuthClick()}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-rose-500 transition-colors"
      >
        <Icon name="Flag" size={13} />
        Пожаловаться
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm animate-fade-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-rose-100 rounded-xl flex items-center justify-center">
                <Icon name="Flag" size={17} className="text-rose-500" />
              </div>
              <div>
                <h3 className="font-bold text-base">Пожаловаться</h3>
                <p className="text-xs text-muted-foreground">Мы рассмотрим в течение 24 часов</p>
              </div>
            </div>

            <div className="space-y-1 mb-3">
              {REASONS.map(r => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${
                    reason === r ? "bg-rose-50 text-rose-700 font-semibold border border-rose-200" : "hover:bg-muted/50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Подробности (необязательно)..."
              className="w-full border border-border rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 resize-none bg-white mb-3"
            />

            {error && (
              <p className="text-xs text-rose-600 mb-2 flex items-center gap-1">
                <Icon name="AlertCircle" size={12} /> {error}
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={sending}
                className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-semibold hover:bg-rose-600 disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {sending ? <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : null}
                Отправить жалобу
              </button>
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted/60"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
