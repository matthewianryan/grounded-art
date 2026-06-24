import Image from "next/image";
import { Reveal } from "./reveal";

// Speaks to the gallery and artist side. In v1 the gallery-interest signup is a direct email
// rather than a form, with a short POPIA note on how we handle the address.
export function SectionGalleries() {
  return (
    <section id="galleries" className="scroll-mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-16">
        <Reveal className="order-2 lg:order-1">
          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-sm bg-line/40">
            <Image
              src="/images/gallery-interior.jpg"
              alt="A bright gallery interior hung with contemporary work."
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <Reveal delay={0.1} className="order-1 lg:order-2">
          <p className="text-sm uppercase tracking-[0.2em] text-accent">For galleries and artists</p>
          <h2 className="mt-5 font-display text-4xl leading-tight sm:text-5xl">
            Be found by people looking for exactly this.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
            If you run a gallery, curate a space, or make work in Cape Town, we would love to
            feature you. Tell us who you are and we will be in touch.
          </p>
          <div className="mt-8">
            <a
              href="mailto:galleries@grounded-art.co.za?subject=We%20want%20to%20be%20on%20Grounded%20Art"
              className="inline-flex rounded-full bg-ink px-6 py-3 text-sm font-medium text-paper transition hover:bg-accent"
            >
              Email us about your space
            </a>
          </div>
          <p className="mt-5 max-w-md text-xs leading-relaxed text-muted">
            We only use your email to talk to you about being featured on Grounded Art, in line
            with POPIA. We will not share it, and you can ask us to remove it at any time.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
