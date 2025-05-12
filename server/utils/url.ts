export function encodeParams(obj: Record<string, string>): string {
  return Object.entries(obj)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
}