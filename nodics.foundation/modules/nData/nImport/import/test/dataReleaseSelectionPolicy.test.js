/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module import/test/dataReleaseSelectionPolicy @description Proves explicit selection without changing default Init activation or startup behavior. @layer test @owner import */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const registration = require('../../../../nService/src/service/module/defaultModuleRegistrationAgentService');

test('explicit releases stay discoverable but require exact selection; existing Init remains automatic', async t => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-explicit-release-'));
    t.after(() => fs.rmSync(root, { recursive: true, force: true }));
    const sections = {};
    for (const [code, selectionPolicy, sourceRoot] of [['baseline', undefined, 'init-v001'], ['optional', 'EXPLICIT', 'init-v002']]) {
        const file = sourceRoot + '/records/data.js';
        fs.mkdirSync(path.join(root, 'data', sourceRoot, 'records'), { recursive: true });
        const source = 'module.exports = [];\n';
        fs.writeFileSync(path.join(root, 'data', file), source);
        sections[code] = { kind: 'DATA_RELEASE', dataType: 'init', selectionPolicy, version: '1.0.0',
            owningDomain: 'example', lifecycle: 'OPERATIONAL_VERSIONED', destinationRole: 'PROCESS',
            environmentScope: ['ALL'], sensitivity: 'INTERNAL', versioningPolicy: 'IMMUTABLE',
            publicationPolicy: 'NONE', initialPublicationPolicy: 'NONE', removalPolicy: 'RETAIN', sourceRoot,
            files: { [file]: crypto.createHash('sha256').update(source).digest('hex') } };
    }
    const manifestPath = path.join(root, 'data/manifest.json');
    const writeManifest = () => fs.writeFileSync(manifestPath, JSON.stringify({ contractVersion: 2, module: 'example', sections }));
    writeManifest();
    const owner = { name: 'example', path: root };
    const fixture = require('./helpers/releaseExecution')({ modules: { example: owner }, runtimeRole: 'PROCESS' });
    const service = fixture.service;
    const releases = service.discoverReleases('init');
    assert.deepEqual(releases.map(release => release.releaseCode).sort(), ['example:baseline', 'example:optional']);
    assert.equal(service.publicRelease(releases.find(release => release.sectionCode === 'optional')).selectionPolicy, 'EXPLICIT');
    const packages = registration.buildActivationDataPackages('example', owner);
    assert.equal(packages.find(pack => pack.code === 'example:baseline').required, true);
    assert.equal(packages.find(pack => pack.code === 'example:baseline').trigger, 'ACTIVATION');
    assert.equal(packages.find(pack => pack.code === 'example:optional').required, false);
    assert.equal(packages.find(pack => pack.code === 'example:optional').trigger, 'USER');
    for (const selection of [{}, { modules: ['example'] }]) {
        const plan = await service.preparePlan({ releaseRequest: { dataType: 'init', ...selection } });
        assert.deepEqual(plan.releases.map(release => release.releaseCode), ['example:baseline']);
    }
    const explicit = await service.preparePlan({ releaseRequest: { dataType: 'init', releaseCodes: ['example:optional'] } });
    assert.deepEqual(explicit.releases.map(release => release.releaseCode), ['example:optional']);
    const profile = { label: 'Foundation', steps: [{ dataType: 'init' }] };
    const implicitProfile = await service.buildInitializationProfile('foundation', profile, {});
    assert.deepEqual(implicitProfile.steps[0].releases.map(release => release.releaseCode), ['example:baseline']);
    const selectedProfile = await service.buildInitializationProfile('selected', {
        ...profile, steps: [{ dataType: 'init', releaseCodes: ['example:optional'] }]
    }, {});
    assert.deepEqual(selectedProfile.steps[0].releases.map(release => release.releaseCode), ['example:optional']);
    const startup = { ...service, executePreparedPlan: async (request, plan) => plan };
    const startupPlan = await startup.installStartupReleases({});
    assert.deepEqual(startupPlan.releases.map(release => release.releaseCode), ['example:baseline']);
    assert.equal(fixture.imports.length, 0);
    fixture.runtimeRole = 'WCMS_STAGED';
    await assert.rejects(service.preparePlan({ releaseRequest: { dataType: 'init', releaseCodes: ['example:optional'] } }), /destination/);
    for (const invalid of ['explicit', 'AUTO', false, null]) {
        sections.optional.selectionPolicy = invalid;
        writeManifest();
        assert.throws(() => service.inspectManifest(owner, 'init', manifestPath, sections.optional, 'optional', true), /selectionPolicy/);
        assert.throws(() => registration.buildActivationDataPackages('example', owner), /selectionPolicy/);
    }
});
