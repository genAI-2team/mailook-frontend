"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/common";

export default function Page() {
  const router = useRouter();

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-4 px-10 py-8">
      <h1 className="text-[28px] font-bold text-ink">7 고정 복장 설정, P2</h1>
      <div className="flex flex-wrap gap-3">
        <Button href="/profile" variant="secondary">
          ‹ 내 성향
        </Button>
        <Button href="/closet" variant="secondary">
          + 옷장에서 추가
        </Button>
        <Button onClick={() => router.push("/")}>저장</Button>
      </div>
    </main>
  );
}
