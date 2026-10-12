import { readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { dedup, prune } from '@gltf-transform/functions';

const folder = new URL('./glb/', import.meta.url);
const io = new NodeIO();
for (const name of (await readdir(folder)).filter(name => name.endsWith('.glb')).sort()) {
  const file = fileURLToPath(new URL(name, folder));
  const before = (await stat(file)).size;
  const document = await io.read(file);
  await document.transform(dedup(), prune());
  await io.write(file, document);
  console.log(`${name}: ${before} → ${(await stat(file)).size} bytes`);
}
