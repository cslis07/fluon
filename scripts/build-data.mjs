// Normalize data/raw (harvested live responses) into compact bundled datasets
// under data/*.json that the API routes serve. Verbatim per-week deltas keep
// overview / ili-region replay byte-identical to the original.
// Run: node scripts/build-data.mjs
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw");
const OUT = join(ROOT, "data");
const rd = (p) => JSON.parse(readFileSync(join(RAW, p), "utf8"));
const wr = (name, obj) => {
  writeFileSync(join(OUT, name), JSON.stringify(obj), "utf8");
  const kb = (Buffer.byteLength(JSON.stringify(obj)) / 1024).toFixed(0);
  console.log(`  wrote data/${name}  (${kb} KB)`);
};
const listWk = (sub) =>
  readdirSync(join(RAW, sub)).filter((f) => f.startsWith("wk__") && f.endsWith(".json"));

const manifest = rd("_manifest.json");
const seasons = manifest.seasons;
const seasonFile = (s) => "season__" + s.replace(/\//g, "-").replace(/[^\w가-힣-]/g, "") + ".json";

// ---------- overview ----------
{
  const def = rd("overview/_default.json");
  const weeksBySeason = {};
  for (const s of seasons) weeksBySeason[s] = rd("overview/" + seasonFile(s)).weeks;
  const byWeekKey = {};
  for (const f of listWk("overview")) {
    const o = rd("overview/" + f);
    byWeekKey[o.selectedWeekKey] = {
      selectedSeason: o.selectedSeason,
      selectedWeek: o.selectedWeek,
      metrics: o.metrics,
      vaccination: o.vaccination,
    };
  }
  wr("overview.json", {
    seasons,
    weeksBySeason,
    latestDataWeek: def.latestDataWeek,
    default: { season: def.selectedSeason, weekKey: def.selectedWeekKey },
    byWeekKey,
  });
}

// ---------- ili-region ----------
{
  const sample = rd("ili-region/" + seasonFile(seasons[0]));
  const weeksBySeason = {};
  for (const s of seasons) weeksBySeason[s] = rd("ili-region/" + seasonFile(s)).weeks;
  const byWeekKey = {};
  let defaultWeekKey = null, defaultSeason = null;
  for (const f of listWk("ili-region")) {
    const r = rd("ili-region/" + f);
    byWeekKey[r.selectedWeekKey] = {
      selectedSeason: r.selectedSeason,
      current: r.current,
      trend: r.trend,
      regionalTotals: r.regionalTotals,
      recent4: r.recent4,
    };
  }
  const defReg = rd("ili-region/" + seasonFile(manifest.selected.season));
  wr("region.json", {
    seasons: sample.seasons,
    regions: sample.regions,
    ageOrder: sample.ageOrder,
    defaultRegion: sample.selectedRegion,
    weeksBySeason,
    default: { season: defReg.selectedSeason, weekKey: defReg.selectedWeekKey },
    byWeekKey,
  });
}

// ---------- ili-age (bySeason, full ages) ----------
{
  const bySeason = {};
  for (const s of seasons) bySeason[s] = rd("ili-age/" + seasonFile(s));
  wr("ili-age.json", { seasons, default: { season: manifest.selected.season }, bySeason });
}

// ---------- ili-seasonal (all seasons + default recent-3 selection) ----------
{
  const all = rd("ili-seasonal/all.json");
  all.defaultSelected = ["24/25절기", "25/26절기", "26/27절기"];
  wr("ili-seasonal.json", all);
}

// ---------- comparison (byMetric) ----------
{
  const metrics = ["nedis", "sari", "ari", "kriss", "lab"];
  const byMetric = {};
  for (const m of metrics) byMetric[m] = rd("comparison/" + m + ".json");
  wr("comparison.json", { metrics, byMetric });
}

// ---------- age-comparison (byMetric, full ages) ----------
{
  const metrics = ["nedis", "sari", "ari", "kriss", "lab"];
  const byMetric = {};
  for (const m of metrics) byMetric[m] = rd("age-comparison/" + m + ".json");
  wr("age-comparison.json", { metrics, byMetric });
}

// ---------- pathogen-seasonal (byMetric) ----------
{
  const metrics = ["kriss", "lab"];
  const byMetric = {};
  for (const m of metrics) byMetric[m] = rd("pathogen-seasonal/" + m + ".json");
  wr("pathogen-seasonal.json", { metrics, byMetric });
}

// ---------- vaccination-detail (byTarget, full ages) ----------
{
  const targets = ["child", "senior"];
  const byTarget = {};
  for (const t of targets) byTarget[t] = rd("vaccination-detail/" + t + ".json");
  wr("vaccination-detail.json", { targets, byTarget });
}

// ---------- verify overview reconstruction is byte-identical ----------
{
  const ds = JSON.parse(readFileSync(join(OUT, "overview.json"), "utf8"));
  let checked = 0, ok = 0;
  for (const f of listWk("overview").slice(0, 30)) {
    const raw = rd("overview/" + f);
    const d = ds.byWeekKey[raw.selectedWeekKey];
    const rebuilt = {
      seasons: ds.seasons,
      weeks: ds.weeksBySeason[raw.selectedSeason],
      selectedSeason: d.selectedSeason,
      selectedWeekKey: Number(raw.selectedWeekKey),
      selectedWeek: d.selectedWeek,
      latestDataWeek: ds.latestDataWeek,
      metrics: d.metrics,
      vaccination: d.vaccination,
    };
    checked++;
    if (JSON.stringify(rebuilt) === JSON.stringify(raw)) ok++;
    else if (checked - ok <= 2) {
      console.log("  ! overview mismatch keys:",
        Object.keys(raw).filter((k) => JSON.stringify(raw[k]) !== JSON.stringify(rebuilt[k])));
    }
  }
  console.log(`  overview reconstruction: ${ok}/${checked} byte-identical`);
}

console.log("data build complete.");
