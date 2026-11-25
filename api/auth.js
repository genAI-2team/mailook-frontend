import api from "@/api/client";
import { clearAuthToken } from "@/api/authToken";

/** localStorage JWT를 Next.js 중계 경로로 보내 서버가 확인한 사용자 정보를 받는다. */
export async function getCurrentUser({ signal } = {}) {

  try {
    const user = await api.get("/api/users/me", {
    baseURL: "",
    signal,
    // 복원 요청의 401은 Context에서 처리한다. 통신 오류와 구분하기 위해 자동 이동을 막는다.
    skipAuthRedirect: true,
    });

    return user;
  } catch (error) {

    throw error;
  }
}

export async function logout() {
  try {
    return await api.post("/api/auth/logout");
  } finally {
    clearAuthToken();
  }
}
