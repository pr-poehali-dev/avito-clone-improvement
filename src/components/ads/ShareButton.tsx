import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

interface ShareButtonProps {
  title: string;
  adId: number;
}

export default function ShareButton({ title, adId }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const url = `${window.location.origin}/?ad=${adId}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => { setCopied(false); setOpen(false); }, 2000);
  };

  const shareLinks = [
    {
      name: "Telegram",
      icon: "Send",
      color: "text-sky-500",
      bg: "hover:bg-sky-50",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "ВКонтакте",
      icon: "Users",
      color: "text-blue-600",
      bg: "hover:bg-blue-50",
      href: `https://vk.com/share.php?url=${encodedUrl}&title=${encodedTitle}`,
    },
    {
      name: "WhatsApp",
      icon: "MessageCircle",
      color: "text-emerald-600",
      bg: "hover:bg-emerald-50",
      href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    },
    {
      name: "Одноклассники",
      icon: "User",
      color: "text-orange-500",
      bg: "hover:bg-orange-50",
      href: `https://connect.ok.ru/offer?url=${encodedUrl}&title=${encodedTitle}`,
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full py-2.5 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted/60 transition-colors flex items-center justify-center gap-2"
      >
        <Icon name="Share2" size={15} />
        Поделиться
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 bg-white rounded-2xl shadow-xl border border-border/50 p-3 min-w-[200px] z-30 animate-fade-in">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">Поделиться в</p>
          <div className="space-y-0.5">
            {shareLinks.map(link => (
              <a
                key={link.name}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm transition-colors ${link.bg}`}
              >
                <Icon name={link.icon} size={15} className={link.color} />
                <span>{link.name}</span>
              </a>
            ))}
          </div>
          <div className="my-2 border-t border-border/40" />
          <button
            onClick={handleCopy}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-sm hover:bg-muted/50 transition-colors"
          >
            <Icon name={copied ? "Check" : "Copy"} size={15} className={copied ? "text-emerald-500" : "text-muted-foreground"} />
            <span className={copied ? "text-emerald-600" : ""}>{copied ? "Ссылка скопирована!" : "Скопировать ссылку"}</span>
          </button>
        </div>
      )}
    </div>
  );
}
