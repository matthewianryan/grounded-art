function safeReturnTo(value: string | undefined): string {
  if (!value || !value.startsWith("/app/")) return "/app/map";
  return value;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.returnTo);

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <p className="text-sm uppercase tracking-[0.16em] text-muted">Account required</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Sign in to continue</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Profile, wallet, and check-in actions are gated behind an account. Browsing the map
        and feed stays open.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-muted">
        The full sign-in flow lands with the account and wallet phase. This page keeps the
        return path for the action you selected.
      </p>
      <a
        href={returnTo}
        className="mt-8 inline-flex rounded-full border border-line px-4 py-2 text-sm text-muted transition hover:border-ink hover:text-ink"
      >
        Back to Grounded Art
      </a>
    </main>
  );
}
