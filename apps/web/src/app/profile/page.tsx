import { redirect } from "next/navigation";
import { ProfileAvatar, ProfileEditLink } from "@/components/profile-ui";
import { getMe, getSessionCookieHeader } from "@/lib/api";
import { signInHref } from "@/lib/auth-gate";

export default async function ProfileHomePage() {
  const cookieHeader = await getSessionCookieHeader();
  const account = await getMe(cookieHeader);
  if (!account) redirect(signInHref("/app/profile"));

  return (
    <section aria-labelledby="profile-summary-heading">
      <div className="flex items-start gap-5">
        <ProfileAvatar account={account} />
        <div className="min-w-0 flex-1">
          <h2 id="profile-summary-heading" className="font-display text-2xl tracking-tight">
            {account.display_name}
          </h2>
          {account.title ? <p className="mt-1 text-sm text-muted">{account.title}</p> : null}
          {account.bio ? (
            <p className="mt-3 text-sm leading-relaxed text-muted">{account.bio}</p>
          ) : (
            <p className="mt-3 text-sm text-muted">No bio yet.</p>
          )}
          <div className="mt-4">
            <ProfileEditLink />
          </div>
        </div>
      </div>
    </section>
  );
}
