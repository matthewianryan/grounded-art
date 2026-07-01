import { redirect } from "next/navigation";
import { ProfileSectionNav } from "@/components/profile-section-nav";
import { getMe, getSessionCookieHeader } from "@/lib/api";
import { signInHref } from "@/lib/auth-gate";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieHeader = await getSessionCookieHeader();
  const account = await getMe(cookieHeader);

  if (!account) {
    redirect(signInHref("/profile"));
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <header>
        <p className="ga-kicker">Your space</p>
        <h1 className="ga-display-section mt-5">Profile</h1>
      </header>

      <ProfileSectionNav />

      <div className="mt-8">{children}</div>
    </div>
  );
}
