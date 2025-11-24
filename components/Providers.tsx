"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import type { ReactNode } from "react";
import { PlayerProvider } from "@/components/player/PlayerProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <PlayerProvider>
        {children}
        <Toaster position="top-right" />
      </PlayerProvider>
    </SessionProvider>
  );
}
