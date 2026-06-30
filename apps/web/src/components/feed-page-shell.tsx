"use client";

import {
  createContext,
  useContext,
  useEffect,
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
  const [navHeight, setNavHeight] = useState(0);
  const [mode, setMode] = useState<FeedBrowseMode>("browse");
  const browseLocked = mode === "browse";

  useEffect(() => {
    function measure() {
      const header = document.querySelector("header");
      setNavHeight(header?.offsetHeight ?? 0);
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const shellContext = useMemo(() => ({ reportMode: setMode }), []);

  return (
    <FeedPageShellContext.Provider value={shellContext}>
      <main
        className={browseLocked ? "flex flex-col overflow-hidden" : "flex flex-col"}
        style={
          browseLocked && navHeight > 0
            ? { height: `calc(100dvh - ${navHeight}px)` }
            : undefined
        }
      >
        <div className="mx-auto w-full max-w-6xl shrink-0 px-4 py-8 sm:px-6">{toolbar}</div>
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
