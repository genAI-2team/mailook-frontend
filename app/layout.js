import localFont from "next/font/local";
import "./globals.css";
import AppShell from "./AppShell";
import { ToastProvider } from "@/components/common/feedback/Toast";

const pretendard = localFont({
  src: "../fonts/PretendardVariable.woff2",
  weight: "45 920",
  display: "swap",
  variable: "--font-pretendard",
  fallback: ["Malgun Gothic", "Apple SD Gothic Neo", "sans-serif"],
});

export const metadata = {
  title: "mAILOOK",
  description: "오늘 동선의 날씨에 맞춰, 내 옷장에서 옷을 골라 드려요.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full`}>
      <body className={`${pretendard.className} flex min-h-full flex-col antialiased`}>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
