/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module nService/test/moduleOwnershipClassification @description Prevents materialized non-callable authority from escaping the metadata-only deployment planner. @layer test @owner nService */
const test = require('node:test');
const assert = require('node:assert/strict');
const agent = require('../src/service/module/defaultModuleRegistrationAgentService');
const source = ownership => ({metaData: {nodics: {owns: ['schema'], runtime: {router: false, ...(ownership ? {ownership} : {})}}}});
test('materialized non-callable claims require explicit installed classification, never wire scope or generic owns', () => {
    const registration = {moduleName: 'stateOwner', clientCallable: false, authorityClaims: [{kind: 'schema', schemaCode: 'entry'}], ownershipScope: 'functional'};
    assert.throws(() => agent.isOwningRegistration(registration, source()), /explicit installed ownership/);
    assert.throws(() => agent.isOwningRegistration(registration, {metaData: {}}), /explicit installed ownership/);
    for (const scope of ['functional', 'runtimeLocal']) assert.equal(agent.isOwningRegistration(registration, source(scope)), true);
    assert.throws(() => agent.isOwningRegistration(registration, source('sourceOnly')), /Source-only/);
    assert.equal(agent.isOwningRegistration({...registration, clientCallable: true}, source()), true);
    assert.equal(agent.isOwningRegistration({...registration, authorityClaims: []}, source()), false);
});
test('service-only ownership is explicit and empty schema packages do not become authority', () => {
    const registration = {moduleName: 'helper', clientCallable: false, authorityClaims: []};
    assert.equal(agent.isOwningRegistration(registration, source('functional')), true);
    assert.equal(agent.isOwningRegistration(registration, source('sourceOnly')), false);
    assert.equal(agent.isOwningRegistration(registration, source()), false);
});

test('operation reader uses canonical installed discovery once, remains lazy and refreshes source changes', t => {
    const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
    const utils = require('../../nConfig/src/utils/utils');
    const previous = {NODICS: global.NODICS, UTILS: global.UTILS};
    const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'ownership-source-')));
    t.after(() => { Object.assign(global, previous); fs.rmSync(root, {recursive: true, force: true}); });
    const framework = path.join(root, 'framework'), foundation = path.join(framework, 'foundation');
    const project = path.join(root, 'project'), owner = path.join(framework, 'owner');
    const write = (directory, name, kind, ownership) => {
        fs.mkdirSync(directory, {recursive: true});
        fs.writeFileSync(path.join(directory, 'package.json'), JSON.stringify({name, index: '1',
            nodics: {kind, runtime: {router: false, ...(ownership ? {ownership} : {})}}}));
    };
    write(framework, 'framework', 'framework'); write(foundation, 'foundation', 'group');
    write(project, 'project', 'application'); write(owner, 'owner', 'capability', 'functional');
    const loaded = source('runtimeLocal');
    global.NODICS = {getNodicsHome: () => foundation, getCustomHome: () => project,
        getRawModule: name => name === 'loaded' ? loaded : undefined};
    let discoveries = 0;
    global.UTILS = {...utils, createInstalledSourceResolver() {
        discoveries++; return utils.createInstalledSourceResolver.call(this);
    }};
    const read = agent.createOwnershipSourceResolver();
    assert.equal(read('loaded'), loaded); assert.equal(discoveries, 0);
    for (let i = 0; i < 40; i++) assert.equal(agent.getModuleOwnershipScope('owner', read('owner')), 'functional');
    assert.equal(discoveries, 1);
    write(owner, 'owner', 'capability', 'sourceOnly');
    assert.equal(agent.getModuleOwnershipScope('owner', read('owner')), 'functional');
    const next = agent.createOwnershipSourceResolver();
    assert.equal(agent.getModuleOwnershipScope('owner', next('owner')), 'sourceOnly');
    assert.equal(discoveries, 2);
    assert.throws(() => next('missing'), /Missing installed source/);
    write(path.join(framework, 'duplicate'), 'owner', 'capability', 'runtimeLocal');
    assert.throws(() => agent.createOwnershipSourceResolver()('owner'), /Duplicate|Ambiguous/);
});
