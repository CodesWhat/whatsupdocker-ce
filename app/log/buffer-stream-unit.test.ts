// @ts-nocheck
import { addEntry } from './buffer.js';

vi.mock('../configuration', () => ({
    getLogLevel: vi.fn(() => 'info'),
}));

vi.mock('./buffer.js', () => ({
    addEntry: vi.fn(),
    getEntries: vi.fn(),
}));

describe('parseLogChunk', () => {
    let parseLogChunk;

    beforeEach(async () => {
        vi.clearAllMocks();
        const mod = await import('./index.js');
        parseLogChunk = mod.parseLogChunk;
    });

    test('should use Date.now() when time is missing', () => {
        const now = Date.now();
        vi.spyOn(Date, 'now').mockReturnValue(now);
        parseLogChunk(JSON.stringify({ level: 30, msg: 'test' }));
        expect(addEntry).toHaveBeenCalledWith(expect.objectContaining({
            timestamp: now,
        }));
    });

    test('should default level to info for unknown numeric level', () => {
        parseLogChunk(JSON.stringify({ time: 1000, level: 999, msg: 'test' }));
        expect(addEntry).toHaveBeenCalledWith(expect.objectContaining({
            level: 'info',
        }));
    });

    test('should use obj.name when component is undefined', () => {
        parseLogChunk(JSON.stringify({ time: 1000, level: 30, name: 'my-service', msg: 'test' }));
        expect(addEntry).toHaveBeenCalledWith(expect.objectContaining({
            component: 'my-service',
        }));
    });

    test('should fall back to drydock when both component and name are undefined', () => {
        parseLogChunk(JSON.stringify({ time: 1000, level: 30, msg: 'test' }));
        expect(addEntry).toHaveBeenCalledWith(expect.objectContaining({
            component: 'drydock',
        }));
    });

    test('should use empty string when msg is undefined', () => {
        parseLogChunk(JSON.stringify({ time: 1000, level: 30 }));
        expect(addEntry).toHaveBeenCalledWith(expect.objectContaining({
            msg: '',
        }));
    });

    test('should ignore JSON parse errors', () => {
        parseLogChunk('not valid json {{{');
        expect(addEntry).not.toHaveBeenCalled();
    });

    test('should prefer component over name', () => {
        parseLogChunk(JSON.stringify({ time: 1000, level: 30, component: 'my-comp', name: 'my-name', msg: 'test' }));
        expect(addEntry).toHaveBeenCalledWith(expect.objectContaining({
            component: 'my-comp',
        }));
    });
});
