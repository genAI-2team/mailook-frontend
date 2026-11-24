import { authHeaders, clearAuthToken } from "./authToken";

export async function saveSignupPlaces(payload) {
  const response = await fetch("/api/places/signup", {
    method: "POST", credentials: "omit", cache: "no-store",
    headers: { "Content-Type": "application/json", ...authHeaders() }, body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => null);
  if (response.status === 401) clearAuthToken();
  if (!response.ok) throw new Error(data?.message || "장소 정보를 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
  return data;
}
