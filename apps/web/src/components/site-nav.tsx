import { PillNav, type PillNavLink } from "@grounded-art/ui";

const links: PillNavLink[] = [
  { href: "/map", label: "Map" },
  { href: "/feed", label: "Feed" },
  { href: "/profile", label: "Profile" },
  // Contact lives on the landing zone (outside the /app basePath), so it is a cross-zone
  // anchor rather than an in-app route. Matches the footer link and the Phase 6 nav spec.
  { href: "/contact", label: "Contact us", crossZone: true },
];

export function SiteNav() {
  return <PillNav links={links} wordmarkExternal />;
}
