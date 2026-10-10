/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/**
 * @module elastic/test/elasticLocalResetMaintenanceContract
 * @description Verifies bounded Local maintenance, native identity/UUID evidence, rejection and cleanup without a network client.
 * @owner elastic @layer test
 * @override Isolated fixtures replace only the exported createClient member; the connection delegate resolves the effective SERVICE owner.
 */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const provider = require('../src/service/maintenance/defaultElasticLocalResetMaintenanceService');
const connection = require('../src/service/connection/defaultElasticSearchEngineConnectionHandlerService');

global.SERVICE = { DefaultElasticSearchEngineConnectionHandlerService: connection };
global.CONFIG = { get: name => name === 'search' ? { requestTimeout: 250 } : undefined };

const alpha = 'fixturelocal_alpha';
const beta = 'fixturelocal_beta';
const uuid = 'initial_UUID_12345';
const secretMarker = 'private-provider-detail';

function request(overrides = {}) {
    return { environment: 'fixtureLocal', configuration: { connection: { hosts: ['http://localhost:9200'] } },
        indices: [alpha], exclusiveDeployment: true, writersExcluded: true, ...overrides };
}

function absent(index, modify) {
    const error = new Error(secretMarker);
    error.meta = { statusCode: 404, body: { status: 404, error: { type: 'index_not_found_exception', index } } };
    if (modify) modify(error);
    return error;
}

function fixture(overrides = {}) {
    const f = { records: new Map([[alpha, uuid]]), calls: [], closes: 0, creates: 0,
        cluster: { cluster_uuid: 'cluster_UUID_12345' },
        topology: { _nodes: { total: 1, successful: 1, failed: 0 }, nodes: {
            node_UUID_12345: { process: { id: 12345 }, http: { bound_address: ['127.0.0.1:9200', '[::1]:9200'] },
                transport: { bound_address: ['127.0.0.1:9300', '[::1]:9300'] } },
        } }, ...overrides };
    const recordCall = (method, parameters, options) => {
        f.calls.push({ method, parameters, options });
        assert.deepEqual(options, { maxRetries: 0, requestTimeout: 250 });
        if (method === 'get' || method === 'delete') {
            assert.equal(typeof parameters.index, 'string');
            assert.ok(provider.validName(parameters.index));
            assert.equal(parameters.expand_wildcards, 'none');
            assert.equal(parameters.ignore_unavailable, false);
            assert.equal(parameters.allow_no_indices, false);
        }
    };
    f.client = {
        info: async (parameters, options) => {
            recordCall('info', parameters, options);
            assert.deepEqual(parameters, {});
            if (f.onInfo) return f.onInfo(parameters);
            return structuredClone(f.cluster);
        },
        nodes: { info: async (parameters, options) => {
            recordCall('nodes', parameters, options);
            assert.deepEqual(parameters, { metric: 'process,http,transport' });
            if (f.onNodes) return f.onNodes(parameters);
            return structuredClone(f.topology);
        } },
        indices: {
            get: async (parameters, options) => {
                recordCall('get', parameters, options);
                assert.deepEqual(parameters, { index: parameters.index, flat_settings: true,
                    expand_wildcards: 'none', ignore_unavailable: false, allow_no_indices: false });
                if (f.onGet) return f.onGet(parameters.index);
                if (!f.records.has(parameters.index)) throw absent(parameters.index);
                return { [parameters.index]: { aliases: {}, settings: { 'index.uuid': f.records.get(parameters.index) } } };
            },
            delete: async (parameters, options) => {
                recordCall('delete', parameters, options);
                assert.deepEqual(parameters, { index: parameters.index, expand_wildcards: 'none',
                    ignore_unavailable: false, allow_no_indices: false, timeout: '250ms', master_timeout: '250ms' });
                if (f.onDelete) return f.onDelete(parameters.index);
                f.records.delete(parameters.index);
                return { acknowledged: true };
            },
        },
        close: async () => { f.closes++; if (f.closeFailure) throw new Error(secretMarker); },
    };
    f.owner = Object.assign({}, provider, { createClient: options => {
        f.creates++;
        f.options = options;
        return f.client;
    } });
    f.open = input => f.owner.open(input || request());
    f.deletes = () => f.calls.filter(call => call.method === 'delete').length;
    return f;
}

