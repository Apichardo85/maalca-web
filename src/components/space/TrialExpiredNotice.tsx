import Link from 'next/link';

interface Props {
  slug: string;
}

/** Shown instead of the generic error message when a save is rejected because the Free
 *  plan's 30-day trial expired — distinct from PlanLimitNotice (10-item cap). Same shape,
 *  different condition: the user needs to know which one it is. */
export function TrialExpiredNotice({ slug }: Props) {
  return (
    <div className="rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-4 py-3 space-y-2">
      <p className="text-sm text-red-700 dark:text-red-400">
        Tu período gratuito de 30 días terminó. Mejora a Emprendedor para seguir editando tu espacio.
      </p>
      <Link
        href={`/space/${slug}/settings`}
        className="inline-block rounded-full bg-[#C8102E] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[#A00D26]"
      >
        Mejorar a Emprendedor →
      </Link>
    </div>
  );
}
