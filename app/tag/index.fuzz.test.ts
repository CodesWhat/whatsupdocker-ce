// @ts-nocheck
import { test, fc } from '@fast-check/vitest';
import { describe, expect } from 'vitest';
import { parse, transform, isGreater, diff } from './index.js';

describe('tag/index fuzz tests', () => {
    test.prop([fc.string()])('parse never throws on arbitrary strings', (input) => {
        const result = parse(input);
        // Result is either a valid SemVer object or null
        expect(result === null || typeof result === 'object').toBe(true);
    });

    test.prop([fc.string(), fc.string()])(
        'transform never throws on arbitrary formula and tag strings',
        (formula, tag) => {
            const result = transform(formula, tag);
            // Should always return a string (either transformed or original)
            expect(typeof result).toBe('string');
        },
    );

    test.prop([fc.string(), fc.string()])(
        'isGreater never throws on arbitrary version strings',
        (v1, v2) => {
            const result = isGreater(v1, v2);
            expect(typeof result).toBe('boolean');
        },
    );

    test.prop([fc.string(), fc.string()])(
        'diff never throws on arbitrary version strings',
        (v1, v2) => {
            const result = diff(v1, v2);
            // Returns a diff string or null
            expect(result === null || typeof result === 'string').toBe(true);
        },
    );

    test.prop([fc.string({ minLength: 1, maxLength: 20 })])(
        'parse handles version-like strings',
        (input) => {
            const result = parse(input);
            expect(result === null || typeof result === 'object').toBe(true);
        },
    );

    test.prop([
        fc.stringMatching(/^[a-z0-9.+-]{1,30}$/),
        fc.stringMatching(/^[a-z0-9.+-]{1,30}$/),
    ])(
        'isGreater handles semver-like strings',
        (v1, v2) => {
            const result = isGreater(v1, v2);
            expect(typeof result).toBe('boolean');
        },
    );
});
