// @ts-nocheck
import OidcStrategy from './OidcStrategy.js';
import log from '../../../log/index.js';

const oidcStrategy = new OidcStrategy({}, () => {}, log);

beforeEach(async () => {
    oidcStrategy.success = jest.fn();
    oidcStrategy.fail = jest.fn();
});

test('authenticate should return user from session if so', async () => {
    oidcStrategy.authenticate({ isAuthenticated: () => true });
    expect(oidcStrategy.success).toHaveBeenCalled();
});

test('authenticate should call super.authenticate when no existing session', async () => {
    const fail = jest.spyOn(oidcStrategy, 'fail');
    oidcStrategy.authenticate({ isAuthenticated: () => false, headers: {} });
    expect(fail).toHaveBeenCalled();
});

test('authenticate should get & validate Bearer token', async () => {
    const verify = jest.spyOn(oidcStrategy, 'verify');
    oidcStrategy.authenticate({
        isAuthenticated: () => false,
        headers: {
            authorization: 'Bearer XXXXX',
        },
    });
    expect(verify).toHaveBeenCalledWith('XXXXX', expect.any(Function));
});
