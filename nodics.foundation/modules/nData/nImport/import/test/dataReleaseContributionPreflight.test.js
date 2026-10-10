/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module import/test/dataReleaseContributionPreflight @description Exercises the secured route/controller/facade preflight contract with real release discovery and Process evidence over isolated read services. @layer test @owner import */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const path = require('node:path');
const root = path.resolve(__dirname, '../../../../../..');
const releaseService = require('../src/service/release/defaultDataReleaseService');
const controller = require('../src/controller/release/defaultDataReleaseController');
const facade = require('../src/facade/release/defaultDataReleaseFacade');
const routes = require('../src/router/routers');
const workflow = path.join(root, 'nodics.process/modules/workflow');
const contribution = require(path.join(workflow, 'src/service/definition/defaultProcessDefinitionContributionService'));
const lifecycle = require(path.join(workflow, 'src/service/definition/defaultProcessDefinitionLifecycleService'));
const graph = require(path.join(workflow, 'src/service/designer/defaultProcessGraphValidationService'));

function fixture() {
    const owner = { name: 'editorial', path: path.join(root, 'nodics.wcms/modules/editorial') };
    const processPolicy = { definitionContributions: { ownershipTransitions: [] } };
    const policy = { destinationEnforced: true,
        contributions: [{ moduleName: 'editorial', sections: ['editorialWorkflows'] }],
        installers: { PROCESS_DEFINITION: 'DefaultProcessDefinitionContributionService' } };
    let current = false, reads = 0;
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.CONFIG = { get: name => ({ data: { dataReleases: policy }, process: processPolicy,
        runtimeRole: { code: 'PROCESS' }, environment: { class: 'LOCAL' } })[name] };
    global.NODICS = { getActiveModules: () => [], getRawModule: name => name === 'editorial' ? owner : undefined,
        getSelectedEnvironmentName: () => 'isolated' };
    const service = { ...releaseService, activeExecutions: new Map(), getInstallations: async () => current ? [{
        code: service.installationCode('tenantA', target), version: target.version, checksum: target.checksum, status: 'COMPLETED'
    }] : [] };
    const target = service.discoverReleases('init').find(item => item.releaseCode === 'editorial:editorialWorkflows');
    const definitions = require(path.join(owner.path, 'data/init-v001/records/process/editorialWorkflowDefinitionData'));
    const records = definitions.definitions.map(item => ({ ...structuredClone(item), status: 'PUBLISHED', currentVersion: 1,
        contributionOwner: 'deployment', contributionCode: 'deployment:editorial',
        contributionVersion: '1.0.0', contributionChecksum: 'a'.repeat(64) }));
    const versions = records.map(item => ({ ...structuredClone(item), definitionCode: item.code, version: 1,
        checksum: lifecycle.checksum(item) }));
    const readService = rows => ({ get: async request => {
        reads++;
        assert.equal(request.tenant, 'tenantA');
        assert.deepEqual(request.authData, { loginId: 'operator' });
        return { result: structuredClone(rows.filter(item => Object.entries(request.query).every(([key, value]) => item[key] === value))) };
    } });
    global.SERVICE = { DefaultDataReleaseService: service, DefaultProcessDefinitionContributionService: contribution,
        DefaultProcessDefinitionLifecycleService: lifecycle, DefaultProcessGraphValidationService: graph,
        DefaultProcessDefinitionService: readService(records), DefaultProcessDefinitionVersionService: readService(versions) };
    global.FACADE = { DefaultDataReleaseFacade: facade };
    const request = body => ({ tenant: 'tenantA', authData: { loginId: 'operator' },
        contribution: { checksum: 'forged' }, httpRequest: { body: {
            dataType: 'sample', releaseCodes: [target.releaseCode], ...body
        } } });
    const validate = body => controller.preflightInit(request(body));
    return { service, policy, processPolicy, target, records, versions, validate, request,
        setCurrent: () => { current = true; }, reads: () => reads };
}

