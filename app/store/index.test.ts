// @ts-nocheck
import fs from 'fs';
import * as store from './index.js';

// Mock dependencies
vi.mock('lokijs', () => ({
    default: vi.fn().mockImplementation(() => ({
        loadDatabase: vi.fn((options, callback) => {
            // Simulate successful database load
            callback(null);
        }),
    })),
}));

vi.mock('fs', () => ({
    default: { existsSync: vi.fn(), mkdirSync: vi.fn() },
}));

vi.mock('../configuration', () => ({
    getStoreConfiguration: vi.fn(() => ({
        path: '/test/store',
        file: 'test.json',
    })),
}));

vi.mock('./app', () => ({
    createCollections: vi.fn(),
}));

vi.mock('./container', () => ({
    createCollections: vi.fn(),
}));

vi.mock('../log', () => ({
    default: { child: vi.fn(() => ({ info: vi.fn() })) },
}));

describe('Store Module', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
    });

    test('should initialize store successfully', async () => {
        fs.existsSync.mockReturnValue(true);

        await store.init();

        const app = await import('./app.js');
        const container = await import('./container.js');

        expect(app.createCollections).toHaveBeenCalled();
        expect(container.createCollections).toHaveBeenCalled();
    });

    test('should create directory if it does not exist', async () => {
        fs.existsSync.mockReturnValue(false);

        await store.init();

        expect(fs.mkdirSync).toHaveBeenCalledWith('/test/store');
    });

    test('should return configuration', async () => {
        const config = store.getConfiguration();

        expect(config).toEqual({
            path: '/test/store',
            file: 'test.json',
        });
    });

    test('should handle database load error', async () => {
        // Reset modules to get a fresh instance
        vi.resetModules();

        // Mock Loki to simulate error
        vi.doMock('lokijs', () => ({
            default: vi.fn().mockImplementation(() => ({
                loadDatabase: vi.fn((options, callback) => {
                    callback(new Error('Database load failed'));
                }),
            })),
        }));

        const storeWithError = await import('./index.js');
        await expect(storeWithError.init()).rejects.toThrow(
            'Database load failed',
        );
    });
});
