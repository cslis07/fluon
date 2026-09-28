import SeriesChartPage from "@/components/SeriesChartPage";
import { PAGES } from "@/config/pages";

export const metadata = { title: "중증급성호흡기감염증 감시(SARI) · 연령별" };

export default function Page() {
  return <SeriesChartPage cfg={PAGES["hospital/sari/age"]} />;
}
