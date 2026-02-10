// @ts-nocheck
import { test, fc } from '@fast-check/vitest';
import { describe, expect } from 'vitest';
import { get } from './index.js';

describe('configuration/index fuzz tests', () => {
    test.prop([fc.string({ minLength: 1, maxLength: 50 })])(
        'get never throws on arbitrary property paths with empty env',
        (prop) => {
            const result = get(prop, {});
            expect(typeof result).toBe('object');
        },
    );

    test.prop([
        fc.string({ minLength: 1, maxLength: 30 }),
        fc.dictionary(
            fc.string({ minLength: 1, maxLength: 40 }),
            fc.string({ maxLength: 100 }),
            { minKeys: 0, maxKeys: 10 },
        ),
    ])(
        'get never throws on arbitrary property paths and env objects',
        (prop, env) => {
            const result = get(prop, env);
            expect(typeof result).toBe('object');
        },
    );

    test.prop([
        fc.constantFrom('dd.watcher', 'dd.trigger', 'dd.registry', 'dd.auth', 'dd.agent'),
        fc.dictionary(
            fc.stringMatching(/^DD_[A-Z_]{1,30}$/),
            fc.string({ maxLength: 100 }),
            { minKeys: 0, maxKeys: 5 },
        ),
    ])(
        'get with realistic DD_ env vars never throws',
        (prop, env) => {
            const result = get(prop, env);
            expect(typeof result).toBe('object');
        },
    );

    test.prop([
        fc.string({ minLength: 1, maxLength: 20 }),
        fc.dictionary(
            fc.string({ minLength: 1, maxLength: 50 }),
            fc.oneof(
                fc.string({ maxLength: 100 }),
                fc.constant(''),
                fc.constant('true'),
                fc.constant('false'),
                fc.integer().map(String),
            ),
            { minKeys: 0, maxKeys: 10 },
        ),
    ])(
        'get handles unusual env var values without crashing',
        (prop, env) => {
            const result = get(prop, env);
            expect(typeof result).toBe('object');
        },
    );
});
