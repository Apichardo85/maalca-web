'use client';

import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';

const ROLE_LABELS: Record<string, { es: string; en: string }> = {
  Owner: { es: 'Dueño', en: 'Owner' },
  Manager: { es: 'Gerente', en: 'Manager' },
  Staff: { es: 'Staff', en: 'Staff' },
};

interface Props {
  fullName: string | null;
  avatarUrl: string | null;
  email: string | null;
  role: string | null;
}

/** "Bienvenido, {nombre} · {Rol}" + avatar, shown below the business name in the
 *  space sidebar/drawer header. Falls back to email, then a generic label, when
 *  user_metadata has no full_name/avatar_url (email/password login instead of Google). */
export function UserBadge({ fullName, avatarUrl, email, role }: Props) {
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  const displayName = fullName || email || getText('Usuario', 'User');
  const initial = displayName.charAt(0).toUpperCase();
  const roleLabel = role ? (ROLE_LABELS[role]?.[language] ?? role) : null;

  return (
    <div className="mt-3 flex items-center gap-2">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={displayName}
          width={28}
          height={28}
          className="flex-shrink-0 rounded-full object-cover"
          style={{ width: 28, height: 28 }}
        />
      ) : (
        <div
          className="flex flex-shrink-0 items-center justify-center rounded-full bg-gray-200 dark:bg-neutral-700 text-xs font-semibold text-gray-600 dark:text-neutral-300"
          style={{ width: 28, height: 28 }}
        >
          {initial}
        </div>
      )}
      <p className="min-w-0 truncate text-xs text-gray-500 dark:text-neutral-400">
        {getText('Bienvenido, ', 'Welcome, ')}
        <span className="font-medium text-gray-700 dark:text-neutral-200">{displayName}</span>
        {roleLabel && <> · {roleLabel}</>}
      </p>
    </div>
  );
}
