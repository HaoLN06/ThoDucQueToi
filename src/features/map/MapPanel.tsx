import { useMemo, useState } from 'react';
import type { GameSession } from '../../services/GameSession';
import { GeographicService } from '../../services/GeographicService';
import type { GameState } from '../../shared/types/state';

export function MapPanel({ session, state }: { session: GameSession; state: GameState }) {
  const [expanded, setExpanded] = useState(false);
  const map = session.content.map;
  const target = state.navigationTarget ? session.locations.get(state.navigationTarget) : null;
  const geography = useMemo(() => new GeographicService(map.projection), [map.projection]);
  const distance = target ? geography.distanceMeters(state.player, target.world) : null;
  const angle = target ? Math.atan2(target.world.y - state.player.y, target.world.x - state.player.x) * 180 / Math.PI : 0;
  const path = (points: Array<{ x: number; y: number }>) => points.map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`).join(' ');

  return (
    <aside className={`map-panel ${expanded ? 'expanded' : ''}`} aria-label="Bản đồ Thọ Đức">
      <button className="map-toggle" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>🗺 {expanded ? 'Thu nhỏ' : 'Bản đồ'}</button>
      <div className="map-content">
        <div className="map-title"><strong>THỌ ĐỨC</strong><small>{state.activeEra === 'ly_1077' ? 'Bản đồ tham chiếu hiện tại' : 'Bắc Ninh · Bắc ở phía trên'}</small></div>
        <svg viewBox={`0 0 ${map.projection.world.width} ${map.projection.world.height}`} role="img" aria-label="Bản đồ thu nhỏ vị trí người chơi và ba di tích">
          <rect width="100%" height="100%" className="mini-ground" />
          {map.layers.water.map((feature) => <path key={feature.id} d={path(feature.points)} className="mini-water" />)}
          {map.layers.roads.map((feature) => <path key={feature.id} d={path(feature.points)} className="mini-road" />)}
          {map.layers.footpaths.map((feature) => <path key={feature.id} d={path(feature.points)} className="mini-path" />)}
          {session.content.locations.map((location) => <circle key={location.id} cx={location.world.x} cy={location.world.y} r="34" className={location.id === state.navigationTarget ? 'mini-heritage target' : 'mini-heritage'} />)}
          {target && <line x1={state.player.x} y1={state.player.y} x2={target.world.x} y2={target.world.y} className="mini-route" />}
          <circle cx={state.player.x} cy={state.player.y} r="28" className="mini-player" />
        </svg>
        <div className="map-legend"><span><i className="dot player" />Bạn</span><span><i className="dot heritage" />Di tích (tạm xác định)</span><span><i className="line road" />Đường OSM</span></div>
        <div className="map-targets">
          <small>CHỌN ĐIỂM ĐẾN</small>
          {session.content.locations.map((location) => <button key={location.id} className={state.navigationTarget === location.id ? 'active' : ''} onClick={() => session.setNavigationTarget(state.navigationTarget === location.id ? null : location.id)}>{location.name}</button>)}
        </div>
        {target && <div className="destination"><span className="direction-arrow" style={{ transform: `rotate(${angle}deg)` }}>➜</span><span><strong>{target.name}</strong><small>{Math.round(distance ?? 0)} m theo tỷ lệ bản đồ</small></span></div>}
        <p className="map-quality">{state.activeEra === 'ly_1077' ? <><strong>Minimap giữ lớp hiện đại để định hướng</strong>; không đại diện địa hình năm 1077.</> : <>Vị trí di tích: <strong>tạm xác định</strong>. Chưa khảo sát thực địa.</>}</p>
        <small className="attribution">{map.attribution}</small>
      </div>
    </aside>
  );
}
