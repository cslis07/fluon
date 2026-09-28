import { NextRequest, NextResponse } from "next/server";
import ds from "@/data/age-comparison.json";
import { filterColumns, selected, Row } from "@/lib/api";

const byMetric = ds.byMetric as Record<string, any>;

export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const metric = sp.get("metric") || "";
  const src = byMetric[metric];
  if (!src) {
    return NextResponse.json({ error: "지원하지 않는 지표입니다." }, { status: 400 });
  }
  const ageGroups: string[] = src.ageGroups;
  const selectedAges = selected(sp.get("ages"), ageGroups);
  return NextResponse.json({
    metric,
    seasons: src.seasons,
    selectedSeason: sp.get("season") || src.selectedSeason,
    ageGroups,
    selectedAges,
    chartData: filterColumns(src.chartData as Row[], selectedAges),
  });
}