test('existing authorized Init validate path returns evidence, blocked authority, then RETAIN with no persistence services', async () => {
    const f = fixture();
    const first = await f.validate({ ownershipTransitions: [{ mode: 'RETAIN' }] });
    assert.equal(first.data.dataType, 'init');
    assert.equal(first.data.validation.ready, false);
    assert.equal(first.data.validation.importExecuted, false);
    const result = first.data.contributionPlans[0];
    assert.equal(result.ready, false);
    assert.equal(result.plan, undefined);
    assert.equal(result.blocker.code, 'ERR_PROCESS_00003');
    assert.equal(result.evidence.definitions.length, 2);
    for (const item of result.evidence.definitions) {
        assert.equal(item.equivalent, true);
        assert.equal(item.installed.moduleName, 'deployment');
        assert.equal(item.target.checksum, f.target.checksum);
        assert.equal(item.publishedChecksum, f.versions.find(version => version.definitionCode === item.code).checksum);
        f.processPolicy.definitionContributions.ownershipTransitions.push({ definitionCode: item.code,
            source: item.installed, target: item.target, publishedChecksum: item.publishedChecksum, mode: 'RETAIN' });
    }
    const before = structuredClone([f.records, f.versions]);
    for (let index = 0; index < 2; index++) {
        const approved = await f.validate();
        assert.equal(approved.data.validation.ready, true);
        assert.deepEqual(approved.data.contributionPlans[0].plan.definitions.map(item => item.action), ['RETAIN', 'RETAIN']);
    }
    f.setCurrent();
    const reads = f.reads();
    const current = await f.validate();
    assert.equal(current.data.validation.skipped, true);
    assert.equal(current.data.validation.ready, true);
    assert.ok(f.reads() > reads, 'current receipt must not skip owner evidence');
    f.processPolicy.definitionContributions.ownershipTransitions = [];
    assert.equal((await f.validate()).data.validation.ready, false);
    assert.deepEqual([f.records, f.versions], before);
});

test('missing hook, corrupted immutable evidence and unexpected service failures reject controller preflight', async () => {
    const f = fixture();
    SERVICE.DefaultProcessDefinitionContributionService = { installContribution: () => { throw Error('must never execute'); } };
    await assert.rejects(f.validate(), /preflight is unavailable/);
    SERVICE.DefaultProcessDefinitionContributionService = contribution;
    f.versions[0].checksum = 'b'.repeat(64);
    await assert.rejects(f.validate(), /published version/);
    SERVICE.DefaultProcessDefinitionService.get = async () => { throw Error('read unavailable'); };
    await assert.rejects(f.validate(), /read unavailable/);
});

test('controller callback carries plan and the existing route retains authorization and fixed Init type', async () => {
    const f = fixture();
    const route = routes.import.dataReleases.preflightInit;
    assert.equal(route.key, '/init/validate');
    assert.equal(route.method, 'POST');
    assert.equal(route.secured, true);
    assert.equal(route.permission, 'import.release.validate');
    assert.deepEqual(route.permissions, ['import.core.run']);
    assert.equal(route.apiExposure, 'dataImport');
    const result = await new Promise((resolve, reject) => controller.preflightInit(f.request(),
        (error, response) => error ? reject(error) : resolve(response)));
    assert.equal(result.data.validation.ready, false);
    assert.equal(result.data.contributionPlans[0].evidence.definitions.length, 2);
});

test('effective reviewer changes require exact configured forward evidence through the same HTTP controller', async () => {
    const f = fixture();
    f.processPolicy.definitionContributions.reviewerAssignments = {
        editorialApproval: { ownerModule: 'editorial', contributionOwner: 'editorial',
            nodeAssignees: { editorialReview: 'newReviewers' } }
    };
    const initial = (await f.validate()).data.contributionPlans[0];
    const approval = initial.evidence.definitions.find(item => item.code === 'editorialApproval');
    assert.equal(approval.equivalent, false);
    f.processPolicy.definitionContributions.ownershipTransitions = initial.evidence.definitions.map(item => ({
        definitionCode: item.code, source: item.installed, target: item.target,
        publishedChecksum: item.publishedChecksum, mode: 'RETAIN'
    }));
    assert.equal((await f.validate({ mode: 'FORWARD', targetExecutionChecksum: approval.targetExecutionChecksum })).data.validation.ready, false);
    const transition = f.processPolicy.definitionContributions.ownershipTransitions.find(item => item.definitionCode === approval.code);
    transition.mode = 'FORWARD';
    assert.equal((await f.validate()).data.validation.ready, false);
    transition.targetExecutionChecksum = approval.targetExecutionChecksum;
    const planned = (await f.validate()).data.contributionPlans[0];
    assert.equal(planned.ready, true);
    assert.deepEqual(planned.plan.definitions.map(item => item.action), ['FORWARD', 'RETAIN']);
    assert.equal(f.records[0].currentVersion, 1);
    assert.equal(f.versions.length, 2);
});