async function rejected(operation, code) {
    await assert.rejects(operation, error => {
        assert.equal(error.code, code);
        assert.equal(error.message, code);
        assert.equal(error.cause, undefined);
        assert.equal(JSON.stringify(error).includes(secretMarker), false);
        assert.equal(error.stack.includes(secretMarker), false);
        return true;
    });
}

test('successful exact drops, sorted frozen names, typed missing, repeat inspect and cleanup', async () => {
    const f = fixture();
    f.records.set(beta, 'second_UUID_12345');
    const held = await f.open(request({ indices: [beta, alpha] }));
    try {
        assert.equal(held.contractVersion, 1);
        assert.deepEqual(held.names, [alpha, beta]);
        assert.ok(Object.isFrozen(held.names));
        assert.deepEqual(await held.inspect(), { indexCount: 2, absentCount: 0,
            provider: { pid: 12345, httpPort: 9200, transportPort: 9300 } });
        assert.deepEqual(await held.drop(alpha), { acknowledged: true, absent: true });
        assert.deepEqual(await held.inspect(), { indexCount: 1, absentCount: 1,
            provider: { pid: 12345, httpPort: 9200, transportPort: 9300 } });
        assert.deepEqual(await held.drop(beta), { acknowledged: true, absent: true });
        assert.deepEqual(await held.verifyEmpty(), { indexCount: 0 });
        assert.equal((await held.inspect()).absentCount, 2);
        assert.equal(f.deletes(), 2);
        assert.equal(f.options.maxRetries, 0);
        assert.equal(f.options.sniffOnStart, false);
        assert.equal(f.options.sniffOnConnectionFault, false);
        assert.equal(f.options.sniffInterval, false);
        assert.deepEqual(f.options.nodes, ['http://localhost:9200']);
    } finally { await held.close(); }
    await held.close();
    assert.equal(f.closes, 1);
    await rejected(() => held.inspect(), 'RESET_ELASTIC_CLIENT_CLOSED');
});

test('originally absent name gives explicit alreadyAbsent receipt without delete', async () => {
    const f = fixture({ records: new Map() });
    const held = await f.open();
    try {
        assert.equal((await held.inspect()).absentCount, 1);
        assert.deepEqual(await held.drop(alpha), { acknowledged: false, absent: true, alreadyAbsent: true });
        assert.deepEqual(await held.verifyEmpty(), { indexCount: 0 });
        assert.equal(f.deletes(), 0);
    } finally { await held.close(); }
});

for (const [name, mutate] of [
    ['UUID replacement', f => f.records.set(alpha, 'replaced_UUID_12345')],
    ['unexpected disappearance', f => f.records.delete(alpha)],
    ['originally absent name recreated', f => f.records.set(beta, 'newlymade_UUID_12345')],
]) test(name + ' refuses before delete and closes', async () => {
    const f = fixture();
    const held = await f.open(request({ indices: [alpha, beta] }));
    await held.inspect();
    mutate(f);
    await rejected(() => held.drop(name.startsWith('originally') ? beta : alpha), 'RESET_ELASTIC_UUID_CHANGED');
    assert.equal(f.deletes(), 0);
    assert.equal(f.closes, 1);
    await held.close();
});

