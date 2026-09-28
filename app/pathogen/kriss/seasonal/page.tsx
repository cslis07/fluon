import SeriesChartPage from "@/components/SeriesChartPage";
import { PAGES } from "@/config/pages";

export const metadata = { title: "K-RISS · 절기별" };

export default function Page() {
  return <SeriesChartPage cfg={PAGES["pathogen/kriss/seasonal"]} />;
}
