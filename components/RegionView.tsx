"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import PageHeader from "@/components/PageHeader";
import { SingleSelect } from "@/components/Selectors";
import { choroplethColor } from "@/lib/colors";

interface RegionData {
  seasons: string[];
  regions: string[];
  weeks: { unique_week_key: number; week_label: string; data_available?: boolean }[];
  selectedSeason: string;
  selectedRegion: string;
  selectedWeekKey: number;
  current: { overall: number; ages: Record<string, number> };
  ageOrder: { key: string; label: string }[];
  trend: any[];
  regionalTotals: { region: string; ili: number }[];
  recent4: { week_label: string; ili: number | null }[];
}

const HEADER = {
  eyebrow: "Influenza like illness, ILI",
  title: "의원급 임상감시 · 지역별",
  desc: "인플루엔자 의사환자 임상감시는 의원급 표본감시의료기관(약 800개소)를 대상으로 매주 내원한 외래환자 중 인플루엔자 의사환자 수를 신고받는 감시체계 입니다.",
  boxes: [
    {
      tag: "term" as const,
      label: "용어설명",
      term: "인플루엔자 의사환자 (Influenza like illness, ILI)",
      def: "38 °C 이상의 발열과 함께 기침, 인후통 증상을 보이는 사람",
    },
    {
      tag: "notice" as const,
      label: "안내사항",
      text: "26/27절기부터 지역별 데이터를 공개, 지역별 표본감시기관 규모의 차이가 있으므로 단순비교할 수 없습니다.",
    },
  ],
};

