"use client";
import { useEffect, useRef, useState } from "react";

type Lang = "es" | "en";

interface ShareButtonProps {
  articleId: string;
  title: string;
  excerpt?: string;
  lang?: Lang;
  /** Visual variant: `icon` (compact) or `pill` (icon + label). */
  variant?: "icon" | "pill";
  /** Extra classes on the trigger button. */
  className?: string;
}

const LABELS: Record<Lang, Record<string, string>> = {
  es: {
    share: "Compartir",
    copy: "Copiar enlace",
    copied: "¡Enlace copiado!",
    twitter: "X / Twitter",
    whatsapp: "WhatsApp",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    email: "Email",
    native: "Compartir…",
  },
  en: {
    share: "Share",
    copy: "Copy link",
    copied: "Link copied!",
    twitter: "X / Twitter",
    whatsapp: "WhatsApp",
    facebook: "Facebook",
    linkedin: "LinkedIn",
    email: "Email",
    native: "Share…",
  },
};

function buildShareUrl(articleId: string): string {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  url.searchParams.set("article", articleId);
  url.hash = "";
  return url.toString();
}

export default function ShareButton({
  articleId,
  title,
  excerpt,
  lang = "es",
  variant = "icon",
  className = "",
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const L = LABELS[lang];

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" &&
        typeof (navigator as Navigator & { share?: unknown }).share === "function"
    );
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const stop = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
  };

  const handleTriggerClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const shareUrl = buildShareUrl(articleId);

    // Prefer native share sheet on mobile.
    if (canNativeShare) {
      try {
        await (navigator as Navigator & {
          share: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
        }).share({
          title,
          text: excerpt,
          url: shareUrl,
        });
        return;
      } catch {
        // user cancelled or failed — fall through to dropdown
      }
    }
    setOpen((v) => !v);
  };

  const copyLink = async (e: React.MouseEvent) => {
    stop(e);
    const shareUrl = buildShareUrl(articleId);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const shareUrl = buildShareUrl(articleId);
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(excerpt ? `${title} — ${excerpt}` : title);

  const links = [
    {
      key: "twitter",
      label: L.twitter,
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      key: "whatsapp",
      label: L.whatsapp,
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    },
    {
      key: "facebook",
      label: L.facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      key: "linkedin",
      label: L.linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      key: "email",
      label: L.email,
      href: `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`,
    },
  ];

  const ShareIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`} onClick={stop}>
      <button
        type="button"
        onClick={handleTriggerClick}
        aria-label={L.share}
        aria-haspopup="menu"
        aria-expanded={open}
        className={
          variant === "pill"
            ? "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-surface-elevated text-text-secondary border border-border hover:text-brand-primary hover:border-brand-primary transition-colors"
            : "inline-flex items-center justify-center w-9 h-9 rounded-full bg-surface-elevated text-text-secondary border border-border hover:text-brand-primary hover:border-brand-primary transition-colors"
        }
      >
        {ShareIcon}
        {variant === "pill" && <span>{L.share}</span>}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-xl shadow-xl overflow-hidden z-50"
          onClick={stop}
        >
          {links.map((l) => (
            <a
              key={l.key}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2.5 text-sm text-text-primary hover:bg-surface-elevated hover:text-brand-primary transition-colors"
              onClick={(e) => {
                stop(e);
                setOpen(false);
              }}
            >
              {l.label}
            </a>
          ))}
          <button
            type="button"
            onClick={copyLink}
            className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-surface-elevated hover:text-brand-primary transition-colors border-t border-border"
          >
            {copied ? L.copied : L.copy}
          </button>
        </div>
      )}
    </div>
  );
}
