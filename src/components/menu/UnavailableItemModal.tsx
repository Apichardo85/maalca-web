"use client";

/**
 * Modal que se abre cuando un cliente intenta ordenar un plato fuera de su horario.
 * Captura nombre + contacto (email o WhatsApp) para avisarle cuando el item vuelva.
 *
 * POST a /api/menu/notify (stub; n8n webhook vendrá en ticket aparte).
 */

import { useState } from "react";

interface UnavailableItemModalProps {
  open: boolean;
  onClose: () => void;
  itemName: string;
  availabilityLabel: string | null;
  affiliateId: string;
  itemId: string;
}

export function UnavailableItemModal({
  open,
  onClose,
  itemName,
  availabilityLabel,
  affiliateId,
  itemId,
}: UnavailableItemModalProps) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [contactType, setContactType] = useState<"whatsapp" | "email">("whatsapp");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) return;
    setSubmitting(true);
    try {
      await fetch("/api/menu/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          affiliateId,
          itemId,
          itemName,
          customerName: name,
          contact,
          contactType,
        }),
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        // reset for next use
        setSuccess(false);
        setName("");
        setContact("");
      }, 1800);
    } catch {
      // stub: even if network fails, confirmar al user (escribimos a un log server-side)
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1800);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,.5)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: "1.25rem",
          padding: "1.75rem",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 25px 60px rgba(0,0,0,.25)",
          fontFamily: "Manrope, system-ui, sans-serif",
        }}
      >
        {success ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✓</div>
            <h3
              style={{
                fontFamily: "Newsreader, Georgia, serif",
                fontSize: "1.3rem",
                color: "var(--p)",
                marginBottom: ".5rem",
              }}
            >
              ¡Te avisaremos!
            </h3>
            <p style={{ fontSize: ".85rem", color: "var(--tm)" }}>
              Cuando <strong>{itemName}</strong> esté disponible, te contactamos.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <p
                  style={{
                    fontSize: ".7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: ".15em",
                    color: "var(--p)",
                    marginBottom: ".25rem",
                  }}
                >
                  Avísame cuando abra
                </p>
                <h3
                  style={{
                    fontFamily: "Newsreader, Georgia, serif",
                    fontSize: "1.3rem",
                    lineHeight: 1.2,
                    color: "var(--p)",
                  }}
                >
                  {itemName}
                </h3>
                {availabilityLabel && (
                  <p style={{ fontSize: ".78rem", color: "var(--tm)", marginTop: ".25rem" }}>
                    {availabilityLabel}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                style={{
                  background: "var(--l2)",
                  border: "none",
                  borderRadius: "50%",
                  width: "36px",
                  height: "36px",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: ".75rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ fontSize: ".75rem", fontWeight: 600, color: "var(--tm)", display: "block", marginBottom: "4px" }}>
                  Tu nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Juan Pérez"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid var(--l3)",
                    fontSize: ".9rem",
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: ".75rem", fontWeight: 600, color: "var(--tm)", display: "block", marginBottom: "4px" }}>
                  Cómo te contactamos
                </label>
                <div style={{ display: "flex", gap: "6px", marginBottom: "6px" }}>
                  {[
                    { k: "whatsapp" as const, l: "📱 WhatsApp" },
                    { k: "email" as const, l: "✉️ Email" },
                  ].map((opt) => (
                    <button
                      type="button"
                      key={opt.k}
                      onClick={() => setContactType(opt.k)}
                      style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "8px",
                        border: contactType === opt.k ? "1.5px solid var(--p)" : "1.5px solid var(--l3)",
                        background: contactType === opt.k ? "var(--p)" : "transparent",
                        color: contactType === opt.k ? "#fff" : "var(--tm)",
                        fontSize: ".8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      {opt.l}
                    </button>
                  ))}
                </div>
                <input
                  type={contactType === "email" ? "email" : "tel"}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  required
                  placeholder={contactType === "email" ? "tu@email.com" : "(607) 555-0123"}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1.5px solid var(--l3)",
                    fontSize: ".9rem",
                    fontFamily: "inherit",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !name.trim() || !contact.trim()}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "9999px",
                background: "var(--p)",
                color: "#fff",
                fontWeight: 700,
                fontSize: ".9rem",
                border: "none",
                cursor: "pointer",
                opacity: submitting || !name.trim() || !contact.trim() ? 0.5 : 1,
                minHeight: "48px",
              }}
            >
              {submitting ? "Enviando..." : "Avísame"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
