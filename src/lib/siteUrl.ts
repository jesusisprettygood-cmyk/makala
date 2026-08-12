export function getSiteUrl(): string {
  const configured = import.meta.env.VITE_SITE_URL?.replace(/\/$/, "")
  if (configured) return configured
  if (typeof window !== "undefined") return window.location.origin
  return ""
}
