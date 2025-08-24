"use client";

import { useLanguage } from "@/hooks/useLanguage";

interface SensitiveNoticeProps {
  topics?: string[];
}

export default function SensitiveNotice({ topics = ["violencia", "duelo"] }: SensitiveNoticeProps) {
  const { t } = useLanguage();
  
  // Translate topics using the warning translation keys
  const translatedTopics = topics.map(topic => {
    const warningKey = `warning.${topic.replace(' ', '')}`;
    return t(warningKey) || topic;
  });
  
  return (
    <div className="mt-3 text-xs text-slate-300 bg-red-900/10 border border-red-800/30 rounded-md p-3">
      <div className="flex items-start gap-2">
        <span className="text-red-400 font-medium">⚠️</span>
        <div>
          <p className="font-medium text-red-400 mb-1">{t('warning.sensitiveContent')}</p>
          <p>{t('warning.contains').replace('{topics}', translatedTopics.join(", "))}</p>
          <p className="text-slate-400 mt-1">{t('warning.recommended')}</p>
        </div>
      </div>
    </div>
  );
}