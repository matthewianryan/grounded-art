"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type FeedBrowseMode = "browse" | "expanded" | "unmask";

const FeedPageShellContext = createContext<{
  reportMode: (mode: FeedBrowseMode) => void;
} | null>(null);

export function useFeedPageShell() {
  return useContext(FeedPageShellContext);
}

export function FeedPageShell({
  toolbar,
  children,
}: {
  toolbar: ReactNode;
  children: ReactNode;
}) {
  const [mode, setMode] = useState<FeedBrowseMode>("browse");
  const browseLocked = mode === "browse";

  const shellContext = useMemo(() => ({ reportMode: setMode }), []);

  // No header: the feed owns the full viewport height. The toolbar leaves a top band clear
  // for the floating menu button.
  return (
    <FeedPageShellContext.Provider value={shellContext}>
      <main
        className={
          browseLocked
            ? "flex h-dvh flex-col overflow-hidden"
            : "flex flex-col"
        }
      >
        <div className="mx-auto w-full max-w-6xl shrink-0 px-4 pb-8 pt-20 sm:px-6">
          {toolbar}
        </div>
        <section
          className={
            browseLocked ? "min-h-0 w-full flex-1 overflow-hidden" : "mt-2 w-full"
          }
        >
          {children}
        </section>
      </main>
    </FeedPageShellContext.Provider>
  );
}
