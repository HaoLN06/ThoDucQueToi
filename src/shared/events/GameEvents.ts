import type { EraId, HeritageLocation } from '../types/content';
import type { GameState } from '../types/state';

export type InteractionTarget =
  | { type: 'guide' }
  | { type: 'location'; location: HeritageLocation }
  | { type: 'portal'; unlocked: boolean };

export interface GameEventMap {
  state: GameState;
  prompt: string | null;
  interaction: InteractionTarget;
  notice: string;
  player: GameState['player'];
}

export type GameCommand =
  | { type: 'start'; resume: boolean }
  | { type: 'move'; x: number; y: number }
  | { type: 'interact' }
  | { type: 'pause'; paused: boolean }
  | { type: 'switch-era'; era?: EraId }
  | { type: 'reset-position' };

type Listener<T> = (payload: T) => void;

export class TypedEventBus {
  private readonly listeners = new Map<keyof GameEventMap, Set<Listener<any>>>();
  private readonly commandListeners = new Set<Listener<GameCommand>>();

  on<K extends keyof GameEventMap>(type: K, listener: Listener<GameEventMap[K]>): () => void {
    const group = this.listeners.get(type) ?? new Set();
    group.add(listener);
    this.listeners.set(type, group);
    return () => group.delete(listener);
  }

  emit<K extends keyof GameEventMap>(type: K, payload: GameEventMap[K]): void {
    this.listeners.get(type)?.forEach((listener) => listener(payload));
  }

  onCommand(listener: Listener<GameCommand>): () => void {
    this.commandListeners.add(listener);
    return () => this.commandListeners.delete(listener);
  }

  command(command: GameCommand): void {
    this.commandListeners.forEach((listener) => listener(command));
  }
}
