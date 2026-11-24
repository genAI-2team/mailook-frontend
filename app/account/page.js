"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/common";

export default function Page() {
  const router = useRouter();

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-4 px-10 py-8">
      <h1 className="text-[28px] font-bold text-ink">3-2 내 계정</h1>
      <div className="flex flex-wrap gap-3">
        <Button variant="danger" onClick={() => router.push("/login")}>
          탈퇴하기
        </Button>
      </div>
    </main>
  );
}
