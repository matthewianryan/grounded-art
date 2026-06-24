import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Hero } from "@/components/hero";
import { SectionAtlas } from "@/components/section-atlas";
import { SectionFeed } from "@/components/section-feed";
import { SectionOneSpace } from "@/components/section-onespace";
import { SectionGalleries } from "@/components/section-galleries";
import { SectionHumanLocal } from "@/components/section-humanlocal";
import { SectionClosing } from "@/components/section-closing";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <SectionAtlas />
        <SectionFeed />
        <SectionOneSpace />
        <SectionGalleries />
        <SectionHumanLocal />
        <SectionClosing />
      </main>
      <SiteFooter />
    </>
  );
}
