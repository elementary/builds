import JSON5 from 'json5'

/**
 * Reads a file from the `data/` directory, which is bundled into the server
 * build as a Nitro server asset (mounted at `assets:data` in nuxt.config.ts).
 * Bundling makes the read independent of `process.cwd()` and the deploy layout.
 *
 * unstorage's `getItem` already deserializes plain JSON via `destr`, so a
 * pure-JSON asset comes back as an object/array; a JSON5 asset (e.g. one with
 * comments) comes back as a raw string that we still need to parse.
 */
export async function readDataAsset<T>(name: string): Promise<T | null> {
  const raw = await useStorage('assets:data').getItem(name)
  if (raw == null) return null
  return (typeof raw === 'string' ? JSON5.parse(raw) : raw) as T
}
