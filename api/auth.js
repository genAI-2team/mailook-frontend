import api from "@/api/client";

export function logout() {
  return api.post("/api/auth/logout");
}
