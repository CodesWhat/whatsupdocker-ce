// @ts-nocheck
import joi from 'joi';
import Loki from 'lokijs';
import fs from 'node:fs';
import logger from '../log/index.js';
const log = logger.child({ component: 'store' });
import { getStoreConfiguration } from '../configuration/index.js';

import * as app from './app.js';
import * as audit from './audit.js';
import * as backup from './backup.js';
import * as container from './container.js';

// Store Configuration Schema
const configurationSchema = joi.object().keys({
    path: joi.string().default('/store'),
    file: joi.string().default('dd.json'),
});

// Validate Configuration
const configurationToValidate = configurationSchema.validate(
    getStoreConfiguration() || {},
);
if (configurationToValidate.error) {
    throw configurationToValidate.error;
}
const configuration = configurationToValidate.value;

// Loki DB
let db;

function createCollections() {
    app.createCollections(db);
    audit.createCollections(db);
    backup.createCollections(db);
    container.createCollections(db);
}

/**
 * Load DB.
 * @param err
 * @param resolve
 * @param reject
 * @returns {Promise<void>}
 */
async function loadDb(err, resolve, reject) {
    if (err) {
        reject(err);
    } else {
        // Create collections
        createCollections();
        resolve();
    }
}

/**
 * Init DB.
 * @param options
 * @returns {Promise<unknown>}
 */
export async function init(options = {}) {
    const isMemory = options.memory || false;
    db = new Loki(`${configuration.path}/${configuration.file}`, {
        autosave: !isMemory,
    });

    if (isMemory) {
        log.info('Init store in memory mode');
        createCollections();
        return Promise.resolve();
    }

    // Migrate from wud.json if dd.json doesn't exist yet
    const storePath = `${configuration.path}/${configuration.file}`;
    const legacyPath = `${configuration.path}/wud.json`;
    if (!fs.existsSync(storePath) && fs.existsSync(legacyPath)) {
        log.info(`Migrating store from ${legacyPath} to ${storePath}`);
        fs.renameSync(legacyPath, storePath);
    }

    log.info(`Load store from (${storePath})`);
    if (!fs.existsSync(configuration.path)) {
        log.info(`Create folder ${configuration.path}`);
        fs.mkdirSync(configuration.path);
    }
    return new Promise((resolve, reject) => {
        db.loadDatabase({}, (err) => loadDb(err, resolve, reject));
    });
}

/**
 * Get configuration.
 * @returns {*}
 */
export function getConfiguration() {
    return configuration;
}
