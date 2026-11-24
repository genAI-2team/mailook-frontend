import { proxyBackend } from "../../../lib/backend-proxy.mjs";

export async function POST(request) {
  return proxyBackend(request, "/api/places/signup");
}
