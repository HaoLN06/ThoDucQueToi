import { useEffect } from 'react';
import type { GameSession } from '../../services/GameSession';
import type { GameState } from '../../shared/types/state';

export function JournalPanel({ session, state, onClose, onReset }: { session: GameSession; state: GameState; onClose: () => void; onReset: () => void }) {
  const quest = session.content.quests[0];
  const completed = new Set([
    ...(state.quest.guideSpoken ? ['talk_guide'] : []),
    ...state.quest.visitedLocations.map((id) => `visit_${id}`),
    ...(state.quest.portalUsed ? ['use_portal'] : []),
    ...(state.quest.completed ? ['complete'] : []),
  ]);
  useEffect(() => {
    const handle = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);
  return (
    <div className="modal-backdrop">
      <section className="modal journal-panel" role="dialog" aria-modal="true" aria-labelledby="journal-title">
        <div className="eyebrow">Nhật ký hành trình</div>
        <h2 id="journal-title">{quest.title}</h2>
        <p>{quest.description}</p>
        <ul className="objective-list">
          {quest.objectives.map((objective) => (
            <li key={objective.id} className={completed.has(objective.id) ? 'done' : ''}>
              <span aria-hidden="true">{completed.has(objective.id) ? '✓' : '○'}</span> {objective.label}
            </li>
          ))}
        </ul>
        <div className="journal-summary">
          <strong>Đã khám phá:</strong> {state.discoveredLocations.length}/3<br />
          <strong>Thời kỳ:</strong> {state.activeEra === 'present' ? 'Hiện tại' : 'Năm 1077 (tái hiện minh họa)'}
        </div>
        <div className="modal-actions spread">
          <button className="button-danger" onClick={onReset}>Xóa tiến trình</button>
          <button autoFocus onClick={onClose}>Đóng nhật ký</button>
        </div>
      </section>
    </div>
  );
}
