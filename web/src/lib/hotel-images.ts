export const HOTEL_IMAGES = {
  hero: [
    { url: "/images/hotel/reception-main.png", alt: "Lotus Korean Hotel reception desk" },
    { url: "/images/hotel/lobby-wide.png", alt: "Lotus Korean Hotel lobby and Hansik Dabang" },
    { url: "/images/hotel/reception-lounge.png", alt: "Lotus Korean Hotel reception lounge" },
  ],
  rooms: {
    B: "/images/hotel/room-suite.png",
    M: "/images/hotel/room-deluxe.png",
    S: "/images/hotel/room-standard.png",
  },
  reception: "/images/hotel/reception-main.png",
  lobby: "/images/hotel/lobby-wide.png",
  lounge: "/images/hotel/reception-lounge.png",
  dining: "/images/hotel/dining-lounge.png",
  suiteLiving: "/images/hotel/room-suite-living.png",
  food: {
    breakfast: "/images/hotel/food-breakfast.png",
    dinner: "/images/hotel/food-bibimbap.png",
    gallery: [
      "/images/hotel/food-breakfast.png",
      "/images/hotel/food-bibimbap.png",
      "/images/hotel/food-bossam-set.png",
      "/images/hotel/food-noodle-set.png",
      "/images/hotel/food-chicken-rice.png",
    ],
  },
} as const;

export const DEFAULT_ROOM_IMAGE = HOTEL_IMAGES.rooms.S;

export function roomImageForCode(code: string | null | undefined, fallback?: string | null) {
  if (fallback) return fallback;
  if (code && code in HOTEL_IMAGES.rooms) {
    return HOTEL_IMAGES.rooms[code as keyof typeof HOTEL_IMAGES.rooms];
  }
  return DEFAULT_ROOM_IMAGE;
}
