import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const map = JSON.parse(await readFile(resolve(root, 'data/generated/tho-duc-game-map.json'), 'utf8'));
const ids = new Set(map.heritage.map((item) => item.id));
const expected = ['dinh_tho_duc', 'den_can_vang', 'chua_thap_linh'];
if (map.mapId !== 'tho_duc_geographic_v1') throw new Error('Unexpected map id.');
if (expected.some((id) => !ids.has(id))) throw new Error('Missing heritage location.');
if (map.heritage.some((item) => item.status !== 'provisional' || !Number.isFinite(item.world.x) || !Number.isFinite(item.world.y))) throw new Error('Invalid heritage metadata.');
if (!map.layers.roads.length || !map.layers.buildings.length) throw new Error('OSM extract did not produce required layers.');
process.stdout.write('Geodata validation passed.\n');
