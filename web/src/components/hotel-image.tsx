import Image, { type ImageProps } from "next/image";

export type HotelPhotoVariant = "hero" | "banner" | "card" | "gallery" | "room" | "food";

const VARIANT_CLASS: Record<HotelPhotoVariant, string> = {
  hero: "hotel-photo hotel-photo-hero",
  banner: "hotel-photo hotel-photo-banner",
  card: "hotel-photo hotel-photo-card",
  gallery: "hotel-photo hotel-photo-gallery",
  room: "hotel-photo hotel-photo-room",
  food: "hotel-photo hotel-photo-food",
};

type Props = ImageProps & {
  variant?: HotelPhotoVariant;
};

export function HotelImage({ variant = "card", className = "", alt = "", ...props }: Props) {
  const base = VARIANT_CLASS[variant];
  return <Image {...props} alt={alt} className={className ? `${base} ${className}` : base} />;
}

export function HotelPhotoFrame({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`hotel-photo-frame ${className}`.trim()}>{children}</div>;
}
