import type { Metadata } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@/components/Analytics";
import { PageViewTracker } from "@/components/PageViewTracker";

export const metadata: Metadata = {
  title: "Promptr",
  description: "Capture and recall AI insights effortlessly.",
  icons: {
    icon: "/favicon.ico.png",
    shortcut: "/favicon.ico.png",
    apple: "/favicon.ico.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-50 antialiased">
        <GoogleAnalytics />
        <PageViewTracker />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
