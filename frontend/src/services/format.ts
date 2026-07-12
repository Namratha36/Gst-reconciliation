export function formatINR(value: number): string {
  if (value >= 100000) {
    return `Rs. ${(value / 100000).toFixed(value % 100000 === 0 ? 0 : 1)}L`;
  }

  return `Rs. ${value.toLocaleString("en-IN")}`;
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function relativeDateLabel(value: string): string {
  const today = new Date("2026-07-12T00:00:00+05:30");
  const target = new Date(`${value}T00:00:00+05:30`);
  const days = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (days === -1) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 0) return `${Math.abs(days)} days overdue`;
  return `In ${days} days`;
}
