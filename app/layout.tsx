import { Toaster } from "sonner";
import type { Metadata } from "next";
import { Outfit, Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { JotaiProvider } from "@/components/providers/jotai-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";

import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["italic"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Aegis",
    template: "%s | Aegis",
  },
  description: "",
  keywords: [],
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/isotipo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="es" suppressHydrationWarning>
        <body
          className={`${outfit.variable} ${cormorant.variable} ${jetbrainsMono.variable} font-sans antialiased`}
        >
          <NuqsAdapter>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              storageKey="nexus-theme"
            >
              <ConvexClientProvider>
                <JotaiProvider>
                  {children}
                  <ModalProvider />
                  <Toaster />
                </JotaiProvider>
              </ConvexClientProvider>
            </ThemeProvider>
          </NuqsAdapter>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
