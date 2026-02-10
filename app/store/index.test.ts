// @ts-nocheck
import fs from 'node:fs';
import * as store from './index.js';

// Mock dependencies
vi.mock('lokijs', () => ({
    default: vi.fn().mockImplementation(function () {
        return {
            loadDatabase: vi.fn((options, callback) => {
                // Simulate successful database load
                callback(null);
            }),
        };
    }),
}));

vi.mock('node:fs', () => ({
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
            default: vi.fn().mockImplementation(function () {
                return {
                    loadDatabase: vi.fn((options, callback) => {
                        callback(new Error('Database load failed'));
                    }),
                };
            }),
        }));

        const storeWithError = await import('./index.js');
        await expect(storeWithError.init()).rejects.toThrow(
            'Database load failed',
        );
    });

    test('should initialize store in memory mode', async () => {
        vi.resetModules();

        vi.doMock('lokijs', () => ({
            default: vi.fn().mockImplementation(function () {
                return {
                    loadDatabase: vi.fn(),
                };
            }),
        }));

        vi.doMock('node:fs', () => ({
            default: { existsSync: vi.fn(), mkdirSync: vi.fn(), renameSync: vi.fn() },
        }));

        vi.doMock('../configuration', () => ({
            getStoreConfiguration: vi.fn(() => ({
                path: '/test/store',
                file: 'test.json',
            })),
        }));

        vi.doMock('./app', () => ({
            createCollections: vi.fn(),
        }));

        vi.doMock('./container', () => ({
            createCollections: vi.fn(),
        }));

        vi.doMock('../log', () => ({
            default: { child: vi.fn(() => ({ info: vi.fn() })) },
        }));

        const storeMemory = await import('./index.js');
        await storeMemory.init({ memory: true });

        const app = await import('./app.js');
        const container = await import('./container.js');
        expect(app.createCollections).toHaveBeenCalled();
        expect(container.createCollections).toHaveBeenCalled();
    });

    test('should throw when store configuration is invalid', async () => {
        vi.resetModules();

        vi.doMock('../configuration', () => ({
            getStoreConfiguration: vi.fn(() => ({
                path: 123, // invalid: path should be a string
            })),
        }));

        vi.doMock('../log', () => ({
            default: { child: vi.fn(() => ({ info: vi.fn() })) },
        }));

        await expect(import('./index.js')).rejects.toThrow();
    });

    test('should migrate from wud.json when dd.json does not exist', async () => {
        vi.resetModules();

        vi.doMock('lokijs', () => ({
            default: vi.fn().mockImplementation(function () {
                return {
                    loadDatabase: vi.fn((options, callback) => {
                        callback(null);
                    }),
                };
            }),
        }));

        const mockFs = {
            existsSync: vi.fn((path) => {
                if (path === '/test/store/test.json') return false;
                if (path === '/test/store/wud.json') return true;
                if (path === '/test/store') return true;
                return false;
            }),
            mkdirSync: vi.fn(),
            renameSync: vi.fn(),
        };

        vi.doMock('node:fs', () => ({
            default: mockFs,
        }));

        vi.doMock('../configuration', () => ({
            getStoreConfiguration: vi.fn(() => ({
                path: '/test/store',
                file: 'test.json',
            })),
        }));

        vi.doMock('./app', () => ({
            createCollections: vi.fn(),
        }));

        vi.doMock('./container', () => ({
            createCollections: vi.fn(),
        }));

        vi.doMock('../log', () => ({
            default: { child: vi.fn(() => ({ info: vi.fn() })) },
        }));

        const storeMigrate = await import('./index.js');
        await storeMigrate.init();

        expect(mockFs.renameSync).toHaveBeenCalledWith(
            '/test/store/wud.json',
            '/test/store/test.json',
        );
    });
});
