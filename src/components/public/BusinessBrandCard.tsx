"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useSimpleLanguage";
import { BUSINESS_TYPE_LABELS, BUSINESS_TYPE_ICONS, type BusinessType } from "@/lib/templates/registry";

/** La marca viva de un negocio tal como él la configuró en su identidad (logo, portada,
 *  colores, nombre, descripción). Coincide con FeaturedAffiliateDto del API. */
export interface BusinessBrand {
  slug: string;
  name: string;
  description?: string | null;
  descriptionEn?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  /** Puede venir en PascalCase del API (BusinessType.ToString()). */
  businessType: string;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  accentColor?: string | null;
}

const DEFAULT_BRAND = "#045AFE";
const TYPE_LABELS_EN: Record<BusinessType, string> = {
  restaurant: "Restaurant",
  barber: "Barbershop",
  service: "Services",
  retail: "Shop",
  community: "Community",
};

/** #RGB / #RRGGBB → {r,g,b}. Devuelve null si no es un hex usable. */
function parseHex(hex?: string | null): { r: number; g: number; b: number } | null {
  if (!hex) return null;
  let h = hex.trim().replace(/^#/, "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

function darken({ r, g, b }: { r: number; g: number; b: number }, amount: number) {
  const f = (v: number) => Math.max(0, Math.round(v * (1 - amount)));
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

/** Luminancia relativa simple — para decidir texto claro/oscuro sobre el color. */
function isLight({ r, g, b }: { r: number; g: number; b: number }) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.65;
}

export function BusinessBrandCard({ brand }: { brand: BusinessBrand }) {
  const { t, language } = useTranslation();

  const typeKey = brand.businessType?.toLowerCase() as BusinessType;
  const typeLabel =
    language === "en"
      ? TYPE_LABELS_EN[typeKey] ?? brand.businessType
      : BUSINESS_TYPE_LABELS[typeKey] ?? brand.businessType;
  const typeIcon = BUSINESS_TYPE_ICONS[typeKey] ?? "✦";

  const desc = (language === "en" ? brand.descriptionEn : brand.description) || brand.description || "";

  // El color del negocio manda. Si no puso uno usable, cae al azul MaalCa.
  const rgb = parseHex(brand.primaryColor) ?? parseHex(DEFAULT_BRAND)!;
  const brandColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const coverGradient = `linear-gradient(135deg, ${brandColor} 0%, ${darken(rgb, 0.45)} 100%)`;
  const onBrandText = isLight(rgb) ? "#171717" : "#ffffff";
  // Para texto sobre fondo claro (chip y CTA), un color de marca muy claro (ej. ámbar) no se
  // lee. La espina y la portada conservan el color real; solo el texto se oscurece lo justo.
  const brandText = isLight(rgb) ? darken(rgb, 0.38) : brandColor;

  const hasCover = !!brand.coverImageUrl;

  return (
    <Link
      href={`/${brand.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface-elevated border border-border transition-[transform,border-color] duration-200 hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:outline-none"
      style={{ ["--brand" as string]: brandColor }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = brandColor)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "")}
    >
      {/* Espina del color del negocio — ata el marco a su marca sin gritar. */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: brandColor }} />

      {/* Portada: la imagen real del negocio, o un degradado de su color con el logo centrado. */}
      <div className="relative h-44 overflow-hidden" style={{ background: coverGradient }}>
        {hasCover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.coverImageUrl!}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {hasCover ? (
          brand.logoUrl && (
            <span className="absolute bottom-3 left-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={brand.logoUrl} alt={brand.name} className="max-h-full max-w-full object-contain" loading="lazy" />
            </span>
          )
        ) : brand.logoUrl ? (
          <span className="absolute inset-0 flex items-center justify-center p-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="max-h-20 max-w-[70%] object-contain drop-shadow-md"
              loading="lazy"
            />
          </span>
        ) : (
          <span
            className="absolute inset-0 flex items-center justify-center font-display text-4xl font-bold"
            style={{ color: onBrandText }}
          >
            {brand.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ backgroundColor: `color-mix(in srgb, ${brandColor} 14%, transparent)`, color: brandText }}
          >
            <span aria-hidden>{typeIcon}</span>
            {typeLabel}
          </span>
        </div>

        <h2 className="font-display text-xl font-bold text-text-primary">{brand.name}</h2>

        {desc && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">{desc}</p>
        )}

        <span
          className="mt-5 inline-flex items-center gap-1 text-sm font-semibold"
          style={{ color: brandText }}
        >
          {t("cases.cta.visit")}
          <svg
            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M5 10h10M11 6l4 4-4 4" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
