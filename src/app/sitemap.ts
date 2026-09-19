import type { MetadataRoute } from "next";
import { getEntries } from "@/lib/eventheme/server";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!process.env.APP_URL) return [];
  const base = process.env.APP_URL.replace(/\/$/, "");
  const paths = [
    "",
    "/evenements",
    "/services",
    "/location",
    "/realisations",
    "/a-propos",
    "/contact",
    "/devis",
    "/mentions-legales",
    "/politique-de-confidentialite",
  ];
  (await getEntries())
    .filter((e) => e.kind === "products" || e.kind === "projects")
    .forEach((e) =>
      paths.push(
        `/${e.kind === "products" ? "location" : "realisations"}/${e.id}`,
      ),
    );
  return paths.map((path) => ({
    url: base + path,
    changeFrequency: "weekly",
    priority: path ? 0.7 : 1,
  }));
}
