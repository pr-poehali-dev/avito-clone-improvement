import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

export default function SupportButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const options = [
    {
      icon: "Send",
      label: "Написать в Telegram",
      desc: "Ответим за 5 минут",
      href: "https://t.me/+QgiLIa1gFRY4Y2Iy",
      color: "text-sky-500",
      bg: "hover:bg-sky-50",
    },
    {
      icon: "MessageCircle",
      label: "Написать в чат",
      desc: "Форма обратной связи",
      href: "https://poehali.dev/help",
      color: "text-violet-600",
      bg: "hover:bg-violet-50",
    },
    {
      icon: "HelpCircle",
      label: "База знаний",
      desc: "Ответы на частые вопросы",
      href: "https://poehali.dev/help",
      color: "text-emerald-600",
      bg: "hover:bg-emerald-50",
    },
  ];

  return (
    <div ref={ref} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Popup */}
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-border/50 w-72 overflow-hidden animate-fade-in">
          <div className="px-4 py-3 bg-gradient-to-r from-violet-600 to-cyan-500 text-white">
            <div className="font-bold text-sm">Служба поддержки</div>
            <div className="text-xs text-white/80 mt-0.5">Мы всегда на связи — выберите канал</div>
          </div>
          <div className="p-2 space-y-0.5">
            {options.map(opt => (
              <a
                key={opt.label}
                href={opt.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${opt.bg}`}
              >
                <div className={`w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0`}>
                  <Icon name={opt.icon} size={17} className={opt.color} />
                </div>
                <div>
                  <div className="text-sm font-semibold">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.desc}</div>
                </div>
                <Icon name="ArrowRight" size={14} className="ml-auto text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all ${
          open
            ? "bg-foreground text-background"
            : "bg-gradient-to-br from-violet-600 to-cyan-500 text-white hover:scale-110"
        }`}
        title="Поддержка"
      >
        <Icon name={open ? "X" : "HeadphonesIcon"} size={22} fallback={open ? "X" : "Headphones"} />
      </button>
    </div>
  );
}
