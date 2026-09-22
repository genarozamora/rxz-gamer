export const META_PIXEL_ID = "1070284245880308";

type MetaPixelWindow = Window & {
  fbq?: (command: string, event: string, parameters?: Record<string, unknown>) => void;
};

export function trackMetaEvent(event: string, parameters?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  (window as MetaPixelWindow).fbq?.("track", event, parameters);
}
