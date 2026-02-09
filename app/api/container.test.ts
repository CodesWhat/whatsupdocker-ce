// @ts-nocheck
vi.mock('express', () => ({
    default: {
        Router: vi.fn(() => ({
            use: vi.fn(),
            get: vi.fn(),
            post: vi.fn(),
            delete: vi.fn(),
            patch: vi.fn(),
        })),
    },
}));

vi.mock('nocache', () => ({ default: vi.fn(() => 'nocache-middleware') }));

vi.mock('../store/container', () => ({
    getContainers: vi.fn(() => []),
    getContainer: vi.fn(),
    updateContainer: vi.fn((container) => container),
    deleteContainer: vi.fn(),
}));

vi.mock('../registry', () => ({
    getState: vi.fn(() => ({
        watcher: {},
        trigger: {},
    })),
}));

vi.mock('../configuration', () => ({
    getServerConfiguration: vi.fn(() => ({
        feature: { delete: true },
    })),
}));

vi.mock('./component', () => ({
    mapComponentsToList: vi.fn(() => []),
}));

vi.mock('../triggers/providers/Trigger', () => ({
    __esModule: true,
    default: {
        parseIncludeOrIncludeTriggerString: vi.fn(),
        doesReferenceMatchId: vi.fn(() => false),
    },
}));

vi.mock('../log', () => ({
    __esModule: true,
    default: {
        child: vi.fn(() => ({
            info: vi.fn(),
            warn: vi.fn(),
        })),
    },
}));

vi.mock('../agent/manager', () => ({
    getAgent: vi.fn(),
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
        sendStatus: vi.fn(),
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
    };
}

describe('Container Router', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
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
