"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { logExecution, logUiEvent } from "../lib/logger";
// [변경 후 — 2026-11-26] 회원가입 API 연결을 추가한다.
import { maiLookLoginRequest } from "../../api/maiLookLoginApi";
import styles from "./signup.module.css";
// [신규 — 2026-11-27] 공통 화면 요소·입력 제한·회원가입 단계를 참조한다.
import { Header, Footer, Input, Button, CheckItem, AlertBox } from "@/components/common";
import { SIGNUP_LIMITS, SIGNUP_STEPS } from "@/constants";
// [신규 — 2026-11-27] 가입 성공 회원을 다음 화면과 공유한다.
import { useAuth } from "../context/AuthContext";

// [변경 전 — 2026-11-26] 회원가입 계정 입력 UI. 다음 버튼은 기본 정보 화면으로 이동한다.
/** [변경 후 — 2026-11-26] 회원 등록에 성공한 경우에만 기본 정보 화면으로 이동한다. */
export default function Signup() {
  const router = useRouter();
  const { acceptAuthenticatedUser } = useAuth();

  // [?? ?] ??? ? trace ?? useEffect?? ?? ?? ??? ????.
  // ???? ??? ? ???? logger? new Date()? ?? ??? ? ???? ?? ??.
  useEffect(() => {
    logExecution("EFFECT Signup: ?? ??");
  }, []);
  const [input, setInput] = useState({ email: "", nickname: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  // [변경 전 — 2026-11-26] const [busy] = useState(false);
  // [변경 후 — 2026-11-26] 등록 요청 중 입력과 버튼을 비활성화한다.
  const [busy, setBusy] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [locationConsent, setLocationConsent] = useState(false);

  function validateEmail(email) {
    // logExecution("FUNCTION Signup.validateEmail");
    // if (!email.trim()) return "이메일을 입력해 주세요.";
    // if (email.length > 50) return "이메일은 50자 이내로 입력해 주세요.";
    // return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    //   ? "" : "올바른 이메일 형식으로 입력해 주세요.";
  }

  function validatePassword(password) {
    // logExecution("FUNCTION Signup.validatePassword");
    // if (!password) return "비밀번호를 입력해 주세요.";
    // return /^(?=[A-Za-z0-9]{2,20}$)(?=.*[0-9])[A-Za-z][A-Za-z0-9]*$/.test(password)
    //   ? "" : "영문자로 시작하는 영문·숫자 조합을 20자 이내로 입력해 주세요.";
  }

  function validateConfirmPassword(confirmPassword, password = input.password) {
    // logExecution("FUNCTION Signup.validateConfirmPassword");
    // if (!confirmPassword) return "비밀번호 확인을 입력해 주세요.";
    // return confirmPassword === password ? "" : "비밀번호가 일치하지 않습니다.";
  }

  function validateNickname(nickname) {
    // logExecution("FUNCTION Signup.validateNickname");
    // if (!nickname) return "닉네임을 입력해 주세요.";
    // return /^[가-힣ㄱ-ㅎㅏ-ㅣA-Za-z0-9]{1,50}$/.test(nickname)
    //   ? "" : "닉네임은 특수문자·공백 없이 한글·영문·숫자 50자 이내로 입력해 주세요.";
  }

  function handleChange(event) {
    logUiEvent(event, "Signup.handleChange");
    const { name, value } = event.target;
    // 한글 조합 중인 자모도 허용하고 특수문자·공백은 입력값에서 제거한다.
    const nextValue = name === "nickname" ? value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣA-Za-z0-9]/g, "").slice(0, SIGNUP_LIMITS.NICKNAME) : value;
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
    logUiEvent(event, "Signup.handleBlur");
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

  function handleLogin(event) {
    logUiEvent(event, "Signup.handleLogin");
    logExecution("NAVIGATE Signup.handleLogin → /login");
    router.push("/login");
  }

  // [변경 전 — 2026-11-26] function handleNext(event) {
  // [변경 후 — 2026-11-26] async/await로 회원 등록 응답을 기다린다.
  async function handleNext(event) {
    logUiEvent(event, "Signup.handleNext");
    logExecution("ENTER Signup.handleNext");
    if (busy) {
      logExecution("EXIT Signup.handleNext: 처리 중이므로 중단");
      return;
    }
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
    if (Object.values(nextErrors).some(Boolean)) {
      logExecution("EXIT Signup.handleNext: 입력 검증 실패 / API 요청 없음");
      return;
    }
    // [변경 전 — 2026-11-26] UI 확인용으로 API 호출 없이 바로 이동했다.
    // [변경 전 — 2026-11-27] 등록 응답 전에 이동하던 구문.
    // logExecution("NAVIGATE Signup.handleNext → /signup/info");
    // router.push("/signup/info");
    // logExecution("EXIT Signup.handleNext");
    // [변경 후 — 2026-11-27] 아래 등록·인증 상태 설정 성공 후에만 이동한다.

    // [변경 후 — 2026-11-26] backend 등록 성공 시 이동하고, 중복·실패 시 현재 화면에 표시한다.
    setBusy(true);
    try {
      // [변경 전 — 2026-11-27] await maiLookLoginRequest("/insert", {
      // [변경 후 — 2026-11-27] /api/auth/signup으로 회원 등록 요청을 보낸다.
      // [변경 전 — 2026-11-27] await maiLookLoginRequest("/signup", {
      // [변경 후 — 2026-11-27] 가입 응답의 userId/email/nickname을 Context로 전달한다.
      const registeredUser = await maiLookLoginRequest("/signup", {
        email: input.email.trim(),
        password: input.password,
        nickname: input.nickname,
        locationConsent,
      });
      acceptAuthenticatedUser(registeredUser);
      // [변경 전 — 2026-11-28] router.push("/signup/info");
      // [변경 후 — 2026-11-28] 회원가입 성공 후 /places로 이동한다.
      logExecution("NAVIGATE Signup.handleNext → /places");
      router.push("/places");
    } catch (error) {
      setMessage(error.message || "회원가입에 실패했습니다. 다시 시도해 주세요.");
      if (error.code === "DUPLICATE_EMAIL") {
        setErrors((previous) => ({ ...previous, email: error.message }));
      }
    } finally {
      setBusy(false);
      logExecution("EXIT Signup.handleNext");
    }
  }
  // [변경 후 — 2026-11-27] 공통 헤더·푸터와 전체 화면 너비를 사용하는 회원가입 양식.
  // 기존 검증 함수의 주석 상태와 회원가입 → Context 설정 → 기본 정보 이동 순서는 유지한다.
  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.page} lang="ko">
        <section className={styles.card} aria-labelledby="signup-title" aria-busy={busy}>
          <div className={styles.heading}>
            <div><p className={styles.eyebrow}>나에게 맞는 옷차림의 시작</p><h1 id="signup-title">회원가입</h1><p>로그인에 사용할 계정 정보를 입력해 주세요.</p></div>
            <ol className={styles.steps} aria-label="회원가입 단계">
              {SIGNUP_STEPS.map(step => <li key={step.id} aria-current={step.id === "account" ? "step" : undefined}>{step.label}</li>)}
            </ol>
          </div>
          <form noValidate onSubmit={event => { event.preventDefault(); void handleNext(event); }}>
            <fieldset className={styles.formBody} disabled={busy}>
              <legend className={styles.srOnly}>계정 정보</legend>
              <div className={styles.sectionHeading}><h2>계정 정보</h2><p>이메일은 로그인 아이디로 사용됩니다.</p></div>
              <div className={styles.fields}>
                <Input id="signup-email" label="이메일" name="email" type="email" autoComplete="username" placeholder="name@example.com" maxLength={SIGNUP_LIMITS.EMAIL} value={input.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} hint={"최대 " + SIGNUP_LIMITS.EMAIL + "자"} />
                <Input id="signup-nickname" label="닉네임" name="nickname" autoComplete="nickname" placeholder="사용할 닉네임을 입력해 주세요" maxLength={SIGNUP_LIMITS.NICKNAME} value={input.nickname} onChange={handleChange} onBlur={handleBlur} error={errors.nickname} hint={"한글·영문·숫자 " + SIGNUP_LIMITS.NICKNAME + "자 이내"} />
                <Input id="signup-password" label="비밀번호" name="password" type="password" autoComplete="new-password" maxLength={SIGNUP_LIMITS.PASSWORD} value={input.password} onChange={handleChange} onBlur={handleBlur} error={errors.password} hint={"영문자로 시작 · 영문·숫자 혼합 · 최대 " + SIGNUP_LIMITS.PASSWORD + "자"} />
                <Input id="signup-confirm" label="비밀번호 확인" className={confirmTouched && input.confirmPassword !== input.password ? styles.confirmMismatch : undefined} name="confirmPassword" type="password" autoComplete="new-password" maxLength={SIGNUP_LIMITS.PASSWORD} value={input.confirmPassword} onChange={handleChange} onBlur={handleBlur} error={errors.confirmPassword} hint="비밀번호를 한 번 더 입력해 주세요." />
              </div>
              <div className={styles.consent}>
                <CheckItem checked={locationConsent} title="위치 정보 이용에 동의합니다. (필수)" description="동선에 맞는 날씨와 옷차림을 안내하는 데 사용합니다." onChange={checked => { setLocationConsent(checked); setErrors(previous => ({ ...previous, locationConsent: "" })); }} />
                {errors.locationConsent && <p className={styles.error} role="alert">{errors.locationConsent}</p>}
              </div>
            </fieldset>
            {message && <AlertBox title="회원가입 안내" message={message} />}
            <div className={styles.actions}>
              <Button variant="secondary" disabled={busy} onClick={handleLogin}>취소</Button>
              <Button type="submit" disabled={busy || !locationConsent}>{busy ? "등록 중…" : "다음"}</Button>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// [변경 전 — 2026-11-27] 재구성 전 소스를 학습용으로 보존하며 실행하지 않는다.
// "use client";
// 
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { trace, logExecution, logUiEvent } from "../lib/logger";
// // [변경 후 — 2026-11-26] 회원가입 API 연결을 추가한다.
// import { maiLookLoginRequest } from "../../api/maiLookLoginApi";
// import styles from "./signup.module.css";
// // [신규 — 2026-11-27] 가입 성공 회원을 다음 화면과 공유한다.
// import { useAuth } from "../context/AuthContext";
// 
// // [변경 전 — 2026-11-26] 회원가입 계정 입력 UI. 다음 버튼은 기본 정보 화면으로 이동한다.
// /** [변경 후 — 2026-11-26] 회원 등록에 성공한 경우에만 기본 정보 화면으로 이동한다. */
// export default function Signup() {
//   const router = useRouter();
//   const { acceptAuthenticatedUser } = useAuth();
// 
//   // [?? ?] ??? ? trace ?? useEffect?? ?? ?? ??? ????.
//   // ???? ??? ? ???? logger? new Date()? ?? ??? ? ???? ?? ??.
//   useEffect(() => {
//     logExecution("EFFECT Signup: ?? ??");
//   }, []);
//   const [input, setInput] = useState({ email: "", nickname: "", password: "", confirmPassword: "" });
//   const [errors, setErrors] = useState({});
//   const [message, setMessage] = useState("");
//   // [변경 전 — 2026-11-26] const [busy] = useState(false);
//   // [변경 후 — 2026-11-26] 등록 요청 중 입력과 버튼을 비활성화한다.
//   const [busy, setBusy] = useState(false);
//   const [confirmTouched, setConfirmTouched] = useState(false);
//   const [locationConsent, setLocationConsent] = useState(false);
// 
//   function validateEmail(email) {
//     // logExecution("FUNCTION Signup.validateEmail");
//     // if (!email.trim()) return "이메일을 입력해 주세요.";
//     // if (email.length > 50) return "이메일은 50자 이내로 입력해 주세요.";
//     // return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
//     //   ? "" : "올바른 이메일 형식으로 입력해 주세요.";
//   }
// 
//   function validatePassword(password) {
//     // logExecution("FUNCTION Signup.validatePassword");
//     // if (!password) return "비밀번호를 입력해 주세요.";
//     // return /^(?=[A-Za-z0-9]{2,20}$)(?=.*[0-9])[A-Za-z][A-Za-z0-9]*$/.test(password)
//     //   ? "" : "영문자로 시작하는 영문·숫자 조합을 20자 이내로 입력해 주세요.";
//   }
// 
//   function validateConfirmPassword(confirmPassword, password = input.password) {
//     // logExecution("FUNCTION Signup.validateConfirmPassword");
//     // if (!confirmPassword) return "비밀번호 확인을 입력해 주세요.";
//     // return confirmPassword === password ? "" : "비밀번호가 일치하지 않습니다.";
//   }
// 
//   function validateNickname(nickname) {
//     // logExecution("FUNCTION Signup.validateNickname");
//     // if (!nickname) return "닉네임을 입력해 주세요.";
//     // return /^[가-힣ㄱ-ㅎㅏ-ㅣA-Za-z0-9]{1,50}$/.test(nickname)
//     //   ? "" : "닉네임은 특수문자·공백 없이 한글·영문·숫자 50자 이내로 입력해 주세요.";
//   }
// 
//   function handleChange(event) {
//     logUiEvent(event, "Signup.handleChange");
//     const { name, value } = event.target;
//     // 한글 조합 중인 자모도 허용하고 특수문자·공백은 입력값에서 제거한다.
//     const nextValue = name === "nickname" ? value.replace(/[^가-힣ㄱ-ㅎㅏ-ㅣA-Za-z0-9]/g, "").slice(0, 50) : value;
//     setInput((previous) => ({ ...previous, [name]: nextValue }));
//     setErrors((previous) => ({
//       ...previous,
//       [name]: "",
//       ...(name === "password" && confirmTouched
//         ? { confirmPassword: validateConfirmPassword(input.confirmPassword, nextValue) } : {}),
//     }));
//     setMessage("");
//   }
// 
//   function handleBlur(event) {
//     logUiEvent(event, "Signup.handleBlur");
//     const { name, value } = event.target;
//     const validators = {
//       email: validateEmail,
//       password: validatePassword,
//       confirmPassword: validateConfirmPassword,
//       nickname: validateNickname,
//     };
//     if (name === "confirmPassword") setConfirmTouched(true);
//     setErrors((previous) => ({ ...previous, [name]: validators[name](value) }));
//   }
// 
//   function handleLogin(event) {
//     logUiEvent(event, "Signup.handleLogin");
//     logExecution("NAVIGATE Signup.handleLogin → /login");
//     router.push("/login");
//   }
// 
//   // [변경 전 — 2026-11-26] function handleNext(event) {
//   // [변경 후 — 2026-11-26] async/await로 회원 등록 응답을 기다린다.
//   async function handleNext(event) {
//     logUiEvent(event, "Signup.handleNext");
//     logExecution("ENTER Signup.handleNext");
//     if (busy) {
//       logExecution("EXIT Signup.handleNext: 처리 중이므로 중단");
//       return;
//     }
//     const nextErrors = {
//       email: validateEmail(input.email),
//       password: validatePassword(input.password),
//       confirmPassword: validateConfirmPassword(input.confirmPassword),
//       nickname: validateNickname(input.nickname),
//       locationConsent: locationConsent ? "" : "위치 정보 이용에 동의해 주세요.",
//     };
//     setConfirmTouched(true);
//     setErrors(nextErrors);
//     setMessage("");
//     if (Object.values(nextErrors).some(Boolean)) {
//       logExecution("EXIT Signup.handleNext: 입력 검증 실패 / API 요청 없음");
//       return;
//     }
//     // [변경 전 — 2026-11-26] UI 확인용으로 API 호출 없이 바로 이동했다.
//     // [변경 전 — 2026-11-27] 등록 응답 전에 이동하던 구문.
//     // logExecution("NAVIGATE Signup.handleNext → /signup/info");
//     // router.push("/signup/info");
//     // logExecution("EXIT Signup.handleNext");
//     // [변경 후 — 2026-11-27] 아래 등록·인증 상태 설정 성공 후에만 이동한다.
// 
//     // [변경 후 — 2026-11-26] backend 등록 성공 시 이동하고, 중복·실패 시 현재 화면에 표시한다.
//     setBusy(true);
//     try {
//       // [변경 전 — 2026-11-27] await maiLookLoginRequest("/insert", {
//       // [변경 후 — 2026-11-27] /api/auth/signup으로 회원 등록 요청을 보낸다.
//       // [변경 전 — 2026-11-27] await maiLookLoginRequest("/signup", {
//       // [변경 후 — 2026-11-27] 가입 응답의 userId/email/nickname을 Context로 전달한다.
//       const registeredUser = await maiLookLoginRequest("/signup", {
//         email: input.email.trim(),
//         password: input.password,
//         nickname: input.nickname,
//         locationConsent,
//       });
//       acceptAuthenticatedUser(registeredUser);
//       logExecution("NAVIGATE Signup.handleNext → /signup/info");
//       router.push("/signup/info");
//     } catch (error) {
//       setMessage(error.message || "회원가입에 실패했습니다. 다시 시도해 주세요.");
//       if (error.code === "DUPLICATE_EMAIL") {
//         setErrors((previous) => ({ ...previous, email: error.message }));
//       }
//     } finally {
//       setBusy(false);
//       logExecution("EXIT Signup.handleNext");
//     }
//   }
//   // [?? ?] return trace("Signup.render", () => (
//   // trace ? logExecution ? new Date()? ??? ? ???? Next.js ??? ????.
//   // [?? ?] trace? ??? ?? JSX? ?? ????.
//   return (
//     <main className={styles.page} lang="ko">
//       <div className={styles.content}>
//         <section className={styles.card} aria-labelledby="signup-title" aria-busy={busy}>
//           <div className={styles.heading}>
//             <div><h1 id="signup-title">회원가입</h1><p>로그인에 쓸 정보를 입력해 주세요.</p></div>
//             <ol className={styles.steps} aria-label="회원가입 단계">
//               <li aria-current="step">1 계정</li><li>2 기본 정보</li><li>3 내 성향</li>
//             </ol>
//           </div>
//           <div className={styles.fields}>
//             <div className={styles.field}>
//               <label htmlFor="signup-email">이메일</label>
//               <input id="signup-email" name="email" type="email" autoComplete="username" placeholder="name@example.com" maxLength={50} value={input.email} onChange={handleChange} onBlur={handleBlur} disabled={busy} aria-invalid={!!errors.email} aria-describedby={errors.email ? "signup-email-error" : undefined} />
//               {errors.email && <p id="signup-email-error" className={styles.error} role="alert">{errors.email}</p>}
//             </div>
//             <div className={styles.field}>
//               <label htmlFor="signup-password">비밀번호</label>
//               <input id="signup-password" name="password" type="password" autoComplete="new-password" maxLength={20} value={input.password} onChange={handleChange} onBlur={handleBlur} disabled={busy} aria-invalid={!!errors.password} aria-describedby="signup-password-help signup-password-error" />
//               <p id="signup-password-help" className={styles.help}>영문자로 시작 · 영문·숫자 혼합 · 최대 20자</p>
//               <p id="signup-password-error" className={styles.error} role="alert">{errors.password}</p>
//             </div>
//             <div className={styles.field}>
//               <label htmlFor="signup-confirm">비밀번호 확인</label>
//               <input id="signup-confirm" className={confirmTouched && input.confirmPassword !== input.password ? styles.confirmMismatch : undefined} name="confirmPassword" type="password" autoComplete="new-password" maxLength={20} value={input.confirmPassword} onChange={handleChange} onBlur={handleBlur} disabled={busy} aria-invalid={!!errors.confirmPassword} aria-describedby={errors.confirmPassword ? "signup-confirm-error" : undefined} />
//               {errors.confirmPassword && <p id="signup-confirm-error" className={styles.error} role="alert">{errors.confirmPassword}</p>}
//             </div>
//             <div className={styles.field}>
//               <label htmlFor="signup-nickname">닉네임</label>
//               <input id="signup-nickname" name="nickname" autoComplete="nickname" maxLength={50} value={input.nickname} onChange={handleChange} onBlur={handleBlur} disabled={busy} aria-invalid={!!errors.nickname} aria-describedby={errors.nickname ? "signup-nickname-error" : undefined} />
//               {errors.nickname && <p id="signup-nickname-error" className={styles.error} role="alert">{errors.nickname}</p>}
//             </div>
//           </div>
//           <div className={styles.consent}>
//             <label><input type="checkbox" checked={locationConsent} disabled={busy}
//               onChange={(event) => { setLocationConsent(event.target.checked); setErrors((previous) => ({ ...previous, locationConsent: "" })); }}
//               aria-invalid={!!errors.locationConsent} aria-describedby={errors.locationConsent ? "signup-consent-error" : undefined} />
//               <strong>위치 정보 이용에 동의합니다. (필수)</strong>
//             </label>
//             {errors.locationConsent && <p id="signup-consent-error" className={styles.error} role="alert">{errors.locationConsent}</p>}
//           </div>
//           {message && <p className={styles.error} role="alert">{message}</p>}
//           <footer className={styles.actions}>
//             <button type="button" className={styles.cancel} disabled={busy} onClick={handleLogin}>취소</button>
//             <button type="button" className={styles.next} disabled={busy || !locationConsent} onClick={handleNext}>{busy ? "확인 중…" : "다음"}</button>
//           </footer>
//         </section>
//       </div>
//     </main>
//   // [?? ?] )); ? trace ??? JSX ??? ?? ???.
//   // [?? ?] ); ? ?? return? JSX ??? ???.
//   );
// }
// 
