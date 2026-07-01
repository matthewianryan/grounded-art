import { redirect } from "next/navigation";
import { ProfileEmptyState } from "@/components/profile-ui";
import { getCheckIns, getSessionCookieHeader } from "@/lib/api";
import { signInHref } from "@/lib/auth-gate";

export default async function ProfileCheckInsPage() {
  const cookieHeader = await getSessionCookieHeader();
  if (!cookieHeader) redirect(signInHref("/profile/check-ins"));

  const checkIns = await getCheckIns(cookieHeader);

  return (
    <section aria-labelledby="check-ins-heading">
      <h2 id="check-ins-heading" className="ga-display-sub">
        Check-ins
      </h2>

      {checkIns.items.length === 0 ? (
        <div className="mt-6">
          <ProfileEmptyState
            title="No check-ins yet"
            body="When you check in at a gallery, your history will appear here."
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {checkIns.items.map((item) => (
            <li
              key={item.id}
              className="rounded-card border border-line bg-card-bg px-4 py-3 shadow-card"
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="ga-display-card">{item.gallery_name}</p>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs ${
                    item.verified
                      ? "border-ink text-ink"
                      : "border-line text-muted"
                  }`}
                >
                  {item.verified ? "Verified" : "Unverified"}
                </span>
              </div>
              <p className="ga-body mt-1">
                {new Date(item.checked_in_at).toLocaleString()}
                {item.point_awarded ? " · +1 point" : null}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
