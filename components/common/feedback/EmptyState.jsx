import Button from "../control/Button";
import { periodLines } from "./text";

// 목록이나 화면이 비었을 때. 제목과 설명, 필요하면 이동 버튼 하나만 둔다.
export default function EmptyState({ title, description, actionLabel, actionHref }) {
  return (
    <div className="flex flex-col items-center bg-bg-1 px-6 py-12 text-center">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {description ? <p className="mt-2 max-w-md text-sm text-sub">{periodLines(description)}</p> : null}
      {actionLabel && actionHref ? (
        <div className="mt-6">
          <Button href={actionHref}>{actionLabel}</Button>
        </div>
      ) : null}
    </div>
  );
}
