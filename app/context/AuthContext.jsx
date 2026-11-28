"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { maiLookLoginRequest } from "../../api/maiLookLoginApi";
import { clearAuthToken, getAuthToken } from "../../api/authToken";
import { getCurrentUser } from "../../api/auth";

const AuthContext = createContext(null);

/** 전체 화면에서 공유하고 새로고침 시 서버의 JWT 검증 결과로 복원하는 사용자 상태. */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [authError, setAuthError] = useState("");
  const [restoreAttempt, setRestoreAttempt] = useState(0);
  // 이전 복원 응답이 이후 로그인·로그아웃 결과를 덮어쓰지 않게 한다.
  const sessionVersion = useRef(0);

  useEffect(() => {

    const controller = new AbortController();
    const version = sessionVersion.current;
    let active = true;
    let token;

    function isCurrentSession() {
      return active && version === sessionVersion.current;
    }

    async function restoreUser() {

      try {
        token = getAuthToken();
        if (!token) {

          if (isCurrentSession()) setUser(null);
          return;
        }
        const result = await getCurrentUser({ signal: controller.signal });
        if (isCurrentSession() && token === getAuthToken()) {
          setUser({ userId: result.userId, email: result.email, nickname: result.nickname });

        }
      } catch (error) {
        if (!isCurrentSession() || controller.signal.aborted) {

          return;
        }
        if (error.response?.status === 401) {

          clearAuthToken();
          setUser(null);
        } else {

          // 네트워크 장애나 서버 오류는 로그아웃으로 처리하지 않고 JWT를 보존한다.
          setAuthError("로그인 상태를 확인하지 못했습니다. 다시 시도해 주세요.");
        }
      } finally {
        if (isCurrentSession()) setIsRestoring(false);

      }
    }

    void restoreUser();
    return () => {

      active = false;
      controller.abort();
    };
  }, [restoreAttempt]);

  function retryRestore() {

    setAuthError("");
    setIsRestoring(true);
    setRestoreAttempt((previous) => previous + 1);
  }

  async function login(credentials) {

    const result = await maiLookLoginRequest("/login", credentials);
    sessionVersion.current += 1;
    // 비밀번호와 JWT는 Context에 넣지 않는다.
    const loginUser = {
      userId: result.userId,
      email: result.email,
      nickname: result.nickname,
    };
    setUser(loginUser);

    setAuthError("");
    setIsRestoring(false);

    return loginUser;
  }

  function logout() {

    sessionVersion.current += 1;
    // 서버 로그아웃 API는 미구현이므로 현재 브라우저의 인증 정보와 화면 상태를 해제한다.
    try {
      clearAuthToken();
    } finally {
      setUser(null);
      setAuthError("");
      setIsRestoring(false);

    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: user !== null, isRestoring, authError, retryRestore, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth는 AuthProvider 안에서 사용해야 합니다.");
  return context;
}
