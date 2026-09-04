export function formatCuisineDisplay(raw?: string | null): string {
  if (!raw?.trim()) return '';
  return raw
    .split(/[,|]/)
    .map((part) =>
      part
        .trim()
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
    )
    .filter(Boolean)
    .join(' · ');
}
