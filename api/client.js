import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  withCredentials: true,
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
      if (!window.location.pathname.startsWith("/login")) {
        // axios 인터셉터에는 라우터가 없어서 전체 이동으로 보낸다.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/login");
      }
    }
    return Promise.reject(error);
  },
);

export default api;
