import api from "./client";

// 기본 설정을 부른다. 줄이 없거나 본문이 비어 있으면 null.
export async function getUserSetting() {
  const saved = await api.get("/api/users/me/settings");
  if (!saved || typeof saved !== "object" || saved.warmthStyle == null) return null;
  return saved;
}

// 가입 중 내 성향에서 기본 설정을 저장한다.
export async function createUserSetting(setting) {
  return api.post("/api/users/me/settings", setting);
}
