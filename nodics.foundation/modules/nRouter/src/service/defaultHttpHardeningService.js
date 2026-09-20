/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nRouter/service/DefaultHttpHardeningService
 * @description Applies topology-aware HTTP hardening to Express applications using
 * layered Nodics configuration for proxy trust, security headers, CORS, rate
 * limits, and body parser limits.
 * @layer service
 * @owner nRouter
 * @override Project, environment, server, or node modules may override this
 * service or the `httpHardening` property tree to align HTTP behavior with
 * deployment topology without changing framework source.
 *
 * @property {Object} requestCounters In-memory per-process rate-limit counters.
 */
module.exports = {

    /**
     * In-memory request counters used by the default rate limiter.
     *
     * @type {Object}
     */
    requestCounters: {},

    /**
     * Initializes the HTTP hardening service.
     *
     * @param {Object} options Nodics initialization options.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return Promise.resolve().then(() => {
            this.resolveCorsOrigins(this.getPolicy().cors || {});
            return true;
        });
    },

    /**
     * Finalizes the HTTP hardening service.
     *
     * @param {Object} options Nodics initialization options.
     * @returns {Promise<boolean>} Resolves when post-initialization is complete.
     */
    postInit: function (options) {
        return Promise.resolve(true);
    },

    /**
     * Returns effective HTTP hardening configuration.
     *
     * @returns {Object} Effective HTTP hardening policy.
     */
    getPolicy: function () {
        const policy = CONFIG.get('httpHardening') || {};
        const cors = { ...(policy.cors || {}) };
        return { ...policy, cors };
    },

    /**
     * Applies Express app-level properties such as proxy trust.
     *
     * @param {Object} app Express app instance.
     * @returns {void}
     * @sideEffects Updates Express app settings.
     */
    applyAppProperties: function (app) {
        let policy = this.getPolicy();
        if (!policy.enabled) {
            return;
        }
        if (typeof app.set === 'function' && Object.prototype.hasOwnProperty.call(policy, 'trustProxy')) {
            app.set('trust proxy', policy.trustProxy);
        }
    },

    /**
     * Applies hardening middleware in front of body parsing and route handling.
     *
     * @param {Object} app Express app instance.
     * @returns {void}
     * @sideEffects Registers security header, CORS, and rate-limit middleware.
     */
    applyHttpMiddleware: function (app) {
        let policy = this.getPolicy();
        if (!policy.enabled || typeof app.use !== 'function') {
            return;
        }
        app.use((req, res, next) => {
            this.applySecurityHeaders(req, res, policy.securityHeaders);
            this.applyCorrelationHeaders(req, res);
            if (this.applyCors(req, res, policy.cors)) {
                return;
            }
            if (!this.applyRateLimit(req, res, policy.rateLimit)) {
                return;
            }
            next();
        });
    },

    /**
     * Applies configured security response headers.
     *
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {Object} securityHeaders Security header policy.
     * @returns {void}
     * @sideEffects Mutates response headers.
     */
    applySecurityHeaders: function (req, res, securityHeaders) {
        if (!securityHeaders || !securityHeaders.enabled || !securityHeaders.headers || typeof res.setHeader !== 'function') {
            return;
        }
        Object.keys(securityHeaders.headers).forEach(headerName => {
            let value = securityHeaders.headers[headerName];
            if (value !== undefined && value !== null && value !== false) {
                res.setHeader(headerName, String(value));
            }
        });
    },

    /**
     * Applies CORS policy and completes preflight requests when configured.
     *
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {Object} cors CORS policy.
     * @returns {boolean} True when the request was completed as CORS preflight.
     */
    applyCors: function (req, res, cors) {
        if (!cors || !cors.enabled || typeof res.setHeader !== 'function') {
            return false;
        }
        let requestOrigin = req.headers && req.headers.origin;
        let allowedOrigin = this.resolveAllowedOrigin(requestOrigin, cors);
        if (requestOrigin && typeof res.setHeader === 'function') {
            res.setHeader('Vary', 'Origin');
        }
        if (allowedOrigin) {
            const allowedHeaders = this.resolveCorsHeaderList(cors.allowedHeaders, cors.allowedHeaderOverrides);
            const exposedHeaders = this.resolveCorsHeaderList(cors.exposedHeaders, cors.exposedHeaderOverrides);
            res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
            if (cors.allowCredentials) {
                res.setHeader('Access-Control-Allow-Credentials', 'true');
            }
            this.setHeaderFromList(res, 'Access-Control-Allow-Methods', cors.allowedMethods);
            this.setHeaderFromList(res, 'Access-Control-Allow-Headers', allowedHeaders);
            this.setHeaderFromList(res, 'Access-Control-Expose-Headers', exposedHeaders);
            if (cors.maxAge !== undefined && cors.maxAge !== null) {
                res.setHeader('Access-Control-Max-Age', String(cors.maxAge));
            }
        }
        if (String(req.method || '').toUpperCase() === 'OPTIONS') {
            res.statusCode = allowedOrigin ? 204 : 403;
            if (typeof res.end === 'function') {
                res.end();
            }
            return true;
        }
        if (requestOrigin && !allowedOrigin) {
            res.statusCode = 403;
            if (typeof res.json === 'function') {
                res.json({
                    code: 'ERR_RTR_00003',
                    responseCode: '403',
                    message: 'Request origin is not allowed'
                });
            } else if (typeof res.end === 'function') {
                res.end();
            }
            return true;
        }
        return false;
    },

    /**
     * Applies case-insensitive header additions/removals to an inherited CORS list.
     * @param {string[]} headers Existing baseline; an explicit replacement remains supported.
     * @param {Object<string,boolean>} overrides Header names mapped to true (include) or false (remove).
     * @returns {string[]} A fresh resolved list; neither declaration is mutated.
     * @throws {TypeError} When an override map contains invalid HTTP names or non-boolean choices.
     */
    resolveCorsHeaderList: function (headers, overrides) {
        if (overrides === undefined) return Array.isArray(headers) ? headers.slice() : [];
        if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides) ||
            ![Object.prototype, null].includes(Object.getPrototypeOf(overrides))) {
            throw new TypeError('CORS header overrides must be a boolean map');
        }
        const entries = Object.entries(overrides);
        const seen = new Set();
        for (const [name, enabled] of entries) {
            if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name) || typeof enabled !== 'boolean') {
                throw new TypeError('CORS header overrides require HTTP token names and boolean values');
            }
            if (seen.has(name.toLowerCase())) throw new TypeError('CORS header overrides contain duplicate case variants');
            seen.add(name.toLowerCase());
        }
        let result = Array.isArray(headers) ? headers.slice() : [];
        for (const [name, enabled] of entries) {
            const normalized = name.toLowerCase();
            if (!enabled) result = result.filter(value => String(value).toLowerCase() !== normalized);
            else if (!result.some(value => String(value).toLowerCase() === normalized)) result.push(name);
        }
        return result;
    },

    /**
     * Builds an exact browser origin from a configured endpoint and framework defaults.
     * @param {string|Object} endpoint Full origin URL or host/protocol/port declaration.
     * @param {Object} defaults Framework-owned host and protocol, extended by later layers.
     * @returns {string} Canonical HTTP(S) origin, including a non-default port.
     * @throws {TypeError} When the endpoint is not a concrete HTTP(S) browser origin.
     */
    createCorsOrigin: function (endpoint, defaults) {
        let value = endpoint;
        if (typeof endpoint !== 'string') {
            if (!endpoint || typeof endpoint !== 'object' || Array.isArray(endpoint) ||
                !Number.isInteger(endpoint.port) || endpoint.port < 1 || endpoint.port > 65535) {
                throw new TypeError('CORS endpoint requires a valid numeric port');
            }
            const host = endpoint.host === undefined ? defaults.host : endpoint.host;
            const protocol = endpoint.protocol === undefined ? defaults.protocol : endpoint.protocol;
            if (typeof host !== 'string' || !host || host !== host.trim() ||
                typeof protocol !== 'string' || !['http', 'https'].includes(protocol)) {
                throw new TypeError('CORS endpoint requires a host and HTTP(S) protocol');
            }
            value = protocol + '://' + host + ':' + endpoint.port;
        }
        if (/[\u0000-\u0020\u007f]/.test(value)) {
            throw new TypeError('CORS endpoint cannot contain whitespace or control characters');
        }
        let url;
        try { url = new URL(value); } catch (error) {
            throw new TypeError('CORS endpoint requires a valid origin URL');
        }
        if (!['http:', 'https:'].includes(url.protocol) || !url.hostname ||
            url.hostname.includes('*') || ['0.0.0.0', '[::]'].includes(url.hostname) ||
            url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
            throw new TypeError('CORS endpoint requires a concrete HTTP(S) origin without credentials or paths');
        }
        return url.origin;
    },

    /**
     * Resolves configured CORS endpoints and explicit origin lists without discovery or request input.
     * @param {Object} cors Effective layered CORS configuration.
     * @returns {Object} Independent allowedOrigins and deniedOrigins arrays; denials take precedence.
     * @throws {TypeError} When endpoint identities, overrides or origin declarations are malformed.
     */
    resolveCorsOrigins: function (cors) {
        const endpoints = cors.originEndpoints || {};
        const overrides = cors.originEndpointOverrides === undefined ? {} : cors.originEndpointOverrides;
        const defaults = cors.originDefaults || {};
        if (!endpoints || typeof endpoints !== 'object' ||
            (!Array.isArray(endpoints) && ![Object.prototype, null].includes(Object.getPrototypeOf(endpoints))) ||
            !overrides || typeof overrides !== 'object' || Array.isArray(overrides) ||
            ![Object.prototype, null].includes(Object.getPrototypeOf(overrides))) {
            throw new TypeError('CORS endpoints and overrides require configured collections');
        }
        const allowedOrigins = cors.allowedOrigins === undefined ? [] : cors.allowedOrigins;
        const deniedOrigins = cors.deniedOrigins === undefined ? [] : cors.deniedOrigins;
        if (![allowedOrigins, deniedOrigins].every(list => Array.isArray(list) && list.every(value => typeof value === 'string'))) {
            throw new TypeError('CORS explicit origins must be string arrays');
        }
        const allowed = new Set(allowedOrigins), denied = new Set(deniedOrigins);
        const entries = Array.isArray(endpoints) ? endpoints.map(endpoint => [endpoint && endpoint.code, endpoint]) : Object.entries(endpoints);
        if (entries.length > 10000) throw new TypeError('CORS endpoint collection exceeds bounded limits');
        const codes = new Set();
        for (const [code, endpoint] of entries) {
            if (typeof code !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(code) ||
                ['constructor', 'prototype', '__proto__'].includes(code) || codes.has(code)) {
                throw new TypeError('CORS endpoints require distinct configured codes');
            }
            codes.add(code);
            const origin = this.createCorsOrigin(endpoint, defaults);
            if (overrides[code] === false) denied.add(origin);
            else allowed.add(origin);
        }
        for (const [code, enabled] of Object.entries(overrides)) {
            if (!codes.has(code) || typeof enabled !== 'boolean') {
                throw new TypeError('CORS endpoint overrides require known codes and boolean values');
            }
        }
        return { allowedOrigins: [...allowed], deniedOrigins: [...denied] };
    },

    /**
     * Echoes bounded request correlation values as response metadata.
     *
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @returns {void}
     */
    applyCorrelationHeaders: function (req, res) {
        if (!res || typeof res.setHeader !== 'function') return;
        let headers = req && req.headers || {};
        let requestId = String(headers['x-request-id'] || headers.requestid || '').trim();
        let correlationId = String(headers['x-correlation-id'] || headers.correlationid || requestId).trim();
        let safe = value => /^[A-Za-z0-9._:-]{1,128}$/.test(value);
        if (safe(requestId)) res.setHeader('X-Request-Id', requestId);
        if (safe(correlationId)) res.setHeader('X-Correlation-Id', correlationId);
    },

    /**
     * Resolves the response origin value for a CORS request.
     *
     * @param {string} requestOrigin Incoming request origin.
     * @param {Object} cors CORS policy.
     * @returns {string|undefined} Allowed origin header value.
     */
    resolveAllowedOrigin: function (requestOrigin, cors) {
        const { allowedOrigins, deniedOrigins } = this.resolveCorsOrigins(cors);
        if (requestOrigin && deniedOrigins.indexOf(requestOrigin) >= 0) {
            return undefined;
        }
        if (!requestOrigin || allowedOrigins.length === 0) {
            return undefined;
        }
        if (allowedOrigins.indexOf('*') >= 0) {
            return cors.allowCredentials ? requestOrigin : '*';
        }
        return allowedOrigins.indexOf(requestOrigin) >= 0 ? requestOrigin : undefined;
    },

    /**
     * Applies a list-valued response header.
     *
     * @param {Object} res Express response.
     * @param {string} headerName Header name.
     * @param {Array<string>} values Header values.
     * @returns {void}
     */
    setHeaderFromList: function (res, headerName, values) {
        if (values && values.length > 0) {
            res.setHeader(headerName, values.join(', '));
        }
    },

    /**
     * Applies a simple in-memory rate limit for the current process.
     *
     * @param {Object} req Express request.
     * @param {Object} res Express response.
     * @param {Object} rateLimit Rate-limit policy.
     * @returns {boolean} True when the request may continue.
     * @sideEffects Updates in-memory request counters and may write a 429 response.
     */
    applyRateLimit: function (req, res, rateLimit) {
        if (!rateLimit || !rateLimit.enabled) {
            return true;
        }
        if (rateLimit.skipOptions && String(req.method || '').toUpperCase() === 'OPTIONS') {
            return true;
        }
        let now = Date.now();
        let windowMs = Number(rateLimit.windowMs || 60000);
        let max = Number(rateLimit.max || 0);
        if (max <= 0) {
            return true;
        }
        let key = this.getRateLimitKey(req, rateLimit);
        let counter = this.requestCounters[key];
        if (!counter || counter.resetAt <= now) {
            counter = {
                count: 0,
                resetAt: now + windowMs
            };
            this.requestCounters[key] = counter;
        }
        counter.count += 1;
        if (typeof res.setHeader === 'function') {
            res.setHeader('X-RateLimit-Limit', String(max));
            res.setHeader('X-RateLimit-Remaining', String(Math.max(max - counter.count, 0)));
            res.setHeader('X-RateLimit-Reset', String(Math.ceil(counter.resetAt / 1000)));
        }
        if (counter.count > max) {
            res.statusCode = 429;
            if (typeof res.setHeader === 'function') {
                res.setHeader('Retry-After', String(Math.max(1, Math.ceil((counter.resetAt - now) / 1000))));
            }
            if (typeof res.json === 'function') {
                res.json({
                    code: 'ERR_RTR_00004',
                    responseCode: '429',
                    message: 'HTTP rate limit exceeded'
                });
            } else if (typeof res.end === 'function') {
                res.end('HTTP rate limit exceeded');
            }
            return false;
        }
        return true;
    },

    /**
     * Resolves the rate-limit key from headers or request connection metadata.
     *
     * @param {Object} req Express request.
     * @param {Object} rateLimit Rate-limit policy.
     * @returns {string} Rate-limit key.
     */
    getRateLimitKey: function (req, rateLimit) {
        let headers = req.headers || {};
        let keyHeaders = rateLimit.keyHeaders || [];
        for (let index = 0; index < keyHeaders.length; index++) {
            let value = headers[String(keyHeaders[index]).toLowerCase()];
            if (value) {
                return String(value).split(',')[0].trim();
            }
        }
        return req.ip || (req.connection && req.connection.remoteAddress) || 'unknown';
    },

    /**
     * Returns URL-encoded parser options from HTTP hardening configuration.
     *
     * @returns {Object} URL-encoded parser options.
     */
    getUrlencodedParserOptions: function () {
        let policy = this.getPolicy();
        return (policy.body && policy.body.urlencoded) || { extended: true };
    },

    /**
     * Returns JSON parser options from HTTP hardening configuration.
     *
     * @returns {Object} JSON parser options.
     */
    getJsonParserOptions: function () {
        let policy = this.getPolicy();
        return (policy.body && policy.body.json) || {};
    },

    /**
     * Returns text parser options from HTTP hardening configuration.
     *
     * @returns {Object} Text parser options.
     */
    getTextParserOptions: function () {
        let policy = this.getPolicy();
        return (policy.body && policy.body.text) || {};
    }
};
