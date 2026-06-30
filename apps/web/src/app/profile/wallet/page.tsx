import { redirect } from "next/navigation";
import { ProfileEmptyState } from "@/components/profile-ui";
import { getSessionCookieHeader, getWallet } from "@/lib/api";
import { signInHref } from "@/lib/auth-gate";

export default async function ProfileWalletPage() {
  const cookieHeader = await getSessionCookieHeader();
  if (!cookieHeader) redirect(signInHref("/app/profile/wallet"));

  const wallet = await getWallet(cookieHeader);

  return (
    <section aria-labelledby="wallet-heading">
      <h2 id="wallet-heading" className="font-display text-2xl tracking-tight">
        Wallet
      </h2>

      {wallet.transactions.length === 0 ? (
        <div className="mt-6">
          <ProfileEmptyState
            title="No points yet"
            body="Check in at a gallery to earn your first point."
          />
        </div>
      ) : (
        <div className="mt-6 rounded-card border border-line bg-card-bg p-5 shadow-card">
          <p className="text-xs uppercase tracking-[0.16em] text-wallet-muted">Balance</p>
          <p className="mt-2 font-display text-4xl text-wallet-balance">{wallet.balance}</p>
          <p className="mt-1 text-sm text-wallet-muted">points earned</p>
          <ul className="mt-6 space-y-3 border-t border-line pt-4">
            {wallet.transactions.map((tx) => (
              <li key={tx.id} className="flex items-baseline justify-between text-sm">
                <span className="text-muted">
                  {tx.gallery_name ?? tx.reason.replaceAll("_", " ")}
                </span>
                <span className={tx.delta > 0 ? "text-wallet-credit" : "text-muted"}>
                  {tx.delta > 0 ? `+${tx.delta}` : tx.delta}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
