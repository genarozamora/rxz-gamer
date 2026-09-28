"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect } from "react";
import { MetaPixel } from "./meta-pixel";

const PRIVATE_ROUTES = ["/admin", "/cuenta", "/checkout"];

function keepPublicStorePages(event: BeforeSendEvent) {
  try {
    const path = new URL(event.url).pathname;
    return PRIVATE_ROUTES.some((route) => path.startsWith(route)) ? null : event;
  } catch {
    return event;
  }
}

export function StoreObservability() {
  useEffect(() => {
    const preserveReadableBrowserZoom = () => {
      const viewportRatio = window.outerWidth > 0 && window.innerWidth > 0
        ? window.outerWidth / window.innerWidth
        : 1;
      const pixelRatio = window.devicePixelRatio || 1;
      const viewportCompensation = viewportRatio < 0.72 ? 1 / viewportRatio : 1;
      const pixelCompensation = pixelRatio < 0.75 ? 1 / pixelRatio : 1;
      const compensation = Math.min(
        5,
        Math.max(1, viewportCompensation, pixelCompensation),
      );
      const guardActive = compensation > 1;
      document.body.style.zoom = guardActive ? String(compensation) : "";
      document.documentElement.dataset.zoomGuard = compensation > 1 ? "active" : "normal";
    };

    preserveReadableBrowserZoom();
    window.addEventListener("resize", preserveReadableBrowserZoom);
    window.visualViewport?.addEventListener("resize", preserveReadableBrowserZoom);
    return () => {
      window.removeEventListener("resize", preserveReadableBrowserZoom);
      window.visualViewport?.removeEventListener("resize", preserveReadableBrowserZoom);
      document.body.style.zoom = "";
      delete document.documentElement.dataset.zoomGuard;
    };
  }, []);

  return (
    <>
      <Analytics beforeSend={keepPublicStorePages} />
      <SpeedInsights sampleRate={1} />
      <MetaPixel />
    </>
  );
}
