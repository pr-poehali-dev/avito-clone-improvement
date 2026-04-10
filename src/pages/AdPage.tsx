import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { formatPrice } from "@/components/AdCard";
import { formatTimeAgo, getAd, AdFull as AdFullType } from "@/lib/adsApi";
import { sendMessage } from "@/lib/messagesApi";
import { User } from "@/lib/auth";
import MediaGallery from "@/components/MediaGallery";
import ShareButton from "@/components/ads/ShareButton";
import ViewStatsChart from "@/components/ads/ViewStatsChart";
import PriceOfferForm from "@/components/ads/PriceOfferForm";
import ReportButton from "@/components/ads/ReportButton";

type AdFull = AdFullType;

interface AdPageProps {
  adId: number;
  onBack: () => void;
  onNavigate: (page: string) => void;
  user: User | null;
  onAuthClick: () => void;
}

export default function AdPage({ adId, onBack, onNavigate, user, onAuthClick }: AdPageProps) {
  const [ad, setAd] = useState<AdFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMsgForm, setShowMsgForm] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [msgText, setMsgText] = useState("");
  const [msgSent, setMsgSent] = useState(false);
  const [msgError, setMsgError] = useState("");
  const [msgSending, setMsgSending] = useState(false);

  useEffect(() => {
    getAd(adId)
      .then(d => {
        setAd(d.ad);
        setLoading(false);
        if (d.ad?.title) document.title = `${d.ad.title} — OMO`;
      })
      .catch(() => setLoading(false));
    return () => { document.title = "OMO — Маркет объявлений"; };
  }, [adId]);

  const handleSendMsg = async () => {
    if (!user) { onAuthClick(); return; }
    if (!msgText.trim()) { setMsgError("Напишите сообщение"); return; }
    setMsgSending(true);
    setMsgError("");
    try {
      await sendMessage(ad!.user_id, msgText.trim(), ad!.id);
      setMsgSent(true);
      setMsgText("");
      setShowMsgForm(false);
    } catch (e: unknown) {
      setMsgError(e instanceof Error ? e.message : "Ошибка отправки");
    } finally {
      setMsgSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-10 h-10 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="font-display text-2xl font-bold mb-2">Объявление не найдено</h2>
        <button onClick={onBack} className="mt-4 px-6 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold">
          Вернуться назад
        </button>
      </div>
    );
  }

  const media = ad.media.length > 0
    ? ad.media
    : ad.image_url
    ? [{ url: ad.image_url, type: "photo" }]
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
      >
        <Icon name="ChevronLeft" size={18} />
        Назад к объявлениям
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: media */}
        <div className="lg:col-span-3">
          <MediaGallery media={media} title={ad.title} />
        </div>

        {/* Right: info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <div className="text-3xl font-bold text-primary">{formatPrice(ad.price)}</div>
                {ad.bargain && <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">Торг</span>}
                {ad.exchange && <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">Обмен</span>}
              </div>
              <h1 className="font-display text-xl font-bold leading-snug">{ad.title}</h1>
            </div>

            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1"><Icon name="MapPin" size={13} />{ad.city || "Не указан"}</span>
              <span className="flex items-center gap-1"><Icon name="Eye" size={13} />{ad.views}</span>
              <span>{formatTimeAgo(ad.created_at)}</span>
            </div>

            {/* Метаданные: подкатегория, состояние, количество */}
            {(ad.subcategory || ad.condition || (ad.quantity && ad.quantity > 1)) && (
              <div className="flex flex-wrap gap-2">
                {ad.subcategory && (
                  <span className="flex items-center gap-1 text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full font-medium">
                    <Icon name="Tag" size={11} />
                    {ad.subcategory}
                  </span>
                )}
                {ad.condition && (
                  <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                    ad.condition === "new"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}>
                    <Icon name={ad.condition === "new" ? "Sparkles" : "RefreshCw"} size={11} />
                    {ad.condition === "new" ? "Новое" : "Б/У"}
                  </span>
                )}
                {ad.quantity && ad.quantity > 1 && (
                  <span className="flex items-center gap-1 text-xs bg-cyan-50 text-cyan-700 px-2.5 py-1 rounded-full font-medium">
                    <Icon name="Package" size={11} />
                    {ad.quantity} шт.
                  </span>
                )}
              </div>
            )}

            {/* Seller */}
            <div
              className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl cursor-pointer hover:bg-muted/60 transition-colors"
              onClick={() => onNavigate(`reviews:${ad.user_id}`)}
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0">
                {ad.seller_avatar
                  ? <img src={ad.seller_avatar} alt={ad.seller_name} className="w-full h-full object-cover" />
                  : <span className="text-white font-bold text-sm">{ad.seller_name.charAt(0).toUpperCase()}</span>
                }
              </div>
              <div>
                <div className="font-semibold text-sm">{ad.seller_name}</div>
                <div className="text-xs text-muted-foreground">Посмотреть отзывы</div>
              </div>
              <Icon name="ChevronRight" size={15} className="ml-auto text-muted-foreground" />
            </div>

            {/* Message success */}
            {msgSent && (
              <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700">
                <Icon name="CheckCircle" size={15} className="shrink-0" />
                Сообщение отправлено! Ответ придёт в раздел «Сообщения»
              </div>
            )}

            {/* CTA buttons */}
            {user?.id !== ad.user_id && (
              <div className="space-y-2">
                {showMsgForm ? (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={msgText}
                      onChange={e => { setMsgText(e.target.value); setMsgError(""); }}
                      placeholder="Здравствуйте, ещё актуально?"
                      className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white resize-none"
                    />
                    {msgError && (
                      <p className="text-xs text-rose-600 flex items-center gap-1">
                        <Icon name="AlertCircle" size={12} /> {msgError}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleSendMsg}
                        disabled={msgSending}
                        className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold text-sm hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-1.5"
                      >
                        {msgSending ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Icon name="Send" size={14} />}
                        Отправить
                      </button>
                      <button
                        onClick={() => setShowMsgForm(false)}
                        className="px-4 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:bg-muted/60"
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => user ? setShowMsgForm(true) : onAuthClick()}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <Icon name="MessageCircle" size={17} />
                    Написать сообщение
                  </button>
                )}
                {ad.seller_phone ? (
                  showPhone ? (
                    <a
                      href={`tel:${ad.seller_phone}`}
                      className="w-full py-2.5 border border-emerald-300 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
                    >
                      <Icon name="Phone" size={15} />
                      {ad.seller_phone}
                    </a>
                  ) : (
                    <button
                      onClick={() => user ? setShowPhone(true) : onAuthClick()}
                      className="w-full py-2.5 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted/60 transition-colors flex items-center justify-center gap-2"
                    >
                      <Icon name="Phone" size={15} />
                      Показать номер
                    </button>
                  )
                ) : null}
                <PriceOfferForm
                  adId={ad.id}
                  adPrice={ad.price}
                  isAuth={!!user}
                  onAuthClick={onAuthClick}
                />
                <ShareButton title={ad.title} adId={ad.id} />
              </div>
            )}
            {user?.id === ad.user_id && (
              <div className="space-y-3">
                <div className="px-4 py-3 bg-violet-50 rounded-xl text-sm text-violet-700 font-medium text-center">
                  Это ваше объявление
                </div>
                <ShareButton title={ad.title} adId={ad.id} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      {ad.description && (
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-display text-lg font-bold mb-3">Описание</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{ad.description}</p>
        </div>
      )}

      {/* Статистика просмотров — только для автора */}
      {user?.id === ad.user_id && (
        <ViewStatsChart adId={ad.id} />
      )}

      {/* Пожаловаться — для всех кроме автора */}
      {user?.id !== ad.user_id && (
        <div className="flex justify-end">
          <ReportButton adId={ad.id} sellerId={ad.user_id} isAuth={!!user} onAuthClick={onAuthClick} />
        </div>
      )}
    </div>
  );
}