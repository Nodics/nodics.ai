/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/test/editorialWorkflowContribution @description Verifies neutral destination-qualified graphs through nImport inspection and Process validation. @layer test @owner editorial */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const releaseService = require('../../../../nodics.foundation/modules/nData/nImport/import/src/service/release/defaultDataReleaseService');
const contributionService = require('../../../../nodics.process/modules/workflow/src/service/definition/defaultProcessDefinitionContributionService');
const graphService = require('../../../../nodics.process/modules/workflow/src/service/designer/defaultProcessGraphValidationService');
const manifest = require('../data/manifest.json');
const registration = require('../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleRegistrationAgentService');
const lifecycle = require('../../../../nodics.process/modules/workflow/src/service/definition/defaultProcessDefinitionLifecycleService');

test('Editorial owns checksum-qualified neutral graphs without activating its runtime in Process', () => {
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.CONFIG = { get: () => ({}) };
    global.SERVICE = { DefaultProcessGraphValidationService: graphService };
    const owner = { name: 'editorial', path: path.resolve(__dirname, '..') };
    global.NODICS = { getRawModule: name => name === 'editorial' ? owner : undefined };
    const release = releaseService.inspectManifest(owner, 'init', path.join(owner.path, 'data/manifest.json'),
        manifest.sections.editorialWorkflows, 'editorialWorkflows', true);
    assert.equal(release.releaseCode, 'editorial:editorialWorkflows');
    assert.equal(release.destinationRole, 'PROCESS');
    assert.equal(release.installer, 'PROCESS_DEFINITION');
    assert.equal(release.selectionPolicy, 'EXPLICIT');
    assert.equal(release.initialPublicationPolicy, 'NONE');
    const packages = registration.buildActivationDataPackages('editorial', owner);
    const workflowPackage = packages.find(pack => pack.code === 'editorial:editorialWorkflows');
    const foundationPackage = packages.find(pack => pack.code === 'editorial:init-v001');
    assert.equal(workflowPackage.required, false);
    assert.equal(workflowPackage.trigger, 'USER');
    assert.equal(foundationPackage.required, true);
    assert.equal(foundationPackage.trigger, 'ACTIVATION');
    const payload = contributionService.loadPayload(release);
    const definitions = contributionService.validateContribution(release, payload);
    assert.deepEqual(definitions.map(definition => definition.code), ['editorialApproval', 'editorialPublication']);
    for (const definition of definitions) {
        assert.equal(definition.ownerModule, 'editorial');
        assert.equal(definition.policy, undefined);
        for (const node of definition.graph.nodes) {
            assert.equal(node.assignee, undefined);
            if (node.action) assert.equal(node.action.moduleName, 'editorial');
        }
    }
});

test('Process operator inspection qualifies the actual Editorial release through nImport without activation or writes', async () => {
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    let role = 'PROCESS';
    const owner = { name: 'editorial', path: path.resolve(__dirname, '..') };
    const data = { dataReleases: { destinationEnforced: true,
        contributions: [{ moduleName: 'editorial', sections: ['editorialWorkflows'] }] } };
    global.CONFIG = { get: name => ({ data, runtimeRole: { code: role }, environment: { class: 'LOCAL' } })[name] };
    global.NODICS = { getActiveModules: () => [], getRawModule: name => name === 'editorial' ? owner : undefined,
        getSelectedEnvironmentName: () => 'testLocal' };
    global.SERVICE = {
        DefaultDataReleaseService: { ...releaseService, getInstallations: async () => [] },
        DefaultProcessDefinitionLifecycleService: lifecycle,
        DefaultProcessGraphValidationService: graphService,
        DefaultProcessDefinitionService: { get: async request => {
            assert.equal(request.tenant, 'tenantA');
            assert.equal(request.authData.loginId, 'operator');
            return { result: [] };
        } }
    };
    const request = { tenant: 'tenantA', authData: { loginId: 'operator' },
        releaseRequest: { dataType: 'init', releaseCodes: ['editorial:editorialWorkflows'] } };
    const inspected = await contributionService.inspectRelease(request);
    assert.deepEqual(inspected.definitions.map(item => item.code), ['editorialApproval', 'editorialPublication']);
    assert.ok(inspected.definitions.every(item => item.equivalent === false && !item.installed &&
        /^[a-f0-9]{64}$/.test(item.target.checksum)));
    assert.deepEqual((await contributionService.planRelease(request)).definitions.map(item => item.action), ['CREATE', 'CREATE']);
    role = 'WCMS_STAGED';
    await assert.rejects(contributionService.inspectRelease(request), /runtime destination/);
    role = 'PROCESS';
    data.dataReleases.contributions = [];
    await assert.rejects(contributionService.inspectRelease(request), /unavailable/);
});
