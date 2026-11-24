// 입력칸 바로 아래 경고 한 줄. 장소 시간이 겹치는 것처럼 저장은 막지 않을 때 쓴다.
export default function WarningLine({ children }) {
  return (
    <p className="mt-2 flex items-start gap-1 text-[13px] text-warn">
      <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" className="mt-0.5 shrink-0">
        <path
          fill="currentColor"
          d="M8 1.4 15 14.2H1L8 1.4Zm0 4.4-.05 3.8h1.1L8.1 5.8H8ZM8.9 11.3a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0Z"
        />
      </svg>
      <span>{children}</span>
    </p>
  );
}
