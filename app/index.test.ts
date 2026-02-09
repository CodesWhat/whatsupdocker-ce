// @ts-nocheck
// Mock all dependencies
jest.mock('./configuration', () => ({
    getVersion: jest.fn(() => '1.0.0'),
}));

jest.mock('./log', () => ({
    info: jest.fn(),
    child: jest.fn().mockReturnThis(),
}));

jest.mock('./store', () => ({
    init: jest.fn().mockResolvedValue(),
}));

jest.mock('./registry', () => ({
    init: jest.fn().mockResolvedValue(),
}));

jest.mock('./api', () => ({
    init: jest.fn().mockResolvedValue(),
}));

jest.mock('./agent/api', () => ({
    init: jest.fn().mockResolvedValue(),
}));

jest.mock('./agent', () => ({
    init: jest.fn().mockResolvedValue(),
}));

jest.mock('./prometheus', () => ({
    init: jest.fn(),
}));

describe('Main Application', () => {
    const originalArgv = process.argv;

    beforeEach(async () => {
        jest.clearAllMocks();
        // Clear the module cache to ensure fresh imports
        jest.resetModules();
        process.argv = [...originalArgv].filter((arg) => arg !== '--agent');
    });

    afterAll(() => {
        process.argv = originalArgv;
    });

    test('should initialize controller mode by default', async () => {
        const { default: log } = await import('./log/index.js');
        const store = await import('./store/index.js');
        const registry = await import('./registry/index.js');
        const api = await import('./api/index.js');
        const agentManager = await import('./agent/index.js');
        const agentServer = await import('./agent/api/index.js');
        const prometheus = await import('./prometheus/index.js');
        const { getVersion } = await import('./configuration/index.js');

        // Import and run the main module
        await import('./index.js');

        // Wait for async operations to complete
        await new Promise((resolve) => setImmediate(resolve));

        // Verify initialization order and calls
        expect(getVersion).toHaveBeenCalled();
        expect(log.info).toHaveBeenCalledWith(
            'WUD is starting in Controller mode (version = 1.0.0)',
        );
        expect(store.init).toHaveBeenCalledWith({ memory: false });
        expect(prometheus.init).toHaveBeenCalled();
        expect(registry.init).toHaveBeenCalledWith({ agent: false });
        expect(agentManager.init).toHaveBeenCalled();
        expect(api.init).toHaveBeenCalled();
        expect(agentServer.init).not.toHaveBeenCalled();
    });

    test('should initialize agent mode with --agent flag', async () => {
        process.argv = [...originalArgv, '--agent'];

        const { default: log } = await import('./log/index.js');
        const store = await import('./store/index.js');
        const registry = await import('./registry/index.js');
        const api = await import('./api/index.js');
        const agentManager = await import('./agent/index.js');
        const agentServer = await import('./agent/api/index.js');
        const prometheus = await import('./prometheus/index.js');

        await import('./index.js');
        await new Promise((resolve) => setImmediate(resolve));

        expect(log.info).toHaveBeenCalledWith(
            'WUD is starting in Agent mode (version = 1.0.0)',
        );
        expect(store.init).toHaveBeenCalledWith({ memory: true });
        expect(registry.init).toHaveBeenCalledWith({ agent: true });
        expect(prometheus.init).not.toHaveBeenCalled();
        expect(agentServer.init).toHaveBeenCalled();
        expect(agentManager.init).not.toHaveBeenCalled();
        expect(api.init).not.toHaveBeenCalled();
    });
});
