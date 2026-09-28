import SeriesChartPage from "@/components/SeriesChartPage";
import { PAGES } from "@/config/pages";

export const metadata = { title: "민간검사기관 · 절기별" };

export default function Page() {
  return <SeriesChartPage cfg={PAGES["pathogen/lab/seasonal"]} />;
}
