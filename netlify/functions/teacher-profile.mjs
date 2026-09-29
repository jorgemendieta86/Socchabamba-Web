import {
  AREAS,
  MATERIALS_INDEX_KEY,
  assignedAreaIds,
  getUser,
  isAdmin,
  json,
  materialIsActive,
  materialResponse,
  methodNotAllowed,
  readJson,
  userDisplayName,
  userEmail
} from "./_shared.mjs";

export default async function handler(request, context) {
  if (request.method !== "GET") return methodNotAllowed(["GET"]);
  const user = getUser(context);
  if (!user) return json({ error: "Debes iniciar sesión como docente." }, 401);

  const email = userEmail(user);
  const areaIds = await assignedAreaIds(email);
  const materials = await readJson(MATERIALS_INDEX_KEY, []);
  const ownMaterials = materials
    .filter((material) => material.ownerEmail === email && materialIsActive(material))
    .sort((first, second) => new Date(second.createdAt) - new Date(first.createdAt))
    .map(materialResponse);

  return json({
    user: { email, name: userDisplayName(user), isAdmin: isAdmin(user) },
    areas: AREAS.filter((area) => areaIds.includes(area.id)),
    materials: ownMaterials
  });
}