for (const [name, body] of [
    ['alias', { [alpha]: { aliases: { alias: {} }, settings: { 'index.uuid': uuid } } }],
    ['alias resolution to another physical index', { other: { aliases: {}, settings: { 'index.uuid': uuid } } }],
    ['extra index', { [alpha]: { aliases: {}, settings: { 'index.uuid': uuid } }, extra: {} }],
    ['data stream', { [alpha]: { aliases: {}, data_stream: 'stream', settings: { 'index.uuid': uuid } } }],
    ['array aliases', { [alpha]: { aliases: [], settings: { 'index.uuid': uuid } } }],
    ['missing aliases', { [alpha]: { settings: { 'index.uuid': uuid } } }],
    ['short UUID', { [alpha]: { aliases: {}, settings: { 'index.uuid': 'short' } } }],
    ['numeric UUID', { [alpha]: { aliases: {}, settings: { 'index.uuid': 12345678901234 } } }],
    ['long UUID', { [alpha]: { aliases: {}, settings: { 'index.uuid': 'x'.repeat(129) } } }],
    ['ambiguous nested UUID', { [alpha]: { aliases: {}, settings: { 'index.uuid': uuid, index: { uuid } } } }],
    ['empty response', {}],
]) test(name + ' metadata is refused and cleaned up', async () => {
    const f = fixture({ onGet: () => body });
    const held = await f.open();
    await rejected(() => held.inspect(), 'RESET_ELASTIC_INDEX_INVALID');
    assert.equal(f.closes, 1);
    assert.equal(f.deletes(), 0);
});

for (const [name, modify] of [
    ['generic 404', e => { e.meta.body.error.type = 'proxy_not_found'; }],
    ['wrong name', e => { e.meta.body.error.index = beta; }],
    ['missing name', e => { delete e.meta.body.error.index; }],
    ['wrong HTTP status', e => { e.meta.statusCode = 500; }],
    ['string HTTP status', e => { e.meta.statusCode = '404'; }],
    ['conflicting body status', e => { e.meta.body.status = 500; }],
    ['raw error', e => { delete e.meta; }],
]) test(name + ' cannot prove absence', async () => {
    const f = fixture({ onGet: index => { throw absent(index, modify); } });
    const held = await f.open();
    await rejected(() => held.inspect(), 'RESET_ELASTIC_INSPECTION_UNCONFIRMED');
    assert.equal(f.closes, 1);
});

for (const [name, indices] of [
    ['wildcard', ['local-*']], ['comma', ['local-alpha,local-beta']], ['all', ['_all']],
    ['uppercase', ['Local-alpha']], ['path', ['local/alpha']], ['blank', ['']],
    ['duplicate', [alpha, alpha]], ['sparse', Array(1)], ['number', [123]],
    ['foreign environment', ['otherlocal_alpha']], ['system index', ['.security-7']],
    ['missing namespace separator', ['fixturelocalalpha']], ['empty selection', []],
    ['long physical name', ['fixturelocal_' + 'x'.repeat(188)]],
    ['oversize', Array.from({ length: 129 }, (_, i) => 'fixturelocal_' + i)],
]) test(name + ' scope never constructs a client', async () => {
    const f = fixture();
    await rejected(() => f.open(request({ indices })), 'RESET_ELASTIC_SCOPE_INVALID');
    assert.equal(f.creates, 0);
});

test('maximum target count and physical-name length remain valid read-only scopes', async () => {
    for (const indices of [Array.from({ length: 128 }, (_, i) => 'fixturelocal_' + i), ['fixturelocal_' + 'x'.repeat(187)]]) {
        const f = fixture({ records: new Map() });
        const held = await f.open(request({ indices }));
        try {
            assert.equal((await held.inspect()).absentCount, indices.length);
            assert.deepEqual(await held.verifyEmpty(), { indexCount: 0 });
            assert.equal(f.deletes(), 0);
        } finally { await held.close(); }
        assert.equal(f.closes, 1);
    }
});

for (const [name, url] of [
    ['remote', 'http://example.invalid:9200'], ['non-loopback', 'http://192.0.2.1:9200'],
    ['TLS', 'https://localhost:9200'], ['path', 'http://localhost:9200/proxy'],
    ['query', 'http://localhost:9200/?x=y'], ['userinfo', 'http://user:pass@localhost:9200'],
    ['nonliteral numeric', 'http://2130706433:9200'], ['IPv4 abbreviation', 'http://127.1:9200'],
]) test(name + ' endpoint never constructs a client', async () => {
    const f = fixture();
    await rejected(() => f.open(request({ configuration: { connection: { node: url } } })), 'RESET_ELASTIC_ENDPOINT_INVALID');
    assert.equal(f.creates, 0);
});

