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

export function UserActionsProvider({ children }: { children: ReactNode }) {
  const [savedKeys, setSavedKeys] = useState<SavedKey[]>([]);
  const [checkedInSlugs, setCheckedInSlugs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSavedKeys(readSavedKeys());
    setCheckedInSlugs(readCheckedInSlugs());
    setReady(true);
  }, []);

  const persistSaved = useCallback((keys: SavedKey[]) => {
    const unique = [...new Set(keys)];
    setSavedKeys(unique);
    writeSavedKeys(unique);
  }, []);

  const persistCheckins = useCallback((slugs: string[]) => {
    const unique = [...new Set(slugs)];
    setCheckedInSlugs(unique);
    writeCheckedInSlugs(unique);
  }, []);

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
      if (allSaved) {
        persistSaved(savedKeys.filter((k) => !keys.includes(k)));
      } else {
        persistSaved([...savedKeys, ...keys]);
      }
    },
    [persistSaved, savedKeys],
  );

  const toggleSaveGallery = useCallback(
    (gallerySlug: string) => {
      const key = galleryKey(gallerySlug);
      if (savedKeys.includes(key)) {
        persistSaved(savedKeys.filter((k) => k !== key));
      } else {
        persistSaved([...savedKeys, key]);
      }
    },
    [persistSaved, savedKeys],
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
