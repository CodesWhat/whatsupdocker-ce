// @ts-nocheck
const { mockRouter } = vi.hoisted(() => ({
    mockRouter: {
        get: vi.fn(),
    },
}));

vi.mock('express', () => ({
    default: {
        Router: vi.fn(() => mockRouter),
    },
}));

vi.mock('../agent', () => ({
    getAgents: vi.fn(() => []),
}));

import { getAgents } from '../agent/index.js';
import * as agentRouter from './agent.js';

function createResponse() {
    return {
        json: vi.fn(),
    };
}

describe('Agent Router', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('should register GET / route on init', () => {
        const router = agentRouter.init();
        expect(router.get).toHaveBeenCalledWith('/', expect.any(Function));
    });

    test('should return mapped agent list', () => {
        getAgents.mockReturnValue([
            {
                name: 'agent-1',
                config: { host: 'localhost', port: 3000 },
                isConnected: true,
            },
            {
                name: 'agent-2',
                config: { host: 'remote', port: 4000 },
                isConnected: false,
            },
        ]);

        agentRouter.init();
        const handler = mockRouter.get.mock.calls.find((c) => c[0] === '/')[1];

        const res = createResponse();
        handler({}, res);

        expect(res.json).toHaveBeenCalledWith([
            { name: 'agent-1', host: 'localhost', port: 3000, connected: true },
            { name: 'agent-2', host: 'remote', port: 4000, connected: false },
        ]);
    });

    test('should return empty array when no agents', () => {
        getAgents.mockReturnValue([]);

        agentRouter.init();
        const handler = mockRouter.get.mock.calls.find((c) => c[0] === '/')[1];

        const res = createResponse();
        handler({}, res);

        expect(res.json).toHaveBeenCalledWith([]);
    });
});
