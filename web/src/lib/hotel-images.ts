export const BREAKFAST_IMAGES = Array.from({ length: 41 }, (_, i) =>
  `/images/hotel/breakfast/breakfast-${String(i + 1).padStart(2, "0")}.jpg`,
);

export const HOTEL_IMAGES = {
  hero: [
    { url: "/images/hotel/reception-main.png", alt: "Lotus Korean Hotel 리셉션" },
    { url: "/images/hotel/reception-01.png", alt: "Lotus Korean Hotel 로비" },
    { url: "/images/hotel/lobby-wide.png", alt: "한식다방 다이닝 라운지" },
    { url: "/images/hotel/reception-04.png", alt: "리셉션" },
  ],
  rooms: {
    B: "/images/hotel/room-suite.png",
    M: "/images/hotel/room-deluxe.png",
    S: "/images/hotel/room-standard.png",
  },
  roomGalleries: {
    M: [
      "/images/hotel/room-deluxe.png",
      "/images/hotel/rooms/room-01.png",
      "/images/hotel/rooms/room-06.png",
    ],
    B: [
      "/images/hotel/room-suite.png",
      "/images/hotel/room-suite-living.png",
      "/images/hotel/rooms/room-03.png",
      "/images/hotel/rooms/room-04.png",
      "/images/hotel/rooms/room-05.png",
    ],
    S: ["/images/hotel/room-standard.png"],
  },
  reception: "/images/hotel/reception-main.png",
  lobby: "/images/hotel/lobby-wide.png",
  lounge: "/images/hotel/reception-lounge.png",
  dining: "/images/hotel/dining-lounge.png",
  suiteLiving: "/images/hotel/room-suite-living.png",
  food: {
    breakfast: BREAKFAST_IMAGES[18],
    dinner: "/images/hotel/food-bibimbap.png",
    gallery: BREAKFAST_IMAGES,
  },
} as const;

export const DEFAULT_ROOM_IMAGE = HOTEL_IMAGES.rooms.M;

export function roomGalleryForCode(code: string | null | undefined, fallback?: string | null) {
  if (code && code in HOTEL_IMAGES.roomGalleries) {
    return HOTEL_IMAGES.roomGalleries[code as keyof typeof HOTEL_IMAGES.roomGalleries];
  }
  const single = roomImageForCode(code, fallback);
  return [single];
}

export function roomImageForCode(code: string | null | undefined, fallback?: string | null) {
  if (fallback) return fallback;
  if (code && code in HOTEL_IMAGES.rooms) {
    return HOTEL_IMAGES.rooms[code as keyof typeof HOTEL_IMAGES.rooms];
  }
  return DEFAULT_ROOM_IMAGE;
}
