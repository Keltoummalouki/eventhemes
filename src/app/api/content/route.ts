import { getEntries } from "@/lib/eventheme/server";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json(await getEntries());
  } catch {
    return Response.json(
      { error: "Le contenu est momentanément indisponible." },
      { status: 503 },
    );
  }
}
