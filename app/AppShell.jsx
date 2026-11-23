"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/common/layout/Footer";
import Header from "@/components/common/layout/Header";

// 로그인 화면만 빼고 모든 화면을 헤더와 푸터로 감싼다.
// 회원가입은 Header가 메뉴 없는 형태로 바꾼다.
export default function AppShell({ children }) {
  const pathname = usePathname() || "/";
  const isLogin = pathname === "/login" || pathname.startsWith("/login/");

  if (isLogin) {
    return children;
  }

  return (
    <>
      <Header nickname={pathname === "/demo" ? "사용자" : undefined} />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </>
  );
}
