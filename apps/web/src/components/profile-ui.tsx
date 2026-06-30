import Link from "next/link";

export function ProfileAvatar({
  account,
  size = "lg",
}: {
  account: { display_name: string; avatar_url: string | null };
  size?: "lg" | "md";
}) {
  const dim = size === "lg" ? "h-20 w-20 text-2xl" : "h-12 w-12 text-lg";
  const initial = account.display_name.charAt(0).toUpperCase();

  if (account.avatar_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={account.avatar_url}
        alt=""
        className={`${dim} rounded-full border border-line object-cover`}
      />
    );
  }

  return (
    <div
      className={`${dim} flex items-center justify-center rounded-full border border-line bg-line/30 font-display`}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}

export function ProfileEditLink() {
  return (
    <Link href="/profile/account" className="text-sm text-muted transition hover:text-ink">
      Edit profile
    </Link>
  );
}

export function ProfileEmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-card border border-line bg-card-bg p-8 text-center shadow-card">
      <h2 className="font-display text-xl tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </div>
  );
}
