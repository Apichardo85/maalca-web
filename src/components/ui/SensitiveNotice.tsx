"use client";import { useTranslation } from "@/hooks/useSimpleLanguage";interface SensitiveNoticeProps {  topics?: string[];}export default function SensitiveNotice({ topics = ["violencia", "duelo"] }: SensitiveNoticeProps) {  const { t } = useTranslation();  // Translate topics using the warning translation keys  const translatedTopics = topics.map(topic => {    const warningKey = `warning.${topic.replace(' ', '')}`;    return t(warningKey) || topic;  });  return (        <div className="mt-3 text-xs rounded-md p-3" style={{ color: 'var(--ciri-text-muted)', backgroundColor: 'var(--ciri-brand)1A', borderColor: 'var(--ciri-border)' }}>
      <div className="flex items-start gap-2">
        <span className="font-medium" style={{ color: 'var(--ciri-brand)' }}>⚠️</span>
        <div>
          <p className="font-medium mb-1" style={{ color: 'var(--ciri-brand)' }}>{t('warning.sensitiveContent')}</p>
          <p>{t('warning.contains').replace('{topics}', translatedTopics.join(", "))}</p>
          <p className="mt-1" style={{ color: 'var(--ciri-text-muted)' }}>{t('warning.recommended')}</p>
        </div>
      </div>
    </div>  );}