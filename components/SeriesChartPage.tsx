"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartPageCfg } from "@/config/pages";
import PageHeader from "@/components/PageHeader";
import { SingleSelect, MultiSelect } from "@/components/Selectors";
import ChartActions from "@/components/ChartActions";
import { categorical, seasonColor } from "@/lib/colors";
import { downloadCSV, downloadChartPNG, Column } from "@/lib/download";

interface SeriesDef {
  key: string;
  label: string;
  color: string;
  fixed?: boolean; // always drawn, not part of the multi-select (e.g. 전체)
}

export default function SeriesChartPage({ cfg }: { cfg: ChartPageCfg }) {
  const [season, setSeason] = useState<string | null>(null);
  const [seasonOptions, setSeasonOptions] = useState<string[]>([]);
  const [seriesDefs, setSeriesDefs] = useState<SeriesDef[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [marker, setMarker] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const chartRef = useRef<HTMLDivElement>(null);
  const urlSeries = useRef<string[] | null>(null);
  const ready = useRef(false);

  const hasSeasonSelect = cfg.kind !== "season";

  // read shareable state from the URL once on mount
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const ser = p.get("series");
    if (ser) urlSeries.current = ser.split(",").filter(Boolean);
    const s = p.get("season");
    if (hasSeasonSelect && s) setSeason(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch when season changes (season is null on first load -> server default)
  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    const qs = new URLSearchParams({ ...(cfg.query || {}) });
    if (hasSeasonSelect && season) qs.set("season", season);
    fetch(`${cfg.endpoint}?${qs.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.error) {
          setStatus("error");
          return;
        }
        setRows(d.chartData || []);
        setSeasonOptions(d.seasons || []);
        setMarker(d.businessStartWeek || null);
        if (season == null && d.selectedSeason) setSeason(d.selectedSeason);

        let defs: SeriesDef[] = [];
        let defSel: string[] = [];
        if (cfg.kind === "age" || cfg.kind === "vaccination") {
          const ages: string[] = d.ageGroups || [];
          defs = ages.map((a, i) => ({ key: a, label: a, color: categorical(i) }));
          defSel = ages.slice();
        } else if (cfg.kind === "season") {
          const seasons: string[] = d.availableSeries || d.seasons || [];
          defs = seasons.map((s) => ({ key: s, label: s, color: seasonColor(s) }));
          defSel = d.selectedSeasons || seasons.slice(-3);
        } else if (cfg.kind === "subtype") {
          const subs: string[] = d.subtypes || [];
          defs = [
            { key: "total_rate", label: "전체", color: "#173f65", fixed: true },
            ...subs.map((s, i) => ({ key: s, label: s, color: categorical(i + 1) })),
          ];
          defSel = subs.slice();
        }
        setSeriesDefs(defs);

        // URL series (once) > kept prior selection > default
        const fromUrl = urlSeries.current
          ? defs.filter((x) => !x.fixed && urlSeries.current!.includes(x.key)).map((x) => x.key)
          : null;
        urlSeries.current = null;
        setSelected((prev) => {
          if (fromUrl && fromUrl.length) return fromUrl;
          if (prev.length && prev.every((p) => defs.some((x) => x.key === p))) return prev;
          return defSel;
        });
        ready.current = true;
        setStatus("ok");
      })
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season, cfg.endpoint]);

  // sync shareable state back to the URL
  useEffect(() => {
    if (!ready.current || status !== "ok") return;
    const p = new URLSearchParams();
    if (hasSeasonSelect && season) p.set("season", season);
    if (selected.length) p.set("series", selected.join(","));
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [season, selected, status, hasSeasonSelect]);

  const visible = useMemo(
    () => seriesDefs.filter((s) => s.fixed || selected.includes(s.key)),
    [seriesDefs, selected]
  );

  const selectable = seriesDefs.filter((s) => !s.fixed);
  const seriesLabels = selectable.map((s) => s.label);
  const labelToKey = useMemo(
    () => Object.fromEntries(selectable.map((s) => [s.label, s.key])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seriesDefs]
  );
  const colorByLabel = useMemo(
    () => Object.fromEntries(selectable.map((s) => [s.label, s.color])),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [seriesDefs]
  );
  const selectedLabels = selectable.filter((s) => selected.includes(s.key)).map((s) => s.label);

  const baseName = `FluON_${cfg.title.replace(/\s·\s/g, "_").replace(/[()]/g, "").replace(/\s+/g, "")}`;

  const onCSV = () => {
    const columns: Column[] = [
      { key: "week_label", label: "주차" },
      ...visible.map((s) => ({ key: s.key, label: s.label })),
    ];
    downloadCSV(`${baseName}.csv`, columns, rows);
  };
  const onPNG = () =>
    downloadChartPNG(chartRef.current, {
      title: cfg.chartTitle,
      subtitle: `단위: ${cfg.unit}${hasSeasonSelect && season ? " · " + season : ""}`,
      legend: visible.map((s) => ({ label: s.label, color: s.color })),
      filename: `${baseName}.png`,
    });

  const foot = `* 마우스를 그래프 위에 올리면 해당 주차의 선택 ${cfg.axisLabel} ${cfg.metricWord} 수치를 확인할 수 있습니다.`;

  return (
    <>
      <PageHeader eyebrow={cfg.eyebrow} title={cfg.title} desc={cfg.desc} boxes={cfg.boxes} />

      <div className="card chart-card">
        <div className="chart-head">
          <span className="chart-pill">{cfg.chartPill}</span>
          <h2 className="chart-title">{cfg.chartTitle}</h2>
          <div className="chart-controls">
            {hasSeasonSelect && (
              <SingleSelect label="절기 선택" value={season || "—"} options={seasonOptions} onChange={setSeason} />
            )}
            <MultiSelect
              label={cfg.seriesLabel}
              values={selectedLabels}
              options={seriesLabels}
              colors={colorByLabel}
              onChange={(labels) => setSelected(labels.map((l) => labelToKey[l]))}
            />
          </div>
        </div>

        <div className="chart-subbar">
          <span className="chart-unit">단위: {cfg.unit}</span>
          <ChartActions onCSV={onCSV} onPNG={onPNG} disabled={status !== "ok"} />
        </div>

        <div className="chart-legend">
          {visible.map((s) => (
            <span className="legend-item" key={s.key}>
              <span className="legend-dot" style={{ background: s.color }} />
              {s.label}
            </span>
          ))}
        </div>

        {status === "loading" && <div className="chart-state">데이터를 불러오는 중…</div>}
        {status === "error" && <div className="chart-state">데이터 조회 중 오류가 발생했습니다.</div>}
        {status === "ok" && (
          <div ref={chartRef}>
            <ResponsiveContainer width="100%" height={540}>
              <LineChart data={rows} margin={{ top: 16, right: 28, bottom: 34, left: 4 }}>
                <CartesianGrid stroke="#eef2f6" vertical={false} />
                <XAxis
                  dataKey="week_label"
                  interval={0}
                  angle={-90}
                  textAnchor="end"
                  height={58}
                  tick={{ fontSize: 11, fill: "#8595a6" }}
                  tickMargin={8}
                  tickLine={false}
                  axisLine={{ stroke: "#d7e0e8" }}
                />
                <YAxis tick={{ fontSize: 12.5, fill: "#8595a6" }} tickLine={false} axisLine={false} width={46} />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid #dce6ee", fontSize: 13, boxShadow: "0 8px 22px rgba(18,61,104,0.14)" }}
                  labelStyle={{ color: "#123d68", fontWeight: 700 }}
                />
                {marker && (
                  <ReferenceLine
                    x={marker}
                    stroke="#e3a838"
                    strokeDasharray="5 4"
                    label={{ value: "예방접종사업 시작", position: "insideTopLeft", fill: "#c78a20", fontSize: 11, fontWeight: 700 }}
                  />
                )}
                {visible.map((s) => (
                  <Line
                    key={s.key}
                    type="monotone"
                    dataKey={s.key}
                    name={s.label}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: "#fff", stroke: s.color, strokeWidth: 1.6 }}
                    activeDot={{ r: 4 }}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <p className="chart-foot">{foot}</p>
      </div>
    </>
  );
}
