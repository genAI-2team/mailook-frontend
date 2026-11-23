"use client";

import { useId } from "react";

// 한 줄 글자 입력. 라벨은 위, 도움말(hint)과 오류(error)는 아래에 둔다.
export default function Input({ label, hint, error, id, className, ...props }) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined;

  return (
    <div className="flex flex-col">
      {label ? (
        <label htmlFor={inputId} className="mb-2 text-[13px] font-medium text-ink">
          {label}
        </label>
      ) : null}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={messageId}
        className={`box-border h-10 w-full rounded-[10px] border bg-white px-3 text-sm text-ink outline-none ${
          error ? "border-error" : "border-border focus:border-brand"
        } ${className ?? ""}`}
        {...props}
      />
      {error ? (
        <p id={`${inputId}-error`} className="mt-2 text-xs text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="mt-2 text-xs text-sub">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
