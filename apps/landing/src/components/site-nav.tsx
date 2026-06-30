import { PillNav, type PillNavLink } from "@grounded-art/ui";

const links: PillNavLink[] = [
  { href: "/#atlas", label: "Map" },
  { href: "/#feed", label: "Feed" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact us" },
];

export function SiteNav() {
  return <PillNav links={links} />;
}
