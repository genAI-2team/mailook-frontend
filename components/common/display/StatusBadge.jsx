// 옷 사진 왼쪽 위에 겹치는 보관 중 표시. 사진 칸은 position relative여야 한다.
export default function StatusBadge({ children }) {
  return (
    <span className="absolute top-2.5 left-2.5 rounded-md border border-warn bg-white px-1.5 py-0.5 text-xs font-bold text-warn">
      {children}
    </span>
  );
}
