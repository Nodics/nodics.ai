/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module media/test/MediaWorkflowReleaseUpgradeContract @description Proves additive explicit selection and installed-definition forward/replay/drift behavior using existing nImport and Process with in-memory lifecycle ports only. */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
const fixture = require('../../../../nodics.foundation/modules/nData/nImport/import/test/helpers/releaseExecution');
const installer = require('../../../../nodics.process/modules/workflow/src/service/definition/defaultProcessDefinitionContributionService');
const validator = require('../../../../nodics.process/modules/workflow/src/service/designer/defaultProcessGraphValidationService');
const manifest = require('../data/manifest.json');
const historicalFile = '../data/init-v002/records/process/mediaPublicationWorkflowDefinitionData.js';
const historical = require(historicalFile);
const currentFile = '../data/init-v003/records/process/mediaPublicationWorkflowDefinitionData.js';
const graph = require(currentFile);
const runtime = require('../../../../nodics.process/modules/workflow/src/service/operation/defaultProcessRuntimeLifecycleService');

/** Provides only an error constructor; no runtime is initialized. */
function errors() { global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } }; }

test('new workflow uses a forward directory and explicit release selection without replaying installed historical releases', async () => {
    errors();
    const owner = { name: 'media', path: path.resolve(__dirname, '..') };
    const f = fixture({ modules: { media: owner }, runtimeRole: 'PROCESS' });
    const release = manifest.sections.mediaPublicationWorkflow;
    assert.equal(release.sourceRoot, 'init-v003'); assert.equal(release.version, '1.0.1');
    assert.deepEqual(Object.keys(release.files), [currentFile.slice('../data/'.length)]);
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname, historicalFile))).digest('hex'),
        '44355063df521b219094703cee293b65df954352e5ced7b77b8b6153acbb5fe9');
    assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.resolve(__dirname, currentFile))).digest('hex'),
        release.files[currentFile.slice('../data/'.length)]);
    assert.equal(graph.definitions[0].code, historical.definitions[0].code);
    assert.equal(release.selectionPolicy, 'EXPLICIT');
    for (const name of ['mediaReplicationRetryJob', 'mediaCleanupRetentionJob']) {
        assert.equal(manifest.sections[name].sourceRoot, 'init-v001');
        assert.equal(manifest.sections[name].version, '0.0.0');
        f.installations.push({ code: 'installed-' + name, releaseCode: 'media:' + name, version: '0.0.0', status: 'INSTALLED' });
    }
    const before = structuredClone(f.installations);
    await assert.rejects(f.service.preparePlan({ releaseRequest: { dataType: 'init', modules: ['media'] } }), /explicit releaseCode/);
    const explicit = await f.service.preparePlan({ releaseRequest: { dataType: 'init', releaseCodes: ['media:mediaPublicationWorkflow'] } });
    assert.deepEqual(explicit.releases.map(item => item.releaseCode), ['media:mediaPublicationWorkflow']);
    assert.deepEqual(explicit.releases[0].declaredFiles, Object.keys(release.files));
    assert.deepEqual(f.installations, before); assert.equal(f.imports.length, 0);
    f.runtimeRole = 'WCMS_STAGED';
    await assert.rejects(f.service.preparePlan({ releaseRequest: { dataType: 'init', releaseCodes: ['media:mediaPublicationWorkflow'] } }), /destination/);
});

test('installed earlier Media workflow advances through Process lifecycle, replays unchanged, and rejects drift/downgrade', async () => {
    errors();
    const definition = structuredClone(graph.definitions[0]);
    const history = [{ ...structuredClone(historical.definitions[0]), definitionCode: definition.code,
        version: 1, currentVersion: 1, status: 'PUBLISHED', contributionOwner: 'media',
        contributionCode: 'media:mediaPublicationWorkflow', contributionVersion: '1.0.0', contributionChecksum: 'a'.repeat(64) }];
    const running = { code: 'running-v1', definitionCode: definition.code, version: 1,
        status: 'WAITING', currentNode: 'mediaReview', context: { sourceVersion: 'retained-v1' } };
    const runningBefore = structuredClone(running);
    let current = structuredClone(history[0]), prepared = 0;
    global.CONFIG = { get: () => ({ definitionContributions: {} }) };
    global.NODICS = { getRawModule: () => ({ path: path.resolve(__dirname, '..') }) };
    global.SERVICE = {
        DefaultProcessGraphValidationService: validator,
        DefaultProcessDefinitionVersionService: { get: async request => ({ result: history.filter(version =>
            version.definitionCode === request.query.definitionCode && version.version === request.query.version) }) },
        DefaultProcessDefinitionLifecycleService: {
            findDefinition: async () => current,
            prepareNextDraft: async () => { prepared++; current.status = 'DRAFT'; },
            updateDraft: async request => { Object.assign(current, request.processDefinition); },
            publishDraft: async () => { current.status = 'PUBLISHED'; current.currentVersion++;
                history.push({ ...structuredClone(current), version: current.currentVersion }); return { data: { version: current.currentVersion } }; }
        }
    };
    const contribution = { ...manifest.sections.mediaPublicationWorkflow, moduleName: 'media',
        releaseCode: 'media:mediaPublicationWorkflow', checksum: 'b'.repeat(64),
        declaredFiles: Object.keys(manifest.sections.mediaPublicationWorkflow.files) };
    const before = structuredClone(history[0]);
    await installer.installContribution({ tenant: 'one', contribution });
    assert.equal(prepared, 1); assert.equal(current.currentVersion, 2);
    assert.equal(current.contributionVersion, '1.0.1'); assert.deepEqual(history[0], before);
    const pinned = await runtime.requireVersion({ tenant: 'one' }, running.definitionCode, running.version);
    assert.deepEqual(pinned, before);
    assert.equal(pinned.graph.nodes.find(node => node.code === 'mediaReview').policy, undefined);
    const successor = await runtime.requireVersion({ tenant: 'one' }, definition.code, 2);
    assert.equal(successor.graph.nodes.find(node => node.code === 'mediaReview').policy.decisionContract.kind, 'APPROVAL');
    assert.deepEqual(successor.policy.actorPolicy, definition.policy.actorPolicy);
    assert.deepEqual(running, runningBefore);
    const replay = await installer.installContribution({ tenant: 'one', contribution });
    assert.equal(replay.data.definitions[0].status, 'CURRENT'); assert.equal(prepared, 1);
    await assert.rejects(installer.installContribution({ tenant: 'one', contribution: { ...contribution, checksum: 'c'.repeat(64) } }), /without a version change/);
    const drifted = structuredClone(definition);
    drifted.graph.nodes.find(node => node.code === 'mediaReview').policy.decisionContract.maximumReasonLength = 2000;
    await assert.rejects(installer.planDefinition({ tenant: 'one' }, drifted, contribution), /without a contribution version change/);
    await assert.rejects(installer.installContribution({ tenant: 'one', contribution: { ...contribution, version: '1.0.0' } }), /downgrade/);
    assert.deepEqual(history[0], before); assert.equal(history.length, 2);
    assert.deepEqual(running, runningBefore); assert.equal(prepared, 1);
});
