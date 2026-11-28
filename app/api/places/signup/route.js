import { proxyBackend } from "../../../lib/backend-proxy.mjs";

export async function POST(request) {
  return proxyBackend(request, "/api/places/signup");
}

// [변경 전 — 2026-11-28] /api/auth/info 중계 소스 보존. 현재 /api/places/signup 사용.
// // [신규 — 2026-11-27] JWT Authorization 헤더와 JSON을 backend InfoController로 전달한다.
// import { proxyBackend } from "../../../lib/backend-proxy.mjs";
// 
// export async function POST(request) {
//   return proxyBackend(request, "/api/auth/info");
// }
// 
