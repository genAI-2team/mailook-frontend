"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/common/layout/Footer";
import Header from "@/components/common/layout/Header";
import { isSignupPath } from "@/components/common/layout/nav";

// 로그인·회원가입은 헤더 없이 두고, 나머지 화면은 헤더와 푸터로 감싼다.
// 닉네임은 로그인 담당의 GET /api/users/me로 붙인다. 성향 정리 토스트는 내 성향 API가 생긴 뒤에 붙인다.
export default function AppShell({ children }) {
  const pathname = usePathname() || "/";

  const isAuthScreen =
    pathname === "/login" || pathname.startsWith("/login/") || isSignupPath(pathname);

  if (isAuthScreen) {
    return children;
  }

  return (
    <>
      <Header />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </>
  );
}
