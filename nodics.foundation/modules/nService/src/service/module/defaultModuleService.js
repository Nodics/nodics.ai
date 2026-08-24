/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const requestPromise = require('node-fetch');
const _ = require('lodash');
const http = require('http');
const https = require('https');

/**
 * @module service/module/DefaultModuleService
 * @description Builds and executes internal module-to-module and external HTTP
 * requests for Nodics. It normalizes authentication, API key, and enterprise
 * headers to the modern standard while preserving legacy header compatibility.
 * @layer service
 * @owner nService
 * @override Project modules may override this service to customize service
 * discovery, header policy, timeout handling, or fetch implementation while
 * preserving `buildRequest`, `buildExternalRequest`, and `fetch` contracts.
 *
 * @property {Object} SERVICE.DefaultRouterService Resolves module API URLs.
 * @property {Object} CLASSES.NodicsError Enriches remote-call errors with request context.
 */
module.exports = {
    _agents: null,
    _circuits: null,
    _diagnostics: null,
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        this.initializeTransport();
        if (SERVICE.DefaultRuntimeLifecycleService) {
            SERVICE.DefaultRuntimeLifecycleService.registerContributor('moduleHttpTransport', {
                order: 900,
                shutdown: () => this.closeTransport()
            });
        }
        return Promise.resolve(true);
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /** Returns the effective layered HTTP resilience policy. */
    getTransportConfiguration: function () {
        let configuration = CONFIG.get('serviceCommunication');
        if (!configuration) {
            throw new CLASSES.NodicsError('ERR_SYS_00000', 'Module service communication configuration is missing');
        }
        return _.merge({}, configuration);
    },

    /** Lazily creates shared agents, circuit state, and diagnostic counters. */
    initializeTransport: function () {
        let pool = this.getTransportConfiguration().connectionPool;
        let agentOptions = {
            keepAlive: pool.keepAlive !== false,
            keepAliveMsecs: pool.keepAliveMsecs,
            maxSockets: pool.maxSockets,
            maxFreeSockets: pool.maxFreeSockets,
            timeout: pool.timeoutMs
        };
        if (!this._agents) {
            this._agents = {
                http: new http.Agent(agentOptions),
                https: new https.Agent(agentOptions)
            };
        }
        this._circuits = this._circuits || new Map();
        this._diagnostics = this._diagnostics || {
            requests: 0, successes: 0, failures: 0, timeouts: 0, retries: 0, circuitRejected: 0,
            totalLatencyMs: 0, lastFailureAt: null,
            moduleInvocation: { local: 0, runtimeRegistry: 0, staticFallback: 0, lastResolution: null }
        };
        return this._agents;
    },

    /** Destroys all shared HTTP connection pools during runtime shutdown. */
    closeTransport: function () {
        if (this._agents) {
            this._agents.http.destroy();
            this._agents.https.destroy();
        }
        this._agents = null;
        return Promise.resolve(true);
    },

    /** Returns sanitized transport counters and per-target circuit state. */
    getTransportDiagnostics: function () {
        this.initializeTransport();
        let circuits = {};
        this._circuits.forEach((value, key) => {
            circuits[key] = { state: value.state, failures: value.failures, openedAt: value.openedAt || null };
        });
        return _.merge({}, this._diagnostics, {
            averageLatencyMs: this._diagnostics.requests ? Math.round(this._diagnostics.totalLatencyMs / this._diagnostics.requests) : 0,
            circuits: circuits
        });
    },

    /** Records a sanitized local/remote module invocation routing decision. */
    recordInvocationResolution: function (options, resolution) {
        this._diagnostics = this._diagnostics || {
            requests: 0, successes: 0, failures: 0, timeouts: 0, retries: 0, circuitRejected: 0,
            totalLatencyMs: 0, lastFailureAt: null
        };
        let moduleDiagnostics = this._diagnostics.moduleInvocation = this._diagnostics.moduleInvocation ||
            { local: 0, runtimeRegistry: 0, staticFallback: 0, lastResolution: null };
        let source = resolution && resolution.source || 'unknown';
        if (moduleDiagnostics[source] !== undefined) moduleDiagnostics[source]++;
        moduleDiagnostics.lastResolution = {
            resolvedAt: new Date().toISOString(),
            source: source,
            moduleName: options.moduleName,
            connectionName: this.getModuleConnectionName(options),
            apiName: options.apiName,
            methodName: options.methodName || 'POST',
            instanceId: resolution && resolution.instanceId,
            server: resolution && resolution.server,
            node: resolution && resolution.node,
            runtimeRole: resolution && resolution.runtimeRole
        };
    },

    /** Resolves the logical module or origin circuit partition for a request. */
    getCircuitKey: function (requestUrl) {
        let parsed = new URL(requestUrl.uri);
        return (requestUrl.nodicsContext && requestUrl.nodicsContext.moduleName) || parsed.origin;
    },

    /** Rejects open circuits or advances an expired circuit to half-open. */
    assertCircuitAvailable: function (key, policy) {
        if (policy.enabled === false) return;
        let circuit = this._circuits.get(key);
        if (!circuit || circuit.state === 'closed') return;
        if (Date.now() - circuit.openedAt >= policy.recoveryTimeoutMs) {
            circuit.state = 'half-open';
            return;
        }
        let error = new Error('Remote service circuit is open');
        error.code = 'EOPENBREAKER';
        this._diagnostics.circuitRejected++;
        throw error;
    },

    /** Closes and resets a target circuit after successful communication. */
    recordCircuitSuccess: function (key) {
        this._circuits.set(key, { state: 'closed', failures: 0, openedAt: null });
    },

    /** Records a terminal request failure and opens its circuit at threshold. */
    recordCircuitFailure: function (key, policy) {
        if (policy.enabled === false) return;
        let circuit = this._circuits.get(key) || { state: 'closed', failures: 0, openedAt: null };
        circuit.failures++;
        if (circuit.state === 'half-open' || circuit.failures >= policy.failureThreshold) {
            circuit.state = 'open';
            circuit.openedAt = Date.now();
        }
        this._circuits.set(key, circuit);
    },

    /** Determines whether retrying a request is safe or explicitly idempotent. */
    isRetrySafe: function (requestUrl) {
        let method = String(requestUrl.method || 'GET').toUpperCase();
        return ['GET', 'HEAD', 'OPTIONS'].includes(method) || Boolean(requestUrl.idempotencyKey ||
            (requestUrl.headers && (requestUrl.headers['Idempotency-Key'] || requestUrl.headers['idempotency-key'])));
    },

    /**
     * Returns true when the requested target module is active in this process.
     *
     * @param {string} moduleName Target module name.
     * @returns {boolean} True when local service invocation is allowed.
     */
    isLocalModuleActive: function (moduleName) {
        return Boolean(moduleName && (!NODICS.isModuleActive || NODICS.isModuleActive(moduleName)));
    },

    /**
     * Resolves the configured connection name used for remote module calls.
     *
     * @param {Object} options Invocation options.
     * @returns {string} Connection alias or target module name.
     */
    getModuleConnectionName: function (options) {
        return options.connectionName || options.moduleName;
    },

    /** Returns the current runtime coordinates that can be compared with a target authority. */
    getCurrentRuntimeAuthority: function () {
        return {
            environment: NODICS.getSelectedEnvironmentName && NODICS.getSelectedEnvironmentName(),
            server: NODICS.getServerName && NODICS.getServerName(),
            node: NODICS.getNodeName && NODICS.getNodeName(),
            runtimeRole: CONFIG.get('runtimeRole')
        };
    },

    /** Normalizes runtime role metadata into comparable uppercase tokens. */
    runtimeRoleTokens: function (role) {
        let tokens = [];
        if (!role) return tokens;
        if (typeof role === 'string') {
            tokens.push(role);
        } else if (typeof role === 'object' && !Array.isArray(role)) {
            ['code', 'publication', 'runtimeRole'].forEach(key => {
                if (role[key]) tokens.push(role[key]);
            });
        }
        return tokens.map(token => String(token).toUpperCase()).filter(Boolean);
    },

    /**
     * Returns true when a requested target authority is served by this runtime.
     *
     * `targetAuthority` describes the intended owner, such as WCMS Online or
     * Process. Runtime Registry will eventually make this comparison lease-backed;
     * for now it uses current runtime coordinates and configured runtime role.
     */
    isCurrentRuntimeAuthority: function (targetAuthority) {
        if (!targetAuthority) return true;
        let authority = typeof targetAuthority === 'string' ? { runtimeRole: targetAuthority } : targetAuthority;
        let current = this.getCurrentRuntimeAuthority();
        if (authority.environment && String(authority.environment) !== String(current.environment || '')) return false;
        if (authority.server && String(authority.server) !== String(current.server || '')) return false;
        if (authority.node && String(authority.node) !== String(current.node || '')) return false;
        if (authority.runtimeRole || authority.code || authority.publication) {
            let requestedTokens = this.runtimeRoleTokens(authority.runtimeRole || authority);
            if (authority.code) requestedTokens = requestedTokens.concat(this.runtimeRoleTokens({ code: authority.code }));
            if (authority.publication) requestedTokens = requestedTokens.concat(this.runtimeRoleTokens({ publication: authority.publication }));
            let currentTokens = this.runtimeRoleTokens(current.runtimeRole);
            return requestedTokens.some(token => currentTokens.includes(token));
        }
        return true;
    },

    /**
     * Returns the prepared module endpoint pool used by router URL generation.
     *
     * @returns {Object|undefined} Module endpoint pool.
     */
    getModulesPool: function () {
        if (SERVICE.DefaultModulesConfigurationService &&
            typeof SERVICE.DefaultModulesConfigurationService.isAvailableModuleConfig === 'function') {
            return SERVICE.DefaultModulesConfigurationService;
        }
        if (SERVICE.DefaultRouterService && typeof SERVICE.DefaultRouterService.getModulesPool === 'function') {
            return SERVICE.DefaultRouterService.getModulesPool();
        }
        return undefined;
    },

    /**
     * Returns true when an inactive target has a configured remote endpoint.
     *
     * @param {Object} options Invocation options.
     * @returns {boolean} True when the connection alias is available.
     */
    isModuleEndpointAvailable: function (options) {
        let pool = this.getModulesPool();
        let connectionName = this.getModuleConnectionName(options);
        return Boolean(pool && typeof pool.isAvailableModuleConfig === 'function' &&
            pool.isAvailableModuleConfig(connectionName));
    },

    /** Resolves a live runtime owner from Runtime Registry when a provider is available. */
    resolveRuntimeOwner: function (options) {
        let resolver = SERVICE.DefaultRuntimeRegistryResolverService;
        if (!resolver || typeof resolver.resolveOwner !== 'function') return Promise.resolve(undefined);
        return Promise.resolve(resolver.resolveOwner(options));
    },

    /**
     * Builds the standard internal authorization header for remote module calls.
     *
     * @param {Object} options Invocation options.
     * @returns {Object} Authorization header or an empty map.
     * @throws {CLASSES.NodicsError} When internal auth is required but missing.
     */
    buildInternalAuthorizationHeader: function (options) {
        let header = options.header || {};
        if (header.Authorization || header.authorization || header.authToken) {
            return {};
        }
        let request = options.request || options.requestBody || {};
        let tenant = options.tenant || request.tenant || CONFIG.get('defaultTenant') || 'default';
        let token = options.authToken;
        if (!token && typeof NODICS.getInternalAuthToken === 'function') {
            token = NODICS.getInternalAuthToken(tenant);
        }
        if (token) {
            return { Authorization: 'Bearer ' + token };
        }
        if (options.requireInternalAuth === false) {
            return {};
        }
        throw new CLASSES.NodicsError('ERR_TNT_00002',
            'Internal service token is unavailable for remote module: ' + options.moduleName);
    },

    /** Builds a request directly against a Runtime Registry owner endpoint. */
    buildRuntimeRegistryRequest: function (options, owner, header) {
        let apiName = options.apiName || '';
        if (!apiName.startsWith('/')) apiName = '/' + apiName;
        let endpoint = String(owner.endpoint || '').replace(/\/+$/, '');
        let url = new URL(endpoint);
        let path = url.pathname.replace(/\/+$/, '');
        let moduleSegment = '/' + options.moduleName;
        if (!path.endsWith(moduleSegment)) {
            let contextRoot = options.contextRoot || CONFIG.get('contextRoot') || 'nodics';
            url.pathname = path + '/' + String(contextRoot).replace(/^\/+|\/+$/g, '') + moduleSegment;
        }
        let base = url.toString().replace(/\/+$/, '');
        return {
            method: options.methodName || 'GET',
            uri: base + '/' + (options.apiVersion || 'v0') + apiName,
            headers: this.normalizeHeaders(_.merge({
                'content-type': options.contentType || CONFIG.get('defaultContentType')
            }, header || {})),
            body: options.requestBody || {},
            json: options.responseType || true,
            timeoutMs: options.timeoutMs,
            maxAttempts: options.maxAttempts,
            maxResponseBytes: options.maxResponseBytes,
            followRedirects: options.followRedirects,
            idempotencyKey: options.idempotencyKey,
            nodicsContext: {
                layer: 'runtime-registry',
                moduleName: options.moduleName,
                connectionName: options.connectionName || options.moduleName,
                methodName: options.methodName || 'GET',
                apiName: options.apiName,
                instanceId: owner.instanceId,
                runtimeRole: owner.runtimeRole
            }
        };
    },

    /**
     * Invokes a local service operation for an active target module.
     *
     * @param {Object} options Invocation options.
     * @param {string} options.serviceName Local SERVICE name.
     * @param {string} options.operationName Local operation name.
     * @param {Object} [options.request] Local request object.
     * @returns {Promise<*>} Local service response.
     */
    invokeLocalModule: function (options) {
        let serviceName = options.serviceName;
        let operationName = options.operationName || options.operation;
        let service = serviceName && SERVICE[serviceName];
        if (!service || typeof service[operationName] !== 'function') {
            throw new CLASSES.NodicsError('ERR_TNT_00001',
                'Local module service is not available: ' + options.moduleName + '.' + (serviceName || 'unknown') + '.' + (operationName || 'unknown'));
        }
        this.recordInvocationResolution(options, { source: 'local' });
        return Promise.resolve(service[operationName](options.request || options.requestBody || {}));
    },

    /**
     * Invokes an inactive target module through the configured module-service API.
     *
     * @param {Object} options Invocation options.
     * @param {string} options.moduleName Target module.
     * @param {string} options.apiName Remote API path.
     * @returns {Promise<*>} Remote response.
     */
    invokeRemoteModule: function (options) {
        if (!options.apiName) {
            throw new CLASSES.NodicsError('ERR_TNT_00003',
                'Remote module API path is required for: ' + options.moduleName);
        }
        let header = _.merge(
            {},
            this.buildInternalAuthorizationHeader(options),
            options.header || {}
        );
        let requestOptions = _.merge({}, options, {
            methodName: options.methodName || 'POST',
            requestBody: options.requestBody !== undefined ? options.requestBody : (options.request || {}),
            header: header
        });
        return this.resolveRuntimeOwner(options).then(owner => {
            if (owner && owner.endpoint) {
                this.recordInvocationResolution(options, Object.assign({ source: 'runtimeRegistry' }, owner));
                return this.buildRuntimeRegistryRequest(requestOptions, owner, header);
            }
            if (!this.isModuleEndpointAvailable(options)) {
                throw new CLASSES.NodicsError('ERR_TNT_00002',
                    'Remote module endpoint is unavailable: ' + this.getModuleConnectionName(options));
            }
            this.recordInvocationResolution(options, { source: 'staticFallback' });
            return this.buildRequest(requestOptions);
        }).then(requestUrl => this.fetch(requestUrl)).then(response => {
            if (typeof options.responseSelector === 'function') {
                return options.responseSelector(response);
            }
            return response;
        });
    },

    /**
     * Invokes a module operation through the correct local or remote path.
     *
     * Active target modules use the local service implementation when the
     * requested authority belongs to this runtime. Inactive modules, or active
     * modules owned by a different target authority, are called remotely through
     * `DefaultModuleService.buildRequest/fetch`.
     *
     * @param {Object} options Invocation options.
     * @param {string} options.moduleName Target module.
     * @returns {Promise<*>} Local or remote operation response.
     */
    invokeModule: function (options) {
        try {
            if (!options || !options.moduleName) {
                throw new CLASSES.NodicsError('ERR_TNT_00003', 'Module invocation requires moduleName');
            }
            if (this.isLocalModuleActive(options.moduleName) && options.local !== false &&
                this.isCurrentRuntimeAuthority(options.targetAuthority)) {
                return this.invokeLocalModule(options);
            }
            return this.invokeRemoteModule(options);
        } catch (error) {
            return Promise.reject(error);
        }
    },

    /** Classifies configured transient statuses and network failures. */
    isRetryableError: function (error, retryPolicy) {
        return retryPolicy.statuses.includes(error.status) || retryPolicy.errorCodes.includes(error.code) || error.name === 'AbortError';
    },

    /** Waits for bounded exponential backoff with configured jitter. */
    delayRetry: function (attempt, retryPolicy) {
        let base = Math.min(retryPolicy.maxDelayMs, retryPolicy.baseDelayMs * Math.pow(2, attempt - 1));
        let jitter = base * retryPolicy.jitterRatio * ((Math.random() * 2) - 1);
        return new Promise(resolve => {
            let timer = setTimeout(resolve, Math.max(0, Math.round(base + jitter)));
            if (timer.unref) timer.unref();
        });
    },

    /**
     * Normalizes standard auth, API key, and enterprise headers.
     *
     * @param {Object} headers Input header map.
     * @returns {Object} Header map using `Authorization`, `x-api-key`, and `x-enterprise-code`.
     */
    normalizeHeaders: function (headers) {
        let normalizedHeaders = {};
        let authToken = headers.Authorization || headers.authorization || headers.authToken;
        let apiKey = headers['x-api-key'] || headers['X-API-Key'] || headers.apiKey;
        let entCode = headers['x-enterprise-code'] || headers['X-Enterprise-Code'] || headers.entCode;

        _.each(headers, (value, key) => {
            if (!['Authorization', 'authorization', 'authToken', 'x-api-key', 'X-API-Key', 'apiKey', 'x-enterprise-code', 'X-Enterprise-Code', 'entCode'].includes(key)) {
                normalizedHeaders[key] = value;
            }
        });
        if (authToken) {
            authToken = String(authToken);
            normalizedHeaders.Authorization = authToken.match(/^Bearer\s+/i) ? authToken : 'Bearer ' + authToken;
        }
        if (apiKey) {
            normalizedHeaders['x-api-key'] = apiKey;
        }
        if (entCode) {
            normalizedHeaders['x-enterprise-code'] = entCode;
        }
        return normalizedHeaders;
    },

    /**
     * Builds an internal module request URL and fetch options.
     *
     * @param {Object} options Module request options.
     * @param {string} options.moduleName Target module name.
     * @param {string} [options.connectionName] Optional endpoint alias when the remote deployment exposes the target module under another server connection.
     * @param {string} options.apiName API path.
     * @param {string} [options.methodName=GET] HTTP method.
     * @param {Object} [options.requestBody] Request body.
     * @param {Object} [options.header] Additional headers.
     * @returns {Object} Fetch request options with Nodics context metadata.
     */
    buildRequest: function (options) {
        this.LOG.debug('Building request url for module ', options.moduleName);
        let header = {
            'content-type': options.contentType || CONFIG.get('defaultContentType')
        };
        if (options.header) {
            _.merge(header, options.header);
        }
        if (options.idempotencyKey) {
            header['Idempotency-Key'] = options.idempotencyKey;
        }
        header = this.normalizeHeaders(header);
        let url = SERVICE.DefaultRouterService.prepareUrl(options);
        if (!options.apiName.startsWith('/')) {
            url += '/';
        }
        let apiName = options.apiName || '';
        if (!apiName.startsWith('/')) apiName = '/' + apiName;
        url = url.replace(/\/+$/, '');
        return {
            method: options.methodName || 'GET',
            uri: url + '/' + (options.apiVersion || 'v0') + apiName,
            headers: header,
            body: options.requestBody || {},
            json: options.responseType || true,
            timeoutMs: options.timeoutMs,
            maxAttempts: options.maxAttempts,
            maxResponseBytes: options.maxResponseBytes,
            followRedirects: options.followRedirects,
            idempotencyKey: options.idempotencyKey,
            nodicsContext: {
                layer: 'remote-module',
                moduleName: options.moduleName,
                connectionName: options.connectionName || options.moduleName,
                methodName: options.methodName || 'GET',
                apiName: options.apiName
            }
        };
    },

    /**
     * Builds an external HTTP request and fetch options.
     *
     * @param {Object} options External request options.
     * @param {string} options.uri Absolute target URI.
     * @param {string} [options.methodName=GET] HTTP method.
     * @param {Object} [options.params] Query parameters.
     * @param {Object} [options.requestBody] Request body.
     * @param {Object} [options.header] Additional headers.
     * @param {number} [options.maxResponseBytes] Maximum accepted response body size.
     * @param {boolean} [options.followRedirects=true] Whether HTTP redirects may be followed.
     * @returns {Object} Fetch request options with external context metadata.
     */
    buildExternalRequest: function (options) {
        this.LOG.debug('Building external request url');
        let header = {
            'content-type': options.contentType || CONFIG.get('defaultContentType')
        };
        if (options.header) {
            _.merge(header, options.header);
        }
        if (options.idempotencyKey) {
            header['Idempotency-Key'] = options.idempotencyKey;
        }
        header = this.normalizeHeaders(header);
        let uri = options.uri;
        if (options.params && !UTILS.isBlank(options.params)) {
            uri = uri + '?';
            Object.keys(options.params).forEach(param => {
                if (!uri.endsWith('?')) {
                    uri = uri + '&';
                }
                uri = uri + param + '=' + options.params[param];
            });
        }
        return {
            method: options.methodName || 'GET',
            uri: uri,
            headers: header,
            body: options.requestBody || {},
            json: options.responseType || true,
            rejectUnauthorized: options.rejectUnauthorized !== false,
            timeoutMs: options.timeoutMs,
            maxAttempts: options.maxAttempts,
            maxResponseBytes: options.maxResponseBytes,
            followRedirects: options.followRedirects,
            idempotencyKey: options.idempotencyKey,
            nodicsContext: {
                layer: 'external-http',
                methodName: options.methodName || 'GET',
                uri: uri
            }
        };
    },

    /**
     * Builds clean error context for internal/external fetch failures.
     *
     * @param {Object} requestUrl Fetch request options.
     * @returns {Object} Sanitized Nodics error context.
     */
    buildFetchErrorContext: function (requestUrl) {
        let context = _.merge({}, requestUrl.nodicsContext || {});
        context.uri = requestUrl.uri;
        context.methodName = requestUrl.method;
        if (requestUrl.body) {
            context.tenant = requestUrl.body.tenant;
            context.sourceName = requestUrl.body.sourceName;
            context.target = requestUrl.body.target;
            context.eventName = requestUrl.body.event;
        }
        return CLASSES.NodicsError.cleanContext(context);
    },

    /**
     * Executes an internal or external HTTP request.
     *
     * @param {Object} requestUrl Fetch request options built by this service.
     * @returns {Promise<Object>} Fetch response body.
     * @throws {CLASSES.NodicsError} Rejects with enriched remote-call context.
     */
    fetch: async function (requestUrl) {
        this.LOG.debug('Hitting module communication URL', {
            methodName: requestUrl.method,
            uri: requestUrl.uri,
            layer: requestUrl.nodicsContext && requestUrl.nodicsContext.layer
        });
        this.initializeTransport();
        let policy = this.getTransportConfiguration();
        let circuitKey = this.getCircuitKey(requestUrl);
        let maxAttempts = Math.max(1, Number(requestUrl.maxAttempts || policy.retry.maxAttempts || 1));
        if (!this.isRetrySafe(requestUrl)) maxAttempts = 1;
        let startedAt = Date.now();
        this._diagnostics.requests++;
        try {
            this.assertCircuitAvailable(circuitKey, policy.circuitBreaker);
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                let controller = new AbortController();
                let timeoutMs = Number(requestUrl.timeoutMs || policy.timeoutMs);
                let timeout = setTimeout(() => controller.abort(), timeoutMs);
                if (timeout.unref) timeout.unref();
                let fetchOptions = {
                    method: requestUrl.method,
                    headers: requestUrl.headers,
                    signal: controller.signal,
                    size: requestUrl.maxResponseBytes,
                    redirect: requestUrl.followRedirects === false ? 'error' : 'follow'
                };
                if (!['GET', 'HEAD'].includes(String(requestUrl.method).toUpperCase()) && requestUrl.body !== undefined) {
                    fetchOptions.body = typeof requestUrl.body === 'string' ? requestUrl.body : JSON.stringify(requestUrl.body);
                }
                fetchOptions.agent = requestUrl.uri.startsWith('https://') ? this._agents.https : this._agents.http;
                try {
                    let response = await requestPromise(requestUrl.uri, fetchOptions);
                    if (!response.ok) {
                        let errorBody;
                        try {
                            errorBody = requestUrl.json === false ? await response.text() : await response.json();
                        } catch (parseError) {
                            errorBody = undefined;
                        }
                        let remoteCode = errorBody && (errorBody.code || errorBody.responseCode);
                        let remoteMessage = errorBody && (errorBody.message || errorBody.error || errorBody.reason);
                        let error = new Error(remoteMessage || ('Remote module request failed with HTTP status ' + response.status));
                        error.status = response.status;
                        if (remoteCode) error.code = remoteCode;
                        if (remoteMessage) error.remoteMessage = remoteMessage;
                        if (errorBody && typeof errorBody === 'object') {
                            error.remoteResponse = CLASSES.NodicsError.cleanContext(errorBody);
                        }
                        throw error;
                    }
                    let result = requestUrl.json === false ? await response.text() : await response.json();
                    clearTimeout(timeout);
                    this.recordCircuitSuccess(circuitKey);
                    this._diagnostics.successes++;
                    return result;
                } catch (error) {
                    clearTimeout(timeout);
                    if (error.name === 'AbortError') {
                        error.code = 'ETIMEDOUT';
                        this._diagnostics.timeouts++;
                    }
                    if (attempt < maxAttempts && this.isRetryableError(error, policy.retry)) {
                        this._diagnostics.retries++;
                        await this.delayRetry(attempt, policy.retry);
                        continue;
                    }
                    throw error;
                }
            }
        } catch (error) {
            this.recordCircuitFailure(circuitKey, policy.circuitBreaker);
            this._diagnostics.failures++;
            this._diagnostics.lastFailureAt = new Date().toISOString();
            throw CLASSES.NodicsError.enrich(error, this.buildFetchErrorContext(requestUrl));
        } finally {
            this._diagnostics.totalLatencyMs += Date.now() - startedAt;
        }
    }
};
