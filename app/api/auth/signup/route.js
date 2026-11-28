// [변경 전 — 2026-11-27] /api/maiLookLogin/insert 중계 경로를 사용했다.
// [변경 후 — 2026-11-27] POST /api/auth/signup을 같은 backend 주소로 중계한다.
import { proxyBackend } from "../../../lib/backend-proxy.mjs";

export async function POST(request) {
  return proxyBackend(request, "/api/auth/signup");
}
