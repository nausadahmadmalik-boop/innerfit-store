export function cleanText(value: unknown, max = 500): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}
export function validPhone(value: string): boolean {
  return /^[6-9]\d{9}$/.test(value);
}
