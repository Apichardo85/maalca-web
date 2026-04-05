import Script from 'next/script'

const GA_ID = process.env.NEXT_PUBLIC_GA_TRACKING_ID

/**
 * Server component — renders gtag scripts in <head>.
 * Only loads when NEXT_PUBLIC_GA_TRACKING_ID is set.
 */
export function GoogleAnalytics() {
  if (!GA_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_title: document.title,
            page_location: window.location.href,
            custom_map: { 'custom_project': 'project' }
          });
        `}
      </Script>
    </>
  )
}
