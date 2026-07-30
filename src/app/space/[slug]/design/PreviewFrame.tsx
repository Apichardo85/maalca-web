'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TEMPLATES, type PublicTemplateProps } from '@/lib/templates/registry';

interface Props {
  business: PublicTemplateProps['business'];
  capabilities: PublicTemplateProps['capabilities'];
}

// Desktop width the real template renders at internally — wide enough that Tailwind's `lg:`
// breakpoint (1024px) and the templates' own max-w-public-content-wide (1180px) both engage,
// so this preview shows the actual desktop layout, not a mobile fallback. `zoom` would avoid
// the manual height measurement below, but isn't standard CSS; transform:scale is what was
// asked for and works everywhere.
const NATURAL_WIDTH = 1280;

/**
 * Renders the real public template (same TEMPLATES registry the live page and /preview/[slug]
 * use) at its natural desktop width, then scales it down with a CSS transform to fit the
 * preview card. Replaces the old hand-maintained PreviewPanel re-render, which kept drifting
 * from the real templates (Horario, FAQ, Pasos, social links each shipped as separate fixes)
 * because every field had to be duplicated by hand instead of coming from the same component.
 */
export function PreviewFrame({ business, capabilities }: Props) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [contentHeight, setContentHeight] = useState(0);

  // Outer width drives the scale factor — measured with useLayoutEffect (not a plain effect)
  // so the first paint already has the right scale instead of flashing full-size content.
  useLayoutEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const measure = () => setScale(outer.clientWidth > 0 ? outer.clientWidth / NATURAL_WIDTH : 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(outer);
    return () => ro.disconnect();
  }, []);

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
    <div
      ref={outerRef}
      className="overflow-hidden rounded-2xl border border-gray-200 dark:border-neutral-700"
      style={{ width: '100%', height: contentHeight * scale }}
    >
      <div
        ref={innerRef}
        style={{ width: NATURAL_WIDTH, transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        <Template business={business} items={[]} categories={[]} capabilities={capabilities} />
      </div>
    </div>
  );
}
