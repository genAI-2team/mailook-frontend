"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import BottomTab from "./BottomTab";
import { MENUS, activeFromPath, isSignupPath } from "./nav";

// 로그인 후 화면의 상단 바. 로고, 주 메뉴, 닉네임, 로그아웃을 둔다.
// 회원가입 주소에서는 메뉴 없이 로고와 '로그인' 링크만 보여 준다.
// active를 넘기지 않으면 주소로 현재 메뉴를 정한다. 하위 화면은 상위 메뉴를 선택 상태로 둔다.
export default function Header({ active }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { user, isLoggedIn, isRestoring, authError, retryRestore, logout } = useAuth();

  function handleLogout() {

    try {
      logout();
    } finally {

      router.push("/login");
    }
  }

  if (isSignupPath(pathname)) {
    return (
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-14 max-w-300 items-center justify-between px-10 md:h-16">
          <Image src="/logo.svg" alt="mAILOOK" width={507} height={87} className="h-5 w-auto" />
          <Link href="/login" className="text-sm font-bold text-brand">
            로그인
          </Link>
        </div>
      </header>
    );
  }

  const current = active ?? activeFromPath(pathname);

  return (
    <>
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-300 items-center gap-x-8 px-10">
          <Link href="/" aria-label="mAILOOK 홈" className="flex h-14 shrink-0 items-center md:h-16">
            <Image src="/logo.svg" alt="mAILOOK" width={507} height={87} className="h-5 w-auto" />
          </Link>
          <nav aria-label="주 메뉴" className="hidden grow gap-2 md:flex">
            {MENUS.map((menu) => {
              const selected = current === menu.key;
              return (
                <Link
                  key={menu.key}
                  href={menu.href}
                  aria-current={selected ? "page" : undefined}
                  className={`flex h-16 items-center border-b-2 px-3.5 text-[15px] ${
                    selected ? "border-brand font-bold text-ink" : "border-transparent font-normal text-sub"
                  }`}
                >
                  {menu.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex h-14 items-center gap-4 md:h-16">
            {isRestoring ? <span role="status" className="text-sm text-sub">로그인 확인 중…</span> : null}
            {authError ? <span role="alert" className="text-sm text-error">
              {authError} <button type="button" disabled={isRestoring} onClick={retryRestore} className="underline">재시도</button>
            </span> : null}
            {user?.nickname ? (
              <Link href="/account" className="text-sm text-ink">
                {user.nickname}님
              </Link>
            ) : null}
            {isRestoring ? null : isLoggedIn ? <button
              type="button"
              onClick={handleLogout}
              className="box-border hidden h-8 cursor-pointer items-center rounded-lg border border-border px-3 text-[13px] text-ink-2 md:inline-flex"
            >
              로그아웃
            </button> : <Link href="/login" className="text-sm font-bold text-brand">로그인</Link>}
          </div>
        </div>
      </header>
      <BottomTab active={current} />
    </>
  );
}
