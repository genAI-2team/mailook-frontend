"use client";

function pageItems(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const seeds = [1, total, current - 1, current, current + 1].filter((page) => page >= 1 && page <= total);
  const unique = [...new Set(seeds)].sort((a, b) => a - b);
  const items = [];
  unique.forEach((page, index) => {
    if (index > 0 && page - unique[index - 1] > 1) items.push("…");
    items.push(page);
  });
  return items;
}

const controlClass =
  "box-border inline-flex size-10 cursor-pointer items-center justify-center rounded-[10px] text-sm disabled:cursor-default disabled:opacity-40";

// 목록 페이지 번호. 현재 페이지는 브랜드 색으로 채워진다.
export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages < 1) return null;

  const items = pageItems(page, totalPages);

  return (
    <nav aria-label="페이지" className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-label="이전 페이지"
        disabled={page <= 1}
        onClick={() => onChange?.(page - 1)}
        className={`${controlClass} border border-border bg-white text-ink hover:border-brand hover:text-brand`}
      >
        ‹
      </button>
      {items.map((item, index) =>
        item === "…" ? (
          <span key={`gap-${index}`} className="px-1 text-sm text-sub">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`${item}페이지`}
            aria-current={item === page ? "page" : undefined}
            onClick={() => onChange?.(item)}
            className={`${controlClass} ${
              item === page
                ? "bg-brand font-bold text-white"
                : "border border-border bg-white text-ink hover:border-brand hover:text-brand"
            }`}
          >
            {item}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="다음 페이지"
        disabled={page >= totalPages}
        onClick={() => onChange?.(page + 1)}
        className={`${controlClass} border border-border bg-white text-ink hover:border-brand hover:text-brand`}
      >
        ›
      </button>
    </nav>
  );
}