for (const connectionOptions of [
    { hosts: ['http://localhost:9200', 'http://localhost:9201'] },
    { hosts: ['http://localhost:9200'], node: 'http://localhost:9200' },
    ...['cloud', 'proxy', 'agent', 'Transport', 'Connection', 'ConnectionPool', 'nodeSelector',
        'sniffOnStart', 'sniffOnConnectionFault', 'sniffInterval', 'tls'].map(key => ({ hosts: ['http://localhost:9200'], [key]: true })),
    { node: { url: new URL('http://localhost:9200') } },
    { node: 'http://localhost:9200', headers: { host: 'remote.invalid' } },
]) test('alternate topology/transport rejected: ' + Object.keys(connectionOptions).join(','), async () => {
    const f = fixture();
    await assert.rejects(() => f.open(request({ configuration: { connection: connectionOptions } })),
        error => ['RESET_ELASTIC_CONNECTION_UNSUPPORTED', 'RESET_ELASTIC_ENDPOINT_INVALID'].includes(error.code));
    assert.equal(f.creates, 0);
});

for (const timeout of [0, -1, 60001, NaN, Infinity, '250', null]) test('invalid timeout ' + timeout + ' rejected', async () => {
    const f = fixture();
    await rejected(() => f.open(request({ configuration: { connection: { node: 'http://localhost:9200', requestTimeout: timeout } } })),
        'RESET_ELASTIC_TIMEOUT_INVALID');
    assert.equal(f.creates, 0);
});

for (const [name, mutate] of [
    ['cluster UUID', f => { f.cluster.cluster_uuid = 'changed_UUID_12345'; }],
    ['node ID', f => { f.topology.nodes.changed_UUID_12345 = f.topology.nodes.node_UUID_12345; delete f.topology.nodes.node_UUID_12345; }],
    ['PID', f => { f.topology.nodes.node_UUID_12345.process.id++; }],
    ['transport port', f => { f.topology.nodes.node_UUID_12345.transport.bound_address = ['127.0.0.1:9301']; }],
]) test(name + ' drift refuses even with stable index UUID', async () => {
    const f = fixture();
    const held = await f.open();
    await held.inspect();
    mutate(f);
    await rejected(() => held.drop(alpha), 'RESET_ELASTIC_IDENTITY_CHANGED');
    assert.equal(f.deletes(), 0);
    assert.equal(f.closes, 1);
});

for (const [name, mutate] of [
    ['multiple nodes', f => { f.topology._nodes.total = 2; }],
    ['failed node', f => { f.topology._nodes.failed = 1; }],
    ['unsuccessful node', f => { f.topology._nodes.successful = 0; }],
    ['extra node result', f => { f.topology.nodes.extra_UUID_12345 = f.topology.nodes.node_UUID_12345; }],
    ['missing cluster UUID', f => { delete f.cluster.cluster_uuid; }],
    ['numeric cluster UUID', f => { f.cluster.cluster_uuid = 12345678901234; }],
    ['invalid PID', f => { f.topology.nodes.node_UUID_12345.process.id = 0; }],
    ['string PID', f => { f.topology.nodes.node_UUID_12345.process.id = '12345'; }],
    ['remote HTTP bind', f => { f.topology.nodes.node_UUID_12345.http.bound_address = ['0.0.0.0:9200']; }],
    ['remote transport bind', f => { f.topology.nodes.node_UUID_12345.transport.bound_address = ['192.0.2.1:9300']; }],
    ['inconsistent ports', f => { f.topology.nodes.node_UUID_12345.http.bound_address.push('127.0.0.1:9201'); }],
    ['wrong HTTP port', f => { f.topology.nodes.node_UUID_12345.http.bound_address = ['127.0.0.1:9201']; }],
    ['remote publish', f => { f.topology.nodes.node_UUID_12345.transport.publish_address = '192.0.2.1:9300'; }],
]) test(name + ' cannot establish native standalone identity', async () => {
    const f = fixture();
    mutate(f);
    const held = await f.open();
    await rejected(() => held.inspect(), 'RESET_ELASTIC_IDENTITY_INVALID');
    assert.equal(f.deletes(), 0);
    assert.equal(f.closes, 1);
});

