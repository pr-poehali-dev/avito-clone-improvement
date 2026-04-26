import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { getInbox, getThread, sendMessage, Dialog, Message, DialogAd } from "@/lib/messagesApi";
import { User } from "@/lib/auth";
import { formatTimeAgo } from "@/lib/adsApi";
import { formatPrice } from "@/components/AdCard";

function UserAvatar({ name, avatarUrl, size = 11 }: { name: string; avatarUrl?: string | null; size?: number }) {
  const cls = `w-${size} h-${size} rounded-full shrink-0 overflow-hidden bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center`;
  return (
    <div className={cls}>
      {avatarUrl
        ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        : <span className="text-white font-bold text-sm">{name.charAt(0).toUpperCase()}</span>
      }
    </div>
  );
}

interface MessagesPageProps {
  user: User | null;
  onAuthClick: () => void;
}

export default function MessagesPage({ user, onAuthClick }: MessagesPageProps) {
  const [dialogs, setDialogs] = useState<Dialog[]>([]);
  const [dialogSearch, setDialogSearch] = useState("");
  const [selected, setSelected] = useState<Dialog | null>(null);
  const [thread, setThread] = useState<Message[]>([]);
  const [otherAvatar, setOtherAvatar] = useState<string | null>(null);
  const [dialogAd, setDialogAd] = useState<DialogAd | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<Dialog | null>(null);

  const loadInbox = async () => {
    try {
      const res = await getInbox();
      setDialogs(res.dialogs);
    } catch {
      setDialogs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadThread = async (dialog: Dialog) => {
    setSelected(dialog);
    setDialogAd(null);
    try {
      const res = await getThread(dialog.other_user_id);
      setThread(res.messages);
      setOtherAvatar(res.other?.avatar_url || dialog.other_avatar || null);
      setDialogAd(res.dialog_ad || null);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setThread([]);
    }
  };

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    loadInbox();
    const inboxInterval = setInterval(loadInbox, 10000);
    return () => clearInterval(inboxInterval);
  }, [user]);

  useEffect(() => {
    if (!selected) return;
    const refreshThread = async () => {
      try {
        const res = await getThread(selected.other_user_id);
        setThread(res.messages);
      } catch { /* pass */ }
    };
    const threadInterval = setInterval(refreshThread, 10000);
    return () => clearInterval(threadInterval);
  }, [selected?.other_user_id]);

  const handleSend = async () => {
    if (!selected || !newMsg.trim() || !user) return;
    setSending(true);
    try {
      await sendMessage(selected.other_user_id, newMsg.trim(), selected.ad_id ?? undefined);
      const newMessage: Message = {
        id: Date.now(),
        sender_id: user.id,
        text: newMsg.trim(),
        created_at: new Date().toISOString(),
        ad_id: selected.ad_id,
        ad_title: selected.ad_title,
        sender_name: user.name,
      };
      setThread(prev => [...prev, newMessage]);
      setNewMsg("");
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      // pass
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20">
        <Icon name="MessageCircle" size={56} className="mx-auto mb-4 opacity-30" />
        <h2 className="font-display text-2xl font-bold mb-2">Войдите в аккаунт</h2>
        <p className="text-muted-foreground mb-6">Чтобы видеть сообщения</p>
        <button
          onClick={onAuthClick}
          className="px-6 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-semibold hover:opacity-90"
        >
          Войти
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl font-bold">Сообщения</h1>
        <p className="text-muted-foreground mt-1">Переписка с покупателями и продавцами</p>
      </div>

      <div className="flex gap-4 h-[600px]">
        {/* Dialog list */}
        <div className={`${selected ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-80 shrink-0 glass-card rounded-2xl overflow-hidden`}>
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={dialogSearch}
                onChange={e => setDialogSearch(e.target.value)}
                placeholder="Поиск диалогов..."
                className="w-full bg-muted/50 rounded-xl pl-8 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-200 transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
              </div>
            ) : dialogs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-6 text-center">
                <Icon name="MessageCircle" size={36} className="mb-3 opacity-30" />
                <p className="text-sm font-medium">Сообщений пока нет</p>
                <p className="text-xs mt-1">Напишите продавцу из объявления</p>
              </div>
            ) : (
              dialogs
              .filter(d => !dialogSearch || d.other_name.toLowerCase().includes(dialogSearch.toLowerCase()) || (d.ad_title || "").toLowerCase().includes(dialogSearch.toLowerCase()))
              .map((d) => (
                <button
                  key={d.other_user_id}
                  onClick={() => loadThread(d)}
                  className={`w-full flex items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors border-b border-border/50 ${
                    selected?.other_user_id === d.other_user_id ? "bg-violet-50" : ""
                  }`}
                >
                  <UserAvatar name={d.other_name} avatarUrl={d.other_avatar} size={11} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm truncate">{d.other_name}</span>
                      <span className="text-xs text-muted-foreground shrink-0 ml-1">{formatTimeAgo(d.last_time)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate mt-0.5">
                      {d.is_mine ? "Вы: " : ""}{d.last_message}
                    </div>
                    {d.ad_title && <div className="text-xs text-violet-600 truncate mt-0.5">{d.ad_title}</div>}
                  </div>
                  {d.unread > 0 && (
                    <span className="w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center font-bold shrink-0">
                      {d.unread}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat window */}
        {selected ? (
          <div className="flex-1 flex flex-col glass-card rounded-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="border-b border-border">
              {/* Собеседник */}
              <div className="flex items-center gap-3 px-4 py-3">
                <button onClick={() => setSelected(null)} className="lg:hidden mr-1 text-muted-foreground hover:text-foreground">
                  <Icon name="ChevronLeft" size={20} />
                </button>
                <UserAvatar name={selected.other_name} avatarUrl={otherAvatar} size={10} />
                <div className="font-semibold">{selected.other_name}</div>
              </div>
              {/* Карточка товара */}
              {dialogAd && (
                <div className="mx-4 mb-3 flex items-center gap-3 p-2.5 bg-muted/40 rounded-xl border border-border/60">
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    {dialogAd.image_url
                      ? <img src={dialogAd.image_url} alt={dialogAd.title} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-0.5">Обсуждаемый товар</div>
                    <div className="font-semibold text-sm line-clamp-1">{dialogAd.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold text-primary">{formatPrice(dialogAd.price)} ₽</span>
                      {dialogAd.city && <span className="text-xs text-muted-foreground">{dialogAd.city}</span>}
                    </div>
                  </div>
                  <Icon name="Package" size={16} className="text-muted-foreground shrink-0" />
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {thread.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Начните переписку
                </div>
              ) : (
                thread.map((m) => {
                  const isMe = user && m.sender_id === user.id;
                  return (
                    <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${
                        isMe
                          ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-br-md"
                          : "bg-white border border-border text-foreground rounded-bl-md"
                      }`}>
                        <p>{m.text}</p>
                        <p className={`text-xs mt-1 ${isMe ? "text-white/70" : "text-muted-foreground"}`}>
                          {formatTimeAgo(m.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-border flex gap-2">
              <input
                type="text"
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder="Напишите сообщение..."
                className="flex-1 bg-muted/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300 transition-all"
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              />
              <button
                onClick={handleSend}
                disabled={sending || !newMsg.trim()}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {sending
                  ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <Icon name="Send" size={16} />
                }
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 glass-card rounded-2xl items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">Выберите диалог</p>
              <p className="text-sm mt-1">или напишите продавцу из объявления</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}