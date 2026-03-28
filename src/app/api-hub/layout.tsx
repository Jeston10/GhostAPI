import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Hub — GhostAPI",
  description:
    "Browse free public APIs (same catalog as Free APIs browse), test endpoints, and send templates to the mock playground.",
};

export default function ApiHubLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
