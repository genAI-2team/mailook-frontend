"use client";

import { useEffect, useState } from "react";
import { getClothes, getClothesPhoto } from "@/api/clothesApi";
import { useAuth } from "@/app/context/AuthContext";
import { AlertBox, Button, Chip, EmptyState, Loading, Pagination, StatusBadge, WarmthBar } from "@/components/common";
import { CLOTHES_CATEGORIES, CLOTHES_CATEGORY, STORAGE_STATUS_LABELS } from "@/constants";
import { cloToLevel } from "@/utils/warmth";

const { OUTER, TOP, BOTTOM, SHOES, ACCESSORY, CARRY_ITEM } = CLOTHES_CATEGORY;
const CATEGORIES = [OUTER, TOP, BOTTOM, SHOES, ACCESSORY, CARRY_ITEM];
const PAGE_SIZE = 10;

function categoryLabel(category) {
  const entry = CLOTHES_CATEGORIES[category];
  return entry?.listLabel ?? entry?.label ?? category;
}

function ClothesPhoto({ id, name }) {
  const [src, setSrc] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let photoUrl;
    getClothesPhoto(id, controller.signal)
      .then((photo) => {
        if (!photo || controller.signal.aborted) return;
        photoUrl = URL.createObjectURL(photo);
        setSrc(photoUrl);
      })
      .catch(() => {
        // 사진 요청이 실패하면 카드에 기본 문구를 표시한다.
      });
    return () => {
      controller.abort();
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [id]);

  if (!src) return "사진";
  // 인증을 거쳐 받은 blob 주소는 브라우저에서 바로 표시한다.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={name} onError={() => setSrc(null)} className="absolute inset-0 size-full object-cover" />;
}

function ClothesCard({ item }) {
  return (
    <li className="min-w-0">
      <article>
        <div className="relative grid aspect-[5/4] place-items-center overflow-hidden rounded-xl bg-photo text-xs text-sub">
          {item.hasPhoto ? <ClothesPhoto id={item.id} name={item.name} /> : "사진"}
          {item.stored && <StatusBadge>{STORAGE_STATUS_LABELS.STORED}</StatusBadge>}
        </div>
        <div className="mt-2 flex items-start justify-between gap-2">
          <h2 className="font-bold leading-6">{item.name}</h2>
          <Button
            href={`/closet/${item.id}`}
            variant="text"
            size="sm"
            aria-label={`${item.name} 상세 보기`}
            className="shrink-0"
          >
            <span aria-hidden="true">···</span>
          </Button>
        </div>
        <div className="mt-0.5 flex flex-col items-start gap-1 text-xs text-sub">
          <p>{categoryLabel(item.category)}</p>
          {item.clo != null && item.category !== CARRY_ITEM && <WarmthBar level={cloToLevel(item.clo)} />}
          <p className="flex items-center gap-1">
            <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" className="size-3 shrink-0">
              <path d="M12.5 6.5c0 3.2-4.5 7-4.5 7s-4.5-3.8-4.5-7a4.5 4.5 0 1 1 9 0Z" />
              <circle cx="8" cy="6.5" r="1.4" />
            </svg>
            <span className="sr-only">보관 위치 </span>
            {item.location ?? "지정 없음"}
          </p>
        </div>
      </article>
    </li>
  );
}

export default function Page() {
  const { user, isRestoring, authError } = useAuth();

  return (
    <main className="mx-auto flex w-full max-w-300 flex-1 flex-col px-5 pt-8 pb-6 sm:px-10">
      {isRestoring ? (
        <Loading variant="text" message="로그인 확인 중…" />
      ) : user ? (
        <ClosetList key={user.userId} />
      ) : authError ? (
        <AlertBox message="로그인 상태를 확인하면 옷장을 볼 수 있어요." />
      ) : (
        <EmptyState title="로그인하면 내 옷장을 볼 수 있어요" actionLabel="로그인" actionHref="/login" />
      )}
    </main>
  );
}

function ClosetList() {
  const [result, setResult] = useState(null);
  const [attempt, setAttempt] = useState(0);
  const [category, setCategory] = useState(null);
  const [page, setPage] = useState(1);
  const clothes = result?.clothes ?? [];
  const filtered = category
    ? clothes.filter((item) => item.category === category)
    : clothes;
  const start = (page - 1) * PAGE_SIZE;

  useEffect(() => {
    const controller = new AbortController();
    getClothes(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted) setResult({ clothes: items });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ error: true });
      });
    return () => controller.abort();
  }, [attempt]);

  function selectCategory(nextCategory) {
    setCategory(nextCategory);
    setPage(1);
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold leading-tight">내 옷장</h1>
          {result?.clothes && <p className="mt-1 text-sm text-sub">등록한 옷 {clothes.length}벌</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button href="/wear/history" variant="secondary">착용 기록</Button>
          <Button href="/closet/storage" variant="secondary">보관 위치 관리</Button>
          <Button href="/closet/new">＋ 옷 추가</Button>
        </div>
      </div>

      <div role="group" aria-label="옷 카테고리" className="mt-8 flex flex-wrap gap-2">
        <Chip selected={category === null} onClick={() => selectCategory(null)}>전체</Chip>
        {CATEGORIES.map((value) => (
          <Chip key={value} selected={category === value} onClick={() => selectCategory(value)}>
            {categoryLabel(value)}
          </Chip>
        ))}
      </div>

      <div className="mt-6">
        {!result && <Loading message="옷 목록을 불러오는 중…" />}
        {result?.error && (
          <AlertBox
            title="옷 목록을 불러오지 못했어요."
            actionLabel="다시 시도"
            onAction={() => {
              setResult(null);
              setAttempt((previous) => previous + 1);
            }}
          />
        )}
        {result?.clothes && (filtered.length ? (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {filtered.slice(start, start + PAGE_SIZE).map((item) => <ClothesCard key={item.id} item={item} />)}
          </ul>
        ) : (
          <EmptyState title={category ? "이 카테고리에 등록한 옷이 없어요" : "등록한 옷이 없어요"} />
        ))}
      </div>

      {filtered.length > 0 && (
        <div className="mt-auto flex justify-center pt-14">
          <Pagination page={page} totalPages={Math.ceil(filtered.length / PAGE_SIZE)} onChange={setPage} />
        </div>
      )}
    </>
  );
}
