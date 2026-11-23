// 추천처럼 결과를 기다리는 자리. 스피너 대신 내용 칸 크기의 스켈레톤을 보여 준다.
// variant로 어떤 칸을 흉내 낼지 정한다. title, message는 아래 안내 두 줄이다.
export default function Loading({ variant = "cards", title, message }) {
  return (
    <div aria-busy="true" className="flex flex-col gap-3">
      {variant === "cards" ? (
        <div className="flex flex-wrap gap-x-4 gap-y-5" aria-hidden="true">
          {[0, 1, 2].map((item) => (
            <div key={item} className="w-40">
              <div className="aspect-square w-full rounded-xl bg-line-2" />
              <div className="mt-2 h-3.5 w-4/5 rounded-full bg-line-2" />
              <div className="mt-1.5 h-2 w-3/5 rounded-full bg-line-2" />
            </div>
          ))}
        </div>
      ) : null}
      {title || message ? (
        <div>
          {title ? <p className="text-sm font-bold text-ink">{title}</p> : null}
          {message ? <p className="text-[13px] text-sub">{message}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
