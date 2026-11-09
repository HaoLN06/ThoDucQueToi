import { useEffect } from 'react';
import type { HeritageLocation } from '../../shared/types/content';

export function LocationPanel({ location, visited, onClose }: { location: HeritageLocation; visited: boolean; onClose: () => void }) {
  useEffect(() => {
    const handle = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);
  return (
    <div className="modal-backdrop">
      <section className="modal location-panel" role="dialog" aria-modal="true" aria-labelledby="location-title">
        <div className="eyebrow">Điểm khám phá · Dữ liệu demo</div>
        <h2 id="location-title">{location.name}</h2>
        <dl>
          <div><dt>Phân loại</dt><dd>{location.categoryLabel}</dd></div>
          <div><dt>Kiểm chứng</dt><dd>Vị trí và thông tin chưa được kiểm chứng</dd></div>
          <div><dt>Trạng thái</dt><dd>{visited ? 'Đã ghi vào nhật ký' : 'Chưa khám phá'}</dd></div>
        </dl>
        <p>{location.description}</p>
        <p className="verification-note">{location.verification.note}</p>
        <div className="modal-actions"><button autoFocus onClick={onClose}>Tiếp tục khám phá</button></div>
      </section>
    </div>
  );
}
