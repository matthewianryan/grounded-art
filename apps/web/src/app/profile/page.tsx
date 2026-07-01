import { redirect } from "next/navigation";
import { ProfileAvatar, ProfileEditLink } from "@/components/profile-ui";
import { getMe, getSessionCookieHeader } from "@/lib/api";
import { signInHref } from "@/lib/auth-gate";

export default async function ProfileHomePage() {
  const cookieHeader = await getSessionCookieHeader();
  const account = await getMe(cookieHeader);
  if (!account) redirect(signInHref("/profile"));

  return (
    <section aria-labelledby="profile-summary-heading">
      <div className="flex items-start gap-5">
        <ProfileAvatar account={account} />
        <div className="min-w-0 flex-1">
          <h2 id="profile-summary-heading" className="ga-display-sub">
            {account.display_name}
          </h2>
          {account.title ? <p className="ga-body mt-1">{account.title}</p> : null}
          {account.bio ? (
            <p className="ga-body mt-3">{account.bio}</p>
          ) : (
            <p className="ga-body mt-3">No bio yet.</p>
          )}
          <div className="mt-4">
            <ProfileEditLink />
          </div>
        </div>
      </div>
    </section>
  );
}
