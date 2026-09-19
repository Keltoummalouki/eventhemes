import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getEntries } from "@/lib/eventheme/server";
import Shell from "@/components/eventheme/Shell";
import { Detail } from "@/components/eventheme/Pages";
async function find(params: Promise<{ page: string; id: string }>) {
  const { page, id } = await params;
  if (!["location", "realisations"].includes(page)) return undefined;
  return (await getEntries()).find(
    (e) =>
      e.id === id && e.kind === (page === "location" ? "products" : "projects"),
  );
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string; id: string }>;
}): Promise<Metadata> {
  const entry = await find(params);
  return {
    title: entry?.title || "Page introuvable",
    description: entry?.description,
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ page: string; id: string }>;
}) {
  const entry = await find(params);
  if (!entry) notFound();
  return (
    <Shell>
      <Detail entry={entry} />
    </Shell>
  );
}
