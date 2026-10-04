"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { META_PIXEL_ID, trackMetaEvent } from "@/lib/meta-pixel";
import { MARKETING_CONSENT_EVENT, MARKETING_CONSENT_KEY } from "@/lib/marketing-consent";
import { PrivacyConsent } from "./privacy-consent";

function MetaPageViews() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackMetaEvent("PageView");
  }, [pathname, searchParams]);

  return null;
}

export function MetaPixel() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const privateRoute = ["/admin", "/cuenta", "/checkout", "/login", "/ayuda", "/arrepentimiento"]
    .some((route) => pathname.startsWith(route));

  useEffect(() => {
    const syncConsent = () => setEnabled(localStorage.getItem(MARKETING_CONSENT_KEY) === "granted");
    queueMicrotask(syncConsent);
    window.addEventListener(MARKETING_CONSENT_EVENT, syncConsent);
    return () => window.removeEventListener(MARKETING_CONSENT_EVENT, syncConsent);
  }, []);

  if (privateRoute) return null;

  return (
    <>
      {enabled && <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META_PIXEL_ID}');`}
      </Script>}
      {enabled && <Suspense fallback={null}>
        <MetaPageViews />
      </Suspense>}
      <PrivacyConsent onChoice={setEnabled} />
    </>
  );
}
