import { useState } from "react";
import Icon from "@/components/ui/icon";
import { messages } from "@/data/mockData";

export default function MessagesPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [newMsg, setNewMsg] = useState("");

  const selectedChat = messages.find(m => m.id === selected);

  const mockChatMessages = [
    { from: "them", text: selectedChat?.text || "", time: "12:00" },
    { from: "me", text: "Да, ещё продаётся! Приходите посмотреть в любое время", time: "12:05" },
    { from: "them", text: "Отлично! Возможен торг?", time: "12:07" },
    { from: "me", text: "Небольшой торг возможен при осмотре", time: "12:10" },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-3xl font-bold">Сообщения</h1>
        <p className="text-muted-foreground mt-1">Переписка с покупателями и продавцами</p>
      </div>

      <div className="flex gap-4 h-[600px]">
        {/* Chat list */}
        <div className={`${selected ? "hidden lg:flex" : "flex"} flex-col w-full lg:w-80 shrink-0 glass-card rounded-2xl overflow-hidden`}>
          <div className="p-4 border-b border-border">
            <input
              type="text"
              placeholder="Поиск..."
              className="w-full bg-muted/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300 transition-all"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelected(msg.id)}
                className={`w-full flex items-center gap-3 p-4 text-left hover:bg-muted/40 transition-colors border-b border-border/50 ${
                  selected === msg.id ? "bg-violet-50" : ""
                }`}
              >
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${msg.avatarColor} flex items-center justify-center shrink-0`}>
                  <span className="text-white font-bold text-xs">{msg.avatar}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm truncate">{msg.from}</span>
                    <span className="text-xs text-muted-foreground shrink-0 ml-1">{msg.time}</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">{msg.text}</div>
                  <div className="text-xs text-violet-600 font-medium truncate mt-0.5">{msg.ad}</div>
                </div>
                {msg.unread > 0 && (
                  <span className="w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center font-bold shrink-0">
                    {msg.unread}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat window */}
        {selected && selectedChat ? (
          <div className="flex-1 flex flex-col glass-card rounded-2xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <button onClick={() => setSelected(null)} className="lg:hidden mr-1 text-muted-foreground hover:text-foreground">
                <Icon name="ChevronLeft" size={20} />
              </button>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${selectedChat.avatarColor} flex items-center justify-center`}>
                <span className="text-white font-bold text-xs">{selectedChat.avatar}</span>
              </div>
              <div>
                <div className="font-semibold">{selectedChat.from}</div>
                <div className="text-xs text-muted-foreground">Объявление: {selectedChat.ad}</div>
              </div>
              <div className="ml-auto flex gap-2">
                <button className="w-9 h-9 rounded-xl hover:bg-muted/60 flex items-center justify-center transition-colors">
                  <Icon name="Phone" size={16} className="text-muted-foreground" />
                </button>
                <button className="w-9 h-9 rounded-xl hover:bg-muted/60 flex items-center justify-center transition-colors">
                  <Icon name="MoreVertical" size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {mockChatMessages.map((m, i) => (
                <div key={i} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm ${
                    m.from === "me"
                      ? "bg-gradient-to-r from-violet-600 to-cyan-500 text-white rounded-br-md"
                      : "bg-white border border-border text-foreground rounded-bl-md"
                  }`}>
                    <p>{m.text}</p>
                    <p className={`text-xs mt-1 ${m.from === "me" ? "text-white/70" : "text-muted-foreground"}`}>
                      {m.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border flex gap-2">
              <button className="w-10 h-10 rounded-xl hover:bg-muted/60 flex items-center justify-center transition-colors text-muted-foreground">
                <Icon name="Paperclip" size={18} />
              </button>
              <input
                type="text"
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder="Напишите сообщение..."
                className="flex-1 bg-muted/50 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300 transition-all"
                onKeyDown={e => e.key === "Enter" && setNewMsg("")}
              />
              <button
                onClick={() => setNewMsg("")}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 flex items-center justify-center text-white hover:opacity-90 transition-opacity"
              >
                <Icon name="Send" size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 glass-card rounded-2xl items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Icon name="MessageCircle" size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">Выберите диалог</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
