/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** Isolated shared-cookie logout recovery; no browser, live service or credentials. */
const test = require('node:test');
const assert = require('node:assert/strict');
const service = require('../src/service/authentication/defaultBrowserSessionService');
const properties = require('../config/properties');

function fixture(customer = false) {
    const calls = [];
    global.CLASSES = { NodicsError: class extends Error {
        constructor(code, message) { super(message); this.code = code; }
    } };
    global.CONFIG = { get: key => {
        if (key === 'profileBrowserSession' || key === 'profileCustomerBrowserSession')
            return { ...properties[key], enabled: true };
        if (key === 'httpHardening') return { cors: {
            enabled: true, allowCredentials: true,
            allowedOrigins: ['https://axis.example.test', 'https://circa.example.test'],
        } };
        if (key === 'profileModuleName') return 'profile';
    } };
    global.SERVICE = {
        DefaultHttpHardeningService: require('../../../../nodics.foundation/modules/nRouter/src/service/defaultHttpHardeningService'),
        DefaultAuthenticationProviderService: {
            removeToken: async (moduleName, token) => { calls.push({ moduleName, token }); return true; },
        },
    };
    const policy = customer ? properties.profileCustomerBrowserSession : properties.profileBrowserSession;
    const request = (headers = {}) => {
        const responseHeaders = {};
        return {
            browserSessionPrincipalType: customer ? 'Customer' : 'Employee',
            entCode: 'old-enterprise',
            httpRequest: { headers: { origin: 'https://axis.example.test', ...headers } },
            httpResponse: { setHeader: (key, value) => { responseHeaders[key] = value; } },
            responseHeaders,
        };
    };
    return { calls, policy, request };
}

for (const customer of [false, true]) {
    test(`already-absent ${customer ? 'Customer' : 'Employee'} logout acknowledges without cookie writes or revocation`, async () => {
        const f = fixture(customer);
        for (const headers of [{}, { 'x-csrf-token': '' }, { cookie: 'unrelated=value' }]) {
            const request = f.request(headers);
            assert.equal(await service.logout(request), true);
            assert.deepEqual(request.responseHeaders, { 'Cache-Control': 'no-store' });
        }
        assert.deepEqual(f.calls, []);
        assert.throws(() => service.logout(f.request({ origin: 'https://evil.example.test' })), { code: 'ERR_AUTH_00001' });
        assert.throws(() => service.logout(f.request({ origin: '' })), { code: 'ERR_AUTH_00001' });
    });
}

test('partial, malformed and mismatched proof never takes absent-session recovery', () => {
    const f = fixture();
    const { refreshCookieName: refresh, csrfCookieName: csrf } = f.policy;
    for (const headers of [
        { cookie: `${refresh}=proof` },
        { cookie: `${refresh}=` },
        { cookie: `${csrf}=` },
        { cookie: `${csrf}=proof` },
        { 'x-csrf-token': 'stale' },
        { cookie: `${refresh}=proof; ${csrf}=proof`, 'x-csrf-token': 'wrong' },
        { cookie: `${refresh}=%ZZ` },
    ]) assert.throws(() => service.logout(f.request(headers)), { code: 'ERR_AUTH_00001' });
    assert.deepEqual(f.calls, []);
});

test('shared employee logout then absent retry succeeds without affecting customer namespace', async () => {
    const f = fixture();
    const { refreshCookieName: refresh, csrfCookieName: csrf } = f.policy;
    const initial = f.request({ origin: 'https://circa.example.test',
        cookie: `${refresh}=shared-refresh; ${csrf}=proof`, 'x-csrf-token': 'proof' });
    assert.equal(await service.logout(initial), true);
    assert.deepEqual(f.calls, [{ moduleName: 'profile', token: 'shared-refresh' }]);
    assert(initial.responseHeaders['Set-Cookie'].every(cookie => cookie.includes('Max-Age=0')));
    const retry = f.request({ cookie: 'nodics_customer_refresh=customer; nodics_customer_csrf=customer-proof' });
    assert.equal(await service.logout(retry), true);
    assert.equal(retry.responseHeaders['Set-Cookie'], undefined);
    assert.equal(f.calls.length, 1);
});

test('owner revocation outage still refuses success and retains cookies', async () => {
    const f = fixture();
    SERVICE.DefaultAuthenticationProviderService.removeToken = async () => { throw new Error('unavailable'); };
    const request = f.request({ cookie: 'nodics_axis_refresh=proof; nodics_axis_csrf=csrf', 'x-csrf-token': 'csrf' });
    await assert.rejects(service.logout(request), /unavailable/);
    assert.equal(request.responseHeaders['Set-Cookie'], undefined);
});
