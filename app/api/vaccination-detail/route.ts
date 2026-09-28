import { NextRequest, NextResponse } from "next/server";
import ds from "@/data/vaccination-detail.json";
import { filterColumns, selected, Row } from "@/lib/api";

const byTarget = ds.byTarget as Record<string, any>;

export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const target = sp.get("target") || "";
  const src = byTarget[target];
  if (!src) {
    return NextResponse.json({ error: "지원하지 않는 예방접종 대상입니다." }, { status: 400 });
  }
  const ageGroups: string[] = src.ageGroups;
  const selectedAges = selected(sp.get("ages"), ageGroups);
  return NextResponse.json({
    target,
    seasons: src.seasons,
    selectedSeason: sp.get("season") || src.selectedSeason,
    ageGroups,
    selectedAges,
    businessStartWeek: src.businessStartWeek,
    chartData: filterColumns(src.chartData as Row[], selectedAges),
  });
}
