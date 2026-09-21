"use client";
import { cn } from "@/lib/utils";

interface LogoProps {
  variant?: "full" | "icon" | "text";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

// Logo real (rebrand azul, sept. 2026): el "lazo" azul + wordmark "MaalCa". Reemplaza el
// ícono anterior (figura humana en círculo rojo/gradient) que había quedado sin actualizar
// desde antes del rebrand. Dos PNG recortados con fondo transparente por variante (claro/
// oscuro) en vez de un SVG a mano — el mark es un logo real provisto por el usuario, no algo
// para recrear en código — y se alternan vía el variant `dark:` de Tailwind (data-theme).
export function Logo({ variant = "full", size = "md", className = "" }: LogoProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-8 w-auto";
      case "md":
        return "h-10 w-auto";
      case "lg":
        return "h-12 w-auto";
      case "xl":
        return "h-16 w-auto";
      default:
        return "h-10 w-auto";
    }
  };

  if (variant === "icon") {
    return (
      <span className={cn("inline-flex items-center", className)}>
        <img
          src="/logo/maalca-icon-light.png"
          alt="MaalCa"
          width={217}
          height={146}
          className={cn(getSizeClasses(), "dark:hidden")}
        />
        <img
          src="/logo/maalca-icon-dark.png"
          alt="MaalCa"
          width={221}
          height={152}
          className={cn(getSizeClasses(), "hidden dark:block")}
        />
      </span>
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

  // Full logo (default): lockup ícono + wordmark, como imagen real.
  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src="/logo/maalca-full-light.png"
        alt="MaalCa"
        width={810}
        height={175}
        className={cn(getSizeClasses(), "dark:hidden")}
      />
      <img
        src="/logo/maalca-full-dark.png"
        alt="MaalCa"
        width={808}
        height={179}
        className={cn(getSizeClasses(), "hidden dark:block")}
      />
    </span>
  );
}
