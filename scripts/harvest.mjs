// Harvest the live FluON API into data/raw so we can rebuild a faithful,
// self-contained clone. Data source: KDCA public surveillance (dportal.kdca.go.kr).
// Run: node scripts/harvest.mjs
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = "https://fluon-web-ui-revision-v52-final-dat.vercel.app";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RAW = join(ROOT, "data", "raw");

const METRICS = ["nedis", "sari", "ari", "kriss", "lab"]; // comparison / age-comparison
const PATHOGENS = ["kriss", "lab"]; // pathogen-seasonal
const TARGETS = ["child", "senior"]; // vaccination-detail

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJSON(path, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(BASE + path, { headers: { accept: "application/json" } });
      const text = await res.text();
      try {
        return { ok: res.ok, status: res.status, data: JSON.parse(text), text };
      } catch {
        return { ok: false, status: res.status, data: null, text };
      }
    } catch (e) {
      if (i === tries - 1) return { ok: false, status: 0, data: null, text: String(e) };
      await sleep(400 * (i + 1));
    }
  }
}

async function save(rel, obj) {
  const file = join(RAW, rel);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(obj, null, 0), "utf8");
}

// crude concurrency pool
async function pool(items, limit, fn) {
  let idx = 0, done = 0;
  const total = items.length;
  const workers = Array.from({ length: limit }, async () => {
    while (idx < items.length) {
      const my = idx++;
      await fn(items[my], my);
      done++;
      if (done % 25 === 0 || done === total) process.stdout.write(`\r    ${done}/${total}   `);
    }
  });
  await Promise.all(workers);
  process.stdout.write("\n");
}

const manifest = { generatedAt: new Date().toISOString(), source: BASE, counts: {} };

async function main() {
  await mkdir(RAW, { recursive: true });

  // 1) default overview -> seasons + selected + domain
  console.log("[1] domain / default overview");
  const def = await getJSON("/api/overview");
  await save("overview/_default.json", def.data);
  const seasons = def.data.seasons;
  console.log("    seasons:", seasons.length, "selectedWeekKey:", def.data.selectedWeekKey);

  // 2) per-season overview -> gives that season's weeks[]
  console.log("[2] per-season week lists");
  const seasonWeeks = {}; // season -> [weekObj]
  for (const s of seasons) {
    const r = await getJSON(`/api/overview?season=${encodeURIComponent(s)}`);
    seasonWeeks[s] = (r.data.weeks || []).filter((w) => w.data_available);
    await save(`overview/season__${sanitizeSeason(s)}.json`, r.data);
  }
  const allWeekKeys = [];
  for (const s of seasons) for (const w of seasonWeeks[s]) allWeekKeys.push({ season: s, week: w });
  console.log("    data-available (season,week) pairs:", allWeekKeys.length);

  // 3) overview replay per (season, weekKey)  [weekKey-sensitive]
  console.log("[3] overview per (season, weekKey)");
  await pool(allWeekKeys, 8, async ({ season, week }) => {
    const wk = week.unique_week_key;
    const r = await getJSON(`/api/overview?season=${encodeURIComponent(season)}&weekKey=${wk}`);
    await save(`overview/wk__${wk}.json`, r.data);
  });
  manifest.counts.overview = allWeekKeys.length;

  // 4) ili-region replay per (season, weekKey)  [weekKey-sensitive, region ignored]
  console.log("[4] ili-region per (season, weekKey)");
  await pool(allWeekKeys, 8, async ({ season, week }) => {
    const wk = week.unique_week_key;
    const r = await getJSON(`/api/ili-region?season=${encodeURIComponent(season)}&weekKey=${wk}`);
    await save(`ili-region/wk__${wk}.json`, r.data);
  });
  // also a default (latest) region snapshot per season for the season selector default
  for (const s of seasons) {
    const r = await getJSON(`/api/ili-region?season=${encodeURIComponent(s)}`);
    await save(`ili-region/season__${sanitizeSeason(s)}.json`, r.data);
  }
  manifest.counts.iliRegion = allWeekKeys.length;

  // 5) ili-age per season (season-sensitive; ages filters -> harvest full)
  console.log("[5] ili-age per season (full, all ages)");
  for (const s of seasons) {
    const r = await getJSON(`/api/ili-age?season=${encodeURIComponent(s)}`);
    await save(`ili-age/season__${sanitizeSeason(s)}.json`, r.data);
  }
  manifest.counts.iliAge = seasons.length;

  // 6) ili-seasonal once (all seasons; seasons filters -> harvest full)
  console.log("[6] ili-seasonal (all)");
  const sea = await getJSON("/api/ili-seasonal");
  await save("ili-seasonal/all.json", sea.data);
  manifest.counts.iliSeasonal = 1;

  // 7) comparison per metric (season ignored)
  console.log("[7] comparison per metric");
  for (const m of METRICS) {
    const r = await getJSON(`/api/comparison?metric=${m}`);
    await save(`comparison/${m}.json`, r.data);
  }
  await save("comparison/_invalid_ili.json", (await getJSON("/api/comparison?metric=ili")).data);
  manifest.counts.comparison = METRICS.length;

  // 8) age-comparison per metric (season ignored; ages filters -> full)
  console.log("[8] age-comparison per metric");
  for (const m of METRICS) {
    const r = await getJSON(`/api/age-comparison?metric=${m}`);
    await save(`age-comparison/${m}.json`, r.data);
  }
  manifest.counts.ageComparison = METRICS.length;

  // 9) pathogen-seasonal per metric (season ignored)
  console.log("[9] pathogen-seasonal per metric");
  for (const m of PATHOGENS) {
    const r = await getJSON(`/api/pathogen-seasonal?metric=${m}`);
    await save(`pathogen-seasonal/${m}.json`, r.data);
  }
  await save("pathogen-seasonal/_invalid.json", (await getJSON("/api/pathogen-seasonal")).data);
  manifest.counts.pathogenSeasonal = PATHOGENS.length;

  // 10) vaccination-detail per target (season ignored; ages filters -> full)
  console.log("[10] vaccination-detail per target");
  for (const t of TARGETS) {
    const r = await getJSON(`/api/vaccination-detail?target=${t}`);
    await save(`vaccination-detail/${t}.json`, r.data);
  }
  await save("vaccination-detail/_invalid.json", (await getJSON("/api/vaccination-detail")).data);
  manifest.counts.vaccinationDetail = TARGETS.length;

  manifest.seasons = seasons;
  manifest.selected = { season: def.data.selectedSeason, weekKey: def.data.selectedWeekKey };
  manifest.latestDataWeek = def.data.latestDataWeek;
  await save("_manifest.json", manifest);
  console.log("\nDONE. counts:", manifest.counts);
}

function sanitizeSeason(s) {
  return s.replace(/\//g, "-").replace(/[^\w가-힣-]/g, "");
}

main().catch((e) => { console.error(e); process.exit(1); });
