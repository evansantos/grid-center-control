import { describe, it, expect } from 'vitest';
import { parseGridCallback, formatButtons, orchButtons } from '../callbacks.js';

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

  it('parses batch callback with extra data', () => {
    const result = parseGridCallback('grid:batch:proj-123:1,2,3');
    expect(result).toEqual({ action: 'batch', id: 'proj-123', extra: '1,2,3' });
  });

  it('parses advance callback', () => {
    const result = parseGridCallback('grid:advance:proj-123');
    expect(result).toEqual({ action: 'advance', id: 'proj-123', extra: undefined });
  });

  it('formats orchestrator launch buttons', () => {
    const buttons = orchButtons('proj-123', 'launch', [4, 5, 6]);
    expect(buttons[0]).toHaveLength(2);
    expect(buttons[0][0].callback_data).toBe('grid:batch:proj-123:4,5,6');
  });

  it('formats orchestrator advance buttons', () => {
    const buttons = orchButtons('proj-123', 'advance');
    expect(buttons[0][0].text).toContain('Advance');
    expect(buttons[0][0].callback_data).toBe('grid:advance:proj-123');
  });
});
