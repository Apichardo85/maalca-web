"use client";
interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  backgroundImage?: string;
  ctaText?: string;
  ctaAction?: () => void;
  variant?: "primary" | "secondary" | "accent" | "warm" | "gold";
}
export default function HeroSection({
  title,
  subtitle,
  description,
  backgroundImage,
  ctaText,
  ctaAction,
  variant = "primary"
}: HeroSectionProps) {
  const gradientVariants = {
    primary: "bg-[image:var(--gradient-primary)]",
    secondary: "bg-[image:var(--gradient-secondary)]",
    accent: "bg-[image:var(--gradient-accent)]",
    warm: "bg-[image:var(--gradient-warm)]",
    gold: "bg-[image:var(--gradient-gold)]"
  };
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {backgroundImage ? (
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        ) : (
          <div className={`w-full h-full ${gradientVariants[variant]}`} />
        )}
        <div className="absolute inset-0 bg-black/30" />
      </div>
      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="animate-fade-in-up">
          {subtitle && (
            <p
              className="text-lg sm:text-xl font-light mb-4 tracking-wide opacity-90 animate-fade-in-up"
              style={{ animationDelay: '0.2s' }}
            >
              {subtitle}
            </p>
          )}
          <h1
            className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
          >
            {title}
          </h1>
          {description && (
            <p
              className="text-lg sm:text-xl font-light mb-8 max-w-3xl mx-auto leading-relaxed opacity-90 animate-fade-in-up"
              style={{ animationDelay: '0.4s' }}
            >
              {description}
            </p>
          )}
          {ctaText && ctaAction && (
            <button
              onClick={ctaAction}
              className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white bg-white/20 backdrop-blur-sm border border-white/30 rounded-full hover:bg-white/30 hover:scale-105 active:scale-95 transition-all duration-300 group animate-fade-in-up"
              style={{ animationDelay: '0.5s' }}
            >
              {ctaText}
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">
                →
              </span>
            </button>
          )}
        </div>
      </div>
      {/* Scroll indicator */}
      <div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-fade-in"
        style={{ animationDelay: '1s' }}
      >
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
