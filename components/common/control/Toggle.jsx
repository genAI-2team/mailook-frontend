"use client";

// 한 가지를 켜고 끄는 스위치. 오늘 몸 상태처럼 예/아니요인 설정에 쓴다.
export default function Toggle({ checked = false, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className="inline-flex cursor-pointer items-center gap-2"
    >
      <span
        className={`relative h-7 w-12 shrink-0 rounded-full motion-safe:transition-colors motion-safe:duration-200 ${checked ? "bg-brand" : "bg-[#C7CBD1]"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 size-6 rounded-full bg-white motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out ${checked ? "translate-x-5" : ""}`}
        />
      </span>
      {label ? <span className="text-sm text-ink">{label}</span> : null}
    </button>
  );
}
