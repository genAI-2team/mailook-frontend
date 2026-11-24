import { Button } from "@/components/common";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-4 px-10 py-8">
      <h1 className="text-[28px] font-bold text-ink">3 내 성향</h1>
      <div className="flex flex-wrap gap-3">
        <Button href="/places">장소 수정</Button>
      </div>
    </main>
  );
}
