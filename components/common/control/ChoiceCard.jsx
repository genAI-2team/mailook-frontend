"use client";

// 제목과 설명이 있는 카드 중 하나만 고른다. 켜져도 바탕은 흰색이고, 테두리만 브랜드 색이다.
// direction이 row면 같은 폭으로 가로, column이면 세로로 쌓는다.
export default function ChoiceCard({ options = [], value, onChange, label, direction = "row" }) {
  const row = direction !== "column";

  return (
    <div role="group" aria-label={label} className={row ? "flex gap-3" : "flex flex-col gap-2"}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange?.(option.value)}
            className={`group box-border flex min-h-16 cursor-pointer flex-col items-start justify-center gap-1 rounded-xl bg-white px-4 py-3.5 text-left ${
              row ? "min-w-0 flex-1" : "w-full"
            } ${selected ? "border-2 border-brand" : "border border-border hover:border-brand"}`}
          >
            <span
              className={`text-[15px] font-medium text-ink ${selected ? "" : "group-hover:text-brand"}`}
            >
              {selected ? "✓ " : ""}
              {option.title}
            </span>
            {option.description ? (
              <span className={`text-xs text-sub ${selected ? "" : "group-hover:text-brand"}`}>
                {option.description}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
