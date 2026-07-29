import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
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

export const metadata: Metadata = {
  title: APP_NAME,
  description: "A beautiful, minimal place to read books online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontSerif.variable}`}>
        <AppProviders>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
