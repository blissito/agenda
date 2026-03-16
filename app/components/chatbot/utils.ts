export function formatMessageTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatDateSeparator(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  if (diff < 7) return d.toLocaleDateString("es-MX", { weekday: "long" });
  return d.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

export function groupMessagesByDate(messages: { createdAt: string }[]): Map<string, typeof messages> {
  const groups = new Map<string, typeof messages>();
  for (const msg of messages) {
    const key = new Date(msg.createdAt).toLocaleDateString("es-MX");
    const group = groups.get(key) || [];
    group.push(msg);
    groups.set(key, group);
  }
  return groups;
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "Ahora";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays === 1) return "Ayer";
  return `${diffDays}d`;
}
