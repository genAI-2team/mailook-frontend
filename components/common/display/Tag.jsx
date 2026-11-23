// 작은 회색 태그. 상황이나 분류처럼 짧게 붙이는 글자에 쓴다.
export default function Tag({ children }) {
  return (
    <span className="inline-flex items-center rounded-md bg-bg-2 px-1.5 py-0.5 text-xs text-ink-2">
      {children}
    </span>
  );
}
