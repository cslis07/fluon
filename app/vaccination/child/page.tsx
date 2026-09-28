import SeriesChartPage from "@/components/SeriesChartPage";
import { PAGES } from "@/config/pages";

export const metadata = { title: "어린이 예방접종률" };

export default function Page() {
  return <SeriesChartPage cfg={PAGES["vaccination/child"]} />;
}
