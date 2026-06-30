import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://grounded-art.co.za";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Grounded Art | Cape Town's living atlas of art",
    template: "%s | Grounded Art",
  },
  description:
    "Cape Town's galleries, exhibitions, and artists in one place and kept current. A curated, human-made atlas and feed of local art.",
  keywords: [
    "Cape Town art",
    "Cape Town galleries",
    "art exhibitions Cape Town",
    "South African art",
    "art openings",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: SITE_URL,
    siteName: "Grounded Art",
    title: "Grounded Art | Cape Town's living atlas of art",
    description:
      "Every gallery, exhibition, and opening in one place, kept current. Curated and made by people in Cape Town.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grounded Art | Cape Town's living atlas of art",
    description:
      "Every gallery, exhibition, and opening in one place, kept current. Curated and made by people in Cape Town.",
  },
};

const themeScript = `(function(){try{var t=localStorage.getItem('ga-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-paper text-ink font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
      </body>
    </html>
  );
}
