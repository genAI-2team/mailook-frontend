const COLORS = ["#3B82F6", "#14B8A6", "#F59E0B", "#F97316", "#DC2626"];
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

// 옷이 얼마나 따뜻한지 보여주는 5칸 막대. 날씨 표현이 아니다.
// level 1~10은 서버 값을 그대로 받고, 글씨는 단계 순서대로 정해져 있다.
// 채운 칸은 모두 같은 색이다. 색은 마지막으로 칠한 칸 번호로 정한다.
export default function WarmthBar({ level = 0 }) {
  const safe = Math.max(0, Math.min(10, Number(level) || 0));
  const filled = safe / 2;
  const colorIndex = Math.min(COLORS.length - 1, Math.max(0, Math.ceil(filled) - 1));
  const color = COLORS[colorIndex];
  const label = LABELS[safe] ?? "";

  return (
    <div
      className="inline-flex items-center gap-2 whitespace-nowrap"
      role="img"
      aria-label={label ? `옷의 따뜻함 ${label}` : "옷의 따뜻함"}
    >
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {COLORS.map((_, index) => {
          const amount = Math.min(1, Math.max(0, filled - index));
          return (
            <span key={index} className="relative h-1.5 w-3.5 overflow-hidden rounded-[2px] bg-line">
              <span
                className="absolute inset-y-0 left-0"
                style={{ width: `${amount * 100}%`, backgroundColor: amount > 0 ? color : "transparent" }}
              />
            </span>
          );
        })}
      </span>
      {label ? <span className="text-xs text-ink">{label}</span> : null}
    </div>
  );
}
