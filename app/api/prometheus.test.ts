// @ts-nocheck
jest.mock('express', () => ({
    Router: jest.fn(() => ({
        use: jest.fn(),
        get: jest.fn(),
    })),
}));

jest.mock('passport', () => ({
    authenticate: jest.fn(() => 'auth-middleware'),
}));

jest.mock('nocache', () => jest.fn(() => 'nocache-middleware'));

jest.mock('../prometheus', () => ({
    output: jest.fn(async () => 'metrics-output'),
}));

jest.mock('../configuration', () => ({
    getServerConfiguration: jest.fn(() => ({
        metrics: {},
    })),
}));

jest.mock('./auth', () => ({
    getAllIds: jest.fn(() => ['basic.default']),
}));

import passport from 'passport';
import { getServerConfiguration } from '../configuration';
import { output } from '../prometheus';
import * as prometheusRouter from './prometheus';
import * as auth from './auth';

describe('Prometheus Router', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        getServerConfiguration.mockReturnValue({
            metrics: {},
        });
    });

    test('should initialize router with auth by default', async () => {
        const router = prometheusRouter.init();

        expect(router).toBeDefined();
        expect(auth.getAllIds).toHaveBeenCalled();
        expect(passport.authenticate).toHaveBeenCalledWith(['basic.default']);
        expect(router.use).toHaveBeenCalledWith('auth-middleware');
        expect(router.get).toHaveBeenCalledWith('/', expect.any(Function));
    });

    test('should allow unauthenticated metrics when disabled in configuration', async () => {
        getServerConfiguration.mockReturnValue({
            metrics: {
                auth: false,
            },
        });

        const router = prometheusRouter.init();

        expect(router).toBeDefined();
        expect(passport.authenticate).not.toHaveBeenCalled();
        expect(router.get).toHaveBeenCalledWith('/', expect.any(Function));
    });

    test('should output metrics payload', async () => {
        const router = prometheusRouter.init();
        const outputHandler = router.get.mock.calls[0][1];
        const response = {
            status: jest.fn().mockReturnThis(),
            type: jest.fn().mockReturnThis(),
            send: jest.fn(),
        };

        await outputHandler({}, response);

        expect(output).toHaveBeenCalled();
        expect(response.status).toHaveBeenCalledWith(200);
        expect(response.type).toHaveBeenCalledWith('text');
        expect(response.send).toHaveBeenCalledWith('metrics-output');
    });
});
