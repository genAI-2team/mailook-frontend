import { Button } from "@/components/common";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-4 px-10 py-8">
      <h1 className="text-[28px] font-bold text-ink">10 착용 기록 보기, P2</h1>
      <div className="flex flex-wrap gap-3">
        <Button href="/closet" variant="secondary">
          ‹ 내 옷장
        </Button>
      </div>
    </main>
  );
}