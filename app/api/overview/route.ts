import { NextRequest, NextResponse } from "next/server";
import ds from "@/data/overview.json";

type Week = { unique_week_key: number; data_available?: boolean };
const byWeekKey = ds.byWeekKey as Record<string, any>;
const weeksBySeason = ds.weeksBySeason as Record<string, Week[]>;

function latestWeekKey(season: string): string | null {
  const weeks = weeksBySeason[season] || [];
  const keys = weeks
    .filter((w) => w.data_available && byWeekKey[String(w.unique_week_key)])
    .map((w) => w.unique_week_key)
    .sort((a, b) => b - a);
  return keys.length ? String(keys[0]) : null;
}

export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  let wk = sp.get("weekKey");
  let season = sp.get("season");

  if (!(wk && byWeekKey[wk])) {
    if (season && weeksBySeason[season]) wk = latestWeekKey(season);
    else wk = null;
  }
  if (!wk || !byWeekKey[wk]) {
    wk = String(ds.default.weekKey);
    season = ds.default.season;
  }

  const entry = byWeekKey[wk];
  const sea = season && weeksBySeason[season] ? season : entry.selectedSeason;

  return NextResponse.json({
    seasons: ds.seasons,
    weeks: weeksBySeason[sea],
    selectedSeason: sea,
    selectedWeekKey: Number(wk),
    selectedWeek: entry.selectedWeek,
    latestDataWeek: ds.latestDataWeek,
    metrics: entry.metrics,
    vaccination: entry.vaccination,
  });
}
