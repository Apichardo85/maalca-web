"use client";

import { useEffect, useState } from "react";
import { trackSocialShare } from "@/hooks/useAnalytics";

interface SocialShareProps {
  url?: string;
  title?: string;
  description?: string;
  platforms?: SocialPlatform[];
  className?: string;
  variant?: "buttons" | "icons" | "minimal";
  project?: 'ciriwhispers' | 'editorial' | 'catering' | 'ecosystem' | 'global';
}

type SocialPlatform = 
  | "twitter" 
  | "linkedin" 
  | "facebook" 
  | "whatsapp" 
  | "telegram" 
  | "copy";

interface ShareUrl {
  platform: SocialPlatform;
  name: string;
  icon: string;
  color: string;
  url: (params: ShareParams) => string;
}

interface ShareParams {
  url: string;
  title: string;
  description: string;
}

const SOCIAL_PLATFORMS: ShareUrl[] = [
  {
    platform: "twitter",
    name: "Twitter",
    icon: "🐦",
    color: "from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700",
    url: ({ url, title }) => 
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
  },
  {
    platform: "linkedin", 
    name: "LinkedIn",
    icon: "💼",
    color: "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
    url: ({ url, title, description }) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(description)}`
  },
  {
    platform: "facebook",
    name: "Facebook", 
    icon: "👥",
    color: "from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
    url: ({ url }) => 
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  },
  {
    platform: "whatsapp",
    name: "WhatsApp",
    icon: "💬",
    color: "from-green-500 to-green-600 hover:from-green-600 hover:to-green-700",
    url: ({ url, title }) => 
      `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`
  },
  {
    platform: "telegram",
    name: "Telegram", 
    icon: "✈️",
    color: "from-sky-400 to-sky-500 hover:from-sky-500 hover:to-sky-600",
    url: ({ url, title }) => 
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  },
  {
    platform: "copy",
    name: "Copiar enlace",
    icon: "🔗", 
    color: "from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700",
    url: ({ url }) => url // Special case - handled differently
  }
];

export default function SocialShare({
  url,
  title = "Compartir desde MaalCa",
  description = "Contenido interesante del ecosistema MaalCa",
  platforms = ["twitter", "linkedin", "facebook", "copy"],
  className = "",
  variant = "buttons",
  project = "global"
}: SocialShareProps) {
  const [currentUrl, setCurrentUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Get current URL if not provided
    if (typeof window !== "undefined") {
      setCurrentUrl(url || window.location.href);
    }
  }, [url]);

  const handleShare = async (platform: SocialPlatform) => {
    const shareParams = {
      url: currentUrl,
      title,
      description
    };

    // Track the sharing event
    trackSocialShare(platform, title, project);

    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = currentUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      return;
    }

    const socialPlatform = SOCIAL_PLATFORMS.find(p => p.platform === platform);
    if (socialPlatform) {
      const shareUrl = socialPlatform.url(shareParams);
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!currentUrl) return null;

  const selectedPlatforms = SOCIAL_PLATFORMS.filter(p => 
    platforms.includes(p.platform)
  );

  if (variant === "minimal") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-sm text-slate-600 dark:text-slate-400">Compartir:</span>
        {selectedPlatforms.map((platform) => (
          <button
            key={platform.platform}
            onClick={() => handleShare(platform.platform)}
            className="text-lg hover:scale-110 transition-transform"
            title={`Compartir en ${platform.name}`}
          >
            {platform.platform === "copy" && copied ? "✅" : platform.icon}
          </button>
        ))}
      </div>
    );
  }

  if (variant === "icons") {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {selectedPlatforms.map((platform) => (
          <button
            key={platform.platform}
            onClick={() => handleShare(platform.platform)}
            className={`w-10 h-10 rounded-full bg-gradient-to-r ${platform.color} flex items-center justify-center text-white text-lg transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg`}
            title={`Compartir en ${platform.name}`}
          >
            {platform.platform === "copy" && copied ? "✅" : platform.icon}
          </button>
        ))}
      </div>
    );
  }

  // Default: buttons variant
  return (
    <div className={`space-y-3 ${className}`}>
      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
        Compartir contenido
      </h4>
      <div className="flex flex-wrap gap-2">
        {selectedPlatforms.map((platform) => (
          <button
            key={platform.platform}
            onClick={() => handleShare(platform.platform)}
            className={`px-4 py-2 rounded-lg bg-gradient-to-r ${platform.color} text-white text-sm font-medium transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg flex items-center gap-2`}
          >
            <span>{platform.platform === "copy" && copied ? "✅" : platform.icon}</span>
            <span>{platform.platform === "copy" && copied ? "¡Copiado!" : platform.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}