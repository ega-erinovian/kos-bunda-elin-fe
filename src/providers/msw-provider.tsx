"use client";

import { useEffect } from "react";

export function MSWProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_API_MODE === "mock") {
      import("@/mocks/browser").then(({ worker }) => {
        worker.start({
          onUnhandledRequest: "bypass",
        });
      });
    }
  }, []);

  return <>{children}</>;
}
