import type { DialogueDefinition, EraDefinition, GameContent, GeographicMap, HeritageLocation, QuestDefinition } from '../shared/types/content';
import { validateContent } from '../shared/validation/contentValidation';

async function loadJson<T>(name: string): Promise<T> {
  const response = await fetch(`${import.meta.env.BASE_URL}data/${name}.json`);
  if (!response.ok) throw new Error(`Không thể tải ${name}.json (${response.status}).`);
  return response.json() as Promise<T>;
}

export async function loadContent(): Promise<GameContent> {
  const [locations, eras, dialogues, quests, map] = await Promise.all([
    loadJson<HeritageLocation[]>('locations'),
    loadJson<EraDefinition[]>('eras'),
    loadJson<DialogueDefinition[]>('dialogues'),
    loadJson<QuestDefinition[]>('quests'),
    loadJson<GeographicMap>('geographic-map'),
  ]);
  return validateContent({ locations, eras, dialogues, quests, map });
}
