"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
  return (
    <>
      <Analytics beforeSend={keepPublicStorePages} />
      <SpeedInsights sampleRate={1} />
    </>
  );
}
