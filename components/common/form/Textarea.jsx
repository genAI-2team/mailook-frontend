"use client";

import { useId } from "react";

// 여러 줄 입력. 라벨 오른쪽에 최대 글자 수를 보여 주고, 오류 표시는 Input과 같다.
export default function Textarea({ label, hint, error, maxLength, rows = 3, id, className, ...props }) {
  const generatedId = useId();
  const areaId = id ?? generatedId;
  const messageId = error ? `${areaId}-error` : hint ? `${areaId}-hint` : undefined;

  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        {label ? (
          <label htmlFor={areaId} className="text-[13px] font-medium text-ink">
            {label}
          </label>
        ) : (
          <span />
        )}
        <span className="shrink-0 text-xs text-sub">선택 · {maxLength}자</span>
      </div>
      <textarea
        id={areaId}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        className={`box-border w-full resize-y rounded-[10px] border bg-white px-3 py-3 text-sm leading-normal text-ink outline-none ${
          error ? "border-error" : "border-border focus:border-brand"
        } ${className ?? ""}`}
        {...props}
      />
      {error ? (
        <p id={`${areaId}-error`} className="mt-2 text-xs text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${areaId}-hint`} className="mt-2 text-xs text-sub">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
