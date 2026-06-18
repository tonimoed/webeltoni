import Script from "next/script";

/**
 * SEM / paid-media tags — Google Analytics 4, Google Ads and the Meta Pixel.
 *
 * Everything here is OPT-IN and inert until you set the corresponding env var
 * (in Vercel → Project → Settings → Environment Variables). With none set,
 * nothing loads and no ad/tracking cookies are written, so the current cookie
 * policy ("no ad cookies") stays accurate.
 *
 *   NEXT_PUBLIC_GA_ID            GA4 measurement id      e.g. G-XXXXXXXXXX
 *   NEXT_PUBLIC_GOOGLE_ADS_ID    Google Ads tag id       e.g. AW-XXXXXXXXX
 *   NEXT_PUBLIC_META_PIXEL_ID    Meta (Facebook) pixel   e.g. 1234567890
 *
 * IMPORTANT (EU/GDPR): before enabling these in production add a cookie-consent
 * banner and update /cookies, since they set advertising cookies. Conversions
 * fired through lib/analytics → track() are forwarded to gtag()/fbq() here.
 */

const GA = process.env.NEXT_PUBLIC_GA_ID;
const ADS = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export function MarketingTags() {
  const gtagId = GA || ADS;

  return (
    <>
      {gtagId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
${GA ? `gtag('config', '${GA}', { anonymize_ip: true });` : ""}
${ADS ? `gtag('config', '${ADS}');` : ""}`}
          </Script>
        </>
      )}

      {PIXEL && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL}');
fbq('track', 'PageView');`}
        </Script>
      )}
    </>
  );
}
