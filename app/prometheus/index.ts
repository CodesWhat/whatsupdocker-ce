// @ts-nocheck
import { collectDefaultMetrics, register } from 'prom-client';

import logger from '../log/index.js';
const log = logger.child({ component: 'prometheus' });
import * as container from './container.js';
import * as trigger from './trigger.js';
import * as watcher from './watcher.js';
import * as registry from './registry.js';

/**
 * Start the Prometheus registry.
 */
export function init() {
    log.info('Init Prometheus module');
    collectDefaultMetrics();
    container.init();
    registry.init();
    trigger.init();
    watcher.init();
}

/**
 * Return all metrics as string for Prometheus scrapping.
 * @returns {string}
 */
export async function output() {
    return register.metrics();
}
