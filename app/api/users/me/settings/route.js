import { proxyBackend } from "@/app/lib/backend-proxy.mjs";

async function settings(request) {
  return proxyBackend(request, "/api/users/me/settings");
}

export const GET = settings;
export const POST = settings;
export const PUT = settings;
