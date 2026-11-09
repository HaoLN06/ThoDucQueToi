import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const bounds = { west: 106.018, south: 21.238, east: 106.035, north: 21.252 };
const padding = 80;
const pixelsPerMeter = 1;
const earthRadius = 6378137;
const rad = Math.PI / 180;
const mercatorY = (lat) => earthRadius * Math.log(Math.tan(Math.PI / 4 + lat * rad / 2));
const origin = { lat: bounds.south, lng: bounds.west };
const maxX = earthRadius * (bounds.east - bounds.west) * rad;
const maxY = mercatorY(bounds.north) - mercatorY(bounds.south);
const world = { width: Math.round(maxX * pixelsPerMeter + padding * 2), height: Math.round(maxY * pixelsPerMeter + padding * 2) };
const project = (lat, lng) => ({
  x: Number((padding + earthRadius * (lng - origin.lng) * rad * pixelsPerMeter).toFixed(2)),
  y: Number((padding + (maxY - (mercatorY(lat) - mercatorY(origin.lat))) * pixelsPerMeter).toFixed(2)),
});

const decodeXml = (value) => value.replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
const tagsOf = (body) => Object.fromEntries([...body.matchAll(/<tag k="([^"]+)" v="([^"]*)"\s*\/>/g)].map((match) => [decodeXml(match[1]), decodeXml(match[2])]));
const xml = await readFile(resolve(root, 'data/raw/osm/tho-duc-map.osm'), 'utf8');
if (!xml.startsWith('<?xml') || !xml.includes('<osm ')) throw new Error('OSM source is not valid XML.');

const nodes = new Map();
for (const match of xml.matchAll(/<node\s+([^>]*)>/g)) {
  const attrs = match[1];
  const id = attrs.match(/\bid="([^"]+)"/)?.[1];
  const lat = Number(attrs.match(/\blat="([^"]+)"/)?.[1]);
  const lng = Number(attrs.match(/\blon="([^"]+)"/)?.[1]);
  if (id && Number.isFinite(lat) && Number.isFinite(lng)) nodes.set(id, { lat, lng });
}

const layers = { roads: [], footpaths: [], water: [], landuse: [], buildings: [] };
for (const match of xml.matchAll(/<way\s+[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/way>/g)) {
  const [, id, body] = match;
  const tags = tagsOf(body);
  const refs = [...body.matchAll(/<nd ref="([^"]+)"\s*\/>/g)].map((item) => item[1]);
  const coordinates = refs.map((ref) => nodes.get(ref)).filter(Boolean).filter(({ lat, lng }) => lat >= bounds.south && lat <= bounds.north && lng >= bounds.west && lng <= bounds.east).map(({ lat, lng }) => project(lat, lng));
  if (coordinates.length < 2) continue;
  const feature = { id: `osm-way-${id}`, points: coordinates, name: tags.name ?? null, kind: tags.highway ?? tags.waterway ?? tags.landuse ?? tags.natural ?? tags.building ?? 'unknown' };
  if (tags.highway && ['footway', 'path', 'track', 'steps', 'pedestrian'].includes(tags.highway)) layers.footpaths.push(feature);
  else if (tags.highway) layers.roads.push(feature);
  if (tags.waterway || tags.natural === 'water' || tags.water) layers.water.push(feature);
  if (tags.landuse || ['wood', 'scrub', 'grassland', 'wetland'].includes(tags.natural)) layers.landuse.push(feature);
  if (tags.building) layers.buildings.push(feature);
}

const heritageRaw = JSON.parse(await readFile(resolve(root, 'data/raw/heritage/tho-duc-heritage.json'), 'utf8'));
const heritage = heritageRaw.locations.map((location) => ({ ...location, world: project(location.latitude, location.longitude) }));
const village = project(21.242777778, 106.023333333);
const output = {
  schemaVersion: 1,
  mapId: 'tho_duc_geographic_v1',
  generatedAt: '2026-11-09',
  attribution: '© OpenStreetMap contributors · ODbL 1.0',
  projection: { type: 'local-web-mercator', crs: 'EPSG:4326', origin, bounds, pixelsPerMeter, padding, world },
  layers,
  heritage,
  interaction: {
    spawn: village,
    guide: { x: village.x + 75, y: village.y + 35 },
    portal: project(21.2455, 106.0328)
  },
  quality: {
    heritageStatus: 'provisional',
    note: 'Heritage coordinates are relative positions from the official name list and have not been field surveyed. OSM geometry may be incomplete.'
  }
};

await mkdir(resolve(root, 'data/generated'), { recursive: true });
await mkdir(resolve(root, 'public/data'), { recursive: true });
const serialized = `${JSON.stringify(output)}\n`;
await writeFile(resolve(root, 'data/generated/tho-duc-game-map.json'), serialized);
await writeFile(resolve(root, 'public/data/geographic-map.json'), serialized);
process.stdout.write(`Generated ${world.width}x${world.height}px map: ${layers.roads.length} roads, ${layers.footpaths.length} paths, ${layers.water.length} water, ${layers.landuse.length} landuse, ${layers.buildings.length} buildings.\n`);
