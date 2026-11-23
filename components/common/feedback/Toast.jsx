"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

const ToastContext = createContext(null);

// 저장·삭제가 끝났다는 짧은 알림. 화면 아래 가운데에 2.5초 동안 뜬다.
// 앱 레이아웃의 ToastProvider 안에서 useToast().showToast('옷을 삭제했어요.')로 띄운다.
export function ToastProvider({ children }) {
  const [message, setMessage] = useState(null);
  const timer = useRef(null);

  const showToast = useCallback((next) => {
    setMessage(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(null), 2500);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message ? (
        <div
          role="status"
          className="fixed bottom-18 left-1/2 z-60 flex h-11 -translate-x-1/2 items-center gap-2 rounded-[10px] bg-ink px-4 text-sm text-white md:bottom-6"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <path fill="currentColor" d="M6.2 11.2 2.9 7.9l1.1-1.1 2.2 2.2 5-5 1.1 1.1-6.1 6.1Z" />
          </svg>
          {message}
        </div>
      ) : null}
    </ToastContext.Provider>
  );
}

// 현재 화면에서 토스트를 띄우는 함수를 준다.
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast는 ToastProvider 안에서만 사용할 수 있습니다.");
  }
  return context;
}
