/**
 * Tarjeta de negocios brandeada por afiliado.
 *
 * Tres variantes:
 * - `front`:   anverso imprimible (1050×600 @ 300dpi ≈ 3.5"×2") — logo + nombre + tagline
 * - `back`:    reverso imprimible (1050×600) — contactos + QR
 * - `digital`: versión responsive para `/tarjeta/[affiliateId]` con CTAs accionables
 *
 * Colores se derivan de `config.branding.primaryColor` via `getBrandColors`.
 * Fonts: Playfair (display) + Inter (body) — variables definidas en layout raíz.
 */

"use client";

import Image from "next/image";
import type { AffiliateConfig } from "@/config/affiliates-config";
import { getBrandColors } from "@/lib/affiliate-branding";

export type BusinessCardVariant = "front" | "back" | "digital";

interface AffiliateBusinessCardProps {
  config: AffiliateConfig;
  /** Data URL del QR (generado con `generateQrDataUrl`). */
  qrDataUrl?: string;
  variant: BusinessCardVariant;
  /** URL que codifica el QR — mostrada bajo el QR en variants `back`/`digital`. */
  qrUrl?: string;
}

// ─── Dimensiones imprimibles ────────────────────────────────────────────────
// 1050×600px = 3.5"×2" @ 300dpi (estándar US business card, horizontal)
const PRINT_WIDTH = 1050;
const PRINT_HEIGHT = 600;

// ─── Helpers ────────────────────────────────────────────────────────────────

function waLink(phone: string): string {
  return `https://wa.me/${phone.replace(/[^\d]/g, "")}`;
}

function telLink(phone: string): string {
  return `tel:${phone}`;
}

function mailLink(email: string): string {
  return `mailto:${email}`;
}

// ─── Componente principal ──────────────────────────────────────────────────

