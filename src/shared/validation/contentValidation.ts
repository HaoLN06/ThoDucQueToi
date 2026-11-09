import type { GameContent, HeritageLocation, LocationId } from '../types/content';

const locationIds = new Set<LocationId>(['dinh_tho_duc', 'den_can_vang', 'chua_thap_linh']);

export function validateLocation(value: unknown): HeritageLocation {
  if (!value || typeof value !== 'object') throw new Error('Bản ghi địa điểm phải là một object.');
  const item = value as Record<string, unknown>;
  if (!locationIds.has(item.id as LocationId)) throw new Error(`ID địa điểm không hợp lệ: ${String(item.id)}`);
  if (typeof item.name !== 'string' || !item.name.trim()) throw new Error('Địa điểm thiếu tên.');
  if (typeof item.description !== 'string') throw new Error(`Địa điểm ${item.id} thiếu mô tả.`);
  const geography = item.geography as Record<string, unknown> | undefined;
  if (!geography || (geography.lat !== null && typeof geography.lat !== 'number') || (geography.lng !== null && typeof geography.lng !== 'number')) {
    throw new Error(`Tọa độ địa lý của ${item.id} không hợp lệ.`);
  }
  const world = item.world as Record<string, unknown> | undefined;
  if (!world || typeof world.x !== 'number' || typeof world.y !== 'number' || !['verified', 'provisional', 'unverified', 'placeholder'].includes(String(world.positionType))) {
    throw new Error(`Tọa độ bản đồ nội bộ của ${item.id} không hợp lệ.`);
  }
  const verification = item.verification as Record<string, unknown> | undefined;
  if (!verification || !Array.isArray(verification.sources) || typeof verification.status !== 'string') {
    throw new Error(`Trạng thái kiểm chứng của ${item.id} không hợp lệ.`);
  }
  return value as HeritageLocation;
}

export function validateContent(value: unknown): GameContent {
  if (!value || typeof value !== 'object') throw new Error('Gói nội dung không hợp lệ.');
  const content = value as Partial<GameContent>;
  if (!Array.isArray(content.locations) || content.locations.length !== 3) throw new Error('Cần đúng ba địa điểm demo.');
  content.locations.map(validateLocation);
  if (!Array.isArray(content.eras) || !content.eras.some((era) => era.id === 'present') || !content.eras.some((era) => era.id === 'ly_1077')) {
    throw new Error('Thiếu dữ liệu thời kỳ bắt buộc.');
  }
  if (!Array.isArray(content.dialogues) || !Array.isArray(content.quests)) throw new Error('Thiếu hội thoại hoặc nhiệm vụ.');
  if (!content.map || content.map.mapId !== 'tho_duc_geographic_v1') throw new Error('Thiếu dữ liệu bản đồ địa lý Thọ Đức.');
  return content as GameContent;
}
