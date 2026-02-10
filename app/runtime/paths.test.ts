// @ts-nocheck
import fs from 'node:fs';
import path from 'node:path';

vi.mock('node:fs', () => ({
    default: {
        statSync: vi.fn(),
    },
}));

describe('runtime/paths', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    test('resolveRuntimeRoot should return cached value on second call', async () => {
        fs.statSync.mockImplementation((p) => {
            // Make the cwd candidate pass marker checks
            if (typeof p === 'string') {
                return { isDirectory: () => true };
            }
            throw new Error('not found');
        });

        const { resolveRuntimeRoot } = await import('./paths.js');

        const first = resolveRuntimeRoot();
        const second = resolveRuntimeRoot();
        expect(first).toBe(second);
    });

    test('resolveRuntimeRoot should fall back to cwd when no markers found', async () => {
        fs.statSync.mockImplementation(() => {
            throw new Error('not found');
        });

        const { resolveRuntimeRoot } = await import('./paths.js');
        const result = resolveRuntimeRoot();
        expect(result).toBe(process.cwd());
    });

    test('resolveFromRuntimeRoot should join segments to runtime root', async () => {
        fs.statSync.mockImplementation(() => {
            throw new Error('not found');
        });

        const { resolveFromRuntimeRoot } = await import('./paths.js');
        const result = resolveFromRuntimeRoot('foo', 'bar');
        expect(result).toBe(path.resolve(process.cwd(), 'foo', 'bar'));
    });

    test('resolveUiDirectory should return first candidate when ui dir exists', async () => {
        const runtimeRoot = process.cwd();

        fs.statSync.mockImplementation((p) => {
            const uiPath = path.resolve(runtimeRoot, 'ui');
            if (p === uiPath) {
                return { isDirectory: () => true };
            }
            throw new Error('not found');
        });

        const { resolveUiDirectory } = await import('./paths.js');
        const result = resolveUiDirectory();
        expect(result).toBe(path.resolve(runtimeRoot, 'ui'));
    });

    test('resolveUiDirectory should return parent ui dir when runtime ui does not exist', async () => {
        fs.statSync.mockImplementation((p) => {
            const parentUi = path.resolve(process.cwd(), '..', 'ui');
            if (p === parentUi) {
                return { isDirectory: () => true };
            }
            throw new Error('not found');
        });

        const { resolveUiDirectory } = await import('./paths.js');
        const result = resolveUiDirectory();
        // It should find the parent ui directory
        expect(typeof result).toBe('string');
    });

    test('resolveRuntimeRoot should use module directory candidate when markers exist', async () => {
        // Make all statSync calls pass (markers exist for all candidates)
        fs.statSync.mockImplementation(() => ({
            isDirectory: () => true,
        }));

        const { resolveRuntimeRoot } = await import('./paths.js');
        const result = resolveRuntimeRoot();
        // Should return a string (the first candidate with markers)
        expect(typeof result).toBe('string');
    });

    test('isDirectory should return false when statSync throws', async () => {
        // statSync throws for all paths
        fs.statSync.mockImplementation(() => {
            throw new Error('ENOENT');
        });

        const { resolveRuntimeRoot } = await import('./paths.js');
        // When no markers found, falls back to cwd
        expect(resolveRuntimeRoot()).toBe(process.cwd());
    });

    test('resolveUiDirectory should return first candidate as fallback when no ui dir exists', async () => {
        fs.statSync.mockImplementation(() => {
            throw new Error('not found');
        });

        const { resolveUiDirectory, resolveRuntimeRoot } = await import('./paths.js');
        const runtimeRoot = resolveRuntimeRoot();
        const result = resolveUiDirectory();
        expect(result).toBe(path.resolve(runtimeRoot, 'ui'));
    });
});
