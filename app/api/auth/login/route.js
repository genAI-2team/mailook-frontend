// [변경 전 — 2026-11-27] app/api/maiLookLogin/[action]/route.js가 login을 중계했다.
// [변경 후 — 2026-11-27] POST /api/auth/login을 같은 backend 주소로 전달한다.
import { proxyBackend } from "../../../lib/backend-proxy.mjs";

export async function POST(request) {
  return proxyBackend(request, "/api/auth/login");
}
