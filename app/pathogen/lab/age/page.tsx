import SeriesChartPage from "@/components/SeriesChartPage";
import { PAGES } from "@/config/pages";

export const metadata = { title: "민간검사기관 · 연령별" };

export default function Page() {
  return <SeriesChartPage cfg={PAGES["pathogen/lab/age"]} />;
}
