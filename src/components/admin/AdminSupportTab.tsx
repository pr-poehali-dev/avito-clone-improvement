import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { adminListTickets, adminReply, closeTicket, getTicket, SupportTicket, SupportMessage } from "@/lib/supportApi";

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function AdminSupportTab() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);
  const [filter, setFilter] = useState("open");
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadTickets = async (f = filter) => {
    setLoading(true);
    const res = await adminListTickets(f);
    setTickets(res.tickets || []);
    setLoading(false);
  };

  useEffect(() => { loadTickets(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openTicket = async (t: SupportTicket) => {
    setSelected(t);
    const res = await getTicket(t.id);
    setMessages(res.messages);
  };

  const handleReply = async () => {
    if (!selected || !replyText.trim()) return;
    setReplying(true);
    await adminReply(selected.id, replyText.trim());
    setReplyText("");
    const res = await getTicket(selected.id);
    setMessages(res.messages);
    setReplying(false);
    loadTickets();
  };

  const handleClose = async () => {
    if (!selected || !confirm("Закрыть тикет?")) return;
    await closeTicket(selected.id);
    setSelected(null);
    loadTickets();
  };

  const statusLabel: Record<string, string> = {
    open: "Открытые",
    answered: "Ожидают ответа",
    closed: "Закрытые",
    all: "Все",
  };

  const statusColor: Record<string, string> = {
    open: "bg-amber-100 text-amber-700",
    answered: "bg-emerald-100 text-emerald-700",
    closed: "bg-muted text-muted-foreground",
  };

  return (
    <div className="flex gap-4 h-[600px]">
      {/* Tickets list */}
      <div className="w-72 shrink-0 flex flex-col glass-card rounded-2xl overflow-hidden">
        <div className="p-3 border-b border-border space-y-2">
          <div className="flex gap-1 flex-wrap">
            {Object.entries(statusLabel).map(([val, label]) => (
              <button
                key={val}
                onClick={() => { setFilter(val); loadTickets(val); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filter === val ? "bg-violet-600 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-border/50">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground px-4">Тикетов нет</div>
          ) : (
            tickets.map(t => (
              <button
                key={t.id}
                onClick={() => openTicket(t)}
                className={`w-full text-left px-3 py-3 hover:bg-muted/40 transition-colors ${selected?.id === t.id ? "bg-violet-50" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-muted-foreground">#{t.id}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${statusColor[t.status] || "bg-muted text-muted-foreground"}`}>
                    {t.status === "open" ? "Открыт" : t.status === "answered" ? "Отвечен" : "Закрыт"}
                  </span>
                </div>
                <div className="font-semibold text-sm mt-1 line-clamp-1">{t.subject}</div>
                <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Icon name="User" size={10} />
                  {t.user_name}
                  {(t.unread ?? 0) > 0 && (
                    <span className="ml-auto w-4 h-4 bg-rose-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                      {t.unread}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{formatTime(t.updated_at)}</div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat window */}
      {selected ? (
        <div className="flex-1 flex flex-col glass-card rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center gap-3">
            <button onClick={() => setSelected(null)} className="lg:hidden text-muted-foreground">
              <Icon name="ChevronLeft" size={18} />
            </button>
            <div className="flex-1">
              <div className="font-semibold text-sm">{selected.subject}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Icon name="User" size={10} />
                {selected.user_name} · #{selected.id}
              </div>
            </div>
            {selected.status !== "closed" && (
              <button
                onClick={handleClose}
                className="px-3 py-1.5 border border-border rounded-xl text-xs text-muted-foreground hover:bg-muted/60 transition-colors"
              >
                Закрыть тикет
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2 ${m.is_admin ? "justify-end" : "justify-start"}`}>
                {!m.is_admin && (
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-auto">
                    <Icon name="User" size={12} className="text-muted-foreground" />
                  </div>
                )}
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.is_admin
                    ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-br-md"
                    : "bg-white border border-border text-foreground rounded-bl-md"
                }`}>
                  {!m.is_admin && <p className="text-[10px] font-bold text-violet-600 mb-1">{m.sender_name}</p>}
                  <p>{m.text}</p>
                  <p className={`text-[10px] mt-1 ${m.is_admin ? "text-white/70" : "text-muted-foreground"}`}>
                    {formatTime(m.created_at)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Reply */}
          {selected.status !== "closed" ? (
            <div className="p-3 border-t border-border flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleReply()}
                placeholder="Ответить пользователю..."
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
          ) : (
            <div className="p-3 border-t border-border text-center text-sm text-muted-foreground">
              Тикет закрыт
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3 glass-card rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Icon name="Headphones" size={28} className="text-muted-foreground/50" />
          </div>
          <p className="text-sm">Выберите тикет из списка слева</p>
        </div>
      )}
    </div>
  );
}
