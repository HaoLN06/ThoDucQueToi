export type EraId = 'present' | 'ly_1077' | 'le' | 'nguyen_1845' | 'twentieth_century';
export type LocationId = 'dinh_tho_duc' | 'den_can_vang' | 'chua_thap_linh';
export type VerificationStatus = 'verified' | 'oral_history' | 'interpretive' | 'placeholder' | 'unverified' | 'location_unverified';

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
  geography: { lat: number | null; lng: number | null };
  world: { mapId: string; x: number; y: number; positionType: 'placeholder' };
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
}
