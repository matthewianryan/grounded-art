import { PillNav, type PillNavLink } from "@grounded-art/ui";
import { mapHref, feedHref } from "@/lib/app-url";

const links: PillNavLink[] = [
  { href: mapHref(), label: "Map", crossZone: true },
  { href: feedHref(), label: "Feed", crossZone: true },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact us" },
];

export function SiteNav() {
  return <PillNav links={links} />;
}
