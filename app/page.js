import { Button } from "@/components/common";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-4 px-10 py-8">
      <h1 className="text-[28px] font-bold text-ink">1 오늘의 옷차림</h1>
      <div className="flex flex-wrap gap-3">
        <Button href="/feedback">피드백 남기기</Button>
        <Button href="/wear/new" variant="secondary">
          직접 고르기(P1)
        </Button>
        <Button href="/preview" variant="secondary">
          핏 확인하기(P1)
        </Button>
        <Button href="/uniform" variant="secondary">
          고정 복장 설정(P2)
        </Button>
      </div>
    </main>
  );
}
