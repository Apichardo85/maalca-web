"use client";

import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon" | "text";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Logo({ 
  variant = "full", 
  size = "md", 
  className = ""
}: LogoProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm": return "h-8 w-auto";
      case "md": return "h-10 w-auto";
      case "lg": return "h-12 w-auto";
      case "xl": return "h-16 w-auto";
      default: return "h-10 w-auto";
    }
  };

  // No necesitamos getColors, usaremos las clases CSS que responden al tema automáticamente

  if (variant === "icon") {
    return (
      <svg
        className={cn(getSizeClasses(), className)}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Circular background with gradient */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(220, 38, 38)" />
            <stop offset="100%" stopColor="rgb(153, 27, 27)" />
          </linearGradient>
        </defs>
        
        <circle cx="30" cy="30" r="28" fill="url(#bgGradient)" stroke="currentColor" strokeWidth="2" className="text-text-primary"/>
        
        {/* Stylized human figure representing connection */}
        <g transform="translate(30, 30)">
          {/* Head */}
          <circle cx="0" cy="-8" r="4" fill="currentColor" className="text-text-primary" />
          
          {/* Body with arms extended (representing openness/connection) */}
          <path
            d="M0 -4 L0 8 M-8 0 L8 0"
            stroke="currentColor"
            className="text-text-primary"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          
          {/* Legs */}
          <path
            d="M0 8 L-4 16 M0 8 L4 16"
            stroke="currentColor"
            className="text-text-primary"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          
          {/* Connection dots around the figure */}
          <circle cx="-12" cy="-6" r="1.5" fill="currentColor" className="text-text-primary opacity-80" />
          <circle cx="12" cy="-6" r="1.5" fill="currentColor" className="text-text-primary opacity-80" />
          <circle cx="-10" cy="6" r="1.5" fill="currentColor" className="text-text-primary opacity-60" />
          <circle cx="10" cy="6" r="1.5" fill="currentColor" className="text-text-primary opacity-60" />
        </g>
      </svg>
    );
  }

  if (variant === "text") {
    return (
      <div className={cn("flex items-center", className)}>
        <span
          className={cn(
            "font-bold tracking-tight text-text-primary",
            size === "sm" && "text-xl",
            size === "md" && "text-2xl",
            size === "lg" && "text-3xl",
            size === "xl" && "text-4xl"
          )}
        >
          Maal
          <span className="text-brand-primary">Ca</span>
        </span>
      </div>
    );
  }

  // Full logo (default)
  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Icon */}
      <svg
        className={cn(getSizeClasses())}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bgGradientFull" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(220, 38, 38)" />
            <stop offset="100%" stopColor="rgb(153, 27, 27)" />
          </linearGradient>
        </defs>
        
        <circle cx="30" cy="30" r="28" fill="url(#bgGradientFull)" stroke="currentColor" strokeWidth="2" className="text-text-primary"/>
        
        <g transform="translate(30, 30)">
          <circle cx="0" cy="-8" r="4" fill="currentColor" className="text-text-primary" />
          <path
            d="M0 -4 L0 8 M-8 0 L8 0"
            stroke="currentColor"
            className="text-text-primary"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M0 8 L-4 16 M0 8 L4 16"
            stroke="currentColor"
            className="text-text-primary"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="-12" cy="-6" r="1.5" fill="currentColor" className="text-text-primary opacity-80" />
          <circle cx="12" cy="-6" r="1.5" fill="currentColor" className="text-text-primary opacity-80" />
          <circle cx="-10" cy="6" r="1.5" fill="currentColor" className="text-text-primary opacity-60" />
          <circle cx="10" cy="6" r="1.5" fill="currentColor" className="text-text-primary opacity-60" />
        </g>
      </svg>

      {/* Text */}
      <span
        className={cn(
          "font-bold tracking-tight text-text-primary",
          size === "sm" && "text-xl",
          size === "md" && "text-2xl", 
          size === "lg" && "text-3xl",
          size === "xl" && "text-4xl"
        )}
      >
        Maal
        <span className="text-brand-primary">Ca</span>
      </span>
    </div>
  );
}