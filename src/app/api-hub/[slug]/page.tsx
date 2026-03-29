import { ApiHubDetail } from "@/components/api-hub/api-hub-detail";
import { ApiHubShell } from "@/components/api-hub/api-hub-shell";
import { CURATED_APIS, getCuratedApi } from "@/lib/api-hub-catalog";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return CURATED_APIS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getCuratedApi(slug);
  if (!entry) {
    return { title: "API Hub — GhostAPI" };
  }
  return {
    title: `${entry.name} — API Hub`,
    description: entry.tagline,
  };
}

export default async function ApiHubDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = getCuratedApi(slug);
  if (!entry) notFound();

  return (
    <ApiHubShell navVariant="detail">
      <ApiHubDetail entry={entry} />
    </ApiHubShell>
  );
}
