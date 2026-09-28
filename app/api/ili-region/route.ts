import { NextRequest, NextResponse } from "next/server";
import ds from "@/data/region.json";

// The original endpoint always serves the current season's regional data
// (season/region params are ignored; only the current season's weekKeys vary).
const byWeekKey = ds.byWeekKey as Record<string, any>;
const weeksBySeason = ds.weeksBySeason as Record<string, any[]>;

export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  let wk = sp.get("weekKey");
  if (!(wk && byWeekKey[wk])) wk = String(ds.default.weekKey);
  const entry = byWeekKey[wk];
  const season = entry.selectedSeason;

  return NextResponse.json({
    seasons: ds.seasons,
    regions: ds.regions,
    weeks: weeksBySeason[season] || weeksBySeason[ds.default.season],
    selectedSeason: season,
    selectedRegion: ds.defaultRegion,
    selectedWeekKey: Number(wk),
    current: entry.current,
    ageOrder: ds.ageOrder,
    trend: entry.trend,
    regionalTotals: entry.regionalTotals,
    recent4: entry.recent4,
  });
}
