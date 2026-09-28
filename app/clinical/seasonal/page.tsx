import SeriesChartPage from "@/components/SeriesChartPage";
import { PAGES } from "@/config/pages";

export const metadata = { title: "의원급 임상감시 · 절기별" };

export default function Page() {
  return <SeriesChartPage cfg={PAGES["clinical/seasonal"]} />;
}
