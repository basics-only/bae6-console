export const MAX_SUGGESTIONS = 10;

/** Distinct values containing `query`, prefix matches first, at most MAX_SUGGESTIONS. */
export function pick(values: string[], query: string): string[] {
  const q = query.trim().toLowerCase();
  const seen = [...new Set(values)].filter((v) => v.toLowerCase().includes(q));
  const starts = seen.filter((v) => v.toLowerCase().startsWith(q));
  return [...starts, ...seen.filter((v) => !starts.includes(v))].slice(
    0,
    MAX_SUGGESTIONS,
  );
}
