export const LOTUS_ROOM_NUMBERS = {
  B: ["215", "216", "219", "220", "315", "316", "319", "320", "415", "416", "419", "420", "515", "516", "520"],
  M: ["218", "221", "318", "321", "418", "421", "518"],
  S: ["317"],
} as const;

export const PUBLIC_ROOM_CODES = ["M", "B", "S"] as const;

export function sortRoomTypes<T extends { code: string }>(rooms: T[]) {
  const order = new Map<string, number>(PUBLIC_ROOM_CODES.map((code, index) => [code, index]));
  return [...rooms].sort((a, b) => (order.get(a.code) ?? 99) - (order.get(b.code) ?? 99));
}
