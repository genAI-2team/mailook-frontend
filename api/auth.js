import api from "@/api/client";
import { clearAuthToken } from "@/api/authToken";

export async function logout() {
  try {
    return await api.post("/api/auth/logout");
  } finally {
    clearAuthToken();
  }
}
