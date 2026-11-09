import { useEffect } from 'react';
import type { DialogueDefinition } from '../../shared/types/content';

interface Props {
  dialogue: DialogueDefinition;
  step: number;
  onNext: () => void;
  onClose: () => void;
}

export function DialoguePanel({ dialogue, step, onNext, onClose }: Props) {
  const current = dialogue.steps[step];
  const last = step === dialogue.steps.length - 1;

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Enter' || event.key === ' ') onNext();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose, onNext]);

  return (
    <div className="modal-backdrop" role="presentation">
      <section className="modal dialogue-panel" role="dialog" aria-modal="true" aria-labelledby="dialogue-title">
        <div className="eyebrow">Nhân vật hư cấu · {step + 1}/{dialogue.steps.length}</div>
        <h2 id="dialogue-title">{current.speaker}</h2>
        <p>{current.text}</p>
        <div className="modal-actions">
          <button className="button-secondary" onClick={onClose}>Đóng</button>
          <button autoFocus onClick={onNext}>{last ? 'Hoàn tất' : 'Tiếp theo'}</button>
        </div>
      </section>
    </div>
  );
}
