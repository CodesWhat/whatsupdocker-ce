// @ts-nocheck
const { mockInit } = vi.hoisted(() => ({
    mockInit: () => ({ init: vi.fn(() => ({ use: vi.fn(), get: vi.fn() })) }),
}));

vi.mock('express', () => ({
    default: { Router: vi.fn(() => ({ use: vi.fn(), get: vi.fn() })) },
}));

vi.mock('./app', mockInit);
vi.mock('./container', mockInit);
vi.mock('./watcher', mockInit);
vi.mock('./trigger', mockInit);
vi.mock('./registry', mockInit);
vi.mock('./authentication', mockInit);
vi.mock('./log', mockInit);
vi.mock('./store', mockInit);
vi.mock('./server', mockInit);
vi.mock('./agent', mockInit);
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

    test('should register catch-all 404 handler', () => {
        const getCalls = router.get.mock.calls;
        const catchAll = getCalls.find((c) => c[0] === '/{*path}');
        expect(catchAll).toBeDefined();

        // Invoke the handler
        const handler = catchAll[1];
        const res = { sendStatus: vi.fn() };
        handler({}, res);
        expect(res.sendStatus).toHaveBeenCalledWith(404);
    });
});
