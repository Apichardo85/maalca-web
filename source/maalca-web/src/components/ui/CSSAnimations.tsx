"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * CSS Animation Component
 * 
 * PERFORMANCE OPTIMIZATION: This component replaces basic Framer Motion animations
 * with pure CSS animations for better performance.
 * 
 * USE THIS INSTEAD OF:
 * <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
 * 
 * USE THIS:
 * <Animate type="fadeInUp" delay={0.2}>
 *   <YourContent />
 * </Animate>
 * 
 * Benefits:
 * - Zero JavaScript overhead for animations
 * - Runs on the compositor thread
 * - Better performance on mobile devices
 * - Smaller bundle size
 */

interface AnimateProps {
  children: ReactNode;
  type?: "fadeIn" | "fadeInUp" | "fadeInDown" | "fadeInLeft" | "fadeInRight" | "scaleIn";
  delay?: number;
  className?: string;
  duration?: number;
}

export function Animate({
  children,
  type = "fadeIn",
  delay = 0,
  className = "",
  duration
}: AnimateProps) {
  const style: React.CSSProperties = {
    animationDelay: `${delay}ms`,
    ...(duration ? { animationDuration: `${duration}ms` } : {})
  };

  return (
    <div className={cn("animate-once", type, className)} style={style}>
      {children}
    </div>
  );
}

/**
 * Staggered animation for lists
 */
interface StaggeredListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  animation?: "fadeInUp" | "fadeInLeft" | "fadeInRight" | "scaleIn";
}

export function StaggeredList({
  children,
  className = "",
  staggerDelay = 100,
  animation = "fadeInUp"
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <div
          key={index}
          className={cn(animation)}
          style={{ animationDelay: `${index * staggerDelay}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

/**
 * Simple entrance animation wrapper
 * Use for elements that should animate when they first appear
 */
interface EntranceAnimationProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export function EntranceAnimation({
  children,
  className = "",
  delay = 0,
  direction = "up"
}: EntranceAnimationProps) {
  const animationClass = {
    up: "fade-in-up",
    down: "fade-in-down",
    left: "fade-in-left",
    right: "fade-in-right",
    none: "fade-in"
  }[direction];

  return (
    <div
      className={cn(animationClass, className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/**
 * Hover scale effect - replaces Framer Motion whileHover
 * Use CSS classes instead:
 * .hover-scale:hover { transform: scale(1.05); }
 * .hover-scale:active { transform: scale(0.95); }
 */
export function HoverScale({ 
  children, 
  className = "",
  scale = 1.05 
}: { 
  children: ReactNode;
  className?: string;
  scale?: number;
}) {
  return (
    <div
      className={cn("transition-transform duration-200", className)}
      style={{ transform: `scale(${scale})` }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `scale(${scale})`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = `scale(${scale - 0.05})`;
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = `scale(${scale})`;
      }}
    >
      {children}
    </div>
  );
}
