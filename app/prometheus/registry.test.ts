// @ts-nocheck
import * as registry from './registry.js';

test('registry histogram should be properly configured', async () => {
    registry.init();
    const summary = registry.getSummaryTags();
    expect(summary.name).toStrictEqual('dd_registry_response');
    expect(summary.labelNames).toStrictEqual(['type', 'name']);
});