for (const [name, response, expected] of [
    ['negative ack', { acknowledged: false }, 'RESET_ELASTIC_DROP_UNACKNOWLEDGED'],
    ['missing ack', {}, 'RESET_ELASTIC_DROP_UNACKNOWLEDGED'],
    ['string ack', { acknowledged: 'true' }, 'RESET_ELASTIC_DROP_UNACKNOWLEDGED'],
    ['wrapped generic success', { success: true, acknowledged: true }, 'RESET_ELASTIC_DROP_UNACKNOWLEDGED'],
    ['negative envelope', { acknowledged: true, success: false }, 'RESET_ELASTIC_RESPONSE_INVALID'],
    ['error envelope', { acknowledged: true, error: secretMarker }, 'RESET_ELASTIC_RESPONSE_INVALID'],
]) test(name + ' deletion response fails and is not retried', async () => {
    const f = fixture({ onDelete: () => response });
    const held = await f.open();
    await held.inspect();
    await rejected(() => held.drop(alpha), expected);
    assert.equal(f.deletes(), 1);
    assert.equal(f.closes, 1);
});

test('lost acknowledgement after provider delete remains uncertain, sanitized and never retried', async () => {
    const f = fixture();
    f.onDelete = index => { f.records.delete(index); throw new Error(secretMarker); };
    const held = await f.open();
    await held.inspect();
    await rejected(() => held.drop(alpha), 'RESET_ELASTIC_DROP_UNCERTAIN');
    assert.equal(f.records.size, 0);
    assert.equal(f.deletes(), 1);
    assert.equal(f.closes, 1);
    await rejected(() => held.drop(alpha), 'RESET_ELASTIC_CLIENT_CLOSED');
});

test('native delete timeout never produces acknowledgement evidence or a retry', async () => {
    const f = fixture({ onDelete: () => { throw Object.assign(new Error(secretMarker), { name: 'TimeoutError', code: 'ETIMEDOUT' }); } });
    const held = await f.open();
    await held.inspect();
    await assert.rejects(() => held.drop(alpha), error => {
        assert.equal(error.code, 'RESET_ELASTIC_DROP_UNCERTAIN');
        assert.equal(error.acknowledged, undefined);
        assert.equal(error.absent, undefined);
        assert.equal(JSON.stringify(error).includes(secretMarker), false);
        return true;
    });
    assert.equal(f.deletes(), 1);
    assert.equal(f.closes, 1);
});

test('timeout during post-acknowledgement readback retains only native acknowledgement evidence', async () => {
    const f = fixture();
    const held = await f.open();
    await held.inspect();
    f.onDelete = () => {
        f.onGet = () => { throw Object.assign(new Error(secretMarker), { name: 'TimeoutError' }); };
        return { acknowledged: true };
    };
    await assert.rejects(() => held.drop(alpha), error => {
        assert.equal(error.code, 'RESET_ELASTIC_INSPECTION_UNCONFIRMED');
        assert.equal(error.acknowledged, true);
        assert.equal(error.index, alpha);
        assert.equal(error.absent, undefined);
        assert.equal(JSON.stringify(error).includes(secretMarker), false);
        return true;
    });
    assert.equal(f.deletes(), 1);
    assert.equal(f.closes, 1);
});

test('acknowledged deletion without absence fails', async () => {
    const f = fixture({ onDelete: () => ({ acknowledged: true }) });
    const held = await f.open();
    await held.inspect();
    await assert.rejects(() => held.drop(alpha), error => {
        assert.equal(error.code, 'RESET_ELASTIC_ABSENCE_UNCONFIRMED');
        assert.equal(error.acknowledged, true);
        assert.equal(error.index, alpha);
        assert.equal(error.absent, undefined);
        return true;
    });
    assert.equal(f.deletes(), 1);
    assert.equal(f.closes, 1);
});

