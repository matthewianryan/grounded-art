// Account and auth types mirroring apps/api/app/schemas.py auth section.

export interface Account {
  id: string;
  email: string;
  display_name: string;
  title: string | null;
  avatar_url: string | null;
  bio: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  joined_at: string;
}

export interface AccountUpdate {
  display_name?: string;
  title?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
}

export interface SavedItem {
  kind: "feed" | "gallery";
  slug: string;
  saved_at: string;
  gallery: import("@/lib/types").Gallery | null;
  feed_item: import("@/lib/types").FeedItem | null;
}

export interface SavedPage {
  items: SavedItem[];
}

export interface WalletTransaction {
  id: string;
  delta: number;
  reason: string;
  created_at: string;
  gallery_name: string | null;
}

export interface Wallet {
  balance: number;
  transactions: WalletTransaction[];
}

export interface CheckInRecord {
  id: string;
  gallery_slug: string;
  gallery_name: string;
  checked_in_at: string;
  verified: boolean;
  point_awarded: boolean;
  presence_method: "geolocation" | "venue_code";
}

export interface CheckInPage {
  items: CheckInRecord[];
}

export interface CheckInChallenge {
  challenge_token: string;
  expires_at: string;
}

export interface CheckInSubmitBody {
  gallery_slug: string;
  latitude: number;
  longitude: number;
  challenge_token: string;
  accuracy?: number;
}

export interface CheckInResult {
  id: string;
  verified: boolean;
  point_awarded: boolean;
  already_earned_today: boolean;
  balance: number;
  presence_method: "geolocation" | "venue_code";
  decline_reason:
    | "out_of_range"
    | "low_accuracy"
    | "unverified"
    | "implausible_travel"
    | "already_earned_today"
    | "method_not_eligible"
    | null;
}
