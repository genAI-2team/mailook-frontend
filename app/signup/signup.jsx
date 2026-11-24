"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trace } from "../lib/logger";
import { maiLookLoginRequest } from "../../api/maiLookLoginApi";
import styles from "./signup.module.css";

/** 회원가입 입력 검증 후 서버에 최초 등록한다. */
export default function Signup() {
  const router = useRouter();
  const [input, setInput] = useState({ email: "", nickname: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [locationConsent, setLocationConsent] = useState(false);

  function validateEmail(email) {
    if (!email.trim()) return "이메일을 입력해 주세요.";
    if (email.length > 50) return "이메일은 50자 이내로 입력해 주세요.";
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? "" : "올바른 이메일 형식으로 입력해 주세요.";
  }

  function validatePassword(password) {
    if (!password) return "비밀번호를 입력해 주세요.";
    return /^(?=[A-Za-z0-9]{2,20}$)(?=.*[0-9])[A-Za-z][A-Za-z0-9]*$/.test(password)
      ? "" : "영문자로 시작하는 영문·숫자 조합을 20자 이내로 입력해 주세요.";
  }

  function validateConfirmPassword(confirmPassword, password = input.password) {
    if (!confirmPassword) return "비밀번호 확인을 입력해 주세요.";
    return confirmPassword === password ? "" : "비밀번호가 일치하지 않습니다.";
  }

  function validateNickname(nickname) {
    if (!nickname) return "닉네임을 입력해 주세요.";
    return /^[가-힣ㄱ-ㅎㅏ-ㅣA-Za-z0-9]{1,50}$/.test(nickname)
      ? "" : "닉네임은 특수문자·공백 없이 한글·영문·숫자 50자 이내로 입력해 주세요.";
  }

  function handleChange(event) {
    const { name, value } = event.target;
    // 한글 조합 중인 자모도 허용하고 특수문자·공백은 입력값에서 제거한다.
    const nextValue = name === "nickname" ? value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣA-Za-z0-9]/g, "").slice(0, 50) : value;
    setInput((previous) => ({ ...previous, [name]: nextValue }));
    setErrors((previous) => ({
      ...previous,
      [name]: "",
      ...(name === "password" && confirmTouched
        ? { confirmPassword: validateConfirmPassword(input.confirmPassword, nextValue) } : {}),
    }));
    setMessage("");
  }

  function handleBlur(event) {
    const { name, value } = event.target;
    const validators = {
      email: validateEmail,
      password: validatePassword,
      confirmPassword: validateConfirmPassword,
      nickname: validateNickname,
    };
    if (name === "confirmPassword") setConfirmTouched(true);
    setErrors((previous) => ({ ...previous, [name]: validators[name](value) }));
  }

  function handleLogin() {
    router.push("/login");
  }

  async function handleNext() {
    if (busy) return;
    const nextErrors = {
      email: validateEmail(input.email),
      password: validatePassword(input.password),
      confirmPassword: validateConfirmPassword(input.confirmPassword),
      nickname: validateNickname(input.nickname),
      locationConsent: locationConsent ? "" : "위치 정보 이용에 동의해 주세요.",
    };
    setConfirmTouched(true);
    setErrors(nextErrors);
    setMessage("");
    if (Object.values(nextErrors).some(Boolean)) return;
    setBusy(true);
    try {
      await maiLookLoginRequest("/insert", {
        email: input.email.trim(),
        password: input.password,
        nickname: input.nickname,
        locationConsent,
      });
      // 가입 후 자동 로그인하지 않는다. 새 계정으로 로그인한 뒤 추가 정보를 입력한다.
      setInput({ email: "", nickname: "", password: "", confirmPassword: "" });
      router.push("/login");
    } catch (error) {
      if (error.code === "DUPLICATE_EMAIL") {
        setErrors((previous) => ({ ...previous, email: error.message }));
      } else {
        setMessage(error.message || "회원가입 등록에 실패했습니다.");
      }
    } finally {
      setBusy(false);
    }
  }
  return trace("Signup.render", () => (
    <main className={styles.page} lang="ko">
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
              <input id="signup-email" name="email" type="email" autoComplete="username" placeholder="name@example.com" maxLength={50} value={input.email} onChange={handleChange} onBlur={handleBlur} disabled={busy} aria-invalid={!!errors.email} aria-describedby={errors.email ? "signup-email-error" : undefined} />
              {errors.email && <p id="signup-email-error" className={styles.error} role="alert">{errors.email}</p>}
            </div>
            <div className={styles.field}>
              <label htmlFor="signup-password">비밀번호</label>
              <input id="signup-password" name="password" type="password" autoComplete="new-password" maxLength={20} value={input.password} onChange={handleChange} onBlur={handleBlur} disabled={busy} aria-invalid={!!errors.password} aria-describedby="signup-password-help signup-password-error" />
              <p id="signup-password-help" className={styles.help}>영문자로 시작 · 영문·숫자 혼합 · 최대 20자</p>
              <p id="signup-password-error" className={styles.error} role="alert">{errors.password}</p>
            </div>
            <div className={styles.field}>
              <label htmlFor="signup-confirm">비밀번호 확인</label>
              <input id="signup-confirm" className={confirmTouched && input.confirmPassword !== input.password ? styles.confirmMismatch : undefined} name="confirmPassword" type="password" autoComplete="new-password" maxLength={20} value={input.confirmPassword} onChange={handleChange} onBlur={handleBlur} disabled={busy} aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? "signup-confirm-error" : undefined} />
              {errors.confirmPassword && <p id="signup-confirm-error" className={styles.error} role="alert">{errors.confirmPassword}</p>}
            </div>
            <div className={styles.field}>
              <label htmlFor="signup-nickname">닉네임</label>
              <input id="signup-nickname" name="nickname" autoComplete="nickname" maxLength={50} value={input.nickname} onChange={handleChange} onBlur={handleBlur} disabled={busy} aria-invalid={!!errors.nickname} aria-describedby={errors.nickname ? "signup-nickname-error" : undefined} />
              {errors.nickname && <p id="signup-nickname-error" className={styles.error} role="alert">{errors.nickname}</p>}
            </div>
          </div>
          <div className={styles.consent}>
            <label><input type="checkbox" checked={locationConsent} disabled={busy}
              onChange={(event) => { setLocationConsent(event.target.checked); setErrors((previous) => ({ ...previous, locationConsent: "" })); }}
              aria-invalid={!!errors.locationConsent} aria-describedby={errors.locationConsent ? "signup-consent-error" : undefined} />
              <strong>위치 정보 이용에 동의합니다. (필수)</strong>
            </label>
            {errors.locationConsent && <p id="signup-consent-error" className={styles.error} role="alert">{errors.locationConsent}</p>}
          </div>
          {message && <p className={styles.error} role="alert">{message}</p>}
          <footer className={styles.actions}>
            <button type="button" className={styles.cancel} disabled={busy} onClick={handleLogin}>취소</button>
            <button type="button" className={styles.next} disabled={busy || !locationConsent} onClick={handleNext}>{busy ? "확인 중…" : "다음"}</button>
          </footer>
        </section>
      </div>
    </main>
  ));
}
