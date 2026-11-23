"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trace, traceAsync } from "../lib/logger";
// import { maiLookLoginRequest } from "../../api/maiLookLoginApi";
import styles from "./signup.module.css";

/** 회원가입 첫 단계: 계정 입력을 검사하고 사용 가능한 이메일·닉네임인지 확인한다. */
export default function Signup() {
  const router = useRouter();
  const [input, setInput] = useState({ email: "", nickname: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy] = useState(false);

  function handleChange(event) {
    return trace("Signup.handleChange", () => {
      const { name, value } = event.target;
      setInput((previous) => ({ ...previous, [name]: value }));
      setErrors((previous) => ({ ...previous, [name]: "" }));
      setMessage("");
    });
  }

  function handleLogin() {
    return trace("Signup.handleLogin", () => router.push("/login"));
  }

  function handleNext() {
    return traceAsync("Signup.handleNext", async () => {
      // UI 확인을 위해 검증을 잠시 중단하고 다음 화면으로 이동한다.
      router.push("/signup/info");
//       if (busy) return;
//       // 서버와 같은 규칙을 사용한다. 실제 가입 저장은 이 단계에서 하지 않는다.
//       const nextErrors = {};
//       if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim()) || input.email.trim().length > 100) nextErrors.email = "올바른 이메일을 입력해 주세요.";
//       if (!/^[가-힣A-Za-z0-9]{1,50}$/.test(input.nickname)) nextErrors.nickname = "한글·영문·숫자 1~50자로 입력해 주세요.";
//       if (!/^(?=[A-Za-z0-9]{8,20}$)(?=.*[0-9])[A-Za-z][A-Za-z0-9]*$/.test(input.password)) nextErrors.password = "영문으로 시작하는 영문·숫자 조합 8~20자로 입력해 주세요.";
//       if (!input.confirmPassword || input.password !== input.confirmPassword) nextErrors.confirmPassword = "비밀번호가 일치하는지 확인해 주세요.";
//       setErrors(nextErrors);
//       setMessage("");
//       if (Object.keys(nextErrors).length) return;
//       setBusy(true);
//       try {
//         const emailResult = await maiLookLoginRequest("/availability", { field: "email", value: input.email.trim() });
//         const nicknameResult = await maiLookLoginRequest("/availability", { field: "nickname", value: input.nickname });
//         const unavailable = {};
//         if (!emailResult.available) unavailable.email = "사용할 수 없는 이메일입니다.";
//         if (!nicknameResult.available) unavailable.nickname = "이미 사용 중인 닉네임입니다.";
//         setErrors(unavailable);
//         if (Object.keys(unavailable).length) return;
//         // 다음 화면으로 이동한다. 비밀번호를 URL·브라우저 저장소·로그에 남기지 않는다.
//         router.push("/signup/info");
//       } catch (error) {
//         setMessage(error.message || "확인하지 못했습니다. 잠시 후 다시 시도해 주세요.");
//       } finally {
//         setBusy(false);
//       }
// 
    });
  }

  return trace("Signup.render", () => (
    <main className={styles.page} lang="ko">
      <header className={styles.header}>
        <span className={styles.brand}>mAILOOK</span>
        <button type="button" className={styles.login} onClick={handleLogin} disabled={busy}>로그인</button>
      </header>
      <div className={styles.content}>
        <section className={styles.card} aria-labelledby="signup-title" aria-busy={busy}>
          <div className={styles.heading}>
            <div><h1 id="signup-title">회원가입</h1><p>로그인에 쓸 정보를 입력해 주세요.</p></div>
            <ol className={styles.steps} aria-label="회원가입 단계">
              <li aria-current="step">1 계정</li><li>2 기본 정보</li><li>3 내 성향</li>
            </ol>
          </div>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor="signup-email">이메일</label>
              <input id="signup-email" name="email" type="email" autoComplete="username" placeholder="name@example.com" maxLength={100} value={input.email} onChange={handleChange} disabled={busy} aria-invalid={!!errors.email} aria-describedby={errors.email ? "signup-email-error" : undefined} />
              {errors.email && <p id="signup-email-error" className={styles.error} role="alert">{errors.email}</p>}
            </div>
            <div className={styles.field}>
              <label htmlFor="signup-nickname">닉네임</label>
              <input id="signup-nickname" name="nickname" autoComplete="nickname" maxLength={50} value={input.nickname} onChange={handleChange} disabled={busy} aria-invalid={!!errors.nickname} aria-describedby={errors.nickname ? "signup-nickname-error" : undefined} />
              {errors.nickname && <p id="signup-nickname-error" className={styles.error} role="alert">{errors.nickname}</p>}
            </div>
            <div className={styles.field}>
              <label htmlFor="signup-password">비밀번호</label>
              <input id="signup-password" name="password" type="password" autoComplete="new-password" maxLength={20} value={input.password} onChange={handleChange} disabled={busy} aria-invalid={!!errors.password} aria-describedby="signup-password-help signup-password-error" />
              <p id="signup-password-help" className={styles.help}>영문으로 시작 · 영문·숫자 조합 8~20자</p>
              <p id="signup-password-error" className={styles.error} role="alert">{errors.password}</p>
            </div>
            <div className={styles.field}>
              <label htmlFor="signup-confirm">비밀번호 확인</label>
              <input id="signup-confirm" name="confirmPassword" type="password" autoComplete="new-password" maxLength={20} value={input.confirmPassword} onChange={handleChange} disabled={busy} aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? "signup-confirm-error" : undefined} />
              {errors.confirmPassword && <p id="signup-confirm-error" className={styles.error} role="alert">{errors.confirmPassword}</p>}
            </div>
          </div>
          {message && <p className={styles.error} role="alert">{message}</p>}
          <footer className={styles.actions}>
            <button type="button" className={styles.cancel} disabled={busy} onClick={handleLogin}>취소</button>
            <button type="button" className={styles.next} disabled={busy} onClick={handleNext}>{busy ? "확인 중…" : "다음"}</button>
          </footer>
        </section>
      </div>
    </main>
  ));
}
