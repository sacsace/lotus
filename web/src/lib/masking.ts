export function maskPassport(value: string | null | undefined): string {
  if (!value) return "—";
  const trimmed = value.trim();
  if (trimmed.length <= 4) return "****";
  return `${"*".repeat(Math.max(trimmed.length - 4, 4))}${trimmed.slice(-4)}`;
}

export function revealPassport(value: string | null | undefined, reveal: boolean): string {
  if (!value) return "—";
  return reveal ? value : maskPassport(value);
}
