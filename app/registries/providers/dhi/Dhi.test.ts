// @ts-nocheck
import Dhi from './Dhi';

// Mock axios
jest.mock('axios', () => jest.fn());

describe('DHI Registry', () => {
    let dhi;

    beforeEach(async () => {
        dhi = new Dhi();
        await dhi.register('registry', 'dhi', 'test', {});
        jest.clearAllMocks();
    });

    test('should create instance', async () => {
        expect(dhi).toBeDefined();
        expect(dhi).toBeInstanceOf(Dhi);
    });

    test('should have correct registry url after init', async () => {
        expect(dhi.configuration.url).toBe('https://dhi.io');
    });

    test('should match dhi registry', async () => {
        expect(dhi.match({ registry: { url: 'dhi.io' } })).toBe(true);
        expect(dhi.match({ registry: { url: 'sub.dhi.io' } })).toBe(true);
        expect(dhi.match({ registry: { url: 'docker.io' } })).toBe(false);
    });

    test('should normalize image url without adding library prefix', async () => {
        const image = { name: 'python', registry: {} };
        const normalized = dhi.normalizeImage(image);
        expect(normalized.name).toBe('python');
        expect(normalized.registry.url).toBe('https://dhi.io/v2');
    });

    test('should initialize with token as password', async () => {
        const dhiWithToken = new Dhi();
        await dhiWithToken.register('registry', 'dhi', 'test', {
            token: 'mytoken',
        });
        expect(dhiWithToken.configuration.password).toBe('mytoken');
    });

    test('should authenticate with credentials', async () => {
        const { default: axios } = await import('axios');
        axios.mockResolvedValue({ data: { token: 'auth-token' } });

        dhi.getAuthCredentials = jest.fn().mockReturnValue('base64credentials');

        const image = { name: 'python' };
        const requestOptions = { headers: {} };

        const result = await dhi.authenticate(image, requestOptions);

        expect(axios).toHaveBeenCalledWith({
            method: 'GET',
            url: 'https://dhi.io/token?service=registry.docker.io&scope=repository:python:pull&grant_type=password',
            headers: {
                Accept: 'application/json',
                Authorization: 'Basic base64credentials',
            },
        });
        expect(result.headers.Authorization).toBe('Bearer auth-token');
    });

    test('should authenticate without credentials', async () => {
        const { default: axios } = await import('axios');
        axios.mockResolvedValue({ data: { token: 'public-token' } });

        dhi.getAuthCredentials = jest.fn().mockReturnValue(null);

        const image = { name: 'python' };
        const requestOptions = { headers: {} };

        const result = await dhi.authenticate(image, requestOptions);

        expect(axios).toHaveBeenCalledWith({
            method: 'GET',
            url: 'https://dhi.io/token?service=registry.docker.io&scope=repository:python:pull&grant_type=password',
            headers: {
                Accept: 'application/json',
            },
        });
        expect(result.headers.Authorization).toBe('Bearer public-token');
    });

    test('should mask all configuration fields', async () => {
        dhi.configuration = {
            url: 'https://dhi.io',
            login: 'testuser',
            password: 'testpass',
            token: 'testtoken',
            auth: 'dGVzdDp0ZXN0',
        };
        const masked = dhi.maskConfiguration();
        expect(masked).toEqual({
            url: 'https://dhi.io',
            login: 'testuser',
            password: 't******s',
            token: 't*******n',
            auth: 'd**********0',
        });
    });
});
