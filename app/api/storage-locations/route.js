import { proxyBackend } from "../../lib/backend-proxy.mjs";

export async function GET(request) {
  return proxyBackend(request, "/api/storage-locations");
}

export async function POST(request) {
  return proxyBackend(request, "/api/storage-locations");
}
