// Series color assignment for charts.

// Categorical palette (navy → blue → light blue → purple → lilac → teal →
// green → amber → coral → slate). Used for age groups, subtypes, vaccination bands.
export const CATEGORICAL = [
  "#173f65",
  "#3b82c4",
  "#7cbde8",
  "#7d55b5",
  "#b48fdc",
  "#23a996",
  "#57c98a",
  "#e0a53b",
  "#dd6f6a",
  "#8a97a5",
];

// Seasons: colored by recency (newest = gold, matching the original).
const SEASON_ORDER_NEWEST_FIRST = [
  "26/27절기",
  "25/26절기",
  "24/25절기",
  "23/24절기",
  "22/23절기",
  "21/22절기",
  "20/21절기",
  "19/20절기",
  "18/19절기",
  "17/18절기",
];
const SEASON_PALETTE = [
  "#eab138", // 26/27 gold
  "#e0796b", // 25/26 coral
  "#1c3d6e", // 24/25 navy
  "#3f8fd0",
  "#7d55b5",
  "#23a996",
  "#57c98a",
  "#c98a3b",
  "#9aa7b3",
  "#c0607a",
];

export function seasonColor(season: string): string {
  const i = SEASON_ORDER_NEWEST_FIRST.indexOf(season);
  return SEASON_PALETTE[i >= 0 ? i % SEASON_PALETTE.length : 0];
}

export function categorical(i: number): string {
  return CATEGORICAL[i % CATEGORICAL.length];
}

// choropleth blue scale (light → dark) for the region map
export function choroplethColor(value: number | null, min: number, max: number): string {
  if (value == null || Number.isNaN(value)) return "#e6eef5";
  const t = max > min ? (value - min) / (max - min) : 0.5;
  const stops = ["#dbe9f5", "#b6d3ec", "#89b7de", "#5b96cc", "#356fae", "#1f4f86"];
  const idx = Math.min(stops.length - 1, Math.max(0, Math.round(t * (stops.length - 1))));
  return stops[idx];
}
