import { logExecution } from "./app/lib/logger";

if (process.env.NODE_ENV !== "production") {
  logExecution("EVENT application:init");
  // Remove the previous listeners when this module is replaced by Fast Refresh.
  window.__mailookLogController?.abort();
  const controller = new AbortController();
  window.__mailookLogController = controller;
  for (const type of ["click", "change", "input", "keydown", "focusin", "focusout"]) {
    document.addEventListener(type, (event) => {
      const tag = event.target instanceof Element ? event.target.tagName.toLowerCase() : "document";
      logExecution(`EVENT ${type} <${tag}>`);
    }, { capture: true, signal: controller.signal });
  }
  window.addEventListener("error", () => logExecution("EVENT window:error"), { signal: controller.signal });
  window.addEventListener("unhandledrejection", () => logExecution("EVENT promise:unhandledrejection"), { signal: controller.signal });
}

export function onRouterTransitionStart(_url, navigationType) {
  logExecution(`EVENT navigation:${navigationType}`);
}
