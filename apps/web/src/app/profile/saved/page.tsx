import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileEmptyState } from "@/components/profile-ui";
import { getSaved, getSessionCookieHeader } from "@/lib/api";
import { signInHref } from "@/lib/auth-gate";

export default async function ProfileSavedPage() {
  const cookieHeader = await getSessionCookieHeader();
  if (!cookieHeader) redirect(signInHref("/app/profile/saved"));

  const saved = await getSaved(cookieHeader);

  return (
    <section aria-labelledby="saved-heading">
      <h2 id="saved-heading" className="font-display text-2xl tracking-tight">
        Saved
      </h2>

      {saved.items.length === 0 ? (
        <div className="mt-6">
          <ProfileEmptyState
            title="Nothing saved yet"
            body="Save galleries and feed items from the map or feed. They will show up here."
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {saved.items.map((item) => {
            const title =
              item.feed_item?.title ?? item.gallery?.name ?? item.slug;
            const href =
              item.kind === "feed"
                ? `/feed/${item.slug}`
                : `/map?gallery=${encodeURIComponent(item.slug)}`;
            const subtitle =
              item.kind === "feed"
                ? "Feed item"
                : item.gallery?.suburb ?? "Gallery";

            return (
              <li key={`${item.kind}:${item.slug}`}>
                <Link
                  href={href}
                  className="block rounded-card border border-line bg-card-bg px-4 py-3 shadow-card transition hover:border-ink"
                >
                  <p className="font-display text-lg tracking-tight">{title}</p>
                  <p className="mt-1 text-sm text-muted">{subtitle}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
