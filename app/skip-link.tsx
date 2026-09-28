"use client";

export function SkipLink() {
  function skipToContent() {
    const main = document.querySelector("main");
    if (!(main instanceof HTMLElement)) return;
    if (!main.hasAttribute("tabindex")) main.setAttribute("tabindex", "-1");
    main.focus({ preventScroll: true });
    main.scrollIntoView({ block: "start" });
  }

  return <button type="button" className="skip-link" onClick={skipToContent}>Saltar al contenido</button>;
}
