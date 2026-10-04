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
    const syncViewportHeight = () => {
      const height = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty(
        "--rxz-viewport-height",
        `${Math.round(height)}px`,
      );
    };

    syncViewportHeight();
    window.addEventListener("resize", syncViewportHeight);
    window.visualViewport?.addEventListener("resize", syncViewportHeight);
    return () => {
      window.removeEventListener("resize", syncViewportHeight);
      window.visualViewport?.removeEventListener("resize", syncViewportHeight);
      document.documentElement.style.removeProperty("--rxz-viewport-height");
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
