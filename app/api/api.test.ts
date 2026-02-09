// @ts-nocheck
// Mock all the router modules
vi.mock('express', () => ({
    default: {
        Router: vi.fn(() => ({
            use: vi.fn(),
            get: vi.fn(),
        })),
    },
}));

vi.mock('./app', () => ({
    init: vi.fn(() => ({ use: vi.fn(), get: vi.fn() })),
}));
vi.mock('./container', () => ({
    init: vi.fn(() => ({ use: vi.fn(), get: vi.fn() })),
}));
vi.mock('./watcher', () => ({
    init: vi.fn(() => ({ use: vi.fn(), get: vi.fn() })),
}));
vi.mock('./trigger', () => ({
    init: vi.fn(() => ({ use: vi.fn(), get: vi.fn() })),
}));
vi.mock('./registry', () => ({
    init: vi.fn(() => ({ use: vi.fn(), get: vi.fn() })),
}));
vi.mock('./authentication', () => ({
    init: vi.fn(() => ({ use: vi.fn(), get: vi.fn() })),
}));
vi.mock('./log', () => ({
    init: vi.fn(() => ({ use: vi.fn(), get: vi.fn() })),
}));
vi.mock('./store', () => ({
    init: vi.fn(() => ({ use: vi.fn(), get: vi.fn() })),
}));
vi.mock('./server', () => ({
    init: vi.fn(() => ({ use: vi.fn(), get: vi.fn() })),
}));
vi.mock('./agent', () => ({
    init: vi.fn(() => ({ use: vi.fn(), get: vi.fn() })),
}));
vi.mock('./auth', () => ({
    requireAuthentication: vi.fn((req, res, next) => next()),
}));

import * as api from './api.js';

describe('API Router', () => {
    let router;

    beforeEach(async () => {
        vi.clearAllMocks();
        router = api.init();
    });

    test('should initialize and return a router', async () => {
        expect(router).toBeDefined();
    });

    test('should mount all sub-routers', async () => {
        const appRouter = await import('./app.js');
        const containerRouter = await import('./container.js');
        const watcherRouter = await import('./watcher.js');
        const triggerRouter = await import('./trigger.js');
        const registryRouter = await import('./registry.js');
        const authenticationRouter = await import('./authentication.js');
        const logRouter = await import('./log.js');
        const storeRouter = await import('./store.js');
        const serverRouter = await import('./server.js');
        const agentRouter = await import('./agent.js');

        expect(appRouter.init).toHaveBeenCalled();
        expect(containerRouter.init).toHaveBeenCalled();
        expect(watcherRouter.init).toHaveBeenCalled();
        expect(triggerRouter.init).toHaveBeenCalled();
        expect(registryRouter.init).toHaveBeenCalled();
        expect(authenticationRouter.init).toHaveBeenCalled();
        expect(logRouter.init).toHaveBeenCalled();
        expect(storeRouter.init).toHaveBeenCalled();
        expect(serverRouter.init).toHaveBeenCalled();
        expect(agentRouter.init).toHaveBeenCalled();
    });

    test('should use requireAuthentication middleware', async () => {
        const auth = await import('./auth.js');
        expect(router.use).toHaveBeenCalledWith(auth.requireAuthentication);
    });
});
