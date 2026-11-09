import { describe, expect, it } from 'vitest';
import { validateContent, validateLocation } from '../../src/shared/validation/contentValidation';

describe('contentValidation', () => {
  it('báo lỗi cho bản ghi địa điểm không hợp lệ', () => {
    expect(() => validateLocation({ id: 'unknown' })).toThrow('ID địa điểm không hợp lệ');
  });

  it('báo lỗi khi gói nội dung thiếu ba địa điểm', () => {
    expect(() => validateContent({ locations: [], eras: [], dialogues: [], quests: [] })).toThrow('Cần đúng ba địa điểm');
  });
});
