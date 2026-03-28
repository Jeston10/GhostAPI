import type { Metadata } from "next";
import { AppToaster } from "@/components/ui/app-toaster";
import { Geist_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  adjustFontFallback: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "API Ghost — Instant mock APIs from schema",
  description:
    "Lightweight SaaS for developers: define a response schema, get a unique URL, and receive realistic dynamic mock data on every GET — no backend required.",
  icons: {
    icon: [{ url: "/GhostAPI%20Test.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
