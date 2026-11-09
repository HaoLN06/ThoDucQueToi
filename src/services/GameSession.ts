import type { GameContent, LocationId } from '../shared/types/content';
import { createInitialState, type GameState } from '../shared/types/state';
import { TypedEventBus } from '../shared/events/GameEvents';
import { EraService } from './EraService';
import { LocationRegistry } from './LocationRegistry';
import { QuestService } from './QuestService';
import { SaveService } from './SaveService';

export class GameSession {
  readonly events = new TypedEventBus();
  readonly locations: LocationRegistry;
  private state: GameState = createInitialState();

  constructor(readonly content: GameContent, private readonly saves: SaveService) {
    this.locations = new LocationRegistry(content.locations);
  }

  snapshot(): GameState {
    return structuredClone(this.state);
  }

  hasSave(): boolean {
    return this.saves.hasValidSave();
  }

  start(resume: boolean): void {
    const restored = resume ? this.saves.load() : null;
    this.state = restored ?? { ...createInitialState(), started: true };
    this.state.started = true;
    this.persist();
  }

  updatePlayer(x: number, y: number): void {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    this.state = { ...this.state, player: { ...this.state.player, x, y } };
    this.events.emit('player', this.state.player);
  }

  setNavigationTarget(id: LocationId | null): void {
    this.state = { ...this.state, navigationTarget: id };
    this.persist();
  }

  flushPlayerPosition(): void {
    this.persist();
  }

  talkToGuide(): void {
    this.state = { ...this.state, quest: QuestService.talkToGuide(this.state.quest) };
    this.persist();
  }

  visitLocation(id: LocationId): void {
    const quest = QuestService.visitLocation(this.state.quest, id);
    const discovered = this.state.discoveredLocations.includes(id)
      ? this.state.discoveredLocations
      : [...this.state.discoveredLocations, id];
    this.state = { ...this.state, quest, discoveredLocations: discovered };
    this.persist();
  }

  portalUnlocked(): boolean {
    return QuestService.isPortalUnlocked(this.state.quest);
  }

  usePortal(): boolean {
    if (!this.portalUnlocked()) return false;
    const quest = QuestService.usePortal(this.state.quest);
    this.state = { ...EraService.toggle(this.state), quest };
    this.persist();
    return true;
  }

  switchEra(): boolean {
    if (!this.portalUnlocked()) return false;
    this.state = EraService.toggle(this.state);
    this.persist();
    return true;
  }

  reset(): void {
    this.state = this.saves.reset();
    this.events.emit('state', this.snapshot());
  }

  private persist(): void {
    this.saves.save(this.state);
    this.events.emit('state', this.snapshot());
  }
}
