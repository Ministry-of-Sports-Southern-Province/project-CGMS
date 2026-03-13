export function resolveAvatarUrl(avatar) {
  if (!avatar) return "";
  const normalized = avatar.replace(/\\/g, "/");
  if (normalized.startsWith("http")) return normalized;
  const path = normalized.startsWith("/") ? normalized : `/${normalized}`;
  if (path.startsWith("/uploads")) {
    const base = import.meta.env.VITE_API_BASE || "http://localhost:4000";
    return `${base}${path}`;
  }
  return path;
}
