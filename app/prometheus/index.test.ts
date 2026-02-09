// @ts-nocheck
import * as prometheus from './index.js';

// Mock prom-client
vi.mock('prom-client', () => ({
    collectDefaultMetrics: vi.fn(),
    register: {
        metrics: vi.fn(() => 'mocked_metrics_output'),
    },
}));

// Mock child modules
vi.mock('./container', () => ({
    init: vi.fn(),
}));

vi.mock('./trigger', () => ({
    init: vi.fn(),
}));

vi.mock('./watcher', () => ({
    init: vi.fn(),
}));

vi.mock('./registry', () => ({
    init: vi.fn(),
}));

// Mock log
vi.mock('../log', () => ({
    default: { child: vi.fn(() => ({ info: vi.fn() })) },
}));

describe('Prometheus Module', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
    });

    test('should initialize all prometheus components', async () => {
        const { collectDefaultMetrics } = await import('prom-client');
        const container = await import('./container.js');
        const trigger = await import('./trigger.js');
        const watcher = await import('./watcher.js');
        const registry = await import('./registry.js');

        prometheus.init();

        expect(collectDefaultMetrics).toHaveBeenCalled();
        expect(container.init).toHaveBeenCalled();
        expect(registry.init).toHaveBeenCalled();
        expect(trigger.init).toHaveBeenCalled();
        expect(watcher.init).toHaveBeenCalled();
    });

    test('should return metrics output', async () => {
        const { register } = await import('prom-client');

        const output = await prometheus.output();

        expect(register.metrics).toHaveBeenCalled();
        expect(output).toBe('mocked_metrics_output');
    });
});
