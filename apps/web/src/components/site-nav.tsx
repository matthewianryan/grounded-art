import { PillNav, type PillNavLink } from "@grounded-art/ui";

const links: PillNavLink[] = [
  { href: "/map", label: "Map" },
  { href: "/feed", label: "Feed" },
  { href: "/profile", label: "Profile" },
];

export function SiteNav() {
  return <PillNav links={links} wordmarkExternal />;
}
