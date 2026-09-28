"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { SingleSelect } from "@/components/Selectors";

type MetricKey = "ili" | "ari" | "sari" | "kriss" | "lab" | "nedis";
interface MetricVal {
  current: number | null;
  previous: number | null;
  trend: { label: string; season: string; value: number | null }[];
}
interface Overview {
  seasons: string[];
  weeks: { unique_week_key: number; week_label: string; data_available?: boolean; threshold?: number }[];
  selectedSeason: string;
  selectedWeekKey: number;
  selectedWeek: { week_label: string; threshold: number; start_dt: string };
  latestDataWeek: { start_dt: string };
  metrics: Record<MetricKey, MetricVal>;
  vaccination: { senior: number | null; child: number | null };
}

const CARDS: { key: MetricKey; title: string; unit: string; pp: boolean }[] = [
  { key: "ili", title: "인플루엔자 의사환자(ILI) 분율", unit: "/1천명 당", pp: false },
  { key: "ari", title: "급성호흡기감염증 환자 중 인플루엔자 환자 수(ARI)", unit: "명", pp: false },
  { key: "sari", title: "중증급성호흡기감염증 환자 중 인플루엔자 환자 수(SARI)", unit: "명", pp: false },
  { key: "kriss", title: "의원급 의료기관 인플루엔자 검출률(K-RISS)", unit: "%", pp: true },
  { key: "lab", title: "검사기관 인플루엔자 검출률(LAB)", unit: "%", pp: true },
  { key: "nedis", title: "응급실 인플루엔자 환자 수(NEDIS)", unit: "명", pp: false },
];

const fmt = (n: number | null) =>
  n == null ? "-" : n.toLocaleString("ko-KR", { maximumFractionDigits: 1 });

