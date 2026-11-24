"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/common";

export default function Page() {
  const router = useRouter();

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-4 px-10 py-8">
      <h1 className="text-[28px] font-bold text-ink">2 체감 피드백</h1>
      <div className="flex flex-wrap gap-3">
        <Button href="/" variant="secondary">
          ‹ 오늘의 옷차림
        </Button>
        <Button href="/" variant="secondary">
          오늘 안 나갔어요
        </Button>
        <Button onClick={() => router.push("/profile")}>피드백 저장</Button>
      </div>
    </main>
  );
}
