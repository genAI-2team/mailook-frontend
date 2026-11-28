/** 서버 전용 프록시. JWT Authorization 헤더를 백엔드에 전달한다. */
export async function proxyBackend(request, path) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ message: "허용되지 않은 요청입니다." }, { status: 403 });
  }
  const contentType = request.headers.get("content-type") || "application/json";
  const isMultipart = contentType.toLowerCase().startsWith("multipart/form-data;");
  const headers = { "Content-Type": isMultipart ? contentType : "application/json" };
  for (const name of ["authorization"]) {
    const value = request.headers.get(name);
    if (value) headers[name] = value;
  }
  try {
    const url = new URL(path, process.env.BACKEND_URL || "http://localhost:8080");
    url.search = new URL(request.url).search;
    const response = await fetch(url, {
      method: request.method, headers,
      body: ["GET", "HEAD"].includes(request.method) ? undefined
        : isMultipart ? await request.arrayBuffer() : await request.text(),
      cache: "no-store", redirect: "manual", signal: AbortSignal.timeout(15000),
    });
    const resultHeaders = new Headers({ "Cache-Control": "no-store" });
    if (response.status === 204) return new Response(null, { status: 204, headers: resultHeaders });
    const data = await response.json().catch(() => ({ message: "백엔드 응답을 확인할 수 없습니다." }));
    return Response.json(data, { status: response.status, headers: resultHeaders });
  } catch {
    return Response.json({ message: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  }
}
