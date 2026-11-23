import Image from "next/image";

// 로그인 화면을 뺀 모든 화면의 하단. 로고, 한 줄 소개, 날씨·지도 출처, 약관, 저작권.
export default function Footer() {
  return (
    <footer className="border-t border-line bg-bg-1">
      <div className="mx-auto flex max-w-300 flex-col gap-6 px-10 pt-7 pb-9 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-2">
          <Image src="/logo.svg" alt="mAILOOK" width={507} height={87} className="h-4 w-auto self-start opacity-70" />
          <p className="text-xs text-sub">오늘 동선의 날씨에 맞춰, 내 옷장에서 옷을 골라 드려요.</p>
          <p className="text-xs text-sub">날씨 정보 기상청 · 지도 카카오</p>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <nav aria-label="약관" className="flex flex-wrap gap-x-4 gap-y-2">
            <a href="#" className="text-xs text-ink-2">
              이용약관
            </a>
            <a href="#" className="text-xs font-bold text-ink-2">
              개인정보 처리방침
            </a>
            <a href="#" className="text-xs text-ink-2">
              위치정보 이용약관
            </a>
          </nav>
          <p className="text-xs text-sub">© 2026 mAILOOK · GenAI 기반 Java 백엔드 개발자 양성과정 팀 프로젝트</p>
        </div>
      </div>
    </footer>
  );
}
