import SeriesChartPage from "@/components/SeriesChartPage";
import { PAGES } from "@/config/pages";

export const metadata = { title: "응급실 감시 · 연령별" };

export default function Page() {
  return <SeriesChartPage cfg={PAGES["emergency/age"]} />;
}
