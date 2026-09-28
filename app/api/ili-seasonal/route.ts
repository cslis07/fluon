import { NextRequest, NextResponse } from "next/server";
import ds from "@/data/ili-seasonal.json";
import { filterColumns, Row } from "@/lib/api";

export function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const allSeasons: string[] = ds.seasons;
  const param = sp.get("seasons");
  // With an explicit `seasons` param we filter (faithful to the original API).
  // With none, we return the full series so the client can drive the selector,
  // while `selectedSeasons` marks the default (recent-3) highlight.
  const requested = param
    ? allSeasons.filter((s) => param.split(",").map((x) => x.trim()).includes(s))
    : allSeasons;
  const selectedSeasons = param ? requested : (ds as any).defaultSelected;

  const thresholds: Record<string, number> = {};
  for (const s of requested) {
    if ((ds.thresholds as Record<string, number>)[s] != null) {
      thresholds[s] = (ds.thresholds as Record<string, number>)[s];
    }
  }
  return NextResponse.json({
    seasons: allSeasons,
    selectedSeasons,
    thresholds,
    chartData: filterColumns(ds.chartData as Row[], requested),
  });
}
