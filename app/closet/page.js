import { Button } from "@/components/common";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-4 px-10 py-8">
      <h1 className="text-[28px] font-bold text-ink">4 내 옷장</h1>
      <div className="flex flex-wrap gap-3">
        <Button href="/closet/new">옷 추가</Button>
        <Button href="/closet/storage" variant="secondary">
          보관 위치 관리
        </Button>
        <Button href="/wear/history" variant="secondary">
          착용 기록(P2)
        </Button>
        <Button href="/closet/1" variant="secondary">
          옷 카드 예시
        </Button>
      </div>
    </main>
  );
}
