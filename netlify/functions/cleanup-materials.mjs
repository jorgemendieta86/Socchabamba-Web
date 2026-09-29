import {
  MATERIALS_INDEX_KEY,
  materialIsActive,
  materialsStore,
  readJson,
  writeJson
} from "./_shared.mjs";

export const config = { schedule: "@daily" };

export default async function handler() {
  const materials = await readJson(MATERIALS_INDEX_KEY, []);
  const expired = materials.filter((material) => !materialIsActive(material));
  if (expired.length === 0) return new Response(JSON.stringify({ removed: 0 }));

  const store = materialsStore();
  const failedIds = new Set();
  for (const material of expired) {
    await store.delete(material.storageKey).catch((error) => {
      console.error(`No se pudo eliminar ${material.storageKey}:`, error);
      failedIds.add(material.id);
    });
  }
  const remainingMaterials = materials.filter((material) => materialIsActive(material) || failedIds.has(material.id));
  await writeJson(MATERIALS_INDEX_KEY, remainingMaterials);
  return new Response(JSON.stringify({ removed: expired.length - failedIds.size, pending: failedIds.size }));
}
