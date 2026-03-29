import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Hub — GhostAPI",
  description:
    "Curated free APIs by category—URLs, request/response examples, copy buttons, and a live Postman-style tester.",
};

export default function ApiHubLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
