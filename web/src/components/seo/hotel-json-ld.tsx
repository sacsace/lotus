import { SITE_DESCRIPTION, SITE_NAME, SITE_NAME_KO, absoluteUrl } from "@/lib/seo";

type Props = {
  slug: string;
  nameKo: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
};

export function HotelJsonLd({ slug, nameKo, address, phone, email }: Props) {
  const url = absoluteUrl(`/${slug}`);
  const isIndia = slug === "lotus-india";
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Hotel",
        "@id": `${url}#hotel`,
        name: SITE_NAME,
        alternateName: [SITE_NAME_KO, nameKo],
        description: SITE_DESCRIPTION,
        url,
        image: absoluteUrl("/opengraph-image"),
        telephone: phone || undefined,
        email: email || undefined,
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
        servesCuisine: "Korean",
        amenityFeature: [
          { "@type": "LocationFeatureSpecification", name: "Airport pickup", value: true },
          { "@type": "LocationFeatureSpecification", name: "Korean dining", value: true },
          { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: true },
          { "@type": "LocationFeatureSpecification", name: "Long-stay support", value: true },
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${url}#website`,
        url,
        name: SITE_NAME,
        inLanguage: ["ko", "en", "zh", "ja"],
        publisher: { "@id": `${url}#hotel` },
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
