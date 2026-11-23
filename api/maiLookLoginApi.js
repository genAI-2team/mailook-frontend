import { traceAsync } from "../app/lib/logger";

/** 동일 출처 프록시를 이용한다. 비밀번호·세션 쿠키·토큰은 로그에 출력하지 않는다. */
export function maiLookLoginRequest(path, body) {
  return traceAsync("maiLookLogin.api", async () => {
    const csrfResponse = await fetch("/api/maiLookLogin/csrf", { credentials: "same-origin", cache: "no-store" });
    if (!csrfResponse.ok) throw new Error("서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.");
    const { token } = await csrfResponse.json();
    const response = await fetch(`/api/maiLookLogin${path}`, {
      method: "POST", cache: "no-store", credentials: "same-origin",
      headers: { "Content-Type": "application/json", "X-CSRF-Token": token },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (response.status === 204) return null;
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.message || "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
    return data;
  });
}
