import { redirect } from "next/navigation";
import { AccountEditor } from "@/components/account-editor";
import { getMe, getSessionCookieHeader } from "@/lib/api";
import { signInHref } from "@/lib/auth-gate";

export default async function ProfileAccountPage() {
  const cookieHeader = await getSessionCookieHeader();
  const account = await getMe(cookieHeader);
  if (!account) redirect(signInHref("/app/profile/account"));

  return (
    <section aria-labelledby="account-heading">
      <h2 id="account-heading" className="ga-display-sub">
        Account
      </h2>
      <div className="mt-6">
        <AccountEditor account={account} />
      </div>
    </section>
  );
}
