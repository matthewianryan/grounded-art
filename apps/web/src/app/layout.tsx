import type { Metadata } from "next";
import { DM_Sans, Noto_Serif } from "next/font/google";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { UserActionsProvider } from "@/components/user-actions-provider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Grounded Art",
  description:
    "Cape Town's galleries, exhibitions, and artists, in one place and kept current.",
};

const themeScript = `(function(){try{var t=localStorage.getItem('ga-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${dmSans.variable} ${notoSerif.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-paper text-ink font-sans antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <UserActionsProvider>
          <SiteNav />
          <div className="flex-1">{children}</div>
        </UserActionsProvider>
      </body>
    </html>
  );
}
