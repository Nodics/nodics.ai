/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const { isDeepStrictEqual } = require('node:util');
const { isIP } = require('node:net');

/**
 * @module elastic/service/maintenance/defaultElasticLocalResetMaintenanceService
 * @description Holds one bounded native loopback client for explicit offline reset of exact physical indices.
 * Open validates configured connection options; inspect pins UUIDs and standalone identity;
 * drop requires fresh identity and native acknowledgement plus exact typed absence.
 * Failure closes the client and exposes only fixed RESET_ errors. No cache, settings,
 * credential, index creation, retirement or runtime lifecycle operations are performed.
 * @owner elastic @layer service
 * @override Later layers may replace documented members through the service loader while preserving these guards.
 */
module.exports = {
    /** Creates a secret-free fixed provider error. @param {string} code Internal RESET_ constant. @returns {Error} Sanitized failure. */
    failure: function (code) {
        return Object.assign(new Error(code), { code });
    },

    /** Checks exact physical names without rewriting or wildcard expansion. @param {string} name Physical name. @returns {boolean} Valid name. */
    validName: function (name) {
        return typeof name === 'string' && /^[a-z0-9][a-z0-9._-]{0,199}$/.test(name) &&
            !['constructor', 'prototype', '__proto__'].includes(name);
    },

    /** Recognizes literal loopback IPs; localhost is accepted only for the configured endpoint. @param {string} host Hostname. @returns {boolean} Loopback IP. */
    loopback: function (host) {
        return host === '[::1]' || host === '::1' || isIP(host) === 4 && host.split('.')[0] === '127';
    },

    /** Normalizes through the existing connection owner and refuses alternate transports/topologies. @param {Object} input Exact environment/configuration/indices and exclusion attestations. @returns {Object} Private client options, names and HTTP port. */
    validate: function (input) {
        try {
            if (typeof input?.environment !== 'string' || !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(input.environment) ||
                input.exclusiveDeployment !== true || input.writersExcluded !== true ||
                !Array.isArray(input.indices) || input.indices.length < 1 || input.indices.length > 128 ||
                new Set(input.indices).size !== input.indices.length || Array.from(input.indices).some(name =>
                    !this.validName(name) || !name.startsWith(input.environment.toLowerCase() + '_')))
                throw this.failure('RESET_ELASTIC_SCOPE_INVALID');
            const configuration = input.configuration;
            const connection = configuration?.connection;
            if (!connection || typeof connection !== 'object' || Array.isArray(connection))
                throw this.failure('RESET_ELASTIC_SCOPE_INVALID');
            // Only native endpoint/authentication options may reach the client. Never forward hooks or transport constructors.
            const allowed = ['hosts', 'node', 'nodes', 'log', 'deadTimeout', 'requestTimeout', 'maxRetries', 'auth', 'headers'];
            if (Object.keys(connection).some(key => !allowed.includes(key)) ||
                ['hosts', 'node', 'nodes'].filter(key => connection[key] !== undefined).length !== 1)
                throw this.failure('RESET_ELASTIC_CONNECTION_UNSUPPORTED');
            if (connection.headers !== undefined && (!connection.headers || typeof connection.headers !== 'object' ||
                Array.isArray(connection.headers) || Object.keys(connection.headers).some(key => key.toLowerCase() !== 'authorization')))
                throw this.failure('RESET_ELASTIC_CONNECTION_UNSUPPORTED');
            const owner = SERVICE.DefaultElasticSearchEngineConnectionHandlerService;
            const timeout = configuration.requestTimeout ?? global.CONFIG?.get('search')?.requestTimeout;
            const options = owner.getClientOptions(connection, timeout);
            if (Object.keys(options).some(key => !['node', 'nodes', 'requestTimeout', 'maxRetries', 'auth', 'headers'].includes(key)) ||
                ['node', 'nodes'].filter(key => options[key] !== undefined).length !== 1)
                throw this.failure('RESET_ELASTIC_CONNECTION_UNSUPPORTED');
            const endpoints = options.node !== undefined ? [options.node] : options.nodes;
            if (!Array.isArray(endpoints) || endpoints.length !== 1 || typeof endpoints[0] !== 'string' ||
                endpoints[0].length > 256 || !/^http:\/\/(?:localhost|127(?:\.[0-9]{1,3}){3}|\[::1\])(?::[0-9]{1,5})?\/?$/.test(endpoints[0]))
                throw this.failure('RESET_ELASTIC_ENDPOINT_INVALID');
            const url = new URL(endpoints[0]);
            if (url.protocol !== 'http:' || !(url.hostname === 'localhost' || this.loopback(url.hostname)) ||
                url.username || url.password || url.search || url.hash || url.pathname !== '/' ||
                !Number.isSafeInteger(Number(url.port || 80)) || Number(url.port || 80) < 1 || Number(url.port || 80) > 65535)
                throw this.failure('RESET_ELASTIC_ENDPOINT_INVALID');
            if (!Number.isSafeInteger(options.requestTimeout) || options.requestTimeout < 1 || options.requestTimeout > 60000)
                throw this.failure('RESET_ELASTIC_TIMEOUT_INVALID');
            return { names: Object.freeze(input.indices.slice().sort()), httpPort: Number(url.port || 80),
                clientOptions: { ...options, maxRetries: 0, sniffOnStart: false, sniffOnConnectionFault: false,
                    sniffInterval: false, maxResponseSize: 1048576, maxCompressedResponseSize: 1048576 } };
        } catch (error) {
            if (['RESET_ELASTIC_SCOPE_INVALID', 'RESET_ELASTIC_CONNECTION_UNSUPPORTED', 'RESET_ELASTIC_ENDPOINT_INVALID',
                'RESET_ELASTIC_TIMEOUT_INVALID'].includes(error?.code)) throw this.failure(error.code);
            throw this.failure('RESET_ELASTIC_CONFIGURATION_INVALID');
        }
    },

    /** Constructs the SDK only in this provider. Isolated fixtures override this member; commands cannot supply adapters. @param {Object} options Validated normalized client options. @returns {Object} Owned native client. */
    createClient: function (options) {
        const { Client } = require('@elastic/elasticsearch');
        return new Client(options);
    },

    /** Opens an owned client without startup hooks or mutation. Caller must close successful holds in finally; failures close automatically. @param {Object} input Explicit validated reset selection. @returns {Promise<Object>} contractVersion 1 held owner. */
    open: async function (input) {
        const target = this.validate(input);
        let client;
        try {
            client = this.createClient(target.clientOptions);
            if (typeof client?.info !== 'function' || typeof client?.nodes?.info !== 'function' ||
                typeof client?.indices?.get !== 'function' || typeof client?.indices?.delete !== 'function' ||
                typeof client?.close !== 'function') throw this.failure('RESET_ELASTIC_CLIENT_INVALID');
            const state = { client, names: target.names, httpPort: target.httpPort,
                requestOptions: Object.freeze({ maxRetries: 0, requestTimeout: target.clientOptions.requestTimeout }),
                identity: null, initial: null, removed: new Set(), closed: false, busy: false, closePromise: null };
            return Object.freeze({
                contractVersion: 1,
                names: state.names,
                /** Pins exact UUIDs and returns count-only provider evidence. @returns {Promise<Object>} Counts and PID/socket ports. */
                inspect: async () => this.run(state, 'inspect'),
                /** Deletes one pinned name once after revalidation. @param {string} index Exact physical name. @returns {Promise<Object>} Acknowledgement/absence flags. */
                drop: async index => this.run(state, 'drop', index),
                /** Verifies exact typed absence for every selected name. @returns {Promise<Object>} Zero selected indices. */
                verifyEmpty: async () => this.run(state, 'verifyEmpty'),
                /** Closes this hold idempotently, sanitizing cleanup failure. @returns {Promise<void>} Cleanup completion. */
                close: async () => this.closeClient(state),
            });
        } catch {
            const failure = this.failure('RESET_ELASTIC_OPEN_FAILED');
            if (client) {
                try { await client.close(); } catch { failure.cleanupFailedCount = 1; }
            }
            throw failure;
        }
    },

    /** Accepts native bodies or SDK meta envelopes, never a negative/error envelope. @param {Object} response Provider response. @returns {Object} Validated body. */
    body: function (response) {
        const body = response && Object.hasOwn(response, 'body') ? response.body : response;
        if (!body || typeof body !== 'object' || Array.isArray(body) || body.error || body.success === false ||
            response.statusCode !== undefined && response.statusCode !== 200)
            throw this.failure('RESET_ELASTIC_RESPONSE_INVALID');
        return body;
    },

    /** Resolves bounded literal bound/publish addresses to one consistent port. @param {Object} section Native http or transport metadata. @returns {number} Single loopback port. */
    boundPort: function (section) {
        const addresses = section?.bound_address;
        if (!Array.isArray(addresses) || !addresses.length || addresses.length > 8)
            throw this.failure('RESET_ELASTIC_IDENTITY_INVALID');
        const ports = [];
        for (const address of [...addresses, ...(section.publish_address === undefined ? [] : [section.publish_address])]) {
            if (typeof address !== 'string' || !/^(?:127(?:\.[0-9]{1,3}){3}|\[::1\]):[0-9]{1,5}$/.test(address))
                throw this.failure('RESET_ELASTIC_IDENTITY_INVALID');
            const url = new URL('http://' + address);
            const port = Number(url.port || 80);
            if (!this.loopback(url.hostname) || !Number.isSafeInteger(port) || port < 1 || port > 65535)
                throw this.failure('RESET_ELASTIC_IDENTITY_INVALID');
            ports.push(port);
        }
        if (new Set(ports).size !== 1) throw this.failure('RESET_ELASTIC_IDENTITY_INVALID');
        return ports[0];
    },

    /** Reads independent standalone cluster/node/process/socket identity and compares any initial pin. @param {Object} state Private hold. @returns {Promise<Object>} Private identity. */
    inspectIdentity: async function (state) {
        let info, nodes;
        try {
            if (state.closed) throw this.failure('RESET_ELASTIC_CLIENT_CLOSED');
            info = this.body(await state.client.info({}, state.requestOptions));
            if (state.closed) throw this.failure('RESET_ELASTIC_CLIENT_CLOSED');
            nodes = this.body(await state.client.nodes.info({ metric: 'process,http,transport' }, state.requestOptions));
        } catch { throw this.failure('RESET_ELASTIC_IDENTITY_UNCONFIRMED'); }
        const ids = Object.keys(nodes.nodes || {});
        const node = nodes.nodes?.[ids[0]];
        if (typeof info.cluster_uuid !== 'string' || !/^[A-Za-z0-9_-]{10,128}$/.test(info.cluster_uuid) ||
            nodes._nodes?.total !== 1 || nodes._nodes?.successful !== 1 || nodes._nodes?.failed !== 0 ||
            ids.length !== 1 || !/^[A-Za-z0-9_-]{10,128}$/.test(ids[0]) ||
            !Number.isSafeInteger(node?.process?.id) || node.process.id < 1)
            throw this.failure('RESET_ELASTIC_IDENTITY_INVALID');
        let identity;
        try {
            identity = { clusterUUID: info.cluster_uuid, nodeID: ids[0], pid: node.process.id,
                httpPort: this.boundPort(node.http), transportPort: this.boundPort(node.transport) };
        } catch { throw this.failure('RESET_ELASTIC_IDENTITY_INVALID'); }
        if (identity.httpPort !== state.httpPort || identity.httpPort === identity.transportPort)
            throw this.failure('RESET_ELASTIC_IDENTITY_INVALID');
        if (state.identity && !isDeepStrictEqual(identity, state.identity)) throw this.failure('RESET_ELASTIC_IDENTITY_CHANGED');
        return identity;
    },

    /** Reads exactly one flat-settings physical index; absence requires typed native 404 naming that index. @param {Object} state Private hold. @param {string} index Exact selected name. @returns {Promise<string|null>} Exact UUID or typed absence. */
    inspectIndex: async function (state, index) {
        if (state.closed) throw this.failure('RESET_ELASTIC_CLIENT_CLOSED');
        if (!this.validName(index) || !state.names.includes(index)) throw this.failure('RESET_ELASTIC_SCOPE_INVALID');
        let response;
        try {
            response = await state.client.indices.get({ index, flat_settings: true, expand_wildcards: 'none',
                ignore_unavailable: false, allow_no_indices: false }, state.requestOptions);
        } catch (error) {
            const failure = error?.meta?.body?.error;
            if (error?.meta?.statusCode === 404 && failure?.type === 'index_not_found_exception' && failure.index === index &&
                (error.meta.body.status === undefined || error.meta.body.status === 404)) return null;
            throw this.failure('RESET_ELASTIC_INSPECTION_UNCONFIRMED');
        }
        const body = this.body(response);
        const record = body[index];
        if (Object.keys(body).length !== 1 || !Object.hasOwn(body, index) || !record || typeof record !== 'object' ||
            Array.isArray(record) || Object.hasOwn(record, 'data_stream') || !record.aliases ||
            typeof record.aliases !== 'object' || Array.isArray(record.aliases) || Object.keys(record.aliases).length ||
            !record.settings || typeof record.settings !== 'object' || Array.isArray(record.settings) ||
            record.settings.index !== undefined || typeof record.settings['index.uuid'] !== 'string' ||
            !/^[A-Za-z0-9_-]{10,128}$/.test(record.settings['index.uuid']))
            throw this.failure('RESET_ELASTIC_INDEX_INVALID');
        return record.settings['index.uuid'];
    },

    /** Executes one sequential held operation, pinning before mutation and closing every failed path. @param {Object} state Private hold. @param {string} operation Held method. @param {string} [index] Exact drop target. @returns {Promise<Object>} Sanitized receipt. */
    run: async function (state, operation, index) {
        if (state.closed) throw this.failure('RESET_ELASTIC_CLIENT_CLOSED');
        if (state.busy) {
            const failure = this.failure('RESET_ELASTIC_OPERATION_IN_PROGRESS');
            try { await this.closeClient(state); } catch { failure.cleanupFailedCount = 1; }
            throw failure;
        }
        state.busy = true;
        let acknowledged = false;
        try {
            const identity = await this.inspectIdentity(state);
            if (!state.identity) state.identity = identity;
            if (operation === 'inspect') {
                const current = new Map();
                for (const name of state.names) {
                    const uuid = await this.inspectIndex(state, name);
                    if (state.initial && uuid !== (state.removed.has(name) ? null : state.initial.get(name)))
                        throw this.failure('RESET_ELASTIC_UUID_CHANGED');
                    current.set(name, uuid);
                }
                await this.inspectIdentity(state);
                if (!state.initial) state.initial = current;
                const absentCount = [...current.values()].filter(uuid => uuid === null).length;
                return { indexCount: state.names.length - absentCount, absentCount,
                    provider: { pid: identity.pid, httpPort: identity.httpPort, transportPort: identity.transportPort } };
            }
            if (!state.initial) throw this.failure('RESET_ELASTIC_INSPECTION_REQUIRED');
            if (operation === 'verifyEmpty') {
                for (const name of state.names) {
                    if (await this.inspectIndex(state, name) !== null) throw this.failure('RESET_ELASTIC_NOT_EMPTY');
                }
                await this.inspectIdentity(state);
                return { indexCount: 0 };
            }
            if (operation !== 'drop' || !state.initial.has(index)) throw this.failure('RESET_ELASTIC_SCOPE_INVALID');
            if (state.removed.has(index)) throw this.failure('RESET_ELASTIC_DROP_ALREADY_COMPLETED');
            const uuid = await this.inspectIndex(state, index);
            if (uuid !== state.initial.get(index)) throw this.failure('RESET_ELASTIC_UUID_CHANGED');
            await this.inspectIdentity(state);
            if (state.closed) throw this.failure('RESET_ELASTIC_CLIENT_CLOSED');
            if (uuid === null) return { acknowledged: false, absent: true, alreadyAbsent: true };
            let response;
            try {
                const timeout = state.requestOptions.requestTimeout + 'ms';
                response = await state.client.indices.delete({ index, expand_wildcards: 'none', ignore_unavailable: false,
                    allow_no_indices: false, timeout, master_timeout: timeout }, state.requestOptions);
            } catch { throw this.failure('RESET_ELASTIC_DROP_UNCERTAIN'); }
            const body = this.body(response);
            if (body.acknowledged !== true || Object.keys(body).length !== 1)
                throw this.failure('RESET_ELASTIC_DROP_UNACKNOWLEDGED');
            acknowledged = true;
            await this.inspectIdentity(state);
            if (await this.inspectIndex(state, index) !== null) throw this.failure('RESET_ELASTIC_ABSENCE_UNCONFIRMED');
            await this.inspectIdentity(state);
            state.removed.add(index);
            return { acknowledged: true, absent: true };
        } catch (error) {
            const known = ['RESET_ELASTIC_IDENTITY_UNCONFIRMED', 'RESET_ELASTIC_IDENTITY_INVALID', 'RESET_ELASTIC_IDENTITY_CHANGED',
                'RESET_ELASTIC_INSPECTION_UNCONFIRMED', 'RESET_ELASTIC_RESPONSE_INVALID', 'RESET_ELASTIC_INDEX_INVALID',
                'RESET_ELASTIC_UUID_CHANGED', 'RESET_ELASTIC_INSPECTION_REQUIRED', 'RESET_ELASTIC_NOT_EMPTY',
                'RESET_ELASTIC_SCOPE_INVALID', 'RESET_ELASTIC_DROP_ALREADY_COMPLETED', 'RESET_ELASTIC_DROP_UNCERTAIN',
                'RESET_ELASTIC_DROP_UNACKNOWLEDGED', 'RESET_ELASTIC_ABSENCE_UNCONFIRMED', 'RESET_ELASTIC_CLIENT_CLOSED'];
            const failure = this.failure(known.includes(error?.code) ? error.code : 'RESET_ELASTIC_OPERATION_FAILED');
            if (acknowledged) Object.assign(failure, { acknowledged: true, index });
            try { await this.closeClient(state); } catch { failure.cleanupFailedCount = 1; }
            throw failure;
        } finally { state.busy = false; }
    },

    /** Closes once even after partial failure; repeated close preserves a failed cleanup result. @param {Object} state Private hold. @returns {Promise<void>} Cleanup or fixed failure. */
    closeClient: async function (state) {
        if (!state.closePromise) {
            state.closed = true;
            state.closePromise = (async () => {
                try { await state.client.close(); } catch { throw this.failure('RESET_ELASTIC_CLOSE_FAILED'); }
            })();
        }
        await state.closePromise;
    },
};
