"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/components/auth-provider";
import { addSaved, fetchCheckIns, fetchSaved, removeSaved } from "@/lib/api-client";
import {
  feedKey,
  galleryKey,
  readCheckedInSlugs,
  readSavedKeys,
  writeCheckedInSlugs,
  writeSavedKeys,
  type SavedKey,
} from "@/lib/user-actions";

interface UserActionsContextValue {
  ready: boolean;
  isSaved: (key: SavedKey) => boolean;
  isFeedItemSaved: (feedSlug: string, gallerySlug?: string | null) => boolean;
  toggleSaveFeedItem: (feedSlug: string, gallerySlug?: string | null) => void;
  toggleSaveGallery: (gallerySlug: string) => void;
  isCheckedIn: (gallerySlug: string) => boolean;
  markCheckedIn: (gallerySlug: string) => void;
}

const UserActionsContext = createContext<UserActionsContextValue | null>(null);

function savedKeysFromServer(items: { kind: string; slug: string }[]): SavedKey[] {
  return items.map((item) =>
    item.kind === "gallery" ? galleryKey(item.slug) : feedKey(item.slug),
  );
}

export function UserActionsProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, ready: authReady } = useAuth();
  const [savedKeys, setSavedKeys] = useState<SavedKey[]>([]);
  const [checkedInSlugs, setCheckedInSlugs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!authReady) return;

    async function hydrate() {
      if (isSignedIn) {
        try {
          const page = await fetchSaved();
          setSavedKeys(savedKeysFromServer(page.items));
        } catch {
          setSavedKeys([]);
        }
        try {
          const checkIns = await fetchCheckIns();
          const slugs = [...new Set(checkIns.items.map((item) => item.gallery_slug))];
          setCheckedInSlugs(slugs);
        } catch {
          setCheckedInSlugs([]);
        }
      } else {
        setSavedKeys(readSavedKeys());
        setCheckedInSlugs(readCheckedInSlugs());
      }
      setReady(true);
    }

    void hydrate();
  }, [authReady, isSignedIn]);

  const persistSaved = useCallback(
    (keys: SavedKey[]) => {
      const unique = [...new Set(keys)];
      setSavedKeys(unique);
      if (!isSignedIn) {
        writeSavedKeys(unique);
      }
    },
    [isSignedIn],
  );

  const persistCheckins = useCallback(
    (slugs: string[]) => {
      const unique = [...new Set(slugs)];
      setCheckedInSlugs(unique);
      if (!isSignedIn) {
        writeCheckedInSlugs(unique);
      }
    },
    [isSignedIn],
  );

  const isSaved = useCallback(
    (key: SavedKey) => savedKeys.includes(key),
    [savedKeys],
  );

  const isFeedItemSaved = useCallback(
    (feedSlug: string, gallerySlug?: string | null) => {
      if (isSaved(feedKey(feedSlug))) return true;
      if (gallerySlug && isSaved(galleryKey(gallerySlug))) return true;
      return false;
    },
    [isSaved],
  );

  const toggleSaveFeedItem = useCallback(
    (feedSlug: string, gallerySlug?: string | null) => {
      const keys: SavedKey[] = [feedKey(feedSlug)];
      if (gallerySlug) keys.push(galleryKey(gallerySlug));

      const allSaved = keys.every((k) => savedKeys.includes(k));

      if (isSignedIn) {
        void (async () => {
          for (const key of keys) {
            const kind = key.startsWith("gallery:") ? "gallery" : "feed";
            const slug = key.split(":")[1]!;
            if (allSaved) {
              await removeSaved(kind, slug);
            } else if (!savedKeys.includes(key)) {
              await addSaved(kind, slug);
            }
          }
          const page = await fetchSaved();
          setSavedKeys(savedKeysFromServer(page.items));
        })();
        return;
      }

      if (allSaved) {
        persistSaved(savedKeys.filter((k) => !keys.includes(k)));
      } else {
        persistSaved([...savedKeys, ...keys]);
      }
    },
    [isSignedIn, persistSaved, savedKeys],
  );

  const toggleSaveGallery = useCallback(
    (gallerySlug: string) => {
      const key = galleryKey(gallerySlug);

      if (isSignedIn) {
        void (async () => {
          if (savedKeys.includes(key)) {
            await removeSaved("gallery", gallerySlug);
          } else {
            await addSaved("gallery", gallerySlug);
          }
          const page = await fetchSaved();
          setSavedKeys(savedKeysFromServer(page.items));
        })();
        return;
      }

      if (savedKeys.includes(key)) {
        persistSaved(savedKeys.filter((k) => k !== key));
      } else {
        persistSaved([...savedKeys, key]);
      }
    },
    [isSignedIn, persistSaved, savedKeys],
  );

  const isCheckedIn = useCallback(
    (gallerySlug: string) => checkedInSlugs.includes(gallerySlug),
    [checkedInSlugs],
  );

  const markCheckedIn = useCallback(
    (gallerySlug: string) => {
      if (!checkedInSlugs.includes(gallerySlug)) {
        persistCheckins([...checkedInSlugs, gallerySlug]);
      }
    },
    [checkedInSlugs, persistCheckins],
  );

  const value = useMemo(
    () => ({
      ready,
      isSaved,
      isFeedItemSaved,
      toggleSaveFeedItem,
      toggleSaveGallery,
      isCheckedIn,
      markCheckedIn,
    }),
    [
      ready,
      isSaved,
      isFeedItemSaved,
      toggleSaveFeedItem,
      toggleSaveGallery,
      isCheckedIn,
      markCheckedIn,
    ],
  );

  return (
    <UserActionsContext.Provider value={value}>{children}</UserActionsContext.Provider>
  );
}

export function useUserActions(): UserActionsContextValue {
  const ctx = useContext(UserActionsContext);
  if (!ctx) {
    throw new Error("useUserActions must be used within UserActionsProvider");
  }
  return ctx;
}
