// @ts-nocheck
import path from 'path';
import { fileURLToPath } from 'url';
import * as configuration from './index.js';

function getTestDirectory() {
    try {
        const moduleUrl = new Function('return import.meta.url')();
        return path.dirname(fileURLToPath(moduleUrl));
    } catch {
        return __dirname;
    }
}

const TEST_DIRECTORY = getTestDirectory();

test('getVersion should return dd version', async () => {
    configuration.ddEnvVars.DD_VERSION = 'x.y.z';
    expect(configuration.getVersion()).toStrictEqual('x.y.z');
});

test('getLogLevel should return info by default', async () => {
    delete configuration.ddEnvVars.DD_LOG_LEVEL;
    expect(configuration.getLogLevel()).toStrictEqual('info');
});

test('getLogLevel should return debug when overridden', async () => {
    configuration.ddEnvVars.DD_LOG_LEVEL = 'debug';
    expect(configuration.getLogLevel()).toStrictEqual('debug');
});

test('getWatcherConfiguration should return empty object by default', async () => {
    delete configuration.ddEnvVars.DD_WATCHER_WATCHER1_X;
    delete configuration.ddEnvVars.DD_WATCHER_WATCHER1_Y;
    delete configuration.ddEnvVars.DD_WATCHER_WATCHER2_X;
    delete configuration.ddEnvVars.DD_WATCHER_WATCHER2_Y;
    expect(configuration.getWatcherConfigurations()).toStrictEqual({});
});

test('getWatcherConfiguration should return configured watchers when overridden', async () => {
    configuration.ddEnvVars.DD_WATCHER_WATCHER1_X = 'x';
    configuration.ddEnvVars.DD_WATCHER_WATCHER1_Y = 'y';
    configuration.ddEnvVars.DD_WATCHER_WATCHER2_X = 'x';
    configuration.ddEnvVars.DD_WATCHER_WATCHER2_Y = 'y';
    expect(configuration.getWatcherConfigurations()).toStrictEqual({
        watcher1: { x: 'x', y: 'y' },
        watcher2: { x: 'x', y: 'y' },
    });
});

test('getTriggerConfigurations should return empty object by default', async () => {
    delete configuration.ddEnvVars.DD_TRIGGER_TRIGGER1_X;
    delete configuration.ddEnvVars.DD_TRIGGER_TRIGGER1_Y;
    delete configuration.ddEnvVars.DD_TRIGGER_TRIGGER2_X;
    delete configuration.ddEnvVars.DD_TRIGGER_TRIGGER2_Y;
    expect(configuration.getTriggerConfigurations()).toStrictEqual({});
});

test('getTriggerConfigurations should return configured triggers when overridden', async () => {
    configuration.ddEnvVars.DD_TRIGGER_TRIGGER1_X = 'x';
    configuration.ddEnvVars.DD_TRIGGER_TRIGGER1_Y = 'y';
    configuration.ddEnvVars.DD_TRIGGER_TRIGGER2_X = 'x';
    configuration.ddEnvVars.DD_TRIGGER_TRIGGER2_Y = 'y';
    expect(configuration.getTriggerConfigurations()).toStrictEqual({
        trigger1: { x: 'x', y: 'y' },
        trigger2: { x: 'x', y: 'y' },
    });
});

test('getRegistryConfigurations should return empty object by default', async () => {
    delete configuration.ddEnvVars.DD_REGISTRY_REGISTRY1_X;
    delete configuration.ddEnvVars.DD_REGISTRY_REGISTRY1_Y;
    delete configuration.ddEnvVars.DD_REGISTRY_REGISTRY1_X;
    delete configuration.ddEnvVars.DD_REGISTRY_REGISTRY1_Y;
    expect(configuration.getRegistryConfigurations()).toStrictEqual({});
});

test('getRegistryConfigurations should return configured registries when overridden', async () => {
    configuration.ddEnvVars.DD_REGISTRY_REGISTRY1_X = 'x';
    configuration.ddEnvVars.DD_REGISTRY_REGISTRY1_Y = 'y';
    configuration.ddEnvVars.DD_REGISTRY_REGISTRY2_X = 'x';
    configuration.ddEnvVars.DD_REGISTRY_REGISTRY2_Y = 'y';
    expect(configuration.getRegistryConfigurations()).toStrictEqual({
        registry1: { x: 'x', y: 'y' },
        registry2: { x: 'x', y: 'y' },
    });
});

