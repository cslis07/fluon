// Shared helpers for the API routes.

export type Row = Record<string, unknown> & { week: number; week_label: string };

/** keep only week/week_label + the requested series columns (order = keepKeys). */
export function filterColumns(chartData: Row[], keepKeys: string[]): Row[] {
  return chartData.map((row) => {
    const out: Row = { week: row.week, week_label: row.week_label };
    for (const k of keepKeys) if (k in row) out[k] = row[k] as unknown;
    return out;
  });
}

/** parse a comma-separated multi-select param, intersected with the valid domain. */
export function selected(param: string | null, domain: string[]): string[] {
  if (!param) return domain.slice();
  const req = param.split(",").map((s) => s.trim());
  return domain.filter((d) => req.includes(d));
}
