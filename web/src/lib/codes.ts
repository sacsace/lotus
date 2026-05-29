const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export function generatePublicCode(): string {
  const buf = new Uint8Array(8);
  crypto.getRandomValues(buf);
  let s = "";
  for (let i = 0; i < 8; i++) s += alphabet[buf[i]! % alphabet.length]!;
  return `LKH-${s}`;
}
