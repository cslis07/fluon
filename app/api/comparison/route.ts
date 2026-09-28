import { NextRequest, NextResponse } from "next/server";
import ds from "@/data/comparison.json";

const byMetric = ds.byMetric as Record<string, unknown>;

export function GET(req: NextRequest) {
  const metric = req.nextUrl.searchParams.get("metric") || "";
  if (!byMetric[metric]) {
    return NextResponse.json({ error: "지원하지 않는 지표입니다." }, { status: 400 });
  }
  return NextResponse.json(byMetric[metric]);
}
