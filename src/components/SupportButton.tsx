import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { User } from "@/lib/auth";
import SupportChat from "@/components/SupportChat";

interface SupportButtonProps {
  user: User | null;
  onAuthClick: () => void;
  onKnowledgeBase: () => void;
}

export default function SupportButton({ user, onAuthClick, onKnowledgeBase }: SupportButtonProps) {
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const handleChat = () => {
    setOpen(false);
    setChatOpen(true);
  };

  const handleKb = () => {
    setOpen(false);
    onKnowledgeBase();
  };

  return (
    <>
      <div ref={ref} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 md:bottom-6 bottom-24">
        {/* Popup */}
        {open && (
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl border border-border/50 w-64 overflow-hidden animate-fade-in">
            <div className="px-4 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white">
              <div className="font-bold text-sm">Служба поддержки</div>
              <div className="text-xs text-white/80 mt-0.5">Как можем помочь?</div>
            </div>
            <div className="p-2 space-y-0.5">
              <button
                onClick={handleChat}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-violet-50 text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Icon name="MessageCircle" size={17} className="text-violet-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Написать в чат</div>
                  <div className="text-xs text-muted-foreground">Ответим в течение часа</div>
                </div>
                <Icon name="ArrowRight" size={14} className="ml-auto text-muted-foreground" />
              </button>
              <button
                onClick={handleKb}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-emerald-50 text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Icon name="BookOpen" size={17} className="text-emerald-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold">База знаний</div>
                  <div className="text-xs text-muted-foreground">Ответы на частые вопросы</div>
                </div>
                <Icon name="ArrowRight" size={14} className="ml-auto text-muted-foreground" />
              </button>
            </div>
          </div>
        )}

        {/* FAB */}
        <button
          onClick={() => setOpen(v => !v)}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all ${
            open
              ? "bg-foreground text-background"
              : "bg-gradient-to-br from-violet-600 to-cyan-500 text-white hover:scale-110"
          }`}
          title="Поддержка"
        >
          <Icon name={open ? "X" : "Headphones"} size={22} />
        </button>
      </div>

      {chatOpen && (
        <SupportChat
          user={user}
          onClose={() => setChatOpen(false)}
          onAuthClick={() => { setChatOpen(false); onAuthClick(); }}
        />
      )}
    </>
  );
}