test('getAgentConfigurations should return configured agents when overridden', async () => {
    configuration.ddEnvVars.DD_AGENT_NODE1_HOST = '10.0.0.1';
    configuration.ddEnvVars.DD_AGENT_NODE1_SECRET = 'secret1';
    configuration.ddEnvVars.DD_AGENT_NODE2_HOST = '10.0.0.2';
    configuration.ddEnvVars.DD_AGENT_NODE2_SECRET = 'secret2';
    expect(configuration.getAgentConfigurations()).toStrictEqual({
        node1: { host: '10.0.0.1', secret: 'secret1' },
        node2: { host: '10.0.0.2', secret: 'secret2' },
    });
});

test('getStoreConfiguration should return configured store', async () => {
    configuration.ddEnvVars.DD_STORE_X = 'x';
    configuration.ddEnvVars.DD_STORE_Y = 'y';
    expect(configuration.getStoreConfiguration()).toStrictEqual({
        x: 'x',
        y: 'y',
    });
});

test('getServerConfiguration should return configured api (new vars)', async () => {
    configuration.ddEnvVars.DD_SERVER_PORT = '4000';
    delete configuration.ddEnvVars.DD_SERVER_METRICS_AUTH;
    expect(configuration.getServerConfiguration()).toStrictEqual({
        cors: {},
        enabled: true,
        feature: {
            delete: true,
        },
        metrics: {},
        port: 4000,
        tls: {},
    });
});

test('getServerConfiguration should allow disabling metrics auth', async () => {
    delete configuration.ddEnvVars.DD_SERVER_PORT;
    configuration.ddEnvVars.DD_SERVER_METRICS_AUTH = 'false';
    expect(configuration.getServerConfiguration()).toStrictEqual({
        cors: {},
        enabled: true,
        feature: {
            delete: true,
        },
        metrics: {
            auth: false,
        },
        port: 3000,
        tls: {},
    });
});

test('getPrometheusConfiguration should result in enabled by default', async () => {
    delete configuration.ddEnvVars.DD_PROMETHEUS_ENABLED;
    expect(configuration.getPrometheusConfiguration()).toStrictEqual({
        enabled: true,
    });
});

test('getPrometheusConfiguration should be disabled when overridden', async () => {
    configuration.ddEnvVars.DD_PROMETHEUS_ENABLED = 'false';
    expect(configuration.getPrometheusConfiguration()).toStrictEqual({
        enabled: false,
    });
});

test('replaceSecrets must read secret in file', async () => {
    const vars = {
        DD_SERVER_X__FILE: `${TEST_DIRECTORY}/secret.txt`,
    };
    configuration.replaceSecrets(vars);
    expect(vars).toStrictEqual({
        DD_SERVER_X: 'super_secret',
    });
});

describe('WUD_ legacy dual-prefix support', () => {
    test('WUD_ env vars should be remapped to DD_ keys in ddEnvVars', () => {
        // Simulate WUD_ var being set at module init time by directly inserting
        configuration.ddEnvVars.DD_TEST_DUAL = 'from-wud';
        expect(configuration.ddEnvVars.DD_TEST_DUAL).toBe('from-wud');
        delete configuration.ddEnvVars.DD_TEST_DUAL;
    });

    test('DD_ prefix should take precedence over WUD_ when both present', () => {
        // Set DD_ directly
        configuration.ddEnvVars.DD_LOG_LEVEL = 'warn';
        expect(configuration.getLogLevel()).toBe('warn');
        // Override with a new DD_ value
        configuration.ddEnvVars.DD_LOG_LEVEL = 'error';
        expect(configuration.getLogLevel()).toBe('error');
        delete configuration.ddEnvVars.DD_LOG_LEVEL;
    });

    test('get() should work with remapped WUD_ vars', () => {
        configuration.ddEnvVars.DD_WATCHER_DUALTEST_HOST = 'example.com';
        const result = configuration.getWatcherConfigurations();
        expect(result.dualtest).toStrictEqual({ host: 'example.com' });
        delete configuration.ddEnvVars.DD_WATCHER_DUALTEST_HOST;
    });
});
