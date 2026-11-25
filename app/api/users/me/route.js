import { proxyBackend } from "../../../lib/backend-proxy.mjs";

export async function GET(request) {
  return proxyBackend(request, "/api/users/me");
}
