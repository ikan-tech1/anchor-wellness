import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist } from "next/font/google";
import { ThemeProvider } from "@anchor/ui";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Anchor — AI Wellness Companion",
  description:
    "Talk or type your day. Anchor turns it into a beautiful journal, mood log, and guided wellness journey.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Anchor",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f3" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1714" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const clerkEnabled =
  clerkPublishableKey?.startsWith("pk_") && clerkPublishableKey.length > 20;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const shell = (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans grain min-h-screen`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );

  if (!clerkEnabled) {
    return shell;
  }

  return <ClerkProvider publishableKey={clerkPublishableKey}>{shell}</ClerkProvider>;
}
