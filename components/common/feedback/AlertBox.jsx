"use client";

import Button from "../control/Button";
import { periodLines } from "./text";

// 화면 전체에 걸친 실패 안내. 아이콘, 제목·설명, 다시 시도 버튼이 한 줄이다.
// 폭이 좁으면 버튼만 아래로 내려간다.
export default function AlertBox({ title, message, actionLabel, onAction }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-4 rounded-2xl border border-warn-border bg-warn-bg px-6 py-5"
    >
      <svg width="22" height="22" viewBox="0 0 16 16" aria-hidden="true" className="shrink-0 text-warn">
        <path
          fill="currentColor"
          d="M8 1.4 15 14.2H1L8 1.4Zm0 4.4-.05 3.8h1.1L8.1 5.8H8ZM8.9 11.3a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0Z"
        />
      </svg>
      <div className="min-w-48 flex-1">
        {title ? <p className="text-[15px] font-bold text-ink">{title}</p> : null}
        {message ? <p className="text-[13px] text-sub">{periodLines(message)}</p> : null}
      </div>
      {actionLabel ? (
        <Button variant="secondary" onClick={onAction} className="shrink-0">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
