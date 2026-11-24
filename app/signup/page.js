import { Button } from "@/components/common";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-4 px-10 py-8">
      <h1 className="text-[28px] font-bold text-ink">0-1 회원가입 · 계정</h1>
      <div className="flex flex-wrap gap-3">
        <Button href="/signup/info">다음</Button>
        <Button href="/login" variant="secondary">
          취소
        </Button>
      </div>
    </main>
  );
}
