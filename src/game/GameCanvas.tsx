import { useEffect, useRef } from 'react';
import type Phaser from 'phaser';
import type { GameSession } from '../services/GameSession';
import { createGame } from './config/createGame';

export function GameCanvas({ session }: { session: GameSession }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!hostRef.current || gameRef.current) return;
    gameRef.current = createGame(hostRef.current, session);
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [session]);

  return <div className="game-canvas" ref={hostRef} aria-label="Bản đồ địa lý Thọ Đức" />;
}
