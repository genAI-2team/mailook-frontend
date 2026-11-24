"use client";

// 오늘 갈 곳처럼 고르는 카드 한 장. 목록 구분선이 아니라 버튼 하나가 한 줄이다.
// disabled는 집처럼 빼지 못하는 항목이다. 눌러도 값이 바뀌지 않는다.
export default function CheckItem({ checked = false, disabled = false, title, description, tag, onChange }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      onClick={() => {
        if (disabled) return;
        onChange?.(!checked);
      }}
      className={`mt-2 flex min-h-14 w-full items-center gap-3 rounded-xl border px-3.5 text-left first:mt-0 ${
        disabled ? "cursor-default border-line bg-bg-1" : `cursor-pointer ${checked ? "border-ink bg-white" : "border-border bg-white"}`
      }`}
    >
      <span
        aria-hidden="true"
        className={`box-border flex size-[22px] shrink-0 items-center justify-center rounded-[6px] text-xs text-white ${
          disabled ? "bg-[#B4B9C0]" : checked ? "bg-brand" : "border-2 border-[#9AA0A8] bg-white"
        }`}
      >
        {disabled || checked ? "✓" : null}
      </span>
      <span className="min-w-0">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className={`truncate text-[15px] font-bold ${disabled ? "text-sub" : "text-ink"}`}>{title}</span>
          {tag ? (
            <span className="shrink-0 rounded-md bg-bg-2 px-1.5 py-0.5 text-xs text-sub">{tag}</span>
          ) : null}
        </span>
        {description ? <span className="mt-0.5 block text-xs text-sub">{description}</span> : null}
      </span>
    </button>
  );
}
