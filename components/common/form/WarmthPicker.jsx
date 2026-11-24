"use client";

const LABELS = [
  "",
  "한여름용",
  "아주 얇음",
  "얇음",
  "가벼움",
  "보통",
  "조금 따뜻함",
  "따뜻함",
  "꽤 따뜻함",
  "매우 따뜻함",
  "한겨울용",
];

function fillColor(level) {
  if (level <= 2) return "#3B82F6";
  if (level <= 4) return "#14B8A6";
  if (level <= 6) return "#F59E0B";
  if (level <= 8) return "#F97316";
  return "#DC2626";
}

// 옷 등록·수정에서 따뜻한 정도를 고르는 입력. 표시용 WarmthBar와 별개다.
// value는 서버가 준 1~10을 그대로 받고, 누른 칸까지 그 단계의 한 색으로 채운다.
export default function WarmthPicker({ value = 1, onChange, hint }) {
  const level = Math.max(1, Math.min(10, Number(value) || 1));
  const color = fillColor(level);

  return (
    <div role="group" aria-label="따뜻한 정도" className="w-full">
      <div className="flex items-center justify-between text-sm font-bold text-ink">
        <span>얇음 · 더운 날</span>
        <span>두꺼움 · 추운 날</span>
      </div>
      <div className="relative">
        <div className="grid grid-cols-10 gap-1" aria-hidden="true">
          {LABELS.slice(1).map((name, index) => (
            <span
              key={name}
              className="h-3 rounded-md"
              style={{ backgroundColor: index < level ? color : "#E3E5E8" }}
            />
          ))}
        </div>
        <div className="absolute inset-x-0 top-1/2 grid h-10 -translate-y-1/2 grid-cols-10 gap-1">
          {LABELS.slice(1).map((name, index) => {
            const step = index + 1;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={step === level}
                aria-label={name}
                onClick={() => onChange?.(step)}
                className="h-10 cursor-pointer bg-transparent"
              />
            );
          })}
        </div>
      </div>
      <div className="flex items-start justify-between gap-4">
        {hint ? <p className="text-xs text-sub">{hint}</p> : <span />}
        <p className="shrink-0 text-[13px] font-medium text-ink-2">{LABELS[level]}</p>
      </div>
    </div>
  );
}
