import { NextRequest, NextResponse } from "next/server";
import ds from "@/data/ili-age.json";
import { filterColumns, selected, Row } from "@/lib/api";

const bySeason = ds.bySeason as Record<string, any>;

export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const seasonParam = sp.get("season");
  const season = seasonParam && bySeason[seasonParam] ? seasonParam : ds.default.season;
  const src = bySeason[season];
  const ageGroups: string[] = src.ageGroups;
  const selectedAges = selected(sp.get("ages"), ageGroups);
  return NextResponse.json({
    seasons: src.seasons,
    selectedSeason: season,
    ageGroups,
    selectedAges,
    chartData: filterColumns(src.chartData as Row[], selectedAges),
  });
}
