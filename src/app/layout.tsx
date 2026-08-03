import type { Metadata, Viewport } from "next";
import { Inter, Lora, Merriweather } from "next/font/google";
import { AppProviders } from "@/providers/app-providers";
import { AppShell } from "@/components/layout/app-shell";
import { APP_NAME } from "@/constants";
import "./globals.css";

// UI/chrome typeface — clean, modern, used for headings and interface text.
const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Reading typeface — comfortable serif reserved for long-form book content
// in the Reader module; exposed globally now so that module can consume it
// without touching this foundation again.
const fontSerif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

// Third Reader typeface option ("Literary") — a classic book-typesetting
// serif, distinct from the UI's Lora so the two serif choices feel different.
const fontLiterary = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-literary",
  display: "swap",
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "A beautiful, minimal place to read books online.",
  // Favicon / apple-touch-icon are auto-detected by Next.js from
  // src/app/icon.png, apple-icon.png, and favicon.ico (file convention) —
  // no need to declare them here too.
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#FE0227",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontSerif.variable} ${fontLiterary.variable}`}>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
