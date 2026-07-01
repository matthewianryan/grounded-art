import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";
import { AuthProvider } from "@/components/auth-provider";
import { UserActionsProvider } from "@/components/user-actions-provider";

export const metadata: Metadata = {
  title: "Grounded Art",
  description:
    "Cape Town's galleries, exhibitions, and artists, in one place and kept current.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const themeScript = `(function(){try{var t=localStorage.getItem('ga-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh overflow-x-hidden bg-paper font-sans text-ink antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <AuthProvider>
          <UserActionsProvider>
            <SiteNav />
            {children}
          </UserActionsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
