/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nRouter/test/HttpHardeningContract
 * @description Verifies that nRouter applies topology-aware HTTP hardening
 * through layered configuration for proxy trust, security headers, CORS, rate
 * limits, and body parser limit policy.
 * @layer test
 * @owner nRouter
 * @override Project modules may add equivalent tests for project-specific HTTP
 * policies while preserving the same property-driven extension contract.
 */

const assert = require('assert');
const defaultPolicy = require('../config/properties').httpHardening;

assert(defaultPolicy.cors.allowedHeaders.includes('X-Enterprise-Code'),
    'CORS must allow the canonical enterprise header consumed by the request pipeline');
assert.strictEqual(defaultPolicy.securityHeaders.headers['Cache-Control'], 'no-store',
    'API responses must default to no-store until an owning response contract explicitly replaces caching');

// @nodics-capability-behavior @nodics-area router
const policy = {
    enabled: true,
    trustProxy: 'loopback',
    body: {
        urlencoded: {
            extended: true,
            limit: '2kb',
            parameterLimit: 12
        },
        json: {
            limit: '3kb',
            strict: true
        },
        text: {
            limit: '4kb',
            type: 'text/plain'
        }
    },
    securityHeaders: {
        enabled: true,
        headers: {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY'
        }
    },
    cors: {
        enabled: true,
        allowedOrigins: ['http://localhost:5173'],
        deniedOrigins: ['http://denied.example'],
        allowedMethods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Enterprise-Code'],
        exposedHeaders: ['X-Nodics-Trace'],
        allowCredentials: true,
        maxAge: 120
    },
    rateLimit: {
        enabled: true,
        windowMs: 60000,
        max: 1,
        skipOptions: true,
        keyHeaders: ['x-forwarded-for']
    }
};

global.CONFIG = {
    get: function (key) {
        if (key === 'httpHardening') {
            return policy;
        }
        return undefined;
    }
};

const service = Object.assign({}, require('../src/service/defaultHttpHardeningService'), {
    requestCounters: {}
});

global.SERVICE = {
    DefaultHttpHardeningService: service
};

const appConfig = require('../src/router/appConfig').default;

function createApp() {
    return {
        settings: {},
        middleware: [],
        set: function (key, value) {
            this.settings[key] = value;
        },
        use: function (handler) {
            this.middleware.push(handler);
        }
    };
}

function createResponse() {
    return {
        statusCode: 200,
        headers: {},
        ended: false,
        jsonBody: undefined,
        setHeader: function (key, value) {
            this.headers[key] = value;
        },
        end: function () {
            this.ended = true;
        },
        json: function (body) {
            this.jsonBody = body;
            this.ended = true;
        }
    };
}

function runMiddleware(req, res) {
    let continued = false;
    service.applyHttpMiddleware({
        use: function (handler) {
            handler(req, res, function () {
                continued = true;
            });
        }
    });
    return continued;
}

const app = createApp();
appConfig.initProperties(app);
assert.strictEqual(app.settings['trust proxy'], 'loopback', 'Proxy trust should come from httpHardening.trustProxy');
assert.strictEqual(app.middleware.length, 1, 'HTTP hardening middleware should be registered early');

const firstResponse = createResponse();
let firstContinued = runMiddleware({
    method: 'GET',
    headers: {
        origin: 'http://localhost:5173',
        'x-forwarded-for': '10.0.0.10'
    }
}, firstResponse);
assert.strictEqual(firstContinued, true, 'Allowed request should continue');
assert.strictEqual(firstResponse.headers['X-Content-Type-Options'], 'nosniff', 'Security header should be applied');
assert.strictEqual(firstResponse.headers['Access-Control-Allow-Origin'], 'http://localhost:5173', 'Allowed CORS origin should be echoed');
assert.strictEqual(firstResponse.headers['Access-Control-Allow-Credentials'], 'true', 'Credentials policy should be applied');
assert.strictEqual(firstResponse.headers.Vary, 'Origin', 'Credentialed CORS responses must vary by origin');
assert.strictEqual(firstResponse.headers['X-RateLimit-Remaining'], '0', 'Rate limit remaining header should be emitted');
assert(firstResponse.headers['Access-Control-Allow-Headers'].includes('X-Enterprise-Code'),
    'CORS response must advertise the canonical enterprise header');

