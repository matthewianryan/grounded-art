"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";

function isProfileRoute(pathname: string) {
  return pathname === "/profile" || pathname.startsWith("/profile/");
}

export function LayoutFooter() {
  const pathname = usePathname();
  if (isProfileRoute(pathname)) return null;
  return <SiteFooter />;
}
