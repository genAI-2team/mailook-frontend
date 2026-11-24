"use client";

import { useId } from "react";

function normalize(options) {
  return options.map((option) =>
    typeof option === "string" ? { value: option, label: option } : option,
  );
}

// 드롭다운. 라벨과 오류 표시 방식은 Input과 같다.
export default function Select({ label, options = [], value, onChange, error, id, className, ...props }) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = error ? `${selectId}-error` : undefined;
  const items = normalize(options);

  return (
    <div className="flex flex-col">
      {label ? (
        <label htmlFor={selectId} className="mb-2 text-[13px] font-medium text-ink">
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        className={`box-border h-10 w-full rounded-[10px] border bg-white px-3 text-sm text-ink outline-none ${
          error ? "border-error" : "border-border focus:border-brand"
        } ${className ?? ""}`}
        {...props}
      >
        {items.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} className="mt-2 text-xs text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
