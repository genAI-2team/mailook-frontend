import { proxyBackend } from "../../../lib/backend-proxy.mjs";

const methods = {
  login: "POST", logout: "POST", insert: "POST",
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
