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
    redirect(signInHref("/app/profile"));
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <header>
        <p className="text-sm uppercase tracking-[0.16em] text-muted">Your space</p>
        <h1 className="mt-2 font-display text-3xl tracking-tight">Profile</h1>
      </header>

      <ProfileSectionNav />

      <div className="mt-8">{children}</div>
    </div>
  );
}
