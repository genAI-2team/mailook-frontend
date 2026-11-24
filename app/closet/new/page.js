"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/common";

export default function Page() {
  const router = useRouter();

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-4 px-10 py-8">
      <h1 className="text-[28px] font-bold text-ink">5 옷 등록</h1>
      <div className="flex flex-wrap gap-3">
        <Button href="/closet" variant="secondary">
          ‹ 내 옷장
        </Button>
        <Button href="/closet" variant="secondary">
          취소
        </Button>
        <Button onClick={() => router.push("/closet")}>옷장에 저장</Button>
      </div>
    </main>
  );
}
