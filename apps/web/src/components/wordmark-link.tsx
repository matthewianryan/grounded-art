import Link from "next/link";

// Noto Serif wordmark with a short rust rule beneath "Grounded" only.
export function WordmarkLink({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-baseline font-display text-lg leading-none"
      aria-label="Grounded Art home"
    >
      <span className="inline-flex flex-col">
        <span>Grounded</span>
        <span className="mt-1.5 h-px w-full bg-accent" aria-hidden="true" />
      </span>
      <span> Art</span>
    </Link>
  );
}
