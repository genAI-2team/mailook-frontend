"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/common";

export default function Page() {
  const router = useRouter();

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-4 px-10 py-8">
      <h1 className="text-[28px] font-bold text-ink">9 직접 착용 기록, P1</h1>
      <div className="flex flex-wrap gap-3">
        <Button href="/" variant="secondary">
          ‹ 오늘의 옷차림
        </Button>
        <Button onClick={() => router.push("/")}>오늘 이걸 입었어요</Button>
      </div>
    </main>
  );
}
