import {
  MATERIALS_INDEX_KEY,
  errorResponse,
  json,
  materialIsActive,
  materialsStore,
  readJson
} from "./_shared.mjs";

export default async function handler(request) {
  if (request.method !== "GET") return new Response("Método no permitido", { status: 405 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return errorResponse("Falta identificar el material.");

  const materials = await readJson(MATERIALS_INDEX_KEY, []);
  const material = materials.find((item) => item.id === id);
  if (!material || !materialIsActive(material)) return errorResponse("El material ya no está disponible.", 404);

  const file = await materialsStore().get(material.storageKey, { type: "arrayBuffer" });
  if (!file) return json({ error: "El archivo ya no está disponible." }, 404);

  const inline = ["application/pdf", "image/jpeg", "image/png", "image/webp"].includes(material.mimeType);
  const disposition = inline ? "inline" : "attachment";
  return new Response(file, {
    headers: {
      "content-type": material.mimeType || "application/octet-stream",
      "content-length": String(material.sizeBytes),
      "content-disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(material.originalName)}`,
      "cache-control": "public, max-age=3600"
    }
  });
}
