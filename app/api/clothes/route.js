import { proxyBackend } from "../../lib/backend-proxy.mjs";

async function getPhoto(request, photoId) {
  const headers = { "Cache-Control": "no-store" };
  const authorization = request.headers.get("authorization");
  if (!authorization) return new Response(null, { status: 401, headers });

  try {
    const url = new URL(`/api/clothes/${photoId}/photo`, process.env.BACKEND_URL || "http://localhost:8080");
    const response = await fetch(url, {
      headers: { Authorization: authorization },
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) {
      return new Response(null, { status: response.status >= 400 ? response.status : 502, headers });
    }
    const contentType = response.headers.get("content-type")?.split(";")[0];
    if (!["image/jpeg", "image/png", "image/gif"].includes(contentType)) {
      return new Response(null, { status: 502, headers });
    }
    return new Response(response.body, {
      headers: { ...headers, "Content-Type": contentType, "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response(null, { status: 502, headers });
  }
}

export async function GET(request) {
  const photoId = new URL(request.url).searchParams.get("photoId");
  if (photoId !== null) {
    if (!/^[1-9]\d{0,18}$/.test(photoId)) {
      return Response.json({ message: "옷 번호를 확인해 주세요." }, { status: 400 });
    }
    return getPhoto(request, photoId);
  }
  return proxyBackend(request, "/api/clothes");
}

export async function POST(request) {
  return proxyBackend(request, "/api/clothes");
}
