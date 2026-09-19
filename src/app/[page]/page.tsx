import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Shell from "@/components/eventheme/Shell";
import {
  About,
  Catalog,
  Events,
  Legal,
  Services,
} from "@/components/eventheme/Pages";
import InquiryForm from "@/components/eventheme/InquiryForm";
import QuoteStudio from "@/components/eventheme/QuoteStudio";
const titles: Record<string, string> = {
  evenements: "Vos événements",
  services: "Nos services",
  location: "Location de matériel",
  realisations: "Réalisations & inspirations",
  "a-propos": "À propos",
  contact: "Contact",
  devis: "Mon devis",
  "mentions-legales": "Mentions légales",
  "politique-de-confidentialite": "Politique de confidentialité",
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  return {
    title: titles[page],
    description: `${titles[page] || "Eventheme"} — Organisation, animation, décoration et location événementielle au Maroc.`,
  };
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ event?: string }>;
}) {
  const { page } = await params;
  const query = await searchParams;
  if (!titles[page]) notFound();
  return (
    <Shell>
      {page === "evenements" ? (
        <Events />
      ) : page === "services" ? (
        <Services />
      ) : page === "location" ? (
        <Catalog />
      ) : page === "realisations" ? (
        <Catalog projects />
      ) : page === "a-propos" ? (
        <About />
      ) : page === "contact" ? (
        <InquiryForm />
      ) : page === "devis" ? (
        <QuoteStudio as="h1" eventId={query.event || ""} />
      ) : (
        <Legal privacy={page === "politique-de-confidentialite"} />
      )}
    </Shell>
  );
}
