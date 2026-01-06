"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Tracks page views to Supabase
 * This is a simple alternative to Google Analytics that stores data in your database
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Only track in production or if explicitly enabled
    if (process.env.NODE_ENV !== "production" && !process.env.NEXT_PUBLIC_ENABLE_PAGE_TRACKING) {
      return;
    }

    const trackPageView = async () => {
      try {
        await fetch("/api/analytics/pageview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            path: pathname,
            timestamp: new Date().toISOString(),
            referrer: document.referrer || null,
            userAgent: navigator.userAgent,
          }),
        });
      } catch (error) {
        // Silently fail - don't interrupt user experience
        console.error("Failed to track page view:", error);
      }
    };

    // Small delay to ensure page is fully loaded
    const timeoutId = setTimeout(trackPageView, 100);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  return null;
}
