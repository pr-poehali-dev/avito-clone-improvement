import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { createTicket, myTickets, getTicket, sendMessage, SupportTicket, SupportMessage } from "@/lib/supportApi";
import { User } from "@/lib/auth";

interface SupportChatProps {
  user: User | null;
  onClose: () => void;
  onAuthClick: () => void;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

export default function SupportChat({ user, onClose, onAuthClick }: SupportChatProps) {
  const [step, setStep] = useState<"start" | "chat">("start");
  const [subject, setSubject] = useState("Вопрос по платформе");
  const [firstMsg, setFirstMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    myTickets().then(r => {
      const open = r.tickets.find(t => t.status !== "closed");
      if (open) {
        setTicket(open);
        setStep("chat");
        loadMessages(open.id);
      }
    }).catch(() => {});
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadMessages = (ticketId: number) => {
    getTicket(ticketId).then(r => {
      setMessages(r.messages);
      setTicket(r.ticket);
    }).catch(() => {});
  };

  const handleStart = async () => {
    if (!user) { onAuthClick(); return; }
    if (!firstMsg.trim()) { setError("Напишите сообщение"); return; }
    setSending(true);
    setError("");
    const res = await createTicket(subject, firstMsg.trim());
    setSending(false);
    if (res.error) { setError(res.error); return; }
    if (res.ticket_id) {
      loadMessages(res.ticket_id);
      setStep("chat");
    }
  };

  const handleReply = async () => {
    if (!ticket || !replyText.trim()) return;
    setReplying(true);
    await sendMessage(ticket.id, replyText.trim());
    setReplyText("");
    setReplying(false);
    loadMessages(ticket.id);
  };

  const quickPhrases = ["Не могу войти в аккаунт", "Не опубликовывается объявление", "Проблема с оплатой", "Другой вопрос"];

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-white dark:bg-card rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] sm:max-h-[600px] animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-cyan-500 rounded-t-3xl sm:rounded-t-2xl px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Icon name="Headphones" size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <div className="font-bold text-white text-sm">Служба поддержки</div>
            <div className="text-white/80 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" />
              Обычно отвечаем в течение часа
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <Icon name="X" size={16} className="text-white" />
          </button>
        </div>

        {step === "start" ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Welcome */}
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shrink-0">
                <Icon name="Bot" size={14} className="text-white" fallback="Headphones" />
              </div>
              <div className="bg-muted/60 rounded-2xl rounded-tl-md px-4 py-3 text-sm">
                Привет! Я помогу вам разобраться с любым вопросом. Опишите проблему — и мы ответим как можно скорее.
              </div>
            </div>

            {/* Quick topics */}
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground px-1">Выберите тему или напишите сами:</p>
              {quickPhrases.map(p => (
                <button
                  key={p}
                  onClick={() => setSubject(p)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all border ${
                    subject === p
                      ? "bg-violet-100 border-violet-400 text-violet-700 font-semibold"
                      : "border-border hover:bg-muted/60 text-foreground"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <div>
              <textarea
                rows={3}
                value={firstMsg}
                onChange={e => { setFirstMsg(e.target.value); setError(""); }}
                placeholder="Опишите вашу проблему подробнее..."
                className="w-full border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 bg-white resize-none transition-all"
              />
              {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
            </div>

            {!user && (
              <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                <Icon name="Info" size={13} className="shrink-0" />
                Войдите в аккаунт, чтобы написать в поддержку
              </div>
            )}

            <button
              onClick={handleStart}
              disabled={sending}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-xl font-bold text-sm hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {sending ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Icon name="Send" size={15} />}
              {user ? "Написать в поддержку" : "Войти и написать"}
            </button>
          </div>
        ) : (
          <>
            {/* Status bar */}
            <div className="px-4 py-2 border-b border-border bg-muted/30 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Тикет #{ticket?.id} · {ticket?.status === "answered" ? "Есть ответ" : ticket?.status === "closed" ? "Закрыт" : "Открыт"}
              </span>
              {ticket?.status === "answered" && (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Icon name="CheckCircle" size={10} />
                  Ответ получен
                </span>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(m => (
                <div key={m.id} className={`flex gap-2 ${m.is_admin ? "justify-start" : "justify-end"}`}>
                  {m.is_admin && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shrink-0 mt-auto">
                      <Icon name="Headphones" size={12} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                    m.is_admin
                      ? "bg-muted/70 text-foreground rounded-tl-md"
                      : "bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-br-md"
                  }`}>
                    {m.is_admin && <p className="text-[10px] font-bold text-violet-600 mb-1">Поддержка</p>}
                    <p>{m.text}</p>
                    <p className={`text-[10px] mt-1 ${m.is_admin ? "text-muted-foreground" : "text-white/70"}`}>
                      {formatTime(m.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">Загрузка...</div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Reply */}
            {ticket?.status !== "closed" && (
              <div className="p-3 border-t border-border flex gap-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Ответить..."
                  onKeyDown={e => e.key === "Enter" && handleReply()}
                  className="flex-1 bg-muted/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300 transition-all"
                />
                <button
                  onClick={handleReply}
                  disabled={replying || !replyText.trim()}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {replying
                    ? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <Icon name="Send" size={16} />}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
