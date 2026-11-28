"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { maiLookLoginRequest } from "../../api/maiLookLoginApi";
import { clearAuthToken, getAuthToken } from "../../api/authToken";
import { getCurrentUser } from "../../api/auth";
import { logExecution } from "../lib/logger";

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
    logExecution("EFFECT AuthProvider.useEffect: 로그인 복원 시작");
    const controller = new AbortController();
    const version = sessionVersion.current;
    let active = true;
    let token;

    function isCurrentSession() {
      return active && version === sessionVersion.current;
    }

    async function restoreUser() {
      logExecution("ENTER AuthContext.restoreUser");
      try {
        token = getAuthToken();
        if (!token) {
          logExecution("STATE AuthContext.restoreUser: 저장된 JWT 없음");
          if (isCurrentSession()) setUser(null);
          return;
        }
        const result = await getCurrentUser({ signal: controller.signal });
        if (isCurrentSession() && token === getAuthToken()) {
          setUser({ userId: result.userId, email: result.email, nickname: result.nickname });
          logExecution("STATE AuthContext.restoreUser: 사용자 Context 복원 예약");
        }
      } catch (error) {
        if (!isCurrentSession() || controller.signal.aborted) {
          logExecution("CANCEL AuthContext.restoreUser: 이전 요청 결과 무시");
          return;
        }
        if (error.response?.status === 401) {
          logExecution("ERROR AuthContext.restoreUser: HTTP 401 / 인증 상태 해제");
          clearAuthToken();
          setUser(null);
        } else {
          logExecution("ERROR AuthContext.restoreUser: 통신 오류 / JWT 보존");
          // 네트워크 장애나 서버 오류는 로그아웃으로 처리하지 않고 JWT를 보존한다.
          setAuthError("로그인 상태를 확인하지 못했습니다. 다시 시도해 주세요.");
        }
      } finally {
        if (isCurrentSession()) setIsRestoring(false);
        logExecution("EXIT AuthContext.restoreUser");
      }
    }

    void restoreUser();
    return () => {
      logExecution("CLEANUP AuthProvider.useEffect: 진행 중 복원 요청 취소");
      active = false;
      controller.abort();
    };
  }, [restoreAttempt]);

  function retryRestore() {
    logExecution("EVENT click → AuthContext.retryRestore");
    setAuthError("");
    setIsRestoring(true);
    setRestoreAttempt((previous) => previous + 1);
  }

  async function login(credentials) {
    logExecution("ENTER AuthContext.login");
    const result = await maiLookLoginRequest("/login", credentials);
    // [변경 후 — 2026-11-27] 로그인/회원가입 성공 결과를 동일한 상태 설정으로 처리한다.
    return acceptAuthenticatedUser(result);
  }

  // [변경 전 — 2026-11-27] 아래 상태 설정은 login 함수에서만 실행했다.
  function acceptAuthenticatedUser(result) {
    sessionVersion.current += 1;
    // 비밀번호와 JWT는 Context에 넣지 않는다.
    const loginUser = {
      userId: result.userId,
      email: result.email,
      nickname: result.nickname,
    };
    setUser(loginUser);
    logExecution("STATE AuthContext.login: 공통 사용자 상태 변경 예약");
    setAuthError("");
    setIsRestoring(false);
    logExecution("EXIT AuthContext.login");
    return loginUser;
  }

  function logout() {
    logExecution("ENTER AuthContext.logout");
    sessionVersion.current += 1;
    // 서버 로그아웃 API는 미구현이므로 현재 브라우저의 인증 정보와 화면 상태를 해제한다.
    try {
      clearAuthToken();
    } finally {
      setUser(null);
      setAuthError("");
      setIsRestoring(false);
      logExecution("EXIT AuthContext.logout: JWT 및 공통 사용자 상태 해제");
    }
  }

  return (
    // [변경 전 — 2026-11-27] value에는 acceptAuthenticatedUser가 없었다.
    // [변경 후 — 2026-11-27] 가입 응답으로도 공통 회원 상태를 설정할 수 있다.
    <AuthContext.Provider value={{ user, isLoggedIn: user !== null, isRestoring, authError, retryRestore, login, logout, acceptAuthenticatedUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth는 AuthProvider 안에서 사용해야 합니다.");
  return context;
}
