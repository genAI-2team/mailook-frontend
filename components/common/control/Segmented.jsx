"use client";

// 2~3칸을 같은 폭으로 나누는 단계 선택. 통풍, 목 부분, 보관 상태처럼 하나만 고른다.
// options는 { value, label } 목록이다. label은 그룹의 aria-label이다.
export default function Segmented({ options = [], value, onChange, label }) {
  return (
    <div role="group" aria-label={label} className="flex gap-2">
      {options.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange?.(item.value)}
            className={`box-border h-10 flex-1 cursor-pointer rounded-[10px] border text-sm ${
              selected
                ? "border-brand bg-brand font-bold text-white"
                : "border-border bg-white text-ink hover:border-brand hover:text-brand"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
