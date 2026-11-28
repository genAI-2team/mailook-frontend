// [변경 후 — 2026-11-28] 회원가입 기본 정보 화면을 /places로 이동한다.
import Places from "./places";
export const metadata = { title: "MaiLook | 장소·일정" };
export default Places;

// [변경 전 — 2026-11-28] 기존 /places 기본 페이지
// import { Button } from "@/components/common";
// 
// export default function Page() {
//   return (
//     <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-4 px-10 py-8">
//       <h1 className="text-[28px] font-bold text-ink">3-1 장소·일정 설정</h1>
//       <div className="flex flex-wrap gap-3">
//         <Button href="/profile" variant="secondary">
//           ‹ 내 성향
//         </Button>
//       </div>
//     </main>
//   );
// }
// 

// [변경 전 — 2026-11-28] 기존 /signup/info 진입점
// import Info from "./info";
// 
// export const metadata = { title: "MaiLook | 기본 정보" };
// export default Info;
// 
