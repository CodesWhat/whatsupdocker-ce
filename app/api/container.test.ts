// @ts-nocheck
jest.mock('express', () => ({
    Router: jest.fn(() => ({
        use: jest.fn(),
        get: jest.fn(),
        post: jest.fn(),
        delete: jest.fn(),
        patch: jest.fn(),
    })),
}));

jest.mock('nocache', () => jest.fn(() => 'nocache-middleware'));

jest.mock('../store/container', () => ({
    getContainers: jest.fn(() => []),
    getContainer: jest.fn(),
    updateContainer: jest.fn((container) => container),
    deleteContainer: jest.fn(),
}));

jest.mock('../registry', () => ({
    getState: jest.fn(() => ({
        watcher: {},
        trigger: {},
    })),
}));

jest.mock('../configuration', () => ({
    getServerConfiguration: jest.fn(() => ({
        feature: { delete: true },
    })),
}));

jest.mock('./component', () => ({
    mapComponentsToList: jest.fn(() => []),
}));

jest.mock('../triggers/providers/Trigger', () => ({
    __esModule: true,
    default: {
        parseIncludeOrIncludeTriggerString: jest.fn(),
        doesReferenceMatchId: jest.fn(() => false),
    },
}));

jest.mock('../log', () => ({
    __esModule: true,
    default: {
        child: jest.fn(() => ({
            info: jest.fn(),
            warn: jest.fn(),
        })),
    },
}));

jest.mock('../agent/manager', () => ({
    getAgent: jest.fn(),
}));

import * as storeContainer from '../store/container.js';
import * as containerRouter from './container.js';

function getUpdatePolicyHandler() {
    const router = containerRouter.init();
    const route = router.patch.mock.calls.find(
        (call) => call[0] === '/:id/update-policy',
    );
    return route[1];
}

function createResponse() {
    return {
        sendStatus: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };
}

describe('Container Router', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
    });

    test('should register update policy route', async () => {
        const router = containerRouter.init();
        expect(router.patch).toHaveBeenCalledWith(
            '/:id/update-policy',
            expect.any(Function),
        );
    });

    test('should return 404 when updating policy for unknown container', async () => {
        storeContainer.getContainer.mockReturnValue(undefined);
        const updatePolicyHandler = getUpdatePolicyHandler();
        const response = createResponse();

        updatePolicyHandler(
            {
                params: { id: 'missing' },
                body: { action: 'skip-current' },
            },
            response,
        );

        expect(response.sendStatus).toHaveBeenCalledWith(404);
        expect(storeContainer.updateContainer).not.toHaveBeenCalled();
    });

    test('should skip current tag update and persist updatePolicy', async () => {
        storeContainer.getContainer.mockReturnValue({
            id: 'container-1',
            updateKind: {
                kind: 'tag',
                remoteValue: '2.0.0',
            },
            result: {
                tag: '2.0.0',
            },
        });
        const updatePolicyHandler = getUpdatePolicyHandler();
        const response = createResponse();

        updatePolicyHandler(
            {
                params: { id: 'container-1' },
                body: { action: 'skip-current' },
            },
            response,
        );

        expect(storeContainer.updateContainer).toHaveBeenCalledTimes(1);
        expect(storeContainer.updateContainer.mock.calls[0][0].updatePolicy).toEqual(
            { skipTags: ['2.0.0'] },
        );
        expect(response.status).toHaveBeenCalledWith(200);
    });

    test('should reject snooze with invalid days', async () => {
        storeContainer.getContainer.mockReturnValue({
            id: 'container-1',
            updateKind: {
                kind: 'tag',
                remoteValue: '2.0.0',
            },
            result: {
                tag: '2.0.0',
            },
        });
        const updatePolicyHandler = getUpdatePolicyHandler();
        const response = createResponse();

        updatePolicyHandler(
            {
                params: { id: 'container-1' },
                body: { action: 'snooze', days: 0 },
            },
            response,
        );

        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.stringContaining('Invalid snooze days value'),
            }),
        );
    });

    test('should clear update policy when action is clear', async () => {
        storeContainer.getContainer.mockReturnValue({
            id: 'container-1',
            updatePolicy: {
                skipTags: ['2.0.0'],
                snoozeUntil: '2099-01-01T00:00:00.000Z',
            },
            updateKind: {
                kind: 'tag',
                remoteValue: '2.0.0',
            },
            result: {
                tag: '2.0.0',
            },
        });
        const updatePolicyHandler = getUpdatePolicyHandler();
        const response = createResponse();

        updatePolicyHandler(
            {
                params: { id: 'container-1' },
                body: { action: 'clear' },
            },
            response,
        );

        expect(storeContainer.updateContainer).toHaveBeenCalledTimes(1);
        expect(
            Object.prototype.hasOwnProperty.call(
                storeContainer.updateContainer.mock.calls[0][0],
                'updatePolicy',
            ),
        ).toBe(true);
        expect(storeContainer.updateContainer.mock.calls[0][0].updatePolicy).toBeUndefined();
        expect(response.status).toHaveBeenCalledWith(200);
    });

    test('should reject skip-current when no update kind is available', async () => {
        storeContainer.getContainer.mockReturnValue({
            id: 'container-1',
            updateKind: {
                kind: 'unknown',
            },
            result: {
                tag: '2.0.0',
            },
        });
        const updatePolicyHandler = getUpdatePolicyHandler();
        const response = createResponse();

        updatePolicyHandler(
            {
                params: { id: 'container-1' },
                body: { action: 'skip-current' },
            },
            response,
        );

        expect(response.status).toHaveBeenCalledWith(400);
        expect(response.json).toHaveBeenCalledWith(
            expect.objectContaining({
                error: expect.stringContaining('No current update available to skip'),
            }),
        );
        expect(storeContainer.updateContainer).not.toHaveBeenCalled();
    });
});
