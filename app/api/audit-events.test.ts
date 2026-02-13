import { beforeEach, describe, expect, test, vi } from 'vitest';

const { mockInsertAudit, mockInc, mockGetAuditCounter } = vi.hoisted(() => ({
  mockInsertAudit: vi.fn(),
  mockInc: vi.fn(),
  mockGetAuditCounter: vi.fn(),
}));

vi.mock('../store/audit.js', () => ({
  insertAudit: mockInsertAudit,
}));

vi.mock('../prometheus/audit.js', () => ({
  getAuditCounter: mockGetAuditCounter,
}));

import { recordAuditEvent } from './audit-events.js';

describe('recordAuditEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuditCounter.mockReturnValue({ inc: mockInc });
  });

  test('should include optional version fields when provided', () => {
    recordAuditEvent({
      action: 'rollback',
      status: 'success',
      container: {
        name: 'nginx',
        image: { name: 'library/nginx' },
      },
      fromVersion: '1.24.0',
      toVersion: '1.23.0',
      details: 'manual rollback',
    });

    expect(mockInsertAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'rollback',
        status: 'success',
        containerName: 'nginx',
        containerImage: 'library/nginx',
        fromVersion: '1.24.0',
        toVersion: '1.23.0',
        details: 'manual rollback',
      }),
    );
    expect(mockInc).toHaveBeenCalledWith({ action: 'rollback' });
  });

  test('should work when prometheus audit counter is not initialized', () => {
    mockGetAuditCounter.mockReturnValue(undefined);

    expect(() =>
      recordAuditEvent({
        action: 'rollback',
        status: 'error',
        containerName: 'nginx',
        containerImage: 'library/nginx',
      }),
    ).not.toThrow();

    expect(mockInsertAudit).toHaveBeenCalled();
  });
});