const limitedResponse = createResponse();
let limitedContinued = runMiddleware({
    method: 'GET',
    headers: {
        origin: 'http://localhost:5173',
        'x-forwarded-for': '10.0.0.10'
    }
}, limitedResponse);
assert.strictEqual(limitedContinued, false, 'Second request over the limit should stop');
assert.strictEqual(limitedResponse.statusCode, 429, 'Rate limited request should use HTTP 429');
assert.strictEqual(limitedResponse.jsonBody.code, 'ERR_RTR_00004', 'Rate limit response should use router status code');
assert(Number(limitedResponse.headers['Retry-After']) >= 1, 'Rate limited request should tell clients when to retry');

const preflightResponse = createResponse();
let preflightContinued = runMiddleware({
    method: 'OPTIONS',
    headers: {
        origin: 'http://unknown.example'
    }
}, preflightResponse);
assert.strictEqual(preflightContinued, false, 'Preflight request should be completed by CORS middleware');
assert.strictEqual(preflightResponse.statusCode, 403, 'Disallowed preflight origin should fail closed');
assert.strictEqual(preflightResponse.ended, true, 'Preflight response should end');

const deniedActualResponse = createResponse();
let deniedActualContinued = runMiddleware({
    method: 'POST',
    headers: {
        origin: 'http://unknown.example',
        'x-forwarded-for': '10.0.0.11'
    }
}, deniedActualResponse);
assert.strictEqual(deniedActualContinued, false, 'Disallowed actual cross-origin requests must fail closed');
assert.strictEqual(deniedActualResponse.statusCode, 403);
assert.strictEqual(deniedActualResponse.jsonBody.code, 'ERR_RTR_00003');

const explicitlyDeniedResponse = createResponse();
let explicitlyDeniedContinued = runMiddleware({
    method: 'GET', headers: { origin: 'http://denied.example', 'x-forwarded-for': '10.0.0.13' }
}, explicitlyDeniedResponse);
assert.strictEqual(explicitlyDeniedContinued, false);
assert.strictEqual(explicitlyDeniedResponse.statusCode, 403);

const correlationResponse = createResponse();
let correlationContinued = runMiddleware({
    method: 'GET',
    headers: {
        origin: 'http://localhost:5173',
        'x-forwarded-for': '10.0.0.12',
        'x-request-id': 'axis-request-1',
        'x-correlation-id': 'axis-flow-1'
    }
}, correlationResponse);
assert.strictEqual(correlationContinued, true);
assert.strictEqual(correlationResponse.headers['X-Request-Id'], 'axis-request-1');
assert.strictEqual(correlationResponse.headers['X-Correlation-Id'], 'axis-flow-1');

assert.deepStrictEqual(service.getUrlencodedParserOptions(), policy.body.urlencoded, 'URL-encoded parser options should come from httpHardening');
assert.deepStrictEqual(service.getJsonParserOptions(), policy.body.json, 'JSON parser options should come from httpHardening');
assert.deepStrictEqual(service.getTextParserOptions(), policy.body.text, 'Text parser options should come from httpHardening');

console.log('HTTP hardening contract validated');

