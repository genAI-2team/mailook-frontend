"use client";

// 보정값처럼 서버 값을 한 단계씩 올리고 내린다. 숫자 표기는 카드가 맡는다.
// 이 컴포넌트는 "1° 단위"와 −/+ 버튼만 그린다.
export function formatDegree(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric === 0) return "0°";
  if (numeric > 0) return `+${numeric}°`;
  return `−${String(numeric).slice(1)}°`;
}

export default function Stepper({
  value,
  min,
  max,
  step = 1,
  onChange,
  unitLabel,
  decreaseLabel = "줄이기",
  increaseLabel = "늘리기",
}) {
  const numeric = Number(value);
  const atMin = min != null && numeric <= min;
  const atMax = max != null && numeric >= max;
  const unit = unitLabel ?? `${step}° 단위`;

  function update(direction) {
    const next = numeric + direction * Number(step);
    const lower = min == null ? next : Math.max(min, next);
    const clamped = max == null ? lower : Math.min(max, lower);
    const rounded = Math.round(clamped * 1000) / 1000;
    onChange?.(rounded);
  }

  const buttonClass =
    "inline-flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border bg-white text-base text-ink hover:border-brand hover:text-brand disabled:cursor-default disabled:opacity-40";

  return (
    <div className="inline-flex items-center gap-2">
      <span className="text-sm text-sub">{unit}</span>
      <button type="button" aria-label={decreaseLabel} disabled={atMin} onClick={() => update(-1)} className={buttonClass}>
        −
      </button>
      <button
        type="button"
        aria-label={increaseLabel}
        disabled={atMax}
        onClick={() => update(1)}
        className={buttonClass}
      >
        +
      </button>
    </div>
  );
}
