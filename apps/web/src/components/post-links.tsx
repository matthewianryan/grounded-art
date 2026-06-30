import type { FeedItemLink } from "@/lib/types";

/** A short list of social and site links on a post. Renders nothing when there are none. */
export function PostLinks({ links }: { links: FeedItemLink[] }) {
  if (links.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {links.map((link) => (
        <li key={link.id}>
          <a
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-sm text-muted transition hover:border-ink hover:text-ink"
          >
            {link.label}
            <ExternalLinkIcon />
          </a>
        </li>
      ))}
    </ul>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M14 4h6v6M10 14L20 4M18 14v6H4V6h6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
