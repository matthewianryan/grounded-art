import Link from "next/link";

export interface WordmarkLinkProps {
  href?: string;
  /** Use a plain anchor for cross-zone navigation (e.g. web app wordmark to landing /). */
  external?: boolean;
}

// Noto Serif wordmark with a short rust rule beneath "Grounded Art".
export function WordmarkLink({ href = "/", external = false }: WordmarkLinkProps) {
  const className = "inline-flex flex-col";
  const content = (
    <>
      <span className="font-display text-lg font-normal leading-none">Grounded Art</span>
      <span className="mt-1.5 h-px w-7 bg-accent" aria-hidden="true" />
    </>
  );

  if (external) {
    return (
      <a href={href} className={className} aria-label="Grounded Art home">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className} aria-label="Grounded Art home">
      {content}
    </Link>
  );
}
