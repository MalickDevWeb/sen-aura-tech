import React from "react";

interface BrandLogoProps {
  variant?: "horizontal" | "badge" | "iconOnly" | "fullHero";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showTagline?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "horizontal",
  size = "md",
  className = "",
  showTagline = true,
}) => {
  // Scale adjustments
  const iconSizeMap = {
    sm: "w-7 h-7 sm:w-8 sm:h-8",
    md: "w-10 h-10 sm:w-12 sm:h-12",
    lg: "w-14 h-14 sm:w-16 sm:h-16",
    xl: "w-20 h-20 sm:w-28 sm:h-28",
  };

  const textSizeMap = {
    sm: "text-sm sm:text-base",
    md: "text-base sm:text-xl",
    lg: "text-xl sm:text-3xl",
    xl: "text-2xl sm:text-4xl",
  };

  const badgeSizeMap = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-20 h-20",
    xl: "w-32 h-32 sm:w-44 sm:h-44",
  };

  // Dedicated SVG vector representation of the official SEN AURA TECH logo
  const LogoSVGIcon = ({ sizeClass = "w-full h-full" }: { sizeClass?: string }) => (
    <svg
      viewBox="0 0 200 200"
      className={sizeClass}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Metallic Silver Gradient */}
        <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" />
          <stop offset="35%" stopColor="#CBD5E1" />
          <stop offset="70%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>

        {/* Metallic Gold Gradient */}
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF08A" />
          <stop offset="30%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>

        {/* Glow Effects */}
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Dark Circle Background for Badge Mode */}
      <circle cx="100" cy="100" r="96" fill="#0B0F19" stroke="#1E293B" strokeWidth="2" />

      {/* Outer Orbit Ring */}
      <ellipse
        cx="100"
        cy="110"
        rx="80"
        ry="24"
        fill="none"
        stroke="url(#goldGrad)"
        strokeWidth="3.5"
        transform="rotate(-22 100 110)"
        filter="url(#goldGlow)"
      />

      {/* Left Silver Arm of 'A' */}
      <path
        d="M 90 28 L 38 140 L 62 140 L 90 76 L 105 110 L 80 110 L 75 122 L 112 122 L 120 140 L 144 140 Z"
        fill="url(#silverGrad)"
      />

      {/* Right Gold Arm with Circuit Traces */}
      <path
        d="M 96 28 L 162 140 L 138 140 L 108 80 Z"
        fill="url(#goldGrad)"
      />
      {/* Circuit Nodes on Gold Arm */}
      <path
        d="M 125 90 L 140 90 M 130 105 L 148 105 M 135 120 L 152 120"
        stroke="#FEF08A"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="140" cy="90" r="2" fill="#FEF08A" />
      <circle cx="148" cy="105" r="2" fill="#FEF08A" />
      <circle cx="152" cy="120" r="2" fill="#FEF08A" />

      {/* Africa Map Wireframe Outline in Center */}
      <path
        d="M 85 75 Q 105 70 120 80 Q 128 92 122 105 Q 112 118 102 128 Q 98 120 90 110 Q 82 98 80 88 Z"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="1.5"
        strokeDasharray="2 1"
      />

      {/* Senegal Star in Gold on West Coast */}
      <polygon
        points="78,88 80,92 84,92 81,94 82,98 78,95 74,98 75,94 72,92 76,92"
        fill="#008751"
        stroke="#FFCC00"
        strokeWidth="0.8"
      />
      <circle cx="78" cy="93" r="1.5" fill="#FFCC00" />

      {/* Senegal Flag Stripe at bottom */}
      <rect x="45" y="175" width="35" height="3.5" fill="#008751" rx="1" />
      <rect x="80" y="175" width="40" height="3.5" fill="#FFCC00" rx="1" />
      <polygon points="100,175.5 101,177 102.5,177 101.2,178 101.6,179.5 100,178.5 98.4,179.5 98.8,178 97.5,177 99,177" fill="#008751" />
      <rect x="120" y="175" width="35" height="3.5" fill="#E8112D" rx="1" />
    </svg>
  );

  if (variant === "badge" || variant === "iconOnly") {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${badgeSizeMap[size]} ${className}`}>
        <LogoSVGIcon />
      </div>
    );
  }

  if (variant === "fullHero") {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 drop-shadow-[0_15px_35px_rgba(245,158,11,0.25)] transition-transform hover:scale-105 duration-300">
          <LogoSVGIcon />
        </div>

        <div className="mt-2.5 sm:mt-3 flex flex-col items-center">
          <span className="text-[11px] sm:text-xs font-black text-emerald-400 tracking-[0.3em] uppercase">SEN</span>
          <div className="flex items-center gap-1.5 text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-none">
            <span className="text-silver-gradient">AURA</span>
            <span className="text-gold-gradient">TECH</span>
          </div>
          
          {/* Senegal Flag Line */}
          <div className="w-36 sm:w-48 md:w-56 h-1 mt-1.5 rounded-full flex overflow-hidden shadow-sm">
            <div className="w-1/3 bg-[#008751]" />
            <div className="w-1/3 bg-[#FFCC00] flex items-center justify-center">
              <span className="text-[7px] text-[#008751]">★</span>
            </div>
            <div className="w-1/3 bg-[#E8112D]" />
          </div>

          {showTagline && (
            <p className="mt-2 text-[10px] sm:text-xs font-bold tracking-[0.2em] text-slate-300 uppercase">
              <span className="text-amber-400">INNOVER</span>
              <span className="text-slate-500 mx-1.5">•</span>
              <span className="text-emerald-400">CONNECTER</span>
              <span className="text-slate-500 mx-1.5">•</span>
              <span className="text-yellow-400">TRANSFORMER</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default: Horizontal Navbar/Footer Logo
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <div className={`relative ${iconSizeMap[size]} shrink-0 drop-shadow-md`}>
        <LogoSVGIcon />
      </div>

      <div className="flex flex-col text-left justify-center">
        <span className="text-[10px] sm:text-xs font-black text-emerald-400 tracking-[0.2em] leading-none mb-0.5">
          SEN
        </span>
        <div className={`flex items-center gap-1 ${textSizeMap[size]} font-black tracking-tight leading-none`}>
          <span className="text-silver-gradient">AURA</span>
          <span className="text-gold-gradient">TECH</span>
        </div>
        {showTagline && (
          <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-bold tracking-[0.15em] text-slate-400 uppercase leading-none mt-1">
            <span className="text-amber-400">INNOVER</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400">CONNECTER</span>
            <span className="text-slate-600">•</span>
            <span className="text-yellow-400">TRANSFORMER</span>
          </div>
        )}
      </div>
    </div>
  );
};
