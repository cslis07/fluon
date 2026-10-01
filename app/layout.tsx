import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import "./components.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: { default: "FluON | Influenza Overview", template: "%s | FluON" },
  description: "인플루엔자 주요 발생 현황 대시보드",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <div className="app">
          <Sidebar />
          <main className="main">{children}</main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
