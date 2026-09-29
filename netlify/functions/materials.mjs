import { randomUUID } from "node:crypto";
import {
  ALLOWED_FILES,
  AREAS,
  EXPIRATION_MONTHS,
  MATERIALS_INDEX_KEY,
  MAX_UPLOAD_BYTES,
  addCalendarMonths,
  areaById,
  assignedAreaIds,
  errorResponse,
  fileExtension,
  getUser,
  isAdmin,
  json,
  materialIsActive,
  materialResponse,
  materialsStore,
  methodNotAllowed,
  normalizedText,
  readJson,
  safeFileName,
  userDisplayName,
  userEmail,
  validateFile,
  writeJson
} from "./_shared.mjs";

function sortMaterials(materials) {
  return materials.slice().sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt));
}

async function listMaterials(request) {
  const url = new URL(request.url);
  const areaId = url.searchParams.get("area") || "";
  const query = normalizedText(url.searchParams.get("q"), 100).toLocaleLowerCase("es");
  const materials = await readJson(MATERIALS_INDEX_KEY, []);
  const visible = sortMaterials(materials)
    .filter(materialIsActive)
    .filter((material) => !areaId || material.areaId === areaId)
    .filter((material) => {
      if (!query) return true;
      return [material.title, material.description, material.areaName, material.grade]
        .join(" ")
        .toLocaleLowerCase("es")
        .includes(query);
    })
    .map(materialResponse);

  return json({ materials: visible, areas: AREAS });
}

async function uploadMaterial(request, context) {
  const user = getUser(context);
  if (!user) return errorResponse("Debes iniciar sesión como docente.", 401);
  const email = userEmail(user);
  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") return errorResponse("La información enviada no es válida.");

  const title = normalizedText(payload.title, 120);
  const description = normalizedText(payload.description, 500);
  const grade = normalizedText(payload.grade, 60);
  const areaId = normalizedText(payload.areaId, 80);
  const fileName = safeFileName(payload.fileName);
  const mimeType = normalizedText(payload.mimeType, 120).toLowerCase();
  const encodedFile = String(payload.data || "").replace(/^data:[^;]+;base64,/, "");

  if (title.length < 3) return errorResponse("Escribe un título de al menos 3 caracteres.");
  if (!areaById(areaId)) return errorResponse("Selecciona un área válida.");
  if (!encodedFile) return errorResponse("Selecciona un archivo para publicar.");

  const allowedAreas = await assignedAreaIds(email);
  if (!isAdmin(user) && !allowedAreas.includes(areaId)) {
    return errorResponse("No tienes asignada el área seleccionada.", 403);
  }

  let buffer;
  try {
    buffer = Buffer.from(encodedFile, "base64");
  } catch {
    return errorResponse("No se pudo leer el archivo.");
  }
  const validation = validateFile(fileName, mimeType, buffer.byteLength);
  if (validation.error) return errorResponse(validation.error);

  const id = randomUUID();
  const now = new Date();
  const material = {
    id,
    storageKey: `file-${id}`,
    originalName: fileName,
    title,
    description,
    grade,
    areaId,
    areaName: areaById(areaId).name,
    mimeType: mimeType || ALLOWED_FILES[validation.extension][0],
    extension: fileExtension(fileName),
    sizeBytes: buffer.byteLength,
    ownerEmail: email,
    ownerName: userDisplayName(user),
    createdAt: now.toISOString(),
    expiresAt: addCalendarMonths(now, EXPIRATION_MONTHS).toISOString()
  };

  const store = materialsStore();
  try {
    await store.set(material.storageKey, buffer);
    const materials = await readJson(MATERIALS_INDEX_KEY, []);
    await writeJson(MATERIALS_INDEX_KEY, [material, ...materials]);
  } catch (error) {
    await store.delete(material.storageKey).catch(() => {});
    console.error("No se pudo guardar el material:", error);
    return errorResponse("No se pudo guardar el material. Inténtalo nuevamente.", 500);
  }

  return json({ material: materialResponse(material) }, 201);
}

async function updateMaterial(request, context) {
  const user = getUser(context);
  if (!user) return errorResponse("Debes iniciar sesión como docente.", 401);
  const email = userEmail(user);
  const payload = await request.json().catch(() => null);
  const id = normalizedText(payload?.id, 80);
  const materials = await readJson(MATERIALS_INDEX_KEY, []);
  const index = materials.findIndex((material) => material.id === id);
  if (index < 0 || !materialIsActive(materials[index])) return errorResponse("El material no existe.", 404);

  const material = materials[index];
  if (!isAdmin(user) && material.ownerEmail !== email) return errorResponse("No puedes modificar este material.", 403);
  const areaId = normalizedText(payload.areaId || material.areaId, 80);
  const allowedAreas = await assignedAreaIds(email);
  if (!isAdmin(user) && !allowedAreas.includes(areaId)) return errorResponse("No tienes asignada el área seleccionada.", 403);
  if (!areaById(areaId)) return errorResponse("Selecciona un área válida.");

  materials[index] = {
    ...material,
    title: normalizedText(payload.title, 120) || material.title,
    description: normalizedText(payload.description, 500),
    grade: normalizedText(payload.grade, 60),
    areaId,
    areaName: areaById(areaId).name,
    updatedAt: new Date().toISOString()
  };
  await writeJson(MATERIALS_INDEX_KEY, materials);
  return json({ material: materialResponse(materials[index]) });
}

async function deleteMaterial(request, context) {
  const user = getUser(context);
  if (!user) return errorResponse("Debes iniciar sesión como docente.", 401);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return errorResponse("Falta identificar el material.");

  const materials = await readJson(MATERIALS_INDEX_KEY, []);
  const material = materials.find((item) => item.id === id);
  if (!material) return errorResponse("El material no existe.", 404);
  if (!isAdmin(user) && material.ownerEmail !== userEmail(user)) {
    return errorResponse("No puedes eliminar este material.", 403);
  }

  await materialsStore().delete(material.storageKey);
  await writeJson(MATERIALS_INDEX_KEY, materials.filter((item) => item.id !== id));
  return json({ deleted: true });
}

export default async function handler(request, context) {
  try {
    if (request.method === "GET") return listMaterials(request);
    if (request.method === "POST") return uploadMaterial(request, context);
    if (request.method === "PUT") return updateMaterial(request, context);
    if (request.method === "DELETE") return deleteMaterial(request, context);
    return methodNotAllowed(["GET", "POST", "PUT", "DELETE"]);
  } catch (error) {
    console.error("Error en materials:", error);
    return errorResponse("Ocurrió un error inesperado.", 500);
  }
}
