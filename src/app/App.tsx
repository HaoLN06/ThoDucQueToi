import { useCallback, useEffect, useMemo, useState } from 'react';
import { GameCanvas } from '../game/GameCanvas';
import { loadContent } from '../content/loadContent';
import { GameSession } from '../services/GameSession';
import { SaveService } from '../services/SaveService';
import type { GameContent, HeritageLocation } from '../shared/types/content';
import { createInitialState, type GameState } from '../shared/types/state';
import { DialoguePanel } from '../features/dialogue/DialoguePanel';
import { LocationPanel } from '../features/dialogue/LocationPanel';
import { JournalPanel } from '../features/journal/JournalPanel';
import { MobileControls } from '../features/input/MobileControls';
import { MapPanel } from '../features/map/MapPanel';

type Phase = 'loading' | 'menu' | 'game' | 'error';
type Modal = { type: 'guide'; step: number } | { type: 'location'; location: HeritageLocation } | { type: 'journal' } | { type: 'help' } | null;

export default function App() {
  const [content, setContent] = useState<GameContent | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [loadError, setLoadError] = useState('');
  const [state, setState] = useState<GameState>(createInitialState());
  const [modal, setModal] = useState<Modal>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const session = useMemo(() => content ? new GameSession(content, new SaveService(window.localStorage)) : null, [content]);

  useEffect(() => {
    let active = true;
    loadContent()
      .then((loaded) => { if (active) { setContent(loaded); setPhase('menu'); } })
      .catch((error: unknown) => { if (active) { setLoadError(error instanceof Error ? error.message : 'Không thể tải dữ liệu trò chơi.'); setPhase('error'); } });
    return () => { active = false; };
  }, []);

  const closeModal = useCallback(() => setModal(null), []);

  useEffect(() => {
    if (!session) return;
    const offState = session.events.on('state', setState);
    const offPrompt = session.events.on('prompt', setPrompt);
    const offNotice = session.events.on('notice', (message) => { setNotice(message); window.setTimeout(() => setNotice(''), 3800); });
    const offInteraction = session.events.on('interaction', (target) => {
      if (target.type === 'guide') setModal({ type: 'guide', step: 0 });
      if (target.type === 'location') {
        session.visitLocation(target.location.id);
        setModal({ type: 'location', location: target.location });
      }
    });
    return () => { offState(); offPrompt(); offNotice(); offInteraction(); };
  }, [session]);

  useEffect(() => {
    if (!session || phase !== 'game') return;
    session.events.command({ type: 'pause', paused: modal !== null });
  }, [modal, phase, session]);

  const begin = (resume: boolean) => {
    if (!session) return;
    session.start(resume);
    setState(session.snapshot());
    setPhase('game');
  };

  const closeDialogue = () => {
    if (modal?.type === 'guide' && session) session.talkToGuide();
    setModal(null);
  };

  const nextDialogue = () => {
    if (!session || modal?.type !== 'guide') return;
    const dialogue = session.content.dialogues[0];
    if (modal.step >= dialogue.steps.length - 1) closeDialogue();
    else setModal({ type: 'guide', step: modal.step + 1 });
  };

  const resetProgress = () => {
    if (!session || !window.confirm('Xóa toàn bộ tiến trình đã lưu trên thiết bị này?')) return;
    session.reset();
    setModal(null);
    setPhase('menu');
  };

  if (phase === 'loading') return <main className="loading-screen"><div className="loader" /><h1>Đang mở hành trình…</h1><p>Đang tải bản đồ và dữ liệu minh họa</p></main>;
  if (phase === 'error' || !session) return <main className="fatal-error"><h1>Không thể khởi động</h1><p>{loadError}</p><button onClick={() => window.location.reload()}>Thử lại</button></main>;

  if (phase === 'menu') {
    return (
      <main className="start-screen">
        <div className="start-art" aria-hidden="true"><span className="sun" /><span className="mount mountain-a" /><span className="mount mountain-b" /><span className="gate">時</span></div>
        <section className="start-card">
          <div className="eyebrow">Một hành trình khám phá quê hương</div>
          <h1>Thọ Đức<br /><span>Dấu Ấn Thời Gian</span></h1>
          <p>Khám phá bản làng minh họa, ghi lại các điểm di sản và bước qua cánh cổng thời gian.</p>
          <div className="start-actions">
            <button className="primary-large" onClick={() => begin(false)}>Bắt đầu khám phá</button>
            {session.hasSave() && <button className="button-secondary" onClick={() => begin(true)}>Tiếp tục</button>}
            <button className="button-quiet" onClick={() => setModal({ type: 'help' })}>Hướng dẫn</button>
          </div>
          <small>Bản đồ Sprint 02 dùng dữ liệu OSM và tọa độ tương đối từ nguồn nhà nước; chưa thay thế khảo sát thực địa.</small>
        </section>
        {modal?.type === 'help' && <HelpPanel onClose={closeModal} />}
      </main>
    );
  }

  const eraLabel = state.activeEra === 'present' ? 'Hiện tại' : '1077 · Tái hiện';
  return (
    <main className={`game-shell era-${state.activeEra}`}>
      <GameCanvas session={session} />
      <header className="game-header">
        <div className="brand-mark"><span>THỌ ĐỨC</span><small>Dấu Ấn Thời Gian</small></div>
        <div className="status-group">
          <div className="status-pill"><small>THỜI KỲ</small><strong>{eraLabel}</strong></div>
          <button className="icon-button" onClick={() => setModal({ type: 'journal' })}>Nhật ký <span>{state.discoveredLocations.length}/3</span></button>
        </div>
      </header>
      <div className="map-disclaimer">{state.activeEra === 'ly_1077' ? 'Tái hiện diễn giải chưa được xác minh · Đã ẩn đường và công trình hiện đại · Thủy hệ là mốc tham chiếu' : 'Bản đồ địa lý khái quát · Vị trí di tích tạm xác định · Không dùng để dẫn đường thực địa'}</div>
      <MapPanel session={session} state={state} />
      <aside className="quest-card">
        <small>NHIỆM VỤ HIỆN TẠI</small>
        <strong>{state.quest.completed ? 'Hành trình đầu tiên đã hoàn thành!' : 'Những dấu ấn đầu tiên'}</strong>
        <div className="progress-track"><span style={{ width: `${Math.min(100, ((Number(state.quest.guideSpoken) + state.quest.visitedLocations.length + Number(state.quest.portalUsed)) / 5) * 100)}%` }} /></div>
        <p>{state.quest.guideSpoken ? `${state.quest.visitedLocations.length}/3 điểm đã khám phá` : 'Hãy tìm Người dẫn chuyện'}</p>
      </aside>
      <button
        className={`timeline-button ${session.portalUnlocked() ? '' : 'locked'}`}
        onClick={() => {
          if (!session.switchEra()) setNotice('Cổng thời gian chưa mở. Hãy hoàn thành các mục khám phá trước.');
        }}
        aria-label="Chuyển đổi thời kỳ"
      >⌛ <span>{session.portalUnlocked() ? 'Đổi thời kỳ' : 'Cổng đang khóa'}</span></button>
      {prompt && <button className="interaction-prompt" onClick={() => session.events.command({ type: 'interact' })}><kbd>E</kbd> {prompt}</button>}
      {notice && <div className="toast" role="status">{notice}</div>}
      <MobileControls session={session} />
      {modal?.type === 'guide' && <DialoguePanel dialogue={session.content.dialogues[0]} step={modal.step} onNext={nextDialogue} onClose={closeDialogue} />}
      {modal?.type === 'location' && <LocationPanel location={modal.location} visited={state.discoveredLocations.includes(modal.location.id)} onClose={closeModal} />}
      {modal?.type === 'journal' && <JournalPanel session={session} state={state} onClose={closeModal} onReset={resetProgress} />}
    </main>
  );
}

function HelpPanel({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const handle = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [onClose]);
  return (
    <div className="modal-backdrop">
      <section className="modal help-panel" role="dialog" aria-modal="true" aria-labelledby="help-title">
        <div className="eyebrow">Cách chơi</div>
        <h2 id="help-title">Bắt đầu hành trình</h2>
        <ul>
          <li><strong>Di chuyển:</strong> WASD, phím mũi tên hoặc cụm nút cảm ứng.</li>
          <li><strong>Tương tác:</strong> E, phím cách hoặc nút “Tương tác”.</li>
          <li><strong>Mục tiêu:</strong> gặp Người dẫn chuyện, ghé ba điểm đánh dấu, sau đó mở cổng thời gian.</li>
          <li><strong>Đóng cửa sổ:</strong> nhấn Escape hoặc nút đóng.</li>
        </ul>
        <div className="modal-actions"><button autoFocus onClick={onClose}>Đã hiểu</button></div>
      </section>
    </div>
  );
}
