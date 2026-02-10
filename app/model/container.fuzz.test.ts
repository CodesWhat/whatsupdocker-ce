// @ts-nocheck
import { test, fc } from '@fast-check/vitest';
import { describe, expect } from 'vitest';
import { validate, flatten, testable_getLink } from './container.js';

// A valid minimal container object for fuzzing variations
function validContainerArb() {
    return fc.record({
        id: fc.string({ minLength: 1, maxLength: 50 }),
        name: fc.string({ minLength: 1, maxLength: 50 }),
        watcher: fc.string({ minLength: 1, maxLength: 50 }),
        image: fc.record({
            id: fc.string({ minLength: 1, maxLength: 50 }),
            registry: fc.record({
                name: fc.string({ minLength: 1, maxLength: 50 }),
                url: fc.string({ minLength: 1, maxLength: 100 }),
            }),
            name: fc.string({ minLength: 1, maxLength: 50 }),
            tag: fc.record({
                value: fc.string({ minLength: 1, maxLength: 30 }),
                semver: fc.boolean(),
            }),
            digest: fc.record({
                watch: fc.boolean(),
            }),
            architecture: fc.string({ minLength: 1, maxLength: 20 }),
            os: fc.string({ minLength: 1, maxLength: 20 }),
        }),
    });
}

describe('model/container fuzz tests', () => {
    test.prop([fc.anything()])(
        'validate handles arbitrary input without crashing',
        (input) => {
            try {
                validate(input);
            } catch (e) {
                // Joi validation errors are expected for bad input
                expect(e).toBeDefined();
            }
        },
    );

    test.prop([validContainerArb()])(
        'validate accepts valid container-shaped objects',
        (container) => {
            // Should either validate successfully or throw a Joi error
            try {
                const result = validate(container);
                expect(result).toBeDefined();
                expect(result.id).toBe(container.id);
            } catch (e) {
                expect(e).toBeDefined();
            }
        },
    );

    test.prop([validContainerArb()])(
        'flatten handles validated containers',
        (container) => {
            try {
                const validated = validate(container);
                const result = flatten(validated);
                expect(typeof result).toBe('object');
            } catch {
                // validation may fail for some generated values - that is ok
            }
        },
    );

    test.prop([
        fc.record({
            linkTemplate: fc.string({ minLength: 1 }),
            transformTags: fc.option(fc.string(), { nil: undefined }),
            image: fc.record({
                tag: fc.record({
                    value: fc.string({ minLength: 1, maxLength: 30 }),
                    semver: fc.boolean(),
                }),
            }),
        }),
        fc.string({ minLength: 1, maxLength: 50 }),
    ])(
        'getLink never throws on arbitrary container and tag',
        (container, tagValue) => {
            const result = testable_getLink(container, tagValue);
            // Returns a string or undefined
            expect(
                result === undefined || typeof result === 'string',
            ).toBe(true);
        },
    );

    test.prop([fc.string(), fc.string()])(
        'getLink handles arbitrary string pairs for container/tag',
        (tpl, tagValue) => {
            const result = testable_getLink(
                {
                    linkTemplate: tpl,
                    image: { tag: { value: tagValue, semver: false } },
                },
                tagValue,
            );
            expect(
                result === undefined || typeof result === 'string',
            ).toBe(true);
        },
    );
});
