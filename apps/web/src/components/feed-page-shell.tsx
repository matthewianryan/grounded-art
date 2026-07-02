"use client";

import type { ReactNode } from "react";

export function FeedPageShell({
  toolbar,
  children,
}: {
  toolbar: ReactNode;
  children: ReactNode;
}) {
  // Layout stays fixed across browse and detail. FeedBrowse owns mode, scroll lock, and the
  // unmask sheet so the Provider children tree does not shift when detail opens.
  return (
    <main className="flex min-h-dvh flex-col bg-paper">
      <div className="mx-auto w-full max-w-6xl shrink-0 px-4 pb-8 pt-20 sm:px-6">
        {toolbar}
      </div>
      <section className="min-h-0 w-full flex-1">{children}</section>
    </main>
  );
}
