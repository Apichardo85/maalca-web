'use client';

import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { useSimpleLanguage } from '@/hooks/useSimpleLanguage';
import SimpleLanguageToggle from '@/components/ui/SimpleLanguageToggle';
import ThemeToggle from '@/components/ui/ThemeToggle';

/** Language + theme + logout, shared by every /space/[slug]/* top bar — the
 *  marketing Header (which used to provide these) is deliberately hidden on
 *  /space routes, so each page's own bar needs this instead of duplicating
 *  the signOut/toggle wiring per file. */
export function SpaceTopBarControls() {
  const router = useRouter();
  const { language } = useSimpleLanguage();
  const getText = (es: string, en: string) => (language === 'es' ? es : en);

  const signOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex flex-shrink-0 items-center gap-3">
      <SimpleLanguageToggle variant="light" />
      <ThemeToggle />
      <button
        onClick={signOut}
        className="text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:underline"
      >
        {getText('Cerrar sesión', 'Sign out')}
      </button>
    </div>
  );
}
