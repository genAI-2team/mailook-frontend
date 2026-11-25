import axios from "axios";
import { getAuthToken, clearAuthToken } from "./authToken";

const NO_TOKEN_PATHS = ["/api/maiLookLogin/login", "/api/maiLookLogin/insert"];

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const url = config.url ?? "";
  if (NO_TOKEN_PATHS.some((path) => url.includes(path))) {
    return config;
  }
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === "object" && "success" in body) {
      if (!body.success) {
        const error = new Error(body.error?.message || "요청에 실패했습니다.");
        error.code = body.error?.code;
        return Promise.reject(error);
      }
      return body.data;
    }
    return body;
  },
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      clearAuthToken();
      const pathname = window.location.pathname;
      const isAuthScreen = pathname === "/login" || pathname.startsWith("/login/")
        || pathname === "/signup" || pathname.startsWith("/signup/");
      const isLoginRequest = NO_TOKEN_PATHS.some((path) => (error.config?.url ?? "").includes(path));
      if (!error.config?.skipAuthRedirect && !isAuthScreen && !isLoginRequest) {
        // axios 인터셉터에는 라우터가 없어서 전체 이동으로 보낸다.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

export default api;
