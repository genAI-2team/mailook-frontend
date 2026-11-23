import Link from "next/link";
import { MENUS } from "./nav";

function HomeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
    </svg>
  );
}

function HangerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 7.2V6a1.7 1.7 0 1 0-1.7-1.7" />
      <path d="M12 7.2 4.6 13a1.3 1.3 0 0 0 .8 2.2h13.2a1.3 1.3 0 0 0 .8-2.2L12 7.2Z" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="8" r="3" />
      <path d="M6.2 19.2c.9-2.8 2.9-4.2 5.8-4.2s4.9 1.4 5.8 4.2" />
    </svg>
  );
}

const ICONS = {
  home: HomeIcon,
  closet: HangerIcon,
  profile: PersonIcon,
};

// 폭 768px 미만에서 상단 메뉴를 대신하는 아래 고정 탭.
// 오늘의 옷차림 / 내 옷장 / 내 성향. Header가 로그인 후 화면에서 함께 렌더한다.
export default function BottomTab({ active }) {
  return (
    <nav
      aria-label="주 메뉴"
      data-bottom-tab
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom,0px)] md:hidden"
    >
      <div className="mx-auto flex max-w-300">
        {MENUS.map((menu) => {
          const selected = active === menu.key;
          const Icon = ICONS[menu.key];
          return (
            <Link
              key={menu.key}
              href={menu.href}
              aria-current={selected ? "page" : undefined}
              className={`flex h-14 flex-1 flex-col items-center justify-center gap-1 text-[11px] ${
                selected ? "font-bold text-brand" : "font-normal text-sub"
              }`}
            >
              <Icon />
              {menu.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
