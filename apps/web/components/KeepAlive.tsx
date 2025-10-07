"use client";

import { useEffect } from "react";
import { HTTP_BACKEND, WS_URL } from "@/Config";

export function KeepAlive() {
  useEffect(() => {
    let isActive = true;
    let httpOnline = false;
    let wsOnline = false;

    // Smart keep-alive that only pings when needed
    const keepAlive = async () => {
      if (!isActive) return;

      const promises = [];

      // Only ping HTTP backend if it's not confirmed online
      if (!httpOnline) {
        promises.push(
          fetch(`${HTTP_BACKEND}/warmup`, {
            method: "GET",
            headers: { "Cache-Control": "no-cache" },
            signal: AbortSignal.timeout(5000),
          })
            .then(() => {
              httpOnline = true;
            })
            .catch(() => {
              httpOnline = false;
            })
        );
      }

      // Only ping WebSocket backend if it's not confirmed online
      if (!wsOnline) {
        promises.push(
          fetch(`${WS_URL}/warmup`, {
            method: "GET",
            headers: { "Cache-Control": "no-cache" },
            signal: AbortSignal.timeout(5000),
          })
            .then(() => {
              wsOnline = true;
            })
            .catch(() => {
              wsOnline = false;
            })
        );
      }

      // Only execute if there are backends to check
      if (promises.length > 0) {
        await Promise.allSettled(promises);
      }
    };

    // Regular keep-alive to prevent sleep (only when both are online)
    const preventSleep = async () => {
      if (!isActive || !httpOnline || !wsOnline) return;

      try {
        // Light ping to both services to keep them warm
        await Promise.allSettled([
          fetch(`${HTTP_BACKEND}/health`, {
            method: "GET",
            headers: { "Cache-Control": "no-cache" },
            signal: AbortSignal.timeout(3000),
          }),
          fetch(`${WS_URL}/health`, {
            method: "GET",
            headers: { "Cache-Control": "no-cache" },
            signal: AbortSignal.timeout(3000),
          }),
        ]);
      } catch {
        // If keep-alive fails, mark backends as potentially offline
        httpOnline = false;
        wsOnline = false;
      }
    };

    // Only run in production
    const isProduction = typeof window !== "undefined" && 
                         window.location.hostname !== "localhost" && 
                         window.location.hostname !== "127.0.0.1";

    if (isProduction) {
      // Initial check
      keepAlive();

      // Wake-up interval: Check every 30 seconds until both are online
      const wakeUpInterval = setInterval(() => {
        if (!httpOnline || !wsOnline) {
          keepAlive();
        }
      }, 30000);

      // Keep-alive interval: Ping every 8 minutes to prevent sleep (only when both online)
      const keepAliveInterval = setInterval(() => {
        if (httpOnline && wsOnline) {
          preventSleep();
        }
      }, 8 * 60 * 1000);

      return () => {
        isActive = false;
        clearInterval(wakeUpInterval);
        clearInterval(keepAliveInterval);
      };
    }

    return () => {
      isActive = false;
    };
  }, []);

  // This component renders nothing and doesn't affect UI
  return null;
}