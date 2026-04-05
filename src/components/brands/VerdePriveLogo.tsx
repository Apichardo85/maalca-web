"use client";

interface VerdePriveLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VerdePriveLogo({ size = "md", className = "" }: VerdePriveLogoProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm": return "w-16 h-16";
      case "md": return "w-24 h-24";
      case "lg": return "w-32 h-32";
      default: return "w-24 h-24";
    }
  };

  return (
    <div className={`${getSizeClasses()} ${className} relative`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full animate-fade-in"
      >
        {/* Gradientes */}
        <defs>
          <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>

          <linearGradient id="premiumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#f4e4bc" />
          </linearGradient>

          <radialGradient id="privacyGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Círculo de privacidad sutil */}
        <circle cx="50" cy="50" r="45" fill="url(#privacyGlow)" />

        {/* Hoja estilizada - símbolo principal */}
        <path
          d="M50 15 C30 25, 25 45, 35 65 C40 75, 50 80, 50 80 C50 80, 60 75, 65 65 C75 45, 70 25, 50 15 Z"
          fill="url(#leafGradient)"
          stroke="#047857"
          strokeWidth="1"
        />

        {/* Vena central de la hoja */}
        <line
          x1="50" y1="20"
          x2="50" y2="75"
          stroke="#047857"
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Venas laterales */}
        <g opacity="0.6">
          <path d="M50 35 Q40 38, 38 48" stroke="#047857" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <path d="M50 35 Q60 38, 62 48" stroke="#047857" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <path d="M50 50 Q42 52, 40 60" stroke="#047857" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          <path d="M50 50 Q58 52, 60 60" stroke="#047857" strokeWidth="0.8" fill="none" strokeLinecap="round" />
        </g>

        {/* Elemento premium - pequeño diamante */}
        <g>
          <rect x="72" y="25" width="8" height="8" rx="1" fill="url(#premiumGradient)" transform="rotate(45 76 29)" />
          <rect x="73" y="26" width="6" height="6" rx="0.5" fill="rgba(255,255,255,0.3)" transform="rotate(45 76 29)" />
        </g>

        {/* Iniciales discretas */}
        <text
          x="50" y="92"
          textAnchor="middle"
          fontSize="8"
          fontWeight="300"
          fill="#047857"
          fontFamily="system-ui"
          letterSpacing="1px"
          opacity="0.7"
        >
          V P
        </text>
      </svg>
    </div>
  );
}

export default VerdePriveLogo;