export default function RegionView() {
  const [weekKey, setWeekKey] = useState<number | null>(null);
  const [region, setRegion] = useState<string>("서울");
  const [d, setD] = useState<RegionData | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const mapRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    fetch("/korea-ili-choropleth.svg")
      .then((r) => r.text())
      .then(setSvg)
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancel = false;
    setStatus("loading");
    const qs = new URLSearchParams();
    if (weekKey) qs.set("weekKey", String(weekKey));
    fetch(`/api/ili-region?${qs.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((res: RegionData) => {
        if (cancel) return;
        setD(res);
        setWeekKey(res.selectedWeekKey);
        setStatus("ok");
      })
      .catch(() => !cancel && setStatus("error"));
    return () => {
      cancel = true;
    };
  }, [weekKey]);

  const totalsMap = useMemo(() => {
    const m: Record<string, number> = {};
    (d?.regionalTotals || []).forEach((r) => (m[r.region] = r.ili));
    return m;
  }, [d]);

  // color regions + place centroid labels once svg + data are ready
  useEffect(() => {
    const host = mapRef.current;
    if (!host || !svg || !d) return;
    const svgEl = host.querySelector("svg");
    if (!svgEl) return;
    const vals = d.regionalTotals.map((r) => r.ili);
    const min = Math.min(...vals);
    const max = Math.max(...vals);

    // remove previous labels
    svgEl.querySelectorAll(".rg-label").forEach((n) => n.remove());

    const groups = svgEl.querySelectorAll<SVGGElement>("[data-region]");
    groups.forEach((g) => {
      const name = g.getAttribute("data-region") || "";
      const val = totalsMap[name] ?? (name === "광주" ? totalsMap["전남광주"] : undefined);
      const fill = choroplethColor(val ?? null, min, max);
      g.querySelectorAll("path").forEach((p) => {
        p.setAttribute("fill", fill);
        p.setAttribute("stroke", "#ffffff");
        p.setAttribute("stroke-width", "2");
      });
      const selected = name === region;
      if (selected) g.querySelectorAll("path").forEach((p) => p.setAttribute("stroke", "#0d2c4d"));
    });

    // labels only for the 16 data regions (skip standalone 광주)
    d.regionalTotals.forEach(({ region: name, ili }) => {
      const g = svgEl.querySelector<SVGGElement>(`[data-region="${name}"]`);
      if (!g) return;
      let bb: DOMRect;
      try {
        bb = g.getBBox();
      } catch {
        return;
      }
      const cx = bb.x + bb.width / 2;
      const cy = bb.y + bb.height / 2;
      const dark = choroplethColor(ili, Math.min(...vals), Math.max(...vals)) === "#1f4f86";
      const txt = document.createElementNS("http://www.w3.org/2000/svg", "text");
      txt.setAttribute("class", "rg-label");
      txt.setAttribute("x", String(cx));
      txt.setAttribute("y", String(cy));
      txt.setAttribute("text-anchor", "middle");
      const short = name === "전남광주" ? "전남광주" : name;
      const t1 = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      t1.setAttribute("x", String(cx));
      t1.setAttribute("dy", "-2");
      t1.setAttribute("font-size", "22");
      t1.setAttribute("font-weight", "700");
      t1.setAttribute("fill", dark ? "#ffffff" : "#123d68");
      t1.textContent = short;
      const t2 = document.createElementNS("http://www.w3.org/2000/svg", "tspan");
      t2.setAttribute("x", String(cx));
      t2.setAttribute("dy", "26");
      t2.setAttribute("font-size", "24");
      t2.setAttribute("font-weight", "800");
      t2.setAttribute("fill", dark ? "#ffffff" : "#123d68");
      t2.textContent = String(ili);
      txt.appendChild(t1);
      txt.appendChild(t2);
      svgEl.appendChild(txt);
    });
  }, [svg, d, region, totalsMap]);

  const overall = d ? totalsMap[region] ?? d.current.overall : null;
  const recent = (d?.recent4 || []).map((r) => ({ week_label: r.week_label, ili: r.ili }));

  return (
    <>
      <PageHeader {...HEADER} />

      <div className="region-grid">
        <div className="card region-map-card">
          <div className="map-scale">
            <span>낮음</span>
            <i className="scale-bar" />
            <span>높음</span>
          </div>
          <div className="map-host" ref={mapRef} dangerouslySetInnerHTML={{ __html: svg }} />
        </div>

        <div className="region-side">
          <div className="card region-controls">
            <SingleSelect label="지역" value={region} options={d?.regions || []} onChange={setRegion} />
            <SingleSelect label="절기" value={d?.selectedSeason || "—"} options={d?.seasons || []} onChange={() => {}} />
            <SingleSelect
              label="주차"
              value={d ? d.weeks.find((w) => w.unique_week_key === d.selectedWeekKey)?.week_label || "—" : "—"}
              options={(d?.weeks || []).filter((w) => w.data_available).map((w) => String(w.unique_week_key))}
              format={(k) => d?.weeks.find((w) => String(w.unique_week_key) === k)?.week_label || k}
              onChange={(k) => setWeekKey(Number(k))}
            />
          </div>

          <div className="card detail-card">
            <div className="detail-top">
              <span className="detail-eyebrow">선택 지역</span>
              <span className="detail-when">
                {d?.selectedSeason} · {d?.weeks.find((w) => w.unique_week_key === d?.selectedWeekKey)?.week_label}
              </span>
            </div>
            <div className="detail-region">{region}</div>
            <div className="detail-body">
              <div className="detail-num">
                <div className="dn-label">전체 ILI</div>
                <div className="dn-val">{overall ?? "-"}</div>
                <div className="dn-unit">외래환자 1천명 당</div>
              </div>
              <div className="detail-spark">
                <div className="ds-label">최근 4주</div>
                <div className="ds-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={recent} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
                      <defs>
                        <linearGradient id="rg-grad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7fb2e0" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#7fb2e0" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="ili" stroke="#4a90d0" strokeWidth={2} fill="url(#rg-grad)" connectNulls dot={false} isAnimationActive={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="ds-labels">
                  {recent.map((r) => (
                    <span key={r.week_label}>{r.week_label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card age-table-card">
            <div className="att-head">
              <h3>연령별 ILI</h3>
              <span>외래환자 1천명 당</span>
            </div>
            {(d?.ageOrder || []).map((a) => (
              <div className="att-row" key={a.key}>
                <span>{a.label}</span>
                <b>{d?.current.ages?.[a.key] ?? "-"}</b>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="chart-foot">
        * 선택한 절기·주차의 지역별 전체 ILI를 색상으로 비교하고, 선택 지역의 전체 및 연령별 ILI를 확인할 수 있습니다.
      </p>
    </>
  );
}
