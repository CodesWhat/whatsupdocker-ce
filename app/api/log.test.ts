// @ts-nocheck
import { createMockResponse } from '../test/helpers.js';

const { mockRouter } = vi.hoisted(() => ({
    mockRouter: { use: vi.fn(), get: vi.fn() },
}));

vi.mock('express', () => ({
    default: { Router: vi.fn(() => mockRouter) },
}));

vi.mock('nocache', () => ({ default: vi.fn(() => 'nocache-middleware') }));

vi.mock('../configuration', () => ({
    getLogLevel: vi.fn(() => 'info'),
}));

import { getLogLevel } from '../configuration/index.js';
import * as logRouter from './log.js';

function createResponse() {
    return createMockResponse();
}

describe('Log Router', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should initialize router with nocache and route', () => {
        const router = logRouter.init();
        expect(router.use).toHaveBeenCalledWith('nocache-middleware');
        expect(router.get).toHaveBeenCalledWith('/', expect.any(Function));
    });

    test('should return log level from configuration', () => {
        logRouter.init();
        const handler = mockRouter.get.mock.calls.find((c) => c[0] === '/')[1];

        const res = createResponse();
        handler({}, res);

        expect(getLogLevel).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ level: 'info' });
    });
});
