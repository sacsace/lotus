import { SITE_DESCRIPTION, SITE_NAME, SITE_NAME_KO, absoluteUrl, getSiteUrl } from "@/lib/seo";

type Props = {
  slug: string;
  nameKo: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
};

export function HotelJsonLd({ slug, nameKo, address, phone, email }: Props) {
  const url = absoluteUrl(`/${slug}`);
  const site = getSiteUrl();
  const isIndia = slug === "lotus-india";

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Hotel", "LodgingBusiness"],
        "@id": `${url}#hotel`,
        name: SITE_NAME,
        alternateName: [SITE_NAME_KO, nameKo],
        description: SITE_DESCRIPTION,
        url,
        image: [
          absoluteUrl("/opengraph-image"),
          absoluteUrl("/images/hotel/reception-main.png"),
          absoluteUrl("/images/hotel/lobby-wide.png"),
        ],
        telephone: phone || undefined,
        email: email || undefined,
        priceRange: "$$",
        currenciesAccepted: "INR, USD",
        paymentAccepted: "Cash, Credit Card",
        address: address
          ? {
              "@type": "PostalAddress",
              streetAddress: address,
              addressLocality: isIndia ? "Bengaluru" : undefined,
              addressRegion: isIndia ? "Karnataka" : undefined,
              postalCode: isIndia ? "560037" : undefined,
              addressCountry: isIndia ? "IN" : undefined,
            }
          : undefined,
        geo: isIndia
          ? {
              "@type": "GeoCoordinates",
              latitude: 12.9698,
              longitude: 77.7499,
            }
          : undefined,
        servesCuisine: ["Korean", "한식"],
        amenityFeature: [
          { "@type": "LocationFeatureSpecification", name: "Airport pickup", value: true },
          { "@type": "LocationFeatureSpecification", name: "Korean dining", value: true },
          { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: true },
          { "@type": "LocationFeatureSpecification", name: "Long-stay support", value: true },
          { "@type": "LocationFeatureSpecification", name: "Laundry", value: true },
        ],
        sameAs: [site, url],
      },
      {
        "@type": "WebSite",
        "@id": `${site}/#website`,
        url: site,
        name: SITE_NAME,
        inLanguage: ["ko", "en", "zh", "ja"],
        publisher: { "@id": `${url}#hotel` },
      },
      {
        "@type": "Organization",
        "@id": `${site}/#organization`,
        name: SITE_NAME,
        url: site,
        logo: absoluteUrl("/icon-512.png"),
        email: email || undefined,
        telephone: phone || undefined,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
