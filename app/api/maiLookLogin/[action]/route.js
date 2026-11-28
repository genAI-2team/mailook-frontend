import { proxyBackend } from "../../../lib/backend-proxy.mjs";

const methods = {
  // [변경 전 — 2026-11-27] login: "POST", logout: "POST", insert: "POST",
  // [변경 후 — 2026-11-27] 로그인은 app/api/auth/login/route.js로 분리한다.
  // [변경 전 — 2026-11-27] logout: "POST", insert: "POST",
  // [변경 후 — 2026-11-27] 회원가입은 app/api/auth/signup/route.js로 분리한다.
  logout: "POST",
  selectById: "GET", selectCount: "GET", selectPage: "GET", update: "PUT", deleteById: "DELETE",
};

async function handle(request, { params }) {
  const { action } = await params;
  if (!Object.hasOwn(methods, action)) return Response.json({ message: "요청 경로를 찾을 수 없습니다." }, { status: 404 });
  if (methods[action] !== request.method) return new Response(null, { status: 405, headers: { Allow: methods[action] } });
  return proxyBackend(request, `/api/maiLookLogin/${action}`);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
