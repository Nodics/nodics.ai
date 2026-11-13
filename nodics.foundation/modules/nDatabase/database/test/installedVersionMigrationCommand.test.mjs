/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module database/test/installedVersionMigrationCommand @description Verifies explicit local maintenance scope and mutation opt-in without connecting providers. @owner database @layer test */
import assert from 'node:assert/strict';
import test from 'node:test';
import { parseOptions, assertLocalConnection } from '../src/service/schema/defaultInstalledVersionMigrationCommand.mjs';
const scope = ['--environment=qualityLocal', '--server=authoring', '--owner=fixture', '--schemas=entry,translation',
    '--tenant=independent', '--plan-file=/tmp/independent-plan.json'];

test('planning is default and mutation requires reviewed scope and provenance', () => {
    assert.equal(parseOptions(scope).action, 'plan');
    assert.deepEqual(parseOptions(scope).schemas, ['entry', 'translation']);
    for (const args of [[], [...scope, '--tenant=other'], [...scope, '--uri=mongodb://remote'], [...scope, '--action=apply'],
        scope.map(value => value.startsWith('--schemas=') ? '--schemas=entry,entry' : value)]) {
        assert.throws(() => parseOptions(args));
    }
    const apply = parseOptions([...scope, '--action=apply', '--execute', '--checksum=' + 'a'.repeat(64),
        '--migration-id=one', '--execution-id=worker-one', '--requested-by=operator', '--correlation-id=case-one']);
    assert.equal(apply.execute, true);
});

test('the native-local entry cannot select an arbitrary remote database', () => {
    for (const host of ['localhost', '127.0.0.1', '[::1]']) assertLocalConnection({ URI: 'mongodb://' + host + ':27017', databaseName: 'fixture' });
    for (const URI of ['mongodb://remote.example', 'mongodb+srv://localhost', 'http://localhost', 'mongodb://127.0.0.1,remote.example']) {
        assert.throws(() => assertLocalConnection({ URI, databaseName: 'fixture' }));
    }
    assert.throws(() => assertLocalConnection({ URI: 'mongodb://localhost' }));
});

test('maintenance context observes initialized owners only after the canonical projection completes', async () => {
    const { createRequire } = await import('node:module');
    const require = createRequire(import.meta.url);
    const { loadContext } = await import('../src/service/schema/defaultInstalledVersionMigrationCommand.mjs');
    const projection = require('../../../nTooling/src/service/project/defaultProjectConfigurationProbeService');
    const credentials = require('../../../nTooling/src/service/project/defaultProjectLocalRuntimeCredentialService');
    const initializer = require('../../../nConfig/src/service/DefaultFrameworkInitializerService');
    const before = { CONFIG: global.CONFIG, SERVICE: global.SERVICE, NODICS: global.NODICS };
    const originals = { resolve: projection.resolve, mergeEnvironment: credentials.mergeEnvironment, load: initializer.loadMaintenanceServices };
    const events = [], raw = {};
    let release, ready = false, pending;
    const gate = new Promise(resolve => { release = resolve; });
    try {
        credentials.mergeEnvironment = () => { events.push('private-inputs'); return {}; };
        projection.resolve = async () => { events.push('projection-start'); await gate; ready = true; events.push('projection-complete'); return {}; };
        initializer.loadMaintenanceServices = async () => { assert(ready); events.push('maintenance'); };
        global.CONFIG = { get: () => { assert(ready, 'configuration cannot be observed before projection acknowledgement'); return { class: 'LOCAL' }; } };
        global.SERVICE = { DefaultFilesLoaderService: { loadSchemaFiles: () => { assert(ready); events.push('schema-read'); return raw; } },
            DefaultDatabaseSchemaHandlerService: { buildDatabaseSchema: async value => { assert.equal(value, raw); events.push('schema-build'); } } };
        global.NODICS = { setActiveChannel: channel => { assert.equal(channel, 'master'); events.push('master'); } };
        pending = loadContext({ environment: 'qualityLocal', server: 'authoring' }); pending.catch(() => {});
        await new Promise(resolve => setImmediate(resolve));
        const beforeCompletion = events.slice();
        release();
        const context = await pending;
        assert.deepEqual(beforeCompletion, ['private-inputs', 'projection-start']);
        assert.equal(context.raw, raw);
        assert.deepEqual(events, ['private-inputs', 'projection-start', 'projection-complete', 'maintenance', 'schema-read', 'schema-build', 'master']);
    } finally {
        release(); if (pending) await pending.catch(() => {});
        projection.resolve = originals.resolve; credentials.mergeEnvironment = originals.mergeEnvironment; initializer.loadMaintenanceServices = originals.load;
        Object.assign(global, before);
    }
});
