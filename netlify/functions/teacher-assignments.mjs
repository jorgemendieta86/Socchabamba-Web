import {
  AREAS,
  assignedAreaIds,
  errorResponse,
  getAssignments,
  getUser,
  isAdmin,
  json,
  methodNotAllowed,
  normalizedText,
  userEmail,
  writeJson
} from "./_shared.mjs";

function ensureAdmin(context) {
  const user = getUser(context);
  return user && isAdmin(user) ? user : null;
}

export default async function handler(request, context) {
  const admin = ensureAdmin(context);
  if (!admin) return errorResponse("Solo un administrador puede gestionar las áreas docentes.", 403);

  if (request.method === "GET") {
    const assignments = await getAssignments();
    return json({ assignments, areas: AREAS });
  }

  if (request.method === "PUT") {
    const payload = await request.json().catch(() => null);
    const email = normalizedText(payload?.email, 160).toLowerCase();
    const areaIds = Array.isArray(payload?.areaIds) ? [...new Set(payload.areaIds.map((value) => normalizedText(value, 80)))] : [];
    if (!email || !email.includes("@")) return errorResponse("Escribe un correo docente válido.");
    if (areaIds.some((areaId) => !AREAS.some((area) => area.id === areaId))) {
      return errorResponse("Una de las áreas seleccionadas no es válida.");
    }

    const assignments = await getAssignments();
    if (areaIds.length === 0) {
      delete assignments[email];
    } else {
      assignments[email] = {
        areaIds,
        updatedAt: new Date().toISOString(),
        updatedBy: userEmail(admin)
      };
    }
    await writeJson("teacher-assignments", assignments);
    return json({ assignments });
  }

  return methodNotAllowed(["GET", "PUT"]);
}