// The owner supplies the baseline; unrelated deployments select only header differences.
assert.deepStrictEqual(defaultPolicy.cors.allowedHeaderOverrides, {});
assert.deepStrictEqual(defaultPolicy.cors.exposedHeaderOverrides, {});
for (const [origin, additions, exposed] of [
    ['https://warehouse.example', { 'X-Warehouse-Id': true }, { ETag: true }],
    ['https://studio.example', { 'X-Studio-Id': true, authorization: false }, { 'X-Preview-Version': true }]
]) {
    const cors = Object.assign({}, defaultPolicy.cors, {
        enabled: true, allowedOrigins: [origin], allowedHeaderOverrides: additions,
        exposedHeaderOverrides: exposed
    });
    const res = createResponse();
    assert.strictEqual(service.applyCors({ method: 'OPTIONS', headers: { origin } }, res, cors), true);
    assert.strictEqual(res.statusCode, 204);
    assert(res.headers['Access-Control-Allow-Headers'].includes(Object.keys(additions)[0]));
    assert.strictEqual(res.headers['Access-Control-Allow-Credentials'], 'true');
    assert(res.headers['Access-Control-Expose-Headers'].includes(Object.keys(exposed)[0]));
    if (additions.authorization === false) assert(!res.headers['Access-Control-Allow-Headers'].includes('Authorization'));
    const denied = createResponse();
    service.applyCors({ method: 'OPTIONS', headers: { origin: 'https://unapproved.example' } }, denied, cors);
    assert.strictEqual(denied.statusCode, 403);
    assert.strictEqual(denied.headers['Access-Control-Allow-Headers'], undefined);
}
const originalHeaders = defaultPolicy.cors.allowedHeaders.slice();
assert.deepStrictEqual(service.resolveCorsHeaderList(['Authorization'], { authorization: true }), ['Authorization']);
assert.deepStrictEqual(service.resolveCorsHeaderList(['Authorization'], { authorization: false }), []);
assert.deepStrictEqual(service.resolveCorsHeaderList([], { 'X-Trace': true }), ['X-Trace']);
assert.deepStrictEqual(service.resolveCorsHeaderList([], {}), []);
for (const invalid of [[], null, { 'X-Trace': 'true' }, { 'X-Bad\r\nInjected': true }, { 'X-Trace': true, 'x-trace': false }]) {
    assert.throws(() => service.resolveCorsHeaderList(originalHeaders, invalid), /CORS header overrides/);
}
assert.deepStrictEqual(defaultPolicy.cors.allowedHeaders, originalHeaders);
const closed = createResponse();
service.applyCors({ method: 'OPTIONS', headers: { origin: 'https://warehouse.example' } }, closed,
    Object.assign({}, defaultPolicy.cors, { enabled: false, allowedHeaderOverrides: { 'X-Warehouse-Id': true } }));
assert.deepStrictEqual(closed.headers, {}, 'Header configuration must not enable CORS');


// Structured endpoints are deployment inputs; host/protocol defaults remain framework-owned.
const dynamicCors = {
    ...structuredClone(defaultPolicy.cors), enabled: true, allowCredentials: true,
    originEndpoints: [{ code: 'editor', port: 4400 }, { code: 'store', port: 4500 }],
    originEndpointOverrides: { store: false }
};
const originalDynamic = structuredClone(dynamicCors);
assert.strictEqual(service.resolveAllowedOrigin('http://localhost:4400', dynamicCors), 'http://localhost:4400');
assert.strictEqual(service.resolveAllowedOrigin('http://localhost:4500', dynamicCors), undefined);
assert.strictEqual(service.resolveAllowedOrigin('http://127.0.0.1:4400', dynamicCors), undefined);
assert.strictEqual(service.resolveAllowedOrigin('http://localhost:4401', dynamicCors), undefined);
assert.strictEqual(service.resolveAllowedOrigin(undefined, dynamicCors), undefined);
assert.deepStrictEqual(dynamicCors, originalDynamic);
const laterCors = structuredClone(dynamicCors);
laterCors.originDefaults = { protocol: 'https', host: 'preview.customer.example' };
laterCors.originEndpoints[0].port = 443;
laterCors.originEndpoints[1].port = 8443;
laterCors.allowedOrigins = ['https://preview.customer.example:8443'];
assert.strictEqual(service.resolveAllowedOrigin('https://preview.customer.example', laterCors), 'https://preview.customer.example');
assert.strictEqual(service.resolveAllowedOrigin('http://localhost:4400', laterCors), undefined);
assert.strictEqual(service.resolveAllowedOrigin('https://preview.customer.example:8443', laterCors), undefined,
    'A denied frontend follows its changed domain/port and defeats an explicit allow entry');
const allowResponse = createResponse();
service.applyCors({ method: 'OPTIONS', headers: { origin: 'https://preview.customer.example' } }, allowResponse, laterCors);
assert.strictEqual(allowResponse.statusCode, 204);
assert.strictEqual(allowResponse.headers['Access-Control-Allow-Origin'], 'https://preview.customer.example');
assert.strictEqual(allowResponse.headers['Access-Control-Allow-Credentials'], 'true');
const denyResponse = createResponse();
service.applyCors({ method: 'OPTIONS', headers: { origin: 'https://preview.customer.example:8443' } }, denyResponse, laterCors);
assert.strictEqual(denyResponse.statusCode, 403);
const closedResponse = createResponse();
assert.strictEqual(service.applyCors({ method: 'OPTIONS', headers: { origin: 'http://localhost:4400' } }, closedResponse,
    { ...dynamicCors, enabled: false }), false);
