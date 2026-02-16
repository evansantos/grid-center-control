import { describe, it, expect } from 'vitest';
import { parseGridCallback, formatButtons } from '../callbacks.js';

describe('Grid callbacks', () => {
  it('parses approve callback', () => {
    const result = parseGridCallback('grid:approve:abc-123');
    expect(result).toEqual({ action: 'approve', id: 'abc-123' });
  });

  it('parses reject callback', () => {
    const result = parseGridCallback('grid:reject:abc-123');
    expect(result).toEqual({ action: 'reject', id: 'abc-123' });
  });

  it('parses view callback', () => {
    const result = parseGridCallback('grid:view:abc-123');
    expect(result).toEqual({ action: 'view', id: 'abc-123' });
  });

  it('parses continue callback', () => {
    const result = parseGridCallback('grid:continue:abc-123');
    expect(result).toEqual({ action: 'continue', id: 'abc-123' });
  });

  it('parses pause callback', () => {
    const result = parseGridCallback('grid:pause:abc-123');
    expect(result).toEqual({ action: 'pause', id: 'abc-123' });
  });

  it('returns null for non-grid messages', () => {
    expect(parseGridCallback('hello')).toBeNull();
    expect(parseGridCallback('grid:')).toBeNull();
    expect(parseGridCallback('grid:unknown:id')).toBeNull();
  });

  it('formats approval buttons', () => {
    const buttons = formatButtons('approval', 'artifact-123', 'project-456');
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveLength(3);
    expect(buttons[0][0].text).toBe('✅ Approve');
    expect(buttons[0][0].callback_data).toBe('grid:approve:artifact-123');
    expect(buttons[0][2].callback_data).toContain('grid:view:project-456');
  });

  it('formats checkpoint buttons', () => {
    const buttons = formatButtons('checkpoint', 'project-456');
    expect(buttons[0]).toHaveLength(3);
    expect(buttons[0][0].text).toBe('▶️ Continue');
    expect(buttons[0][1].text).toBe('⏸ Pause');
  });
});
