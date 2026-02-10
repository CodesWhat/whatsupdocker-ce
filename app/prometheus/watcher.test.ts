// @ts-nocheck
import * as watcher from './watcher.js';

test('watcher counter should be properly configured', async () => {
    watcher.init();
    const gauge = watcher.getWatchContainerGauge();
    expect(gauge.name).toStrictEqual('dd_watcher_total');
    expect(gauge.labelNames).toStrictEqual(['type', 'name']);
});
