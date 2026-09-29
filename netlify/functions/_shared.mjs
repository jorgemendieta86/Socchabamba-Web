import { getStore } from "@netlify/blobs";

export const MATERIALS_INDEX_KEY = "materials-index";
export const ASSIGNMENTS_KEY = "teacher-assignments";
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const EXPIRATION_MONTHS = 2;

export const AREAS = [
  { id: "matematica", name: "Matemática" },
  { id: "comunicacion", name: "Comunicación" },
  { id: "ciencia-tecnologia", name: "Ciencia y Tecnología" },
  { id: "ciencias-sociales", name: "Ciencias Sociales" },
  { id: "ingles", name: "Inglés" },
  { id: "educacion-fisica", name: "Educación Física" },
  { id: "educacion-trabajo", name: "Educación para el Trabajo" },
  { id: "arte-cultura", name: "Arte y Cultura" },
  { id: "dpcc", name: "Desarrollo Personal, Ciudadanía y Cívica" },
  { id: "educacion-religiosa", name: "Educación Religiosa" }
];

export const ALLOWED_FILES = {
  pdf: ["application/pdf"],
  doc: ["application/msword", "application/octet-stream"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/octet-stream"],
  ppt: ["application/vnd.ms-powerpoint", "application/octet-stream"],
  pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "application/octet-stream"],
  xls: ["application/vnd.ms-excel", "application/octet-stream"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/octet-stream"],
  odt: ["application/vnd.oasis.opendocument.text", "application/octet-stream"],
  odp: ["application/vnd.oasis.opendocument.presentation", "application/octet-stream"],
  ods: ["application/vnd.oasis.opendocument.spreadsheet", "application/octet-stream"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  png: ["image/png"],
  webp: ["image/webp"]
};

function contextName() {
  const raw = process.env.CONTEXT || "local";
  return raw.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

export function materialsStore() {
  return getStore({ name: `docentes-materiales-${contextName()}` });
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

export function errorResponse(message, status = 400, details = undefined) {
  return json({ error: message, ...(details ? { details } : {}) }, status);
}

export function methodNotAllowed(methods) {
  return new Response(JSON.stringify({ error: "Método no permitido" }), {
    status: 405,
    headers: {
      "allow": methods.join(", "),
      "content-type": "application/json; charset=utf-8"
    }
  });
}

export function getUser(context) {
  return context?.clientContext?.user || context?.user || null;
}

export function userEmail(user) {
  return String(user?.email || "").trim().toLowerCase();
}

export function isAdmin(user) {
  const email = userEmail(user);
  const configuredAdmins = String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  const roles = [
    ...(Array.isArray(user?.app_metadata?.roles) ? user.app_metadata.roles : []),
    ...(Array.isArray(user?.user_metadata?.roles) ? user.user_metadata.roles : [])
  ].map((role) => String(role).toLowerCase());
  return configuredAdmins.includes(email) || roles.includes("admin");
}

export async function readJson(key, fallback) {
  const value = await materialsStore().get(key, { type: "json" });
  return value === null || value === undefined ? fallback : value;
}

export async function writeJson(key, value) {
  await materialsStore().setJSON(key, value);
}

export async function getAssignments() {
  const value = await readJson(ASSIGNMENTS_KEY, {});
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export async function assignedAreaIds(email) {
  const assignments = await getAssignments();
  const record = assignments[email];
  return Array.isArray(record) ? record : Array.isArray(record?.areaIds) ? record.areaIds : [];
}

export function areaById(areaId) {
  return AREAS.find((area) => area.id === areaId) || null;
}

export function addCalendarMonths(date, months) {
  const result = new Date(date);
  const originalDay = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(originalDay, lastDay));
  return result;
}

export function normalizedText(value, maxLength) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maxLength);
}

export function safeFileName(value) {
  return String(value || "archivo")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "archivo";
}

export function fileExtension(fileName) {
  const parts = String(fileName || "").toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : "";
}

export function validateFile(fileName, mimeType, byteLength) {
  const extension = fileExtension(fileName);
  const allowedTypes = ALLOWED_FILES[extension];
  if (!allowedTypes || (mimeType && !allowedTypes.includes(mimeType))) {
    return { error: "El formato del archivo no está permitido." };
  }
  if (!Number.isFinite(byteLength) || byteLength <= 0) {
    return { error: "El archivo está vacío o no es válido." };
  }
  if (byteLength > MAX_UPLOAD_BYTES) {
    return { error: "El archivo supera el límite de 4 MB." };
  }
  return { extension };
}

export function materialIsActive(material) {
  return material && new Date(material.expiresAt).getTime() > Date.now();
}

export function materialResponse(material) {
  return {
    ...material,
    downloadUrl: `/.netlify/functions/materials-file?id=${encodeURIComponent(material.id)}`
  };
}

export function userDisplayName(user) {
  return normalizedText(user?.user_metadata?.full_name || user?.user_metadata?.name || userEmail(user), 120);
}