test('malformed absence after acknowledgement fails', async () => {
    const f = fixture();
    const held = await f.open();
    await held.inspect();
    f.onDelete = () => {
        f.onGet = index => { throw absent(index, e => { e.meta.body.error.index = beta; }); };
        return { acknowledged: true };
    };
    await assert.rejects(() => held.drop(alpha), error => {
        assert.equal(error.code, 'RESET_ELASTIC_INSPECTION_UNCONFIRMED');
        assert.equal(error.acknowledged, true);
        assert.equal(error.index, alpha);
        assert.equal(error.absent, undefined);
        assert.equal(JSON.stringify(error).includes(secretMarker), false);
        return true;
    });
    assert.equal(f.deletes(), 1);
    assert.equal(f.closes, 1);
});

test('identity changes during exact pre-delete inspection cannot reach deletion', async () => {
    const f = fixture();
    const held = await f.open();
    await held.inspect();
    f.onGet = () => {
        f.topology.nodes.node_UUID_12345.process.id++;
        return { [alpha]: { aliases: {}, settings: { 'index.uuid': uuid } } };
    };
    await rejected(() => held.drop(alpha), 'RESET_ELASTIC_IDENTITY_CHANGED');
    assert.equal(f.deletes(), 0);
});

test('post-delete identity drift prevents a completion receipt', async () => {
    const f = fixture();
    const held = await f.open();
    await held.inspect();
    f.onDelete = index => { f.records.delete(index); f.cluster.cluster_uuid = 'changed_UUID_12345'; return { acknowledged: true }; };
    await rejected(() => held.drop(alpha), 'RESET_ELASTIC_IDENTITY_CHANGED');
    assert.equal(f.deletes(), 1);
    assert.equal(f.closes, 1);
});

for (const method of ['inspect', 'verifyEmpty']) test('recreated deleted name is refused by ' + method, async () => {
    const f = fixture();
    const held = await f.open();
    await held.inspect();
    await held.drop(alpha);
    f.records.set(alpha, 'recreated_UUID_12345');
    await rejected(() => held[method](), method === 'inspect' ? 'RESET_ELASTIC_UUID_CHANGED' : 'RESET_ELASTIC_NOT_EMPTY');
    assert.equal(f.deletes(), 1);
    assert.equal(f.closes, 1);
});

test('drop before inspect, unselected names, repeated delete and nonempty verification fail closed', async () => {
    for (const [action, code] of [
        [async held => held.drop(alpha), 'RESET_ELASTIC_INSPECTION_REQUIRED'],
        [async held => { await held.inspect(); return held.drop(beta); }, 'RESET_ELASTIC_SCOPE_INVALID'],
        [async held => { await held.inspect(); await held.drop(alpha); return held.drop(alpha); }, 'RESET_ELASTIC_DROP_ALREADY_COMPLETED'],
        [async held => { await held.inspect(); return held.verifyEmpty(); }, 'RESET_ELASTIC_NOT_EMPTY'],
    ]) {
        const f = fixture();
        const held = await f.open();
        await rejected(() => action(held), code);
        assert.equal(f.closes, 1);
    }
});

test('close failure is sanitized, retained across repeated close, and counted on operation failure', async () => {
    const f = fixture({ closeFailure: true, onGet: () => { throw new Error(secretMarker); } });
    const held = await f.open();
    await assert.rejects(() => held.inspect(), error => {
        assert.equal(error.code, 'RESET_ELASTIC_INSPECTION_UNCONFIRMED');
        assert.equal(error.cleanupFailedCount, 1);
        assert.equal(JSON.stringify(error).includes(secretMarker), false);
        return true;
    });
    await rejected(() => held.close(), 'RESET_ELASTIC_CLOSE_FAILED');
    await rejected(() => held.close(), 'RESET_ELASTIC_CLOSE_FAILED');
    assert.equal(f.closes, 1);
});

test('overlapping operations close the hold and prevent continued provider requests', async () => {
    const f = fixture();
    let release;
    f.onInfo = () => new Promise(resolve => { release = () => resolve(f.cluster); });
    const held = await f.open();
    const pending = held.inspect();
    await rejected(() => held.inspect(), 'RESET_ELASTIC_OPERATION_IN_PROGRESS');
    release();
    await rejected(() => pending, 'RESET_ELASTIC_IDENTITY_UNCONFIRMED');
    assert.equal(f.closes, 1);
    assert.equal(f.calls.length, 1);
    assert.equal(f.deletes(), 0);
});

