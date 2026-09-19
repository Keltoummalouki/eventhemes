import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { authClient, localMode, requireAdmin } from "@/lib/eventheme/server";
import { checkOrigin, readBytes } from "@/lib/eventheme/http";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    await requireAdmin();
    if (Number(request.headers.get("content-length")) > 9 * 1024 * 1024)
      throw new Error("La photo doit peser moins de 8 Mo.");
    const body = await readBytes(request, 9 * 1024 * 1024);
    const form = await new Response(Uint8Array.from(body), { headers: { 'Content-Type': request.headers.get('content-type') || '' } }).formData();
    const file = form.get("file");
    if (!(file instanceof File) || file.size > 8 * 1024 * 1024)
      throw new Error("Photo invalide ou trop volumineuse (8 Mo maximum).");
    const extensions: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    };
    const extension = extensions[file.type];
    if (!extension) throw new Error("Utilisez une photo JPEG, PNG ou WebP.");
    const bytes = Buffer.from(await file.arrayBuffer());
    const valid =
      extension === "jpg"
        ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        : extension === "png"
          ? bytes
              .subarray(0, 8)
              .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
          : bytes.subarray(0, 4).toString() === "RIFF" &&
            bytes.subarray(8, 12).toString() === "WEBP";
    if (!valid)
      throw new Error("Le fichier ne correspond pas à une image reconnue.");
    const name = `${randomUUID()}.${extension}`;
    if (localMode()) {
      const directory = path.join(process.cwd(), "public", "uploads");
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, name), bytes);
      return Response.json({ url: `/uploads/${name}` });
    }
    const client = await authClient();
    const { error } = await client.storage
      .from("eventheme-media")
      .upload(name, bytes, { contentType: file.type, upsert: false });
    if (error) throw error;
    return Response.json({
      url: client.storage.from("eventheme-media").getPublicUrl(name).data
        .publicUrl,
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Import impossible." },
      { status: 400 },
    );
  }
}
