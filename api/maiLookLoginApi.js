import api from "./client";
import { saveAuthToken, clearAuthToken } from "./authToken";

/** 공통 axios로 요청하고, 로그인 성공 시 JWT를 저장한다. */
export async function maiLookLoginRequest(path, body) {
  let data;
  try {
    // 응답 인터셉터가 response.data를 반환하므로 결과를 바로 사용한다.
    // 기존 Next.js 중계 경로와 JWT 헤더 인증 방식을 유지한다.
    data = await api.post(`/api/maiLookLogin${path}`, body, {
      baseURL: "",
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const status = error.response?.status;
    if (status === 401) clearAuthToken();
    const message = path === "/login" && status === 401
      ? "이메일 또는 비밀번호가 틀립니다."
      : error.response?.data?.message || error.message || "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";
    const failure = new Error(message);
    failure.code = error.response?.data?.code || error.code;
    throw failure;
  }

  if (data?.status === "fail") {
    throw new Error(data.message || "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.");
  }
  if (path === "/login") {
    if (!data?.accessToken) throw new Error("로그인 토큰을 받지 못했습니다.");
    saveAuthToken(data.accessToken);
  }
  return data;
}
