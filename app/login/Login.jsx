// 입력과 버튼 클릭에 따라 화면이 바뀌므로 브라우저에서 실행하는 컴포넌트로 지정한다.
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { trace, logExecution, logUiEvent } from "../lib/logger";
import { useAuth } from "../context/AuthContext";
import styles from "./Login.module.css";

/**
 * 왼쪽에는 서비스 소개를, 오른쪽에는 로그인 입력창을 보여 준다.
 * 처리 순서: 입력값 저장 → 입력 검사 → 서버에 로그인 요청 → 결과에 맞춰 화면 변경.
 * trace는 일반 작업의 실행을 기록하고, 서버 요청은 async/await로 처리한다.
 * 로그에는 이메일·비밀번호 등 사용자가 입력한 값을 전달하지 않는다.
 */
export default function Login() {
  const router = useRouter();

  // [?? ?] ??? ? trace ?? useEffect?? ?? ?? ??? ????.
  // ???? ??? ? ???? logger? new Date()? ?? ??? ? ???? ?? ??.
  useEffect(() => {
    logExecution("EFFECT Login: ?? ??");
  }, []);
  const { user, login, logout, isRestoring, authError, retryRestore } = useAuth();
  // useState는 화면에서 기억할 값을 만든다. set으로 시작하는 함수를 호출하면 값이 바뀌고 화면도 갱신된다.
  // 입력창에 적힌 이메일과 비밀번호를 저장한다.
  const [loginInput, setLoginInput] = useState({ email: "jdhdh@hanmail.net", password: "ver3r2" });
  const [showPassword, setShowPassword] = useState(false);
  // 입력창 아래에 표시할 오류를 저장한다. 예: errors.email은 이메일 안내 문구이다.
  const [errors, setErrors] = useState({});
  // 서버 응답을 기다리는 동안 true가 된다. 입력창과 버튼을 잠시 막는 데 사용한다.
  const [busy, setBusy] = useState(false);
  // 로그인 성공이나 서버 요청 실패 등 화면에 보여 줄 안내 문구이다.
  const [message, setMessage] = useState("");
  // user는 AuthProvider에서 관리하므로 다른 화면에서도 동일한 상태를 사용할 수 있다.

  /** 이메일이 비어 있거나 기본 형식에 맞지 않으면 안내 문구를 반환한다. 정상이면 빈 문자열을 반환한다. */
  function validateEmail(email) {
    return trace("Login.validateEmail", () => {
      // trim()으로 앞뒤 공백을 뺀 뒤 실제 글자가 있는지 확인한다.
      if (!email.trim()) return "이메일을 입력해 주세요.";
      // 공백 없이 '글자@글자.글자' 모양인지, 전체 길이가 100자 이하인지 확인한다.
      // 여기서는 입력 모양만 검사한다. 실제 계정과 비밀번호 확인은 서버가 담당한다.
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && email.trim().length <= 100
        ? "" : "올바른 이메일 형식으로 입력해 주세요.";
    });
  }

  /** 비밀번호 입력 여부와 입력창의 최대 길이를 검사한다. 계정 일치 여부는 서버에서 확인한다. */
  function validatePassword(password) {
    return trace("Login.validatePassword", () => {
      // 비밀번호의 공백도 실제 입력값이므로 trim()으로 변경하지 않는다.
      if (!password) return "비밀번호를 입력해 주세요.";
      return password.length <= 20 ? "" : "비밀번호는 20자 이하로 입력해 주세요.";
    });
  }

  /** 이메일 또는 비밀번호 입력이 바뀔 때 해당 값과 안내 문구를 갱신한다. */
  function handleChange(event) {
    logUiEvent(event, "Login.handleChange");
    return trace("Login.handleChange", () => {
      const { name, value } = event.target;
      // name이 email이면 이메일만, password이면 비밀번호만 바꾼다.
      // ...previous는 다른 입력칸의 기존 값을 그대로 남긴다는 뜻이다.
      setLoginInput((previous) => ({ ...previous, [name]: value }));
      // 사용자가 다시 입력하기 시작하면 해당 입력칸의 오류와 이전 서버 안내를 지운다.
      setErrors((previous) => ({ ...previous, [name]: "" }));
      setMessage("");
    });
  }

  /** 입력을 검사한 뒤 서버에 로그인을 요청하고 성공 또는 실패 결과를 화면에 표시한다. */
  async function handleLogin(event) {
    logUiEvent(event, "Login.handleLogin");
    logExecution("ENTER Login.handleLogin");
        // 1. 이미 요청 중이면 이번 호출은 처리하지 않는다-> 로그인 요청을 중복으로 보내지 않도록 방어하기 위해 사용
        if (busy || isRestoring) {
          logExecution("EXIT Login.handleLogin: 처리 중이므로 중단");
          return;
        }
        // 2. 이메일과 비밀번호를 각각의 검증 함수로 검사하고 결과를 각 입력창 아래에 표시한다.
        const nextErrors = {
          email: validateEmail(loginInput.email),
          password: validatePassword(loginInput.password),
        };
        setErrors(nextErrors);
        setMessage("");
        // 오류 문구가 하나라도 있으면 서버에 요청하지 않고 여기서 끝낸다.
        if (Object.values(nextErrors).some(Boolean)) {
          logExecution("EXIT Login.handleLogin: 입력 검증 실패 / API 요청 없음");
          return;
        }
        // 3. 요청 중 표시를 켜고 입력창과 버튼을 잠시 사용할 수 없게 한다.
        setBusy(true);
        try {
          // 4. 로그인 요청 후 발급받은 JWT는 API 함수가 localStorage에 저장한다.
          // await는 서버 응답을 기다린다는 뜻이다. 이메일 앞뒤 공백만 제거하고 비밀번호는 그대로 전달한다.
          logExecution("CALL Login.handleLogin → AuthContext.login");
          await login({ email: loginInput.email.trim(),
            password: loginInput.password });
          // 5. Context에 저장한 사용자 정보는 헤더와 다른 화면에서도 사용할 수 있다.
          setShowPassword(false);
          // 로그인 후 입력칸에 비밀번호 등이 남지 않도록 두 입력값을 비운다.
          setLoginInput({ email: "", password: "" });
          setMessage("로그인되었습니다.");
          logExecution("NAVIGATE Login.handleLogin → /: 화면 이동 요청");
          router.push("/");
        } catch (error) {
          logExecution("ERROR Login.handleLogin: 화면에 오류 표시");
          // 서버가 요청을 거절했거나 통신에 실패하면 안내 문구를 보여 준다.
          setMessage(error.message || "로그인하지 못했습니다. 이미 탈퇴한 회원입니다.");
        } finally {
          // 성공과 실패에 관계없이 대기 상태를 끝내 버튼을 다시 사용할 수 있게 한다.
          // 로그인 요청 처리가 끝났다는 상태로 변경하는 코드로 로그인에 실패해도 버튼이 계속 비활성화된 채로 남지 않습니다.
          setBusy(false);
          logExecution("EXIT Login.handleLogin: 대기 상태 해제");
        }
  }

  /** 현재 브라우저의 JWT와 공통 사용자 정보를 비운다. */
  async function handleLogout(event) {
    logUiEvent(event, "Login.handleLogout");
    logExecution("ENTER Login.handleLogout");
    setBusy(true);
    try {
      logout();
      setMessage("");
    // 처리 중 오류를 표시하고 마지막에는 대기 상태를 해제한다.
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); logExecution("EXIT Login.handleLogout"); }
  }

  /** 입력창에서 Enter를 누르면 로그인 버튼을 누른 것처럼 처리한다. */
  function handleKeyDown(event) {
    if (event.key !== "Enter") return;
    logUiEvent(event, "Login.handleKeyDown");
    return trace("Login.handleKeyDown", () => {
      // 한글을 조합하는 중의 Enter는 글자 확정용일 수 있으므로 로그인하지 않는다.
      // preventDefault()는 기본 키 동작을 막고, void는 로그인 완료를 이 자리에서 기다리지 않음을 나타낸다.
      if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); void handleLogin(); }
    });
  }

  // 저장된 값에 맞춰 화면을 만든다. 입력·대기·사용자 정보 등이 바뀌면 다시 실행될 수 있다.
  // [?? ?] return trace("Login.render", () => (
  // trace ? logExecution ? new Date()? ??? ? ???? Next.js ??? ????.
  // [?? ?] trace? ??? ?? JSX? ?? ????.
  return (
    <main className={styles.page} lang="ko">
      {/* 날씨에 맞춘 옷차림을 소개하는 사진 배너 */}
      <div className={styles.previewColumn}>
        <section className={styles.preview} aria-labelledby="intro-title">
        <div className={styles.heroCopy}>
          <h1 id="intro-title">오늘 날씨,<br />나에게 맞춰 입기</h1>
          <p>AI가 내 옷장을 보고 오늘 날씨에 맞는 옷을 골라드려요.<br className={styles.lineBreak} />입고 나서 느낌을 남길수록, 나에게 맞는 착장이 완성돼요.</p>
        </div>
        </section>
      </div>
      {/* 2. 로그인 영역: HTML form 대신 입력값과 버튼 클릭을 직접 처리한다. */}
      <section className={styles.loginPanel} aria-labelledby="login-title">
        <div className={styles.loginBox}>
          <h2 id="login-title">
            <Image src="/logo.svg" alt="mAILOOK" width={507} height={87} className={styles.logo} />
            <span>로그인</span>
          </h2>
          {isRestoring && <p role="status">로그인 상태를 확인하고 있습니다…</p>}
          {authError && <div role="alert" className={styles.error}>
            <p>{authError}</p>
            <button type="button" className={styles.secondary} disabled={isRestoring || busy} onClick={retryRestore}>다시 확인</button>
          </div>}
          {/* 사용자 정보가 있으면 환영 문구와 로그아웃 버튼을, 없으면 아래 입력창을 표시한다. */}
          {user ? <div className={styles.loggedIn}>
            <p>{user.nickname}, 반가워요.</p>
            <p role="status">{message}</p>
            <button type="button" className={styles.primary} disabled={busy || isRestoring} onClick={handleLogout}>로그아웃</button>
          </div> : <>
            {/* value는 저장된 입력값, onChange는 입력할 때 실행할 함수이다.
                이메일 입력창을 벗어나면 onBlur에서 형식을 한 번 더 검사한다.
                aria-invalid와 aria-describedby는 화면 읽기 도구에 오류 여부와 안내 위치를 알려 준다. */}
            <div className={styles.field}>
              <label htmlFor="email">이메일</label>
              <input id="email" name="email" type="email" placeholder="name@example.com" autoComplete="username"
                value={loginInput.email} maxLength={100} disabled={busy || isRestoring} onChange={handleChange} onKeyDown={handleKeyDown}
                onBlur={() => trace("Login.emailBlur", () => setErrors((previous) => ({ ...previous, email: validateEmail(loginInput.email) })))}
                aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
              {errors.email && <p id="email-error" className={styles.error} role="alert">{errors.email}</p>}
            </div>
            {/* 비밀번호는 type="password"로 글자를 가린다. 실제 계정 일치 여부는 서버가 검사한다. */}
            <div className={styles.field}>
              <label htmlFor="password">비밀번호</label>
              <div className={styles.passwordRow}>
              <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" maxLength={20}
                value={loginInput.password} disabled={busy || isRestoring} onChange={handleChange} onKeyDown={handleKeyDown}
                onBlur={() => trace("Login.passwordBlur", () => setErrors((previous) => ({ ...previous, password: validatePassword(loginInput.password) })))}
                aria-invalid={!!errors.password} aria-describedby={errors.password ? "password-error" : undefined} />
              <button type="button" className={styles.passwordToggle} disabled={busy || isRestoring}
                aria-controls="password" aria-pressed={showPassword}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보이기"}
                onClick={(event) => {
                  logUiEvent(event, "Login.togglePassword");
                  setShowPassword(previous => !previous);
                }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                  {showPassword && <path d="m3 3 18 18" />}
                </svg>
              </button>
              </div>
              {errors.password && <p id="password-error" className={styles.error} role="alert">{errors.password}</p>}
            </div>
            {/* 안내 문구가 있을 때만 보여 준다. 요청 중에는 버튼을 막고 '로그인 중…'을 표시한다. */}
            {message && <p className={styles.error} role="alert">{message}</p>}
            <button type="button" className={styles.primary} disabled={busy || isRestoring} onClick={handleLogin}>{isRestoring ? "로그인 확인 중…" : busy ? "로그인 중…" : "로그인"}</button>
            <div className={styles.divider}><span>처음이신가요?</span></div>
            {/* 새 계정 만들기를 누르면 /signup의 회원가입 화면으로 이동한다. */}
            <button type="button" className={styles.secondary} disabled={busy || isRestoring}
              onClick={() => trace("Login.createAccount", () => router.push("/signup"))}>새 계정 만들기</button>
          </>}
        </div>
      </section>
    </main>
  // [?? ?] )); ? trace ??? JSX ??? ?? ???.
  // [?? ?] ); ? ?? return? JSX ??? ???.
  );
}
