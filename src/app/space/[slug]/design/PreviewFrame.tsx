'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TEMPLATES, type PublicTemplateProps } from '@/lib/templates/registry';

interface Props {
  business: PublicTemplateProps['business'];
  capabilities: PublicTemplateProps['capabilities'];
}

type PreviewMode = 'desktop' | 'mobile';

// Simulated viewport widths the real template renders at internally — 1280 is wide enough
// that Tailwind's `lg:` breakpoint (1024px) and the templates' own max-w-public-content-wide
// (1180px) both engage, so desktop mode shows the actual desktop layout, not a mobile
// fallback. 390 matches a typical modern phone viewport (iPhone 12/13/14) for mobile mode.
// `zoom` would avoid the manual height measurement below, but isn't standard CSS;
// transform:scale is what was asked for and works everywhere.
const NATURAL_WIDTHS: Record<PreviewMode, number> = { desktop: 1280, mobile: 390 };

/**
 * Renders the real public template (same TEMPLATES registry the live page and /preview/[slug]
 * use) at a simulated desktop or mobile width, then scales it down with a CSS transform to fit
 * the preview card. Replaces the old hand-maintained PreviewPanel re-render, which kept drifting
 * from the real templates (Horario, FAQ, Pasos, social links each shipped as separate fixes)
 * because every field had to be duplicated by hand instead of coming from the same component.
 */
export function PreviewFrame({ business, capabilities }: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<PreviewMode>('desktop');
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);
  const naturalWidth = NATURAL_WIDTHS[mode];

  // Server always renders 'desktop' (no window at SSR time) — this corrects it to the editor's
  // own device on first mount, via useLayoutEffect so it lands before paint instead of flashing
  // desktop first. Only runs once: after that the toggle is the only thing that changes mode.
  const defaultModeSet = useRef(false);
  useLayoutEffect(() => {
    if (defaultModeSet.current) return;
    defaultModeSet.current = true;
    if (window.innerWidth < 768) setMode('mobile');
  }, []);

  // Outer width drives the scale factor — measured with useLayoutEffect (not a plain effect)
  // so the first paint already has the right scale instead of flashing full-size content.
  useLayoutEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const measure = () => setScale(outer.clientWidth > 0 ? outer.clientWidth / naturalWidth : 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    return () => ro.disconnect();
  }, [naturalWidth]);

  // Inner (unscaled) content height drives the outer container's height, so the scaled result
  // never gets clipped or leaves dead space — recalculates as the template's own content
  // changes (e.g. a FAQ <details> opened inside the preview).
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;
    const ro = new ResizeObserver((entries) => setContentHeight(entries[0].contentRect.height));
    ro.observe(inner);
    return () => ro.disconnect();
  }, []);

  const Template = TEMPLATES[business.business_type];
  if (!Template) return null;

  return (
    <div>
      <div className="mb-3 flex justify-end gap-1">
        <button
          type="button"
          onClick={() => setMode('desktop')}
          aria-pressed={mode === 'desktop'}
          className={`rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
            mode === 'desktop'
              ? 'bg-[#C8102E]/10 text-[#C8102E]'
              : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
          }`}
        >
          🖥️
        </button>
        <button
          type="button"
          onClick={() => setMode('mobile')}
          aria-pressed={mode === 'mobile'}
          className={`rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
            mode === 'mobile'
              ? 'bg-[#C8102E]/10 text-[#C8102E]'
              : 'text-gray-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
          }`}
        >
          📱
        </button>
      </div>

      <div
        ref={outerRef}
        className="overflow-hidden rounded-2xl border border-gray-200 dark:border-neutral-700"
        style={{ width: '100%', height: contentHeight * scale }}
      >
        <div
          ref={innerRef}
          style={{ width: naturalWidth, transform: `scale(${scale})`, transformOrigin: 'top left' }}
        >
          <Template business={business} items={[]} categories={[]} capabilities={capabilities} />
        </div>
      </div>
    </div>
  );
}