test('invalid client closes partial construction; constructor failures never expose raw details', async () => {
    const f = fixture();
    delete f.client.nodes;
    await rejected(() => f.open(), 'RESET_ELASTIC_OPEN_FAILED');
    assert.equal(f.closes, 1);
    const g = fixture();
    g.owner.createClient = () => { throw new Error(secretMarker); };
    await rejected(() => g.open(), 'RESET_ELASTIC_OPEN_FAILED');
});

test('read-only identity errors close without mutation; SDK meta body is accepted', async () => {
    const f = fixture({ onNodes: () => { throw new Error(secretMarker); } });
    const held = await f.open();
    await rejected(() => held.inspect(), 'RESET_ELASTIC_IDENTITY_UNCONFIRMED');
    assert.equal(f.deletes(), 0);
    assert.equal(f.closes, 1);
    const g = fixture();
    g.onInfo = () => ({ statusCode: 200, body: g.cluster });
    g.onNodes = () => ({ statusCode: 200, body: g.topology });
    const metaHeld = await g.open();
    try { assert.equal((await metaHeld.inspect()).indexCount, 1); } finally { await metaHeld.close(); }
});

test('exclusion attestations required and caller adapters never replace the provider', async () => {
    for (const field of ['writersExcluded', 'exclusiveDeployment']) {
        const f = fixture();
        await rejected(() => f.open(request({ [field]: false })), 'RESET_ELASTIC_SCOPE_INVALID');
        assert.equal(f.creates, 0);
    }
    const f = fixture();
    const held = await f.open(request({ createClient: () => { throw new Error('caller adapter used'); } }));
    try { assert.equal((await held.inspect()).indexCount, 1); } finally { await held.close(); }
    assert.equal(f.creates, 1);
});

test('normalization is owned by the configured connection service and leaves configuration intact', async () => {
    const original = SERVICE.DefaultElasticSearchEngineConnectionHandlerService;
    let normalizations = 0;
    SERVICE.DefaultElasticSearchEngineConnectionHandlerService = { ...connection, getClientOptions: function (...args) {
        normalizations++;
        return connection.getClientOptions(...args);
    } };
    try {
        const f = fixture();
        const input = request({ configuration: { connection: { hosts: ['http://127.0.0.1:9200'], log: 'info', deadTimeout: 1000, maxRetries: 7 } } });
        const before = structuredClone(input);
        const held = await f.open(input);
        await held.close();
        assert.equal(normalizations, 1);
        assert.deepEqual(input, before);
        assert.equal(f.options.maxRetries, 0);
        assert.equal(f.options.log, undefined);
        assert.equal(f.options.deadTimeout, undefined);
    } finally { SERVICE.DefaultElasticSearchEngineConnectionHandlerService = original; }
});

test('connection delegate honors the loader-merged maintenance owner without requiring its SDK', async () => {
    const previous = SERVICE.DefaultElasticLocalResetMaintenanceService;
    const input = request();
    let received;
    const result = { contractVersion: 1 };
    SERVICE.DefaultElasticLocalResetMaintenanceService = { open: async value => { received = value; return result; } };
    try {
        assert.equal(await connection.openLocalResetMaintenance(input), result);
        assert.equal(received, input);
    } finally {
        if (previous) SERVICE.DefaultElasticLocalResetMaintenanceService = previous;
        else delete SERVICE.DefaultElasticLocalResetMaintenanceService;
    }
});

test('installed SDK nodes.info metric spelling maps to the native path without network', async () => {
    const path = require('node:path');
    const Nodes = require(path.join(path.dirname(require.resolve('@elastic/elasticsearch')), 'lib/api/api/nodes.js')).default;
    let called;
    const api = new Nodes({ request: async (parameters, options) => { called = { parameters, options }; return {}; } });
    await api.info({ metric: 'process,http,transport' }, { maxRetries: 0, requestTimeout: 250 });
    assert.equal(called.parameters.method, 'GET');
    assert.equal(called.parameters.path, '/_nodes/process%2Chttp%2Ctransport');
    assert.deepEqual(called.options, { maxRetries: 0, requestTimeout: 250 });
});
