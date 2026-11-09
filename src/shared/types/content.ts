export type EraId = 'present' | 'ly_1077' | 'le' | 'nguyen_1845' | 'twentieth_century';
export type LocationId = 'dinh_tho_duc' | 'den_can_vang' | 'chua_thap_linh';
export type VerificationStatus = 'verified' | 'provisional' | 'unverified' | 'placeholder';

export interface Verification {
  status: VerificationStatus;
  sources: string[];
  note: string;
}

export interface HeritageLocation {
  id: LocationId;
  name: string;
  category: 'communal_house' | 'temple' | 'pagoda';
  categoryLabel: string;
  verification: Verification;
  geography: { lat: number | null; lng: number | null; accuracyMeters: number | null };
  world: { mapId: string; x: number; y: number; positionType: VerificationStatus };
  availableEras: EraId[];
  description: string;
}

export interface EraDefinition {
  id: EraId;
  label: string;
  enabled: boolean;
  description: string;
}

export interface DialogueStep {
  speaker: string;
  text: string;
}

export interface DialogueDefinition {
  id: string;
  npcId: string;
  fictional: boolean;
  questTrigger?: 'guide_spoken';
  steps: DialogueStep[];
}

export interface QuestDefinition {
  id: 'first_memories';
  title: string;
  description: string;
  objectives: Array<{ id: string; label: string }>;
}

export interface GameContent {
  locations: HeritageLocation[];
  eras: EraDefinition[];
  dialogues: DialogueDefinition[];
  quests: QuestDefinition[];
  map: GeographicMap;
}

export interface MapPoint { x: number; y: number }
export interface MapFeature { id: string; points: MapPoint[]; name: string | null; kind: string }
export interface GeographicMap {
  schemaVersion: 1;
  mapId: 'tho_duc_geographic_v1';
  generatedAt: string;
  attribution: string;
  projection: {
    type: 'local-web-mercator'; crs: 'EPSG:4326';
    origin: { lat: number; lng: number };
    bounds: { west: number; south: number; east: number; north: number };
    pixelsPerMeter: number; padding: number;
    world: { width: number; height: number };
  };
  layers: Record<'roads' | 'footpaths' | 'water' | 'landuse' | 'buildings', MapFeature[]>;
  heritage: Array<{ id: LocationId; world: MapPoint; status: 'provisional' }>;
  interaction: { spawn: MapPoint; guide: MapPoint; portal: MapPoint };
  quality: { heritageStatus: 'provisional'; note: string };
}
