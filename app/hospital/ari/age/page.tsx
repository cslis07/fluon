import SeriesChartPage from "@/components/SeriesChartPage";
import { PAGES } from "@/config/pages";

export const metadata = { title: "급성호흡기감염증 감시(ARI) · 연령별" };

export default function Page() {
  return <SeriesChartPage cfg={PAGES["hospital/ari/age"]} />;
}
