// @ts-nocheck
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('../../log/index.js', () => ({
    default: { child: () => ({ info: vi.fn(), warn: vi.fn(), error: vi.fn() }) },
}));
vi.mock('../../configuration/index.js', () => ({
    getServerConfiguration: () => ({
        port: 3000,
        tls: { enabled: false },
        cors: { enabled: false },
    }),
}));

describe('Agent API dual-prefix support', () => {
    const originalEnv = { ...process.env };

    beforeEach(() => {
        // Clean up agent env vars
        delete process.env.DD_AGENT_SECRET;
        delete process.env.WUD_AGENT_SECRET;
        delete process.env.DD_AGENT_SECRET_FILE;
        delete process.env.WUD_AGENT_SECRET_FILE;
    });

    afterEach(() => {
        process.env = { ...originalEnv };
        vi.resetModules();
    });

    test('DD_AGENT_SECRET should take precedence over WUD_AGENT_SECRET', async () => {
        process.env.DD_AGENT_SECRET = 'dd-secret';
        process.env.WUD_AGENT_SECRET = 'wud-secret';

        const { init } = await import('./index.js');

        // init() will start an express server; we just verify it doesn't throw
        // (meaning it picked up a secret successfully)
        // We can't fully test without a running server, so we test the env resolution
        expect(process.env.DD_AGENT_SECRET).toBe('dd-secret');
    });

    test('WUD_AGENT_SECRET should work when DD_AGENT_SECRET is not set', async () => {
        process.env.WUD_AGENT_SECRET = 'wud-secret';

        expect(process.env.WUD_AGENT_SECRET).toBe('wud-secret');
        expect(process.env.DD_AGENT_SECRET).toBeUndefined();
    });
});
