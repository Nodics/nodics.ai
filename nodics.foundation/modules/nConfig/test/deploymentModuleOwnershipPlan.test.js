/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module config/test/deploymentModuleOwnershipPlan @description Verifies entry-root ownership and remote dependency derivation without deployment role catalogues. @layer test @owner config */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const owner = require('../src/service/defaultDeploymentModuleOwnershipService');
const source = {
  domain: { name: 'domain', metaData: { nodics: { kind: 'group', runtime: { router: false } } } },
  product: { name: 'product', parent: 'domain', metaData: { nodics: { owns: ['schema'], runtime: { router: true } } } },
  wallet: { name: 'wallet', metaData: { nodics: { owns: ['schema'], runtime: { router: true } } } },
  health: { name: 'health', metaData: { nodics: { owns: ['schema'], runtime: { ownership: 'runtimeLocal', router: true } } } },
  helper: { name: 'helper', metaData: { nodics: { runtime: { ownership: 'sourceOnly' } } } },
  coordinator: { name: 'coordinator', metaData: { nodics: { runtime: { ownership: 'functional' } } } },
};
const runtime = (server, modules, extra = {}) => ({ projectCode: 'partner', environment: 'local', server, publication: 'OPERATIONAL', modules, explicitModules: [], explicitGroups: [], ...extra });
const plan = runtimes => owner.plan(runtimes, name => source[name]);
test('unique selected owner serves dependencies without copying their module inventory', () => {
  const result = plan([runtime('author', ['product'], { explicitGroups: ['domain'] }), runtime('consumer', ['product', 'wallet'], { explicitModules: ['wallet'] })]);
  assert.equal(result.find(x => x.moduleName === 'product').server, 'author');
  assert.equal(result.find(x => x.moduleName === 'wallet').server, 'consumer');
});
test('group containment never claims an external dependency', () => {
  const result = plan([runtime('domainHost', ['product', 'wallet'], { explicitGroups: ['domain'] }), runtime('walletHost', ['wallet'], { explicitModules: ['wallet'] })]);
  assert.equal(result.find(x => x.moduleName === 'wallet').server, 'walletHost');
});
test('competing explicit owners and ambiguous dependency-only placement reject', () => {
  assert.throws(() => plan(['a', 'b'].map(s => runtime(s, ['product'], { explicitModules: ['product'] }))), /Ambiguous functional owner/);
  assert.throws(() => plan(['a', 'b'].map(s => runtime(s, ['product']))), /select the capability in one runtime/);
});
test('one consuming runtime may own an otherwise unassigned dependency', () => {
  assert.equal(plan([runtime('only', ['product'])])[0].server, 'only');
});
test('runtime-local infrastructure and source-only helpers do not compete', () => {
  assert.deepEqual(plan(['a', 'b'].map(s => runtime(s, ['health', 'helper']))), []);
});
test('service-only functional authority must still have one owner', () => {
  assert.throws(() => plan(['a', 'b'].map(s => runtime(s, ['coordinator']))), /Ambiguous functional owner/);
});
test('publication, environment and project isolate owners', () => {
  const result = plan([runtime('a', ['product'], { publication: 'STAGED' }), runtime('b', ['product'], { publication: 'ONLINE' }), runtime('c', ['product'], { environment: 'other' }), runtime('d', ['product'], { projectCode: 'other' })]);
  assert.equal(result.length, 4);
});
test('unknown sources, contexts and ownership classifications fail closed', () => {
  assert.throws(() => plan([runtime('a', ['missing'])]), /Missing installed/);
  assert.throws(() => plan([runtime('a', ['product'], { publication: 'UNKNOWN' })]), /publication context/);
  assert.throws(() => owner.plan([runtime('a', ['product'])], () => ({ metaData: { nodics: { runtime: { ownership: 'all' } } } })), /Invalid ownership/);
});

test('explicit remote source loading does not become local functional ownership', () => {
  const result = plan([runtime('owner', ['product'], { explicitModules: ['product'] }), runtime('consumer', ['product'], { explicitModules: ['product'], remoteModules: ['product'] })]);
  assert.equal(result.length, 1);
  assert.equal(result[0].server, 'owner');
});

