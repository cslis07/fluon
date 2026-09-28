import SeriesChartPage from "@/components/SeriesChartPage";
import { PAGES } from "@/config/pages";

export const metadata = { title: "K-RISS · 연령별" };

export default function Page() {
  return <SeriesChartPage cfg={PAGES["pathogen/kriss/age"]} />;
}
