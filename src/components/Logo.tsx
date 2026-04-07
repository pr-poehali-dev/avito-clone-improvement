interface LogoProps {
  size?: number;
  showText?: boolean;
}

export default function Logo({ size = 36, showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        {/* Фон */}
        <rect width="40" height="40" rx="11" fill="url(#lg1)" />
        {/* Буква O — два круга и M между ними */}
        {/* Левый O */}
        <circle cx="12" cy="20" r="5.5" fill="none" stroke="white" strokeWidth="2.5" />
        {/* Правый O */}
        <circle cx="28" cy="20" r="5.5" fill="none" stroke="white" strokeWidth="2.5" />
        {/* M по центру */}
        <path
          d="M17.5 24 L17.5 16 L20 20.5 L22.5 16 L22.5 24"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {showText && (
        <div className="hidden sm:flex flex-col leading-none">
          <span className="font-display font-black text-xl tracking-widest gradient-text">OMO</span>
          <span className="font-semibold text-[9px] tracking-[0.15em] text-muted-foreground uppercase">Маркет объявлений</span>
        </div>
      )}
    </div>
  );
}
