import { proxyBackend } from "../../lib/backend-proxy.mjs";
import { traceAsync } from "../../lib/logger";

export async function POST(request) {
  return traceAsync("clothes.POST", () => proxyBackend(request, "/api/clothes"));
}