function addDays(iso: string, days: number) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export default function OverviewView() {
  const [season, setSeason] = useState<string | null>(null);
  const [weekKey, setWeekKey] = useState<number | null>(null);
  const [d, setD] = useState<Overview | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    let cancel = false;
    setStatus("loading");
    const qs = new URLSearchParams();
    if (season) qs.set("season", season);
    if (weekKey) qs.set("weekKey", String(weekKey));
    fetch(`/api/overview?${qs.toString()}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((res: Overview) => {
        if (cancel) return;
        setD(res);
        if (season == null) setSeason(res.selectedSeason);
        setWeekKey(res.selectedWeekKey);
        setStatus("ok");
      })
      .catch(() => !cancel && setStatus("error"));
    return () => {
      cancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season, weekKey]);

  const onSeason = (s: string) => {
    setSeason(s);
    setWeekKey(null); // let server pick that season's latest week
  };

  const availableWeeks = (d?.weeks || []).filter((w) => w.data_available);
  const weekLabelByKey = Object.fromEntries((d?.weeks || []).map((w) => [String(w.unique_week_key), w.week_label]));
  const updateDate = d ? addDays(d.latestDataWeek.start_dt, 4) : "";

  return (
    <>
      <div className="ov-head">
        <div>
          <p className="page-eyebrow">Influenza Overview</p>
          <h1 className="page-title" style={{ marginBottom: 4 }}>주요 발생 현황</h1>
        </div>
        <div className="ov-meta">
          <p>전주 일요일-토요일 동안 신고자료를 기준<br />으로 매주 목요일 업데이트</p>
          <p className="upd">최근 업데이트: {updateDate}</p>
        </div>
        <div className="ov-selects card">
          <SingleSelect label="절기 선택" value={season || "—"} options={d?.seasons || []} onChange={onSeason} />
          <SingleSelect
            label="주차 선택"
            value={weekKey ? weekLabelByKey[String(weekKey)] || "—" : "—"}
            options={availableWeeks.map((w) => String(w.unique_week_key))}
            format={(k) => weekLabelByKey[k] || k}
            onChange={(k) => setWeekKey(Number(k))}
          />
        </div>
      </div>

      {status !== "ok" || !d ? (
        <div className="chart-state">{status === "error" ? "데이터 조회 중 오류가 발생했습니다." : "데이터를 불러오는 중…"}</div>
      ) : (
        <>
          <div className="grid-cards" style={{ marginBottom: 18 }}>
            {CARDS.map((c) => (
              <MetricCard key={c.key} cfg={c} m={d.metrics[c.key]} />
            ))}
          </div>

          <div className="ov-bottom">
            <StageCard ili={d.metrics.ili.current} threshold={d.selectedWeek?.threshold} season={d.selectedSeason} week={d.selectedWeek?.week_label} />
            <VaccinationCard vaccination={d.vaccination} />
          </div>
        </>
      )}
    </>
  );
}

function MetricCard({ cfg, m }: { cfg: (typeof CARDS)[number]; m: MetricVal }) {
  const cur = m?.current ?? null;
  const prev = m?.previous ?? null;
  let change = 0;
  let up = true;
  if (cur != null && prev != null && prev !== 0) {
    change = cfg.pp ? cur - prev : ((cur - prev) / Math.abs(prev)) * 100;
    up = cur >= prev;
  }
  const trend = (m?.trend || []).map((t) => ({ label: t.label, value: t.value }));
  const color = up ? "var(--up)" : "var(--down)";
  return (
    <div className="card metric-card">
      <div className="metric-title">{cfg.title}</div>
      <div className="metric-body">
        <div className="metric-left">
          <div className="metric-num">
            {fmt(cur)}
            <span className="metric-unit">{cfg.unit}</span>
          </div>
          <div className="metric-change">
            <span className="mc-label">전주 대비</span>
            <span className="mc-arrow" style={{ color }}>{up ? "▲" : "▼"}</span>
            <span className="mc-val" style={{ color }}>
              {Math.abs(change).toFixed(1)}
              {cfg.pp ? "%p" : "%"}
            </span>
          </div>
        </div>
        <div className="metric-right">
          <div className="metric-spark">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 6, right: 2, bottom: 0, left: 2 }}>
                <defs>
                  <linearGradient id={`g-${cfg.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7fb2e0" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#7fb2e0" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke="#4a90d0" strokeWidth={2} fill={`url(#g-${cfg.key})`} isAnimationActive={false} connectNulls dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="spark-labels">
            {trend.map((t) => (
              <span key={t.label}>{t.label}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StageCard({ ili, threshold, season, week }: { ili: number | null; threshold?: number; season: string; week?: string }) {
  const t = threshold ?? 0;
  const bounds = [t, t * 5, t * 10];
  const stages = [
    { name: "비유행", color: "var(--stage-none)", desc: "유행기준 미만" },
    { name: "보통", color: "var(--stage-mid)", desc: "유행기준 이상 ~ 5배 미만" },
    { name: "높음", color: "var(--stage-high)", desc: "유행기준 5배 이상 ~ 10배 미만" },
    { name: "매우높음", color: "var(--stage-vhigh)", desc: "유행기준 10배 이상" },
  ];
  let idx = 0;
  if (ili != null) {
    if (ili >= bounds[2]) idx = 3;
    else if (ili >= bounds[1]) idx = 2;
    else if (ili >= bounds[0]) idx = 1;
    else idx = 0;
  }
  return (
    <div className="card card-pad">
      <h3 className="panel-title">인플루엔자 유행단계</h3>
      <div className="stage-wrap">
        <div className="stage-gauge">
          <div className="stage-bubble" style={{ left: `${idx * 25 + 12.5}%` }}>
            <div className="sb-1">{season} {week}</div>
            <div className="sb-2">{ili != null ? ili : "-"}</div>
          </div>
          <div className="stage-bar">
            {stages.map((s) => (
              <div key={s.name} className="stage-seg" style={{ background: s.color }} />
            ))}
          </div>
          <div className="stage-names">
            {stages.map((s, i) => (
              <span key={s.name} className={i === idx ? "on" : ""}>{s.name}</span>
            ))}
          </div>
        </div>
        <div className="stage-legend">
          <div className="sl-head">
            <span>{season} 유행기준</span>
            <b>{t}</b>
          </div>
          {stages.map((s, i) => (
            <div key={s.name} className={"sl-row" + (i === idx ? " on" : "")}>
              <span className="sl-dot" style={{ background: s.color }} />
              <span className="sl-name">{s.name}</span>
              <span className="sl-desc">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VaccinationCard({ vaccination }: { vaccination: { senior: number | null; child: number | null } }) {
  const items = [
    { pill: "어르신", range: "65세 이상", val: vaccination?.senior },
    { pill: "어린이", range: "6개월-13세", val: vaccination?.child },
  ];
  return (
    <div className="card card-pad">
      <h3 className="panel-title">인플루엔자 예방접종</h3>
      <div className="vax-grid">
        {items.map((it) => (
          <div className="vax-cell" key={it.pill}>
            <span className="vax-pill">{it.pill}</span>
            <div className="vax-range">{it.range}</div>
            <div className="vax-status">
              {it.val != null ? `${it.val}%` : "예방접종사업\n종료"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
