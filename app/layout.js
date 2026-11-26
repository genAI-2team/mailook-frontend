import { Suspense } from "react";
import localFont from "next/font/local";
import "./globals.css";
import AppShell from "./AppShell";
import { AuthProvider } from "./context/AuthContext";
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
          {/* 변경 전: Provider가 Suspense 밖에 있고, 대기 화면에서도 children을 렌더링했다.
          <AuthProvider>
            <Suspense fallback={<div className="flex flex-1 flex-col">{children}</div>}>
              <AppShell>{children}</AppShell>
            </Suspense>
          </AuthProvider>
          */}
          {/* 변경 후: 인증 Provider와 화면을 같은 경계 안에 두고, 대기 화면은 고정한다. */}
          <Suspense fallback={<div role="status" className="flex flex-1 flex-col">화면을 불러오고 있습니다…</div>}>
            <AuthProvider>
              <AppShell>{children}</AppShell>
            </AuthProvider>
          </Suspense>
        </ToastProvider>
      </body>
    </html>
  );
}
