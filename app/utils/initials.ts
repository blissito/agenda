export function getInitials(
  displayName: string | null | undefined,
  email?: string | null,
): string {
  const name = (displayName || "").trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  }
  return ((email || "").slice(0, 2) || "?").toUpperCase()
}
