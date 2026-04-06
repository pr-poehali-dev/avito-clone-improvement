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
          <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="logoGrad2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#67e8f9" />
          </linearGradient>
        </defs>
        {/* Фон плашки */}
        <rect width="40" height="40" rx="10" fill="url(#logoGrad)" />
        {/* Тег/ценник — основной символ */}
        <path
          d="M10 12 L22 12 L30 20 L22 28 L10 28 Z"
          fill="white"
          opacity="0.95"
        />
        {/* Дырочка в теге */}
        <circle cx="13.5" cy="18" r="2.5" fill="url(#logoGrad)" />
        {/* Буква М как акцент */}
        <path
          d="M15 22 L16.5 17 L18 20 L19.5 17 L21 22"
          stroke="url(#logoGrad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {showText && (
        <span className="font-display font-bold text-xl tracking-wide hidden sm:block">
          <span className="gradient-text">Объяво</span>
          <span className="text-foreground">Маркет</span>
        </span>
      )}
    </div>
  );
}
