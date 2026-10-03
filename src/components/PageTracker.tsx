"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const startedAt = Date.now();

    fetch("/api/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventType: "PAGE_VIEW",
        page: pathname,
        success: true,
      }),
    }).catch(() => {});

    return () => {
      const durationMs = Date.now() - startedAt;

      fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventType: "TIME_ON_PAGE",
          page: pathname,
          durationMs,
          success: true,
        }),
        keepalive: true,
      }).catch(() => {});
    };
  }, [pathname]);

  return null;
}