assert.strictEqual(closedResponse.headers['Access-Control-Allow-Origin'], undefined);
assert.strictEqual(defaultPolicy.cors.enabled, true);
assert.deepStrictEqual(service.resolveCorsOrigins(defaultPolicy.cors), {
    allowedOrigins: [3100, 3200, 3300, 3400, 3500, 3600].map(port => `http://localhost:${port}`),
    deniedOrigins: []
});
for (const port of [3100, 3200, 3300, 3400, 3500, 3600]) {
    assert.strictEqual(service.resolveAllowedOrigin(`http://localhost:${port}`, defaultPolicy.cors), `http://localhost:${port}`);
    assert.strictEqual(service.resolveAllowedOrigin(`http://127.0.0.1:${port}`, defaultPolicy.cors), undefined);
}
const urlsCors = { ...structuredClone(defaultPolicy.cors), originEndpoints: {
    editor: 'https://editor.customer.example/', public: { host: 'public.customer.example', protocol: 'https', port: 443 }
} };
assert.deepStrictEqual(service.resolveCorsOrigins(urlsCors).allowedOrigins, ['https://editor.customer.example', 'https://public.customer.example']);
assert.strictEqual(service.resolveAllowedOrigin('https://extra.customer.example', { ...urlsCors, allowedOrigins: ['https://extra.customer.example'] }), 'https://extra.customer.example');
for (const endpoint of [
    { port: 0 }, { port: 65536 }, { port: 4300.5 }, { port: '4300' }, {},
    { port: 4300, host: '' }, { port: 4300, host: '0.0.0.0' }, { port: 4300, host: '*.example' },
    { port: 4300, protocol: 'file' }, 'file:///tmp/data', 'https://name:password@example.com',
    'https://exa\nmple.com', ' https://example.com', 'https://example.com/path', 'https://example.com?token=x', 'https://example.com#fragment', 'https://*.example'
]) assert.throws(() => service.resolveCorsOrigins({ ...dynamicCors, originEndpoints: { bad: endpoint }, originEndpointOverrides: {} }), /CORS endpoint/);
assert.throws(() => service.resolveCorsOrigins({ ...dynamicCors, originEndpoints: 42 }), /collections/);
assert.throws(() => service.resolveCorsOrigins({ ...dynamicCors, originEndpoints: [{ code: 'same', port: 4400 }, { code: 'same', port: 4500 }] }), /distinct/);
assert.throws(() => service.resolveCorsOrigins({ ...dynamicCors, originEndpointOverrides: { missing: false } }), /known codes/);
assert.throws(() => service.resolveCorsOrigins({ ...dynamicCors, originEndpointOverrides: { editor: 'true' } }), /boolean/);
require('node:test')('HTTP initialization rejects malformed configured origin sources before serving requests', async () => {
    const invalid = { ...service, getPolicy: () => ({ cors: { ...dynamicCors, originEndpoints: { editor: { port: 0 } } } }) };
    await assert.rejects(invalid.init({}), /valid numeric port/);
    const valid = { ...service, getPolicy: () => ({ cors: dynamicCors }) };
    assert.strictEqual(await valid.init({}), true);
});


require('node:test')('frontend launch metadata cannot enable CORS or grant API origins', () => {
    const previous = global.CONFIG;
    try {
        global.CONFIG = { get: key => key === 'httpHardening' ? { ...structuredClone(defaultPolicy), cors: { ...structuredClone(defaultPolicy.cors), enabled: false, originEndpoints: {} } } : { editor: { port: 4400 } } };
        const isolated = service.getPolicy();
        assert.strictEqual(isolated.cors.enabled, false);
        assert.deepStrictEqual(service.resolveCorsOrigins(isolated.cors), { allowedOrigins: [], deniedOrigins: [] });
        isolated.cors.enabled = true;
        isolated.cors.originEndpoints = null;
        assert.deepStrictEqual(service.resolveCorsOrigins(isolated.cors), { allowedOrigins: [], deniedOrigins: [] });
    } finally { global.CONFIG = previous; }
});
