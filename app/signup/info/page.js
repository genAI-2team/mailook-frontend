import { Button } from "@/components/common";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-4 px-10 py-8">
      <h1 className="text-[28px] font-bold text-ink">0-2 기본 정보</h1>
      <div className="flex flex-wrap gap-3">
        <Button href="/signup" variant="secondary">
          이전
        </Button>
        <Button href="/signup/preference">다음</Button>
      </div>
    </main>
  );
}
