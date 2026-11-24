"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// 모달의 빈 틀. 바깥을 누르거나 Esc를 누르면 onClose로 닫힌다.
// 아래 오른쪽 버튼은 footer로 넣는다. 내용만 children이다.
export default function Modal({ open, title, onClose, children, footer, embedded = false }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const hydrated = useHydrated();

  useEffect(() => {
    if (!open || embedded) return undefined;

    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, embedded]);

  if (!open || (!embedded && !hydrated)) return null;

  const dialog = (
    <div
      className={
        embedded
          ? "absolute inset-0 flex items-center justify-center bg-[rgba(26,28,31,0.45)] p-4"
          : "fixed inset-0 z-50 flex items-center justify-center bg-[rgba(26,28,31,0.45)] p-4"
      }
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className="w-full max-w-110 rounded-[18px] bg-white p-7 outline-none"
        onClick={(event) => event.stopPropagation()}
      >
        {title ? (
          <h2 id={titleId} className="text-lg font-bold text-ink">
            {title}
          </h2>
        ) : null}
        <div className={title ? "mt-4 text-sm text-ink-2" : "text-sm text-ink-2"}>{children}</div>
        {footer ? <div className="mt-6 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>
  );

  if (embedded) return dialog;
  return createPortal(dialog, document.body);
}