test('real layered runtime selections derive a remote dependency and preserve module DB overrides', t => {
  const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
  const initializer = require('../src/service/DefaultFrameworkInitializerService');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-owner-plan-'));
  t.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  const framework = path.join(temporary, 'framework'), project = path.join(temporary, 'partner');
  const write = (folder, name, kind, extra = {}, properties) => {
    fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(path.join(folder, 'package.json'), JSON.stringify({ name, version: '0.0.0', index: '1',
      ...extra, nodics: { kind, runtimeModule: true, loadableByNodicsModuleLoader: true, runtime: { router: false }, ...extra.nodics } }));
    if (properties) { fs.mkdirSync(path.join(folder, 'config')); fs.writeFileSync(path.join(folder, 'config/properties.js'), 'module.exports = ' + JSON.stringify(properties)); }
  };
  write(path.join(framework, 'domain'), 'domain', 'group', { requiredModules: ['product'] });
  write(path.join(framework, 'domain/modules/product'), 'product', 'capability', { nodics: { runtime: { router: true } } });
  write(path.join(framework, 'client'), 'client', 'capability', { requiredModules: ['product'], nodics: { runtime: { router: true } } });
  write(project, 'partner', 'application');
  write(path.join(project, 'envs'), 'environments', 'group');
  const env = path.join(project, 'envs/local'); write(env, 'local', 'group');
  const config = (port, modules) => ({ activeModules: { modules, groups: [] }, runtimeRole: { code: 'arbitrary', publication: 'OPERATIONAL' },
    servers: { default: { endpoint: { host: 'localhost', port, protocol: 'http' } } }, database: { default: { name: 'base' }, product: { name: 'preserved-product' } } });
  write(path.join(env, 'owner'), 'owner', 'server', { nodics: { extends: ['domain'] } }, config(4301, []));
  write(path.join(env, 'consumer'), 'consumer', 'server', {}, config(4302, ['client']));
  const context = initializer.deploymentPropertyContext({ projectRoot: project, frameworkRoot: framework, environmentCode: 'local', serverCode: 'consumer' });
  const properties = config(4302, ['client']), before = structuredClone(properties);
  const result = owner.derive(properties, { ...context, nodeCode: null }, initializer);
  assert.equal(result.servers.product.remoteOnly, true);
  assert.equal(result.servers.product.endpoint.port, 4301);
  assert.equal(result.servers.client.remoteOnly, false);
  assert.deepEqual(result.database, before.database);
  assert.deepEqual(properties, before);
  // Previously derived endpoint hints are not authored ownership intent.
  write(path.join(env, 'other'), 'other', 'server', {}, config(4303, ['product']));
  const hinted = { ...properties, servers: { ...properties.servers, product: { remoteOnly: true } } };
  assert.equal(owner.derive(hinted, context, initializer).servers.product.endpoint.port, 4303);
  write(path.join(env, 'other2'), 'other2', 'server', {}, config(4304, ['product']));
  assert.throws(() => owner.derive(hinted, context, initializer), /Ambiguous functional owner/);
  fs.rmSync(path.join(env, 'other2'), { recursive: true });
  fs.rmSync(path.join(env, 'other'), { recursive: true });
  // A capability selected on a peer node is still owned by that logical server.
  fs.writeFileSync(path.join(env, 'owner/package.json'), JSON.stringify({ name: 'owner', index: '1', nodics: { kind: 'server', runtimeModule: true, loadableByNodicsModuleLoader: true } }));
  write(path.join(env, 'owner/worker'), 'worker', 'node', {}, { activeModules: { modules: ['product'], groups: [] } });
  write(path.join(env, 'consumer/retired'), 'retired', 'node', { nodics: { retired: true } }, { activeModules: { modules: ['product'], groups: [] } });
  const nodeResult = owner.derive(properties, context, initializer);
  assert.equal(nodeResult.servers.product.remoteOnly, true);
  assert.equal(nodeResult.servers.product.endpoint.port, 4301);
});

test('contradictory source-only callable metadata rejects before projection', () => {
  assert.throws(() => owner.plan([runtime('a', ['bad'])], () => ({ name: 'bad', metaData: { nodics: { runtime: { ownership: 'sourceOnly', router: true } } } })), /Source-only helper/);
});

test('explicit module placement overrides broad group default ownership without duplication', () => {
  const result = plan([runtime('groupHost', ['product'], { explicitGroups: ['domain'] }), runtime('selectedOwner', ['product'], { explicitModules: ['product'] })]);
  assert.equal(result.length, 1);
  assert.equal(result[0].server, 'selectedOwner');
});
