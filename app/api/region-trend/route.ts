import { NextResponse } from "next/server";
import ds from "@/data/region.json";

// Region × week matrix for overlaying multiple regions on one chart.
// The source only publishes current-season weekly regional ILI (3 weeks).
const byWeekKey = ds.byWeekKey as Record<string, any>;
const weeksBySeason = ds.weeksBySeason as Record<string, any[]>;

export function GET() {
  const season = ds.default.season;
  const weeks = (weeksBySeason[season] || []).filter(
    (w) => byWeekKey[String(w.unique_week_key)]
  );

  const chartData = weeks.map((w) => {
    const entry = byWeekKey[String(w.unique_week_key)];
    const row: Record<string, unknown> = { week: w.week, week_label: w.week_label };
    for (const rt of entry.regionalTotals as { region: string; ili: number }[]) {
      row[rt.region] = rt.ili;
    }
    return row;
  });

  // order regions by latest-week value (desc) for a sensible default top-N
  const latest = chartData[chartData.length - 1] || {};
  const regions = [...(ds.regions as string[])].sort(
    (a, b) => (Number(latest[b]) || 0) - (Number(latest[a]) || 0)
  );

  return NextResponse.json({ season, regions, chartData });
}
