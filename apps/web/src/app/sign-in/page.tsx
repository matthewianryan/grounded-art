import { SignInFlow } from "@/components/sign-in-flow";

function safeReturnTo(value: string | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/map";
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
      <p className="ga-kicker">Account</p>
      <h1 className="ga-display-page mt-5">Continue with email</h1>
      <p className="ga-body-intro mt-7 max-w-md">
        Sign in or create an account with a one-time code. Browsing the map and feed stays
        open without an account.
      </p>
      <div className="mt-8">
        <SignInFlow returnTo={returnTo} />
      </div>
    </main>
  );
}
