"use client";

import type { ReactNode } from "react";

interface FeedUnmaskRevealProps {
  children: ReactNode;
}

/**
 * Stage 2 of the reveal: the full-width sheet that rises over the pinned browse scene on scroll,
 * the framer.university unmask technique with no animation library. The parent applies the
 * pinning and the scroll overlap; here we render the edge-to-edge paper sheet that carries the
 * full post detail or the account-style gallery view.
 */
export function FeedUnmaskReveal({ children }: FeedUnmaskRevealProps) {
  return (
    <div className="w-full rounded-t-[1.5rem] border-t border-line bg-paper shadow-[0_-24px_60px_-32px_rgba(0,0,0,0.45)]">
      <div className="px-4 pb-32 pt-12 sm:px-8">{children}</div>
    </div>
  );
}
