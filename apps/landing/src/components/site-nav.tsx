import { PillNav, type PillNavLink } from "@grounded-art/ui";
import { appHref } from "@/lib/app-url";

const links: PillNavLink[] = [
  { href: appHref("/map"), label: "Map", crossZone: true },
  { href: appHref("/feed"), label: "Feed", crossZone: true },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact us" },
];

export function SiteNav() {
  return <PillNav links={links} />;
}
