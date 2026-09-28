import { NextRequest, NextResponse } from "next/server";
import ds from "@/data/pathogen-seasonal.json";
import { filterColumns, Row } from "@/lib/api";

const byMetric = ds.byMetric as Record<string, any>;

export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const metric = sp.get("metric") || "";
  const src = byMetric[metric];
  if (!src) {
    return NextResponse.json({ error: "지원하지 않는 지표입니다." }, { status: 400 });
  }
  const subtypes: string[] = src.subtypes;
  const param = sp.get("subtypes");
  const selectedSubtypes = param
    ? subtypes.filter((s) => param.split(",").map((x) => x.trim()).includes(s))
    : subtypes;

  return NextResponse.json({
    metric,
    seasons: src.seasons,
    selectedSeason: sp.get("season") || src.selectedSeason,
    subtypes,
    selectedSubtypes,
    // total_rate (전체) is always included alongside the selected subtypes.
    chartData: filterColumns(src.chartData as Row[], ["total_rate", ...selectedSubtypes]),
  });
}
