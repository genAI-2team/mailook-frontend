"use client";

// 상황·카테고리·태그를 고르는 둥근 버튼. children이 글씨다.
// 켜지면 브랜드 색으로 채워지고, showCheck면 앞에 ✓를 붙인다.
export default function Chip({ children, selected = false, showCheck = false, onClick }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`inline-flex h-9 cursor-pointer items-center gap-1 rounded-full border px-3.5 text-sm ${
        selected
          ? "border-brand bg-brand font-bold text-white"
          : "border-border bg-white font-normal text-ink hover:border-brand hover:text-brand"
      }`}
    >
      {selected && showCheck ? <span aria-hidden="true">✓</span> : null}
      {children}
    </button>
  );
}
