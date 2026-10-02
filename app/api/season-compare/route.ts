import { NextRequest, NextResponse } from "next/server";
import cmp from "@/data/comparison.json";
import ili from "@/data/ili-seasonal.json";

// Compare each metric at a given week against the SAME week of the previous season.
// ili comes from ili-seasonal; nedis/sari/ari/kriss/lab from comparison.
const seasonsOrdered: string[] = ili.seasons; // oldest -> newest

function prevSeasonOf(s: string): string | null {
  const i = seasonsOrdered.indexOf(s);
  return i > 0 ? seasonsOrdered[i - 1] : null;
}

function valueAt(chartData: any[], week: number, season: string): number | null {
  const row = chartData.find((r) => r.week === week);
  if (!row) return null;
  const v = row[season];
  return typeof v === "number" ? v : null;
}

export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const season = sp.get("season") || seasonsOrdered[seasonsOrdered.length - 1];
  const week = Number(sp.get("week"));
  const prevSeason = prevSeasonOf(season);

  const metrics: Record<string, { current: number | null; previous: number | null }> = {};
  metrics.ili = {
    current: valueAt((ili as any).chartData, week, season),
    previous: prevSeason ? valueAt((ili as any).chartData, week, prevSeason) : null,
  };
  for (const m of cmp.metrics) {
    const cd = (cmp.byMetric as any)[m].chartData;
    metrics[m] = {
      current: valueAt(cd, week, season),
      previous: prevSeason ? valueAt(cd, week, prevSeason) : null,
    };
  }

  return NextResponse.json({ season, prevSeason, week, metrics });
}
