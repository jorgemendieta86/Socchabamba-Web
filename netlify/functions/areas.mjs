import { AREAS, json, methodNotAllowed } from "./_shared.mjs";

export default async function handler(request) {
  if (request.method !== "GET") return methodNotAllowed(["GET"]);
  return json({ areas: AREAS });
}