export function AffiliateBusinessCard({
  config,
  qrDataUrl,
  variant,
  qrUrl,
}: AffiliateBusinessCardProps) {
  const colors = getBrandColors(config.branding.primaryColor);
  const { branding, contact } = config;

  if (variant === "front") {
    const tagline =
      config.businessType === "restaurant"
        ? "Cocina Dominicana Auténtica"
        : config.businessType === "barbershop"
          ? "Estilo con carácter"
          : config.businessType === "health"
            ? "Cuidado integral"
            : "Hecho con pasión";

    return (
      <div
        data-testid="business-card-front"
        className="relative overflow-hidden"
        style={{
          width: PRINT_WIDTH,
          height: PRINT_HEIGHT,
          background: `linear-gradient(150deg, ${colors.dark} 0%, ${colors.primary} 55%, ${colors.dark} 100%)`,
          color: "#ffffff",
          fontFamily: "var(--font-inter, system-ui, sans-serif)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Glow orbs */}
        <div aria-hidden style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: `radial-gradient(circle at 20% 50%, #ffffff0d 0%, transparent 45%),
                       radial-gradient(circle at 80% 50%, #ffffff0d 0%, transparent 45%)`,
        }} />
        {/* Top accent line */}
        <div aria-hidden style={{
          position: "absolute", top: 0, left: 80, right: 80,
          height: 3, background: "#ffffff35", borderRadius: "0 0 3px 3px",
        }} />
        {/* Bottom accent line */}
        <div aria-hidden style={{
          position: "absolute", bottom: 0, left: 80, right: 80,
          height: 3, background: "#ffffff35", borderRadius: "3px 3px 0 0",
        }} />

        {/* Center: logo + name + tagline */}
        <div style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 26,
          textAlign: "center",
        }}>
          {/* Logo — protagonist */}
          <div style={{
            width: 230,
            height: 230,
            borderRadius: 36,
            background: "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 18,
            boxShadow: "0 12px 48px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2)",
          }}>
            <Image
              src={branding.logo}
              alt={branding.name}
              width={194}
              height={194}
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
              unoptimized
            />
          </div>

          {/* Name */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <h1 style={{
              fontFamily: "var(--font-playfair, Georgia, serif)",
              fontSize: 50,
              fontWeight: 700,
              lineHeight: 1,
              margin: 0,
              letterSpacing: "-0.01em",
            }}>
              {branding.name}
            </h1>
            {/* Divider */}
            <div style={{ width: 48, height: 2, background: "#ffffff60", borderRadius: 2 }} />
            <p style={{
              fontSize: 12,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              opacity: 0.65,
              margin: 0,
              fontWeight: 700,
            }}>
              {tagline}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "back") {
    return (
      <div
        data-testid="business-card-back"
        style={{
          width: PRINT_WIDTH,
          height: PRINT_HEIGHT,
          background: "#ffffff",
          color: "#111827",
          fontFamily: "var(--font-inter, system-ui, sans-serif)",
          padding: 56,
          display: "flex",
          gap: 48,
          alignItems: "center",
          borderTop: `8px solid ${colors.primary}`,
        }}
      >
        {/* QR block */}
        <div style={{ flexShrink: 0, textAlign: "center" }}>
          {qrDataUrl && (
            <img
              src={qrDataUrl}
              alt="QR"
              style={{
                width: 340,
                height: 340,
                display: "block",
                borderRadius: 12,
                border: `3px solid ${colors.primary}`,
                padding: 12,
                background: "#ffffff",
              }}
            />
          )}
          <p
            style={{
              marginTop: 14,
              fontSize: 11,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: colors.primary,
              fontWeight: 700,
            }}
          >
            Escanéame
          </p>
        </div>

        {/* Contact block */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-playfair, Georgia, serif)",
                fontSize: 36,
                fontWeight: 700,
                margin: 0,
                color: colors.dark,
                lineHeight: 1,
              }}
            >
              {branding.name}
            </h2>
            <div
              style={{
                height: 4,
                width: 60,
                background: colors.primary,
                marginTop: 10,
                borderRadius: 2,
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 18 }}>
            {contact?.phoneDisplay && (
              <ContactRow icon="📞" label={contact.phoneDisplay} color={colors.primary} />
            )}
            {contact?.email && <ContactRow icon="✉️" label={contact.email} color={colors.primary} />}
            {contact?.website && (
              <ContactRow
                icon="🌐"
                label={contact.website.replace(/^https?:\/\//, "")}
                color={colors.primary}
              />
            )}
            {contact?.address && (
              <ContactRow icon="📍" label={contact.address} color={colors.primary} />
            )}
            {contact?.social?.instagram && (
              <ContactRow
                icon="📸"
                label={`@${contact.social.instagram}`}
                color={colors.primary}
              />
            )}
          </div>
        </div>
      </div>
    );
  }

  // variant === "digital"
  return (
    <div
      data-testid="business-card-digital"
      className="w-full max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl"
      style={{ background: "#ffffff" }}
    >
      {/* Hero branded */}
      <div
        className="relative px-8 py-10 text-white text-center"
        style={{
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.dark} 100%)`,
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 85% 15%, ${colors.light}33 0%, transparent 50%)`,
          }}
        />
        <div className="relative flex flex-col items-center gap-4">
          <div
            className="w-24 h-24 rounded-2xl bg-white p-3 flex items-center justify-center"
          >
            <Image
              src={branding.logo}
              alt={branding.name}
              width={80}
              height={80}
              style={{ objectFit: "contain", width: "100%", height: "100%" }}
              unoptimized
            />
          </div>
          <div>
            <h1
              className="font-bold leading-none"
              style={{
                fontFamily: "var(--font-playfair, Georgia, serif)",
                fontSize: 32,
                letterSpacing: "-0.02em",
              }}
            >
              {branding.name}
            </h1>
            <p className="mt-2 text-sm opacity-90">{branding.description}</p>
          </div>
        </div>
      </div>

      {/* QR */}
      {qrDataUrl && (
        <div className="flex flex-col items-center py-6 px-6 border-b border-gray-100">
          <img
            src={qrDataUrl}
            alt="QR"
            className="w-48 h-48 rounded-xl"
            style={{ border: `3px solid ${colors.primary}`, padding: 8, background: "#fff" }}
          />
          <p
            className="mt-3 text-[10px] uppercase tracking-[0.25em] font-bold"
            style={{ color: colors.primary }}
          >
            {qrUrl ? "Escanea para ver más" : "Escanéame"}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="p-6 space-y-3">
        {contact?.phone && (
          <ActionButton href={telLink(contact.phone)} color={colors.primary} icon="📞" label="Llamar" sub={contact.phoneDisplay ?? contact.phone} />
        )}
        {contact?.whatsapp && (
          <ActionButton
            href={waLink(contact.whatsapp)}
            color={colors.primary}
            icon="💬"
            label="WhatsApp"
            sub="Chatea con nosotros"
            external
          />
        )}
        {contact?.email && (
          <ActionButton href={mailLink(contact.email)} color={colors.primary} icon="✉️" label="Email" sub={contact.email} />
        )}
        {contact?.website && (
          <ActionButton
            href={contact.website}
            color={colors.primary}
            icon="🌐"
            label="Sitio web"
            sub={contact.website.replace(/^https?:\/\//, "")}
            external
          />
        )}
        {contact?.mapsUrl && (
          <ActionButton
            href={contact.mapsUrl}
            color={colors.primary}
            icon="📍"
            label="Cómo llegar"
            sub={contact.address ?? "Ver en Maps"}
            external
          />
        )}
        {contact?.social?.instagram && (
          <ActionButton
            href={`https://instagram.com/${contact.social.instagram}`}
            color={colors.primary}
            icon="📸"
            label="Instagram"
            sub={`@${contact.social.instagram}`}
            external
          />
        )}
      </div>
    </div>
  );
}

// ─── Subcomponentes ─────────────────────────────────────────────────────────

function ContactRow({ icon, label, color }: { icon: string; label: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <span
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: `${color}18`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span style={{ fontSize: 17, fontWeight: 500, color: "#374151" }}>{label}</span>
    </div>
  );
}

function ActionButton({
  href,
  color,
  icon,
  label,
  sub,
  external,
}: {
  href: string;
  color: string;
  icon: string;
  label: string;
  sub: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-4 rounded-xl border-2 p-4 transition-all hover:scale-[1.02] hover:shadow-md"
      style={{ borderColor: `${color}30` }}
    >
      <span
        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: `${color}15` }}
      >
        {icon}
      </span>
      <div className="flex-1 text-left min-w-0">
        <p className="font-bold text-gray-900 dark:text-white text-sm">{label}</p>
        <p className="text-xs text-gray-500 truncate">{sub}</p>
      </div>
      <span className="text-gray-400">→</span>
    </a>
  );
}
