export function registerServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    const base =
      (import.meta as { env?: { BASE_URL?: string } }).env?.BASE_URL || "/";
    const swPath = base === "/" ? "/sw.js" : `${base.replace(/\/$/, "")}/sw.js`;
    navigator.serviceWorker.register(swPath).catch(() => {});
  });
}
