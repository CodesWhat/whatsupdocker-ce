// @ts-nocheck
import Trueforge from './trueforge.js';

vi.mock('axios');

const trueforge = new Trueforge();
trueforge.configuration = {
    namespace: 'namespace',
    account: 'account',
    token: 'token',
};

vi.mock('axios');

test('validatedConfiguration should initialize when auth configuration is valid', async () => {
    expect(
        trueforge.validateConfiguration({
            namespace: 'namespace',
            account: 'account',
            token: 'token',
        }),
    ).toStrictEqual({
        namespace: 'namespace',
        account: 'account',
        token: 'token',
    });
});

test('validatedConfiguration should initialize when anonymous configuration is valid', async () => {
    expect(trueforge.validateConfiguration('')).toStrictEqual({});
    expect(trueforge.validateConfiguration(undefined)).toStrictEqual({});
});

test('validatedConfiguration should throw error when configuration is missing', async () => {
    expect(() => {
        trueforge.validateConfiguration({});
    }).toThrow();
});

test('match should return true when registry url is from trueforge', async () => {
    expect(
        trueforge.match({
            registry: {
                url: 'oci.trueforge.org',
            },
        }),
    ).toBeTruthy();
});

test('match should return false when registry url is not from trueforge', async () => {
    expect(
        trueforge.match({
            registry: {
                url: 'wrong.io',
            },
        }),
    ).toBeFalsy();
});

test('normalizeImage should return the proper registry v2 endpoint', async () => {
    expect(
        trueforge.normalizeImage({
            name: 'test/image',
            registry: {
                url: 'oci.trueforge.org/test/image',
            },
        }),
    ).toStrictEqual({
        name: 'test/image',
        registry: {
            url: 'https://oci.trueforge.org/test/image/v2',
        },
    });
});

test('getAuthPull should return quay-compatible pull credentials', async () => {
    expect(trueforge.getAuthPull()).toStrictEqual({
        username: 'namespace+account',
        password: 'token',
    });
});
