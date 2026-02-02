/** AdSense 오류 방지 및 레이아웃 깨짐 방지 */
export function preventAdSenseErrors(): void {
  try {
    if (typeof window === "undefined") return;
    const style = document.createElement("style");
    style.textContent = ".adsbygoogle { min-height: 50px !important; }";
    document.head.appendChild(style);
  } catch (_e) {}
}

export function setupAdObserver(): void {
  try {
    if (typeof window === "undefined" || !("MutationObserver" in window))
      return;
    const observer = new MutationObserver(() => {
      document.querySelectorAll(".adsbygoogle").forEach((el) => {
        if (el instanceof HTMLElement && !el.getAttribute("data-ad-status")) {
          el.style.minHeight = "50px";
        }
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (_e) {}
}
