import Script from "next/script";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim() || "GTM-MXGDPK8S";

export function GoogleTagManager() {
  if (!GTM_ID) return null;

  return (
    <>
      <Script id="gtm-datalayer" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
      `}</Script>
      <Script
        id="gtm"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
      />
    </>
  );
}

export function GoogleTagManagerNoscript() {
  if (!GTM_ID) return null;

  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height={0}
        width={0}
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  );
}
