import { Button } from "@/components/common";

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-300 flex-1 flex-col gap-4 px-6 py-8 md:px-10">
      <Button href="/closet/new" variant="text" className="w-fit">‹ 옷 등록</Button>
      <h1 className="text-[28px] font-bold text-ink">상품 검색</h1>
    </main>
  );
}
