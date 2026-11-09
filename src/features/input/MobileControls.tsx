import type { GameSession } from '../../services/GameSession';

export function MobileControls({ session }: { session: GameSession }) {
  const move = (x: number, y: number) => session.events.command({ type: 'move', x, y });
  const stop = () => move(0, 0);
  const direction = (label: string, symbol: string, x: number, y: number, className: string) => (
    <button
      className={`dpad-button ${className}`}
      aria-label={label}
      onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); move(x, y); }}
      onPointerUp={stop}
      onPointerCancel={stop}
    >{symbol}</button>
  );
  return (
    <div className="mobile-controls" aria-label="Điều khiển cảm ứng">
      <div className="dpad">
        {direction('Đi lên', '▲', 0, -1, 'up')}
        {direction('Sang trái', '◀', -1, 0, 'left')}
        {direction('Sang phải', '▶', 1, 0, 'right')}
        {direction('Đi xuống', '▼', 0, 1, 'down')}
      </div>
      <button className="interact-button" onClick={() => session.events.command({ type: 'interact' })}>Tương tác</button>
    </div>
  );
}
