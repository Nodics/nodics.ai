/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
/** @module nPublish/test/publicationSetupObservation @description Exact service/plan and uncached owner proof without runtime calls. @layer test @owner nPublish */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const base = require('../src/service/defaultPublicationSetupObservationService');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');

function fixture(t) {
    const previous = Object.fromEntries(['CONFIG', 'SERVICE', 'CLASSES', 'NODICS'].map(key => [key, global[key]]));
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nodics-observation-'));
    t.after(() => { fs.rmSync(root, { recursive: true, force: true });
        for (const [key, value] of Object.entries(previous)) value === undefined ? delete global[key] : global[key] = value; });
    const service = Object.create(base), reads = [], state = { server: 'staged', role: 'COMMERCE_STAGED', source: 'digest',
        target: 'digest', mutate: undefined, policyEnabled: true };
    const item = { code: 'partner-publication', domain: 'partner', rootType: 'policy', rootCode: 'partner-root', sourceVersion: 'source-v1',
        input: { publicationCode: 'partner-publication' } };
    const publicationStep = { type: 'GOVERNED_PUBLICATIONS', phase: 'AFTER_PUBLICATION', code: 'partner:publication',
        operatorEnterpriseCode: 'partnerEnterprise', targetServer: 'staged', targetRuntimeRole: 'COMMERCE_STAGED',
        publicationPlan: { contractVersion: 1, items: [item] } };
    const releaseStep = { type: 'DATA_RELEASE', phase: 'BEFORE_PUBLICATION', code: 'partner:reference',
        dataType: 'core', targetServer: 'staged', targetRuntimeRole: 'COMMERCE_STAGED' };
    const profile = { code: 'partner', owner: 'partner', baselineCode: 'partner',
        target: { connectionName: 'staged', runtimeRole: 'COMMERCE_STAGED' }, preparation: { steps: [releaseStep, publicationStep] } };
    const fileBytes = Buffer.from('{"source":true}\n');
    const release = { moduleName: 'partner', releaseCode: 'partner:reference', sectionCode: 'reference', dataType: 'core',
        version: '1.0.0', checksum: hash('core-v001/reference.json:' + hash(fileBytes)), sourceRoot: 'core-v001',
        declaredFiles: ['core-v001/reference.json'], lifecycle: 'OPERATIONAL_REFERENCE', destinationRole: 'COMMERCE_STAGED',
        environmentScope: ['local'] };
    const plan = { contractVersion: 1, code: 'partner-reviewed', revision: 1, tenant: 'tenantA', profileCode: 'partner',
        baselineCode: 'partner', profileDigest: service.digest(profile), stages: [
            { code: releaseStep.code, server: 'staged', descriptor: service.stepIdentity(releaseStep), enterpriseCode: 'sharedEnterprise', release: structuredClone(release) },
            { code: publicationStep.code, server: 'staged', descriptor: service.stepIdentity(publicationStep), enterpriseCode: 'partnerEnterprise',
                online: { server: 'online', runtimeRole: 'COMMERCE' }, publications: [
                    { code: item.code, revision: 4, targetVersion: 'digest', operationKey: 'activation-key', previousOnlineVersion: null }] },
        ] };
    const policy = { enabled: true, maximumPlanBytes: 100000, maximumSourceBytes: 8388608, maximumSourcePayloadBytes: 4194304,
        targetObservers: { partner: 'PartnerProvider' }, profilePlans: { partner: plan.code }, plans: {}, callers: {
        platform: { tenant: 'tenantA', enterpriseCode: 'platformEnterprise', serviceId: 'platform-service', projectCode: 'projectA',
            environmentCode: 'local', serverCode: 'platform', instanceCode: 'instanceA', assignmentCode: 'deploymentA', plans: [plan.code] },
    } };
    const writePlan = () => { const bytes = Buffer.from(JSON.stringify(plan)); fs.writeFileSync(path.join(root, 'observation.json'), bytes);
        policy.plans[plan.code] = { moduleName: 'partner', path: 'observation.json', checksum: hash(bytes), revision: plan.revision }; };
    writePlan();
    const input = (mode = 'SOURCE') => ({ contractVersion: 1, planCode: plan.code, checksum: policy.plans[plan.code].checksum,
        revision: plan.revision, stageCode: mode === 'INSTALLATION' ? releaseStep.code : publicationStep.code, mode,
        ...(mode === 'TARGET' ? { operations: [{ code: item.code, operationKey: 'activation-key' }] } : {}) });
    const authData = { tokenType: 'service', principalType: 'service', tenant: 'tenantA', entCode: 'platformEnterprise', serviceId: 'platform-service',
        modules: ['publish'], permissions: ['publish.setup.observe'], runtimeInstanceId: 'instanceA', userGroups: [],
        runtimeScope: { projectCode: 'projectA', environmentCode: 'local', serverCode: 'platform', instanceCode: 'instanceA', assignmentCode: 'deploymentA' } };
    const request = { tenant: 'tenantA', authData };
    const receipt = { operationKey: 'activation-key', publicationCode: item.code, sourceVersion: item.sourceVersion,
        targetVersion: 'digest', previousOnlineVersion: null, committed: true };
    const row = { ...item, tenantCode: 'tenantA', enterpriseCode: 'partnerEnterprise', state: 'ONLINE', revision: 4,
        targetVersion: 'digest', activationOperation: { key: 'activation-key', previousOnlineVersion: null },
        auditTrail: [{ toState: 'APPROVED' }, { toState: 'ONLINE', details: { receipt } }] };
    const installation = { code: 'local:tenantA:partner:reference:core', tenant: 'tenantA', environment: 'local', active: true, status: 'CURRENT',
        moduleName: release.moduleName, releaseCode: release.releaseCode, sectionCode: release.sectionCode, dataType: release.dataType,
        version: release.version, checksum: release.checksum, runId: 'runA', executionId: 'executionA' };
    const get = kind => async r => {
        assert.notEqual(r.authData, authData); assert.equal(r.authData.isSystem, true); assert.equal(authData.isSystem, undefined);
        assert.equal(r.authData.serviceId, authData.serviceId); assert.equal(r.options.skipItemCache, true); assert.equal(r.options.recursive, false);
        assert.equal(r.searchOptions.limit, 2); reads.push([kind, structuredClone(r.query)]);
        state.mutate?.(kind, reads.length);
        return { code: 'SUC_FIND_00000', result: kind === 'publication' && state.missingPublication ? [] :
            [structuredClone(kind === 'publication' ? row : installation)] };
    };
    global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
    global.NODICS = { getRawModule: code => code === 'partner' ? { name: 'partner', path: root } : undefined,
        isModuleActive: code => code === 'partner',
        getServerName: () => state.server, getSelectedEnvironmentName: () => 'local' };
    const catalog = ['publish.setup.observe'];
    global.CONFIG = { get: key => ({ publish: { setup: { observation: policy }, providers: {
        versionProviders: { partner: 'PartnerProvider' }, domainAdapters: { partner: 'Adapter' }, workflowProviders: { partner: 'Workflow' } } },
        backofficeApplicationInitialization: { profiles: { partner: profile } }, runtimeRole: { code: state.role },
        identityGovernance: { permissionCatalog: catalog } })[key] };
    const forbidden = () => { throw new Error('mutation invoked'); };
    global.SERVICE = {
        DefaultIdentityGovernanceService: Object.assign(Object.create(require('../../nAuth/src/service/identity/defaultIdentityGovernanceService')),
            { getConfiguration: () => require('../../nAuth/config/properties').identityGovernance }),
        DefaultServiceTokenService: require('../../nAuth/src/service/identity/defaultServiceTokenService'),
        DefaultPublicationRequestService: { get: get('publication'), save: forbidden, update: forbidden },
        DefaultDataInstallationService: { get: get('installation'), save: forbidden, update: forbidden },
        PartnerProvider: { validateSetup: async (p, r) => { assert.notEqual(r.authData, authData); assert.equal(r.authData.isSystem, true); assert.equal(r.enterpriseCode, 'partnerEnterprise');
            reads.push(['source']); return state.source; },
            isSetupReceiptCommitted: (p, r, receipt) => receipt?.committed === true,
            observeSetupTarget: async (p, r) => { assert.notEqual(r.authData, authData); assert.equal(r.authData.isSystem, true); reads.push(['target']);
                return { version: state.target, revision: 1, receipt }; }, prepareSetup: forbidden, activate: forbidden },
        DefaultDataReleaseService: { discoverReleases: () => [release], validateDestination: () => {},
            installationCode: () => installation.code,
            contributionSourceSnapshot: () => ({ files: new Map([['core-v001/reference.json', fileBytes]]) }),
            preparePlan: forbidden, preflight: forbidden, execute: forbidden },
        DefaultPublicationLifecycleService: { create: forbidden, validate: forbidden, requestApproval: forbidden, activate: forbidden },
    };
    return { service, request, authData, policy, plan, profile, release, installation, row, receipt, state, reads, input, root, writePlan, catalog };
}

test('disabled policy and unrecognized/missing explicit permission refuse before owner reads', async t => {
    const f = fixture(t); f.policy.enabled = false;
    await assert.rejects(f.service.observe(f.request, f.input()), { code: 'ERR_PUB_SETUP_OBSERVATION' });
    f.policy.enabled = true; f.catalog.length = 0;
    await assert.rejects(f.service.observe(f.request, f.input())); f.catalog.push('publish.setup.observe');
    f.authData.permissions = ['*']; await assert.rejects(f.service.observe(f.request, f.input())); assert.deepEqual(f.reads, []);
});
test('exact original signed deployment observes foreign publication source without financial or submit grants', async t => {
    const f = fixture(t), original = structuredClone(f.authData);
    const result = await f.service.observe(f.request, f.input());
    assert.equal(result.ready, true); assert.equal(result.enterpriseCode, 'partnerEnterprise');
    assert.equal(result.items[0].revision, 4); assert.equal(f.reads.filter(row => row[0] === 'publication').length, 4);
    assert.deepEqual(f.authData, original); assert.deepEqual(f.authData.permissions, ['publish.setup.observe']);
});
test('target proof reads actual owner target and never infers CURRENT from source receipt alone', async t => {
    const f = fixture(t); f.state.server = 'online'; f.state.role = 'COMMERCE';
    assert.equal((await f.service.observe(f.request, f.input('TARGET'))).ready, true);
    f.state.target = 'other'; assert.equal((await f.service.observe(f.request, f.input('TARGET'))).ready, false);
    assert.equal(f.reads.filter(row => row[0] === 'target').length, 4);
});
test('TARGET admits only exact complete operation selectors and rejects extra authority before reads', async t => {
    const f = fixture(t); f.state.server = 'online'; f.state.role = 'COMMERCE';
    const valid = f.input('TARGET');
    for (const operations of [undefined, [], [null], [valid.operations[0], valid.operations[0]],
        [{ ...valid.operations[0], code: 'foreign' }], [{ ...valid.operations[0], operationKey: '' }],
        [{ ...valid.operations[0], enterpriseCode: 'foreign' }]]) {
        const input = { ...valid, operations };
        if (operations === undefined) delete input.operations;
        await assert.rejects(f.service.observe(f.request, input));
    }
    await assert.rejects(f.service.observe(f.request, { ...valid, mode: 'SOURCE' }));
    assert.deepEqual(f.reads, []);
    assert.equal((await f.service.observe(f.request, valid)).ready, true);
});
for (const field of ['serviceId', 'principalType', 'tenant', 'entCode', 'runtimeInstanceId']) {
    test('wrong signed principal field ' + field + ' refuses before owner reads', async t => {
        const f = fixture(t); f.authData[field] = 'foreign';
        await assert.rejects(f.service.observe(f.request, f.input())); assert.deepEqual(f.reads, []);
    });
}
for (const field of ['projectCode', 'environmentCode', 'serverCode', 'instanceCode', 'assignmentCode']) {
    test('wrong deployment coordinate ' + field + ' refuses before owner reads', async t => {
        const f = fixture(t); f.authData.runtimeScope[field] = 'foreign';
        await assert.rejects(f.service.observe(f.request, f.input())); assert.deepEqual(f.reads, []);
    });
}
test('human, system, wrong module, aliases, duplicate callers and foreign server are refused', async t => {
    const f = fixture(t);
    for (const mutate of [() => f.authData.tokenType = 'access', () => f.authData.isSystem = true,
        () => f.authData.modules = [], () => f.request.enterpriseCode = 'partnerEnterprise',
        () => f.request.httpRequest = { headers: { tenant: 'foreign' } },
        () => f.policy.callers.duplicate = structuredClone(f.policy.callers.platform), () => f.state.server = 'foreign']) {
        const auth = structuredClone(f.authData), policy = structuredClone(f.policy); mutate();
        await assert.rejects(f.service.observe(f.request, f.input()));
        Object.assign(f.authData, auth); delete f.authData.isSystem; Object.assign(f.policy, policy); delete f.policy.callers.duplicate;
        delete f.request.enterpriseCode; delete f.request.httpRequest; f.state.server = 'staged';
    }
    assert.deepEqual(f.reads, []);
});
test('unknown plan, checksum, revision and stage selectors refuse before reads', async t => {
    const f = fixture(t);
    for (const patch of [{ planCode: 'foreign' }, { checksum: '0'.repeat(64) }, { revision: 2 },
        { stageCode: 'partner:foreign' }, { mode: 'TARGET' }, { enterpriseCode: 'caller-chosen' }])
        await assert.rejects(f.service.observe(f.request, { ...f.input(), ...patch }));
    assert.deepEqual(f.reads, []);
});
test('target plan authority is independent of globally discovered partial or absent BackOffice profiles', async t => {
    const f = fixture(t);
    f.profile.preparation = undefined; f.profile.dataPackages = [{ code: 'different-global-contribution' }];
    assert.equal((await f.service.observe(f.request, f.input())).ready, true);
    const get = global.CONFIG.get;
    global.CONFIG.get = key => key === 'backofficeApplicationInitialization' ? undefined : get(key);
    assert.equal((await f.service.observe(f.request, f.input())).ready, true);
    f.row.rootCode = 'foreign'; await assert.rejects(f.service.observe(f.request, f.input()));
});
test('a connection alias is not receiving server authority; the reviewed canonical server pin is exact', async t => {
    const f = fixture(t);
    f.plan.stages.forEach(stage => stage.descriptor.targetServer = 'stagedAlias'); f.writePlan();
    assert.equal((await f.service.observe(f.request, f.input())).ready, true);
    f.plan.stages[1].server = 'stagedAlias'; f.writePlan();
    await assert.rejects(f.service.observe(f.request, f.input()));
});
test('confined plan rejects traversal, absolute paths, symlinks and changed bytes', async t => {
    const f = fixture(t), reference = f.policy.plans[f.plan.code], original = reference.path;
    for (const name of ['../observation.json', path.join(f.root, 'observation.json'), 'link.json']) {
        if (name === 'link.json') fs.symlinkSync(path.join(f.root, original), path.join(f.root, name));
        reference.path = name; await assert.rejects(f.service.observe(f.request, f.input()));
    }
    reference.path = original; fs.appendFileSync(path.join(f.root, original), ' ');
    await assert.rejects(f.service.observe(f.request, f.input())); assert.deepEqual(f.reads, []);
});
test('foreign publication tenant, enterprise, root, source and revision refuse even with a CURRENT target', async t => {
    const f = fixture(t);
    for (const [key, value] of [['tenantCode', 'other'], ['enterpriseCode', 'other'], ['rootCode', 'other'],
        ['sourceVersion', 'other'], ['revision', 5]]) {
        const original = f.row[key]; f.row[key] = value;
        await assert.rejects(f.service.observe(f.request, f.input())); f.row[key] = original;
    }
});
test('fresh reads detect mid-observation revision drift and policy revocation, never reuse old READY', async t => {
    const f = fixture(t); assert.equal((await f.service.observe(f.request, f.input())).ready, true);
    f.state.source = 'changed'; assert.equal((await f.service.observe(f.request, f.input())).ready, false);
    f.state.source = 'digest'; let count = 0;
    f.state.mutate = kind => { if (kind === 'publication' && ++count === 2) f.row.revision++; };
    await assert.rejects(f.service.observe(f.request, f.input())); f.row.revision = 4;
    f.state.mutate = () => f.policy.enabled = false;
    await assert.rejects(f.service.observe(f.request, f.input()));
});
test('installed proof rechecks source bytes and exact uncached nImport receipt without preflight or preparation', async t => {
    const f = fixture(t); assert.equal((await f.service.observe(f.request, f.input('INSTALLATION'))).ready, true);
    assert.equal(f.reads.filter(row => row[0] === 'installation').length, 2);
    f.installation.checksum = 'changed'; assert.equal((await f.service.observe(f.request, f.input('INSTALLATION'))).ready, false);
    f.installation.tenant = 'foreign'; await assert.rejects(f.service.observe(f.request, f.input('INSTALLATION')));
    f.installation.tenant = 'tenantA'; f.release.version = '2.0.0'; await assert.rejects(f.service.observe(f.request, f.input('INSTALLATION')));
});

test('changed actual release bytes refuse even when discovery and installation still claim the old checksum', async t => {
    const f = fixture(t);
    global.SERVICE.DefaultDataReleaseService.contributionSourceSnapshot = () => ({ files: new Map([
        ['core-v001/reference.json', Buffer.from('changed actual bytes')],
    ]) });
    await assert.rejects(f.service.observe(f.request, f.input('INSTALLATION'))); assert.deepEqual(f.reads, []);
});
test('observation source budgets are bounded and private; global nImport installer limits remain unchanged', t => {
    const f = fixture(t), installerPolicy = { maximumContributionBytes: 1024, maximumContributionPayloadBytes: 256 };
    global.SERVICE.DefaultDataReleaseService.configuration = () => installerPolicy;
    global.SERVICE.DefaultDataReleaseService.contributionSourceSnapshot = function () {
        assert.equal(this.configuration().maximumContributionBytes, f.policy.maximumSourceBytes);
        assert.equal(this.configuration().maximumContributionPayloadBytes, f.policy.maximumSourcePayloadBytes);
        return { files: new Map() };
    };
    f.service.sourceSnapshot(f.release); assert.equal(global.SERVICE.DefaultDataReleaseService.configuration(), installerPolicy);
    for (const patch of [{ maximumSourceBytes: Infinity }, { maximumSourceBytes: 67108865 },
        { maximumSourcePayloadBytes: 16777217 }, { maximumSourcePayloadBytes: 8388609 }]) {
        const original = { ...f.policy }; Object.assign(f.policy, patch);
        assert.throws(() => f.service.policy()); Object.assign(f.policy, original);
    }
});

test('real group-free principal uses canonical private read authority through generated checkAccess, never external groups', async t => {
    const f = fixture(t), get = require('../../nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService');
    const schemaAccess = require('../../nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService');
    f.authData.userGroups = [];
    global.CONFIG.get = ((original) => key => key === 'accessPoints' ? { readAccessPoint: 5, fullAccessPoint: 7 } : original(key))(global.CONFIG.get);
    const oldUtils = global.UTILS; t.after(() => oldUtils === undefined ? delete global.UTILS : global.UTILS = oldUtils);
    global.UTILS = { isBlank: value => !Object.keys(value).length };
    global.SERVICE.DefaultSchemaAccessHandlerService = schemaAccess;
    global.SERVICE.DefaultRecordOwnershipPolicyService = require('../../nDatabase/database/src/service/access/defaultRecordOwnershipPolicyService');
    global.SERVICE.DefaultPublicationRequestService.get = request => new Promise((resolve, reject) => get.checkAccess.call(
        { LOG: { debug() {} } }, { ...request, schemaModel: { rawSchema: { accessGroups: { serviceAccountUserGroup: 5 } } } }, {},
        { nextSuccess: () => resolve({ result: [f.row] }), error: (r, response, error) => reject(error) }));
    assert.equal((await f.service.observe(f.request, f.input())).ready, true);
    assert.deepEqual(f.authData.userGroups, []); assert.equal(f.authData.isSystem, undefined);
    assert.equal(f.reads.filter(row => row[0] === 'source').length, 2);
});
test('target-only observer selection needs no source version, domain adapter or workflow registration', async t => {
    const f = fixture(t), get = global.CONFIG.get;
    global.CONFIG.get = key => key === 'publish' ? { setup: { observation: f.policy },
        providers: { versionProviders: {}, domainAdapters: {}, workflowProviders: {} } } : get(key);
    f.state.server = 'online'; f.state.role = 'COMMERCE';
    assert.equal((await f.service.observe(f.request, f.input('TARGET'))).ready, true);
    delete f.policy.targetObservers.partner;
    await assert.rejects(f.service.observe(f.request, f.input('TARGET')));
    f.policy.targetObservers.partner = 'PartnerProvider'; global.NODICS.isModuleActive = () => false;
    await assert.rejects(f.service.observe(f.request, f.input('TARGET')));
    assert.deepEqual(f.authData.userGroups, []); assert.equal(f.authData.isSystem, undefined);
});
test('missing canonical private persistence authority refuses without adding groups or mutating external claims', async t => {
    const f = fixture(t), original = structuredClone(f.authData);
    delete global.SERVICE.DefaultIdentityGovernanceService;
    await assert.rejects(f.service.observe(f.request, f.input()));
    assert.deepEqual(f.authData, original); assert.deepEqual(f.reads, []);
});
test('service-only observer has its own permission; human submission and all decision routes remain distinct', () => {
    const routes = require('../src/router/routers').publish.publicationLifecycle;
    assert.deepEqual(routes.setupObserve.authTokenTypes, ['service']); assert.deepEqual(routes.setupObserve.accessGroups, ['serviceAccountUserGroup']);
    assert.equal(routes.setupObserve.permission, 'publish.setup.observe');
    for (const name of ['setupStatus', 'setupSubmit', 'create', 'get', 'validate', 'requestApproval'])
        assert.deepEqual(routes[name].authTokenTypes, ['access']);
    for (const name of ['approve', 'reject', 'activate']) assert.deepEqual(routes[name].accessGroups, ['runtimeConfigAdminUserGroup']);
    assert.equal(require('../config/properties').publish.setup.observation.enabled, false);
    const auth = structuredClone(require('../../nAuth/config/properties'));
    assert.equal(auth.identityGovernance.permissionCatalog.filter(permission => permission === 'publish.setup.observe').length, 1);
    auth.identityGovernance.permissionCatalog = [];
    assert(!JSON.stringify(auth).includes('publish.setup.observe'), 'recognition must not create default grants');
});
test('actual secured route admits group-free scoped service only with its explicit module and permission', async t => {
    const f = fixture(t), security = require('../../nRouter/src/service/request/defaultSecuredRequestPipelineService');
    const properties = require('../../nAuth/config/properties'), get = global.CONFIG.get;
    global.CONFIG.get = key => key === 'authSecurity' ? properties.authSecurity : get(key);
    const request = { ...f.request, moduleName: 'publish', router: require('../src/router/routers').publish.publicationLifecycle.setupObserve };
    const check = () => new Promise((resolve, reject) => security.checkAccess(request, {}, {
        nextSuccess: () => resolve(true), error: (r, response, error) => reject(error),
    }));
    assert.equal(await check(), true); assert.deepEqual(f.authData.userGroups, []);
    f.authData.permissions = []; await assert.rejects(check(), { code: 'ERR_AUTH_00003' });
    f.authData.permissions = ['publish.setup.observe']; f.authData.modules = [];
    await assert.rejects(check(), { code: 'ERR_AUTH_00003' });
    f.authData.modules = ['publish']; f.authData.tokenType = 'access';
    await assert.rejects(check(), { code: 'ERR_AUTH_00003' }); assert.deepEqual(f.reads, []);
});

test('bootstrap plan needs no final operation pins; shared BEFORE qualifies before any AFTER publication exists', async t => {
    const f = fixture(t); delete f.plan.stages[1].publications; f.writePlan(); f.state.missingPublication = true;
    assert.equal((await f.service.observe(f.request, f.input('INSTALLATION'))).ready, true);
    assert.equal((await f.service.observe(f.request, f.input())).ready, false);
    f.state.missingPublication = false;
    const source = await f.service.observe(f.request, f.input());
    assert.equal(source.ready, true); assert.equal(source.items[0].operationKey, 'activation-key');
    f.state.server = 'online'; f.state.role = 'COMMERCE';
    assert.equal((await f.service.observe(f.request, f.input('TARGET'))).ready, true);
    f.state.server = 'staged'; f.state.role = 'COMMERCE_STAGED'; f.row.revision++;
    assert.equal((await f.service.observe(f.request, f.input())).items[0].revision, 5);
});
test('read-only plan review material derives current prerequisites and sources, never lifecycle receipts or grants', t => {
    const f = fixture(t), draft = f.service.describePlan('partner', 'tenantA', 'review-draft');
    assert.equal(draft.profileDigest, f.service.digest(f.profile)); assert.equal(draft.stages.length, 2);
    assert.equal(draft.stages[0].release.checksum, f.release.checksum); assert.equal(draft.stages[0].enterpriseCode, null);
    assert.equal(draft.stages[1].publications, undefined); assert.deepEqual(f.reads, []);
    global.SERVICE.DefaultDataReleaseService.discoverReleases = () => [];
    assert.equal(f.service.describePlan('partner', 'tenantA', 'review-draft').stages[0].release, null);
    assert.throws(() => f.service.describeRelease(f.release.releaseCode, f.release.dataType));
});
test('CMS baseline reuses exact owner status, current target pointer and Media qualification without final publication pins', async t => {
    const f = fixture(t), descriptor = { code: 'partner', rootType: 'site', rootCode: 'partnerSite', sourceVersion: 'source-v1' };
    f.plan.baseline = { server: 'staged', runtimeRole: 'COMMERCE_STAGED', enterpriseCode: 'partnerEnterprise',
        descriptorDigest: f.service.digest(descriptor) }; f.writePlan();
    Object.assign(f.row, { domain: 'cms', rootType: 'site', rootCode: 'partnerSite' });
    let qualified = true, pointer = 'digest';
    global.SERVICE.DefaultCmsPublicationBaselineService = { descriptor: () => descriptor, publicationCode: () => f.row.code,
        status: async () => ({ baselineCode: 'partner', readiness: 'READY', releaseStatus: 'CURRENT', publication: structuredClone(f.row),
            mediaDependencies: { owner: 'media', qualified, status: qualified ? 'READY' : 'ACTION_REQUIRED', dependencies: [] } }) };
    global.SERVICE.DefaultCmsPublicationVersionProviderService = { transport: () => ({ getStatus: async () => ({ version: pointer }) }) };
    const input = { ...f.input(), mode: 'BASELINE', stageCode: 'partner' };
    assert.equal((await f.service.observe(f.request, input)).ready, true);
    pointer = 'changed'; assert.equal((await f.service.observe(f.request, input)).ready, false);
    pointer = 'digest'; qualified = false; assert.equal((await f.service.observe(f.request, input)).ready, false);
    descriptor.sourceVersion = 'changed'; await assert.rejects(f.service.observe(f.request, input));
});

function generatedGate(t, f) {
    const initializer = require('../../nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService');
    const oldUtils = global.UTILS, get = global.CONFIG.get;
    t.after(() => oldUtils === undefined ? delete global.UTILS : global.UTILS = oldUtils);
    global.UTILS = { isBlank: value => !Object.keys(value).length, createModelName: name => name + 'Model' };
    global.CONFIG.get = key => key === 'accessPoints' ? { readAccessPoint: 5, fullAccessPoint: 7 } : get(key);
    global.SERVICE.DefaultSchemaAccessHandlerService = require('../../nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService');
    global.SERVICE.DefaultRecordOwnershipPolicyService = require('../../nDatabase/database/src/service/access/defaultRecordOwnershipPolicyService');
    const reads = [];
    const service = (rows, groups) => ({
        get: request => new Promise((resolve, reject) => {
            assert.equal(request.tenant, f.request.tenant); assert.notEqual(request.authData, f.authData);
            assert.equal(request.authData.isSystem, true); assert.equal(f.authData.isSystem, undefined);
            assert.deepEqual(f.authData.userGroups, []); assert.equal(request.options.skipItemCache, true);
            assert.equal(typeof request.query.code, 'string'); reads.push(request);
            initializer.checkAccess.call({ LOG: { debug() {} } }, { ...request,
                schemaModel: { rawSchema: { accessGroups: groups } } }, {}, {
                nextSuccess: () => {
                    const result = rows.filter(row => Object.entries(request.query).every(([key, value]) => row[key] === value));
                    resolve({ code: 'SUC_FIND_00000', result: structuredClone(result), count: result.length });
                }, error: (r, response, error) => reject(error),
            });
        }),
        save: () => assert.fail('observation must not save'), update: () => assert.fail('observation must not update'),
        remove: () => assert.fail('observation must not remove'),
    });
    return { service, reads };
}

for (const domain of ['pricing', 'inventory', 'tax', 'promotion']) {
    test(domain + ' actual retained-source and target descendants pass generated access with group-free external claims', async t => {
        const f = fixture(t), gate = generatedGate(t, f), prefix = domain[0].toUpperCase() + domain.slice(1);
        const directory = path.resolve(__dirname, '../../../../nodics.commerce/modules/baseCommerce/modules', domain);
        const owner = require(path.join(directory, 'src/service/default' + prefix + 'PublicationService'));
        const properties = require(path.join(directory, 'config/properties'));
        const groups = properties.schemaPolicies[domain].operational.accessGroups;
        const item = f.plan.stages[1].descriptor.publicationPlan.items[0], rootType = Object.keys(owner.policyFields())[0];
        Object.assign(item, { domain, rootType, input: { publicationCode: item.code,
            references: [{ schema: rootType, code: item.rootCode, versionId: 0 }] } });
        const scope = { tenant: f.request.tenant, enterpriseCode: 'partnerEnterprise' };
        const payload = { ...scope, rootType, rootCode: item.rootCode,
            records: [{ schema: rootType, policy: { code: item.rootCode, versionId: 0 } }] };
        const version = owner.fingerprint(payload); item.sourceVersion = version;
        const release = { ...scope, code: version, rootType, rootCode: item.rootCode, payload, fingerprint: version };
        const pointerCode = owner.pointerCode(item, scope);
        const receipt = { ...scope, code: 'receipt', operationKey: 'activation-key', publicationCode: item.code,
            sourceVersion: version, targetVersion: version, fingerprint: version, pointerCode,
            expectedRevision: 0, previousOnlineVersion: null, applied: true };
        const pointer = { ...scope, code: pointerCode, active: true, version, revision: 1, receiptCode: receipt.code };
        Object.assign(f.row, { ...item, targetVersion: version,
            auditTrail: [{ toState: 'APPROVED' }, { toState: 'ONLINE', details: { receipt: structuredClone(receipt) } }] });
        f.plan.stages[1].publications[0].targetVersion = version;
        f.policy.targetObservers[domain] = 'ActualOwner'; f.writePlan();
        const get = global.CONFIG.get;
        global.CONFIG.get = key => key === domain ? { publication: {
            runtimeRole: f.state.server === 'staged' ? 'STAGED' : 'ONLINE', sourceVersioningQualified: true } } :
            key === 'publish' ? { setup: { observation: f.policy }, providers: { versionProviders: { [domain]: 'ActualOwner' },
                domainAdapters: { [domain]: 'Adapter' }, workflowProviders: { [domain]: 'Workflow' } } } : get(key);
        global.NODICS.isModuleActive = code => code === domain;
        global.SERVICE.ActualOwner = owner;
        global.SERVICE['Default' + prefix + 'PolicyReleaseService'] = gate.service([release], groups);
        global.SERVICE['Default' + prefix + 'PolicyPointerService'] = gate.service([pointer], groups);
        global.SERVICE['Default' + prefix + 'PolicyReceiptService'] = gate.service([receipt], groups);
        assert.equal((await f.service.observe(f.request, f.input())).ready, true);
        // Optional typed predecessor is absent in persistence; the committed journal remains explicit null.
        delete receipt.previousOnlineVersion;
        f.state.server = 'online'; f.state.role = 'COMMERCE';
        assert.equal((await f.service.observe(f.request, f.input('TARGET'))).ready, true);
        receipt.previousOnlineVersion = 'foreign-predecessor';
        assert.equal((await f.service.observe(f.request, f.input('TARGET'))).ready, false);
        delete receipt.previousOnlineVersion;
        pointer.revision++;
        await assert.rejects(f.service.observe(f.request, f.input('TARGET')));
        pointer.revision--;
        assert(gate.reads.length >= 8); assert(gate.reads.every(read => read.query.enterpriseCode === scope.enterpriseCode));
        const original = structuredClone(f.authData); receipt.enterpriseCode = 'foreign';
        await assert.rejects(f.service.observe(f.request, f.input('TARGET')));
        assert.deepEqual(f.authData, original);
    });
}

test('Product actual sealed graph and target pointer descendants use generated private reads, not external group grants', async t => {
    const f = fixture(t), gate = generatedGate(t, f);
    const directory = path.resolve(__dirname, '../../../../nodics.commerce/modules/baseCommerce/modules/product');
    const graph = require(path.join(directory, 'src/service/defaultProductPublicationGraphService'));
    const provider = require(path.join(directory, 'src/service/defaultProductPublicationVersionProviderService'));
    const target = require(path.join(directory, 'src/service/defaultProductPublicationTargetService'));
    const groups = require(path.join(directory, 'config/properties')).schemaPolicies.product.tenantOwned.accessGroups;
    const item = f.plan.stages[1].descriptor.publicationPlan.items[0];
    Object.assign(item, { domain: 'product', rootType: 'product', sourceVersion: '1',
        input: { publicationCode: item.code, storeCode: 'reviewedStore', versionId: 0 } });
    const root = { code: item.rootCode, tenant: f.request.tenant, enterpriseCode: 'partnerEnterprise', versionId: 1,
        status: 'ACTIVE', publicationReferences: { storeCode: 'reviewedStore', capturedFromVersion: 0, records: [] } };
    const scope = { tenant: f.request.tenant, productCode: item.rootCode, storeCode: 'reviewedStore' };
    const version = graph.hash({ scope, references: [{ schema: 'product', code: root.code, versionId: 1, hash: graph.hash(root) }] });
    const receipt = { committed: true, publicationCode: item.code, sourceVersion: '1', targetVersion: version,
        operationKey: 'activation-key', previousOnlineVersion: null };
    const pointer = { code: graph.hash(scope), tenant: f.request.tenant, active: true, version, revision: 1, receipts: [receipt] };
    Object.assign(f.row, { ...item, targetVersion: version,
        auditTrail: [{ toState: 'APPROVED' }, { toState: 'ONLINE', details: { receipt } }] });
    f.plan.stages[1].publications[0].targetVersion = version;
    f.policy.targetObservers.product = 'ActualProduct'; f.writePlan();
    const get = global.CONFIG.get;
    global.CONFIG.get = key => key === 'product' ? { publication: { maximumDependencies: 10, target: { runtimeRole: 'COMMERCE' } },
        localization: { requiredLocales: [] } } : key === 'runtimeRole' ? { ...get(key), publication: f.state.server === 'staged' ? 'STAGED' : 'OPERATIONAL' } :
        key === 'publish' ? { setup: { observation: f.policy }, providers: { versionProviders: { product: 'ActualProduct' },
            domainAdapters: { product: 'Adapter' }, workflowProviders: { product: 'Workflow' } } } : get(key);
    global.NODICS.isModuleActive = code => code === 'product';
    global.NODICS.getModels = () => ({ productModel: { versioned: true, rawSchema: { versionedReadMode: 'CURRENT' } } });
    Object.assign(global.SERVICE, { ActualProduct: provider, DefaultProductPublicationGraphService: graph,
        DefaultProductPublicationTargetService: target,
        DefaultProductLocalizationPolicyService: require(path.join(directory, 'src/service/defaultProductLocalizationPolicyService')),
        DefaultProductService: gate.service([root], groups), DefaultProductPublicationPointerService: gate.service([pointer], groups) });
    assert.equal((await f.service.observe(f.request, f.input())).ready, true);
    delete f.row.enterpriseCode;
    delete f.row.tenantCode;
    assert.equal((await f.service.observe(f.request, f.input())).ready, true);
    assert.equal(f.row.enterpriseCode, undefined);
    assert.equal(f.row.tenantCode, undefined);
    for (const tenantCode of ['foreign', null, '']) {
        f.row.tenantCode = tenantCode;
        await assert.rejects(f.service.observe(f.request, f.input()));
    }
    delete f.row.tenantCode;
    f.row.tenant = 'foreign';
    await assert.rejects(f.service.observe(f.request, f.input())); delete f.row.tenant;
    for (const field of ['enterpriseCode', 'tenant', 'code', 'versionId']) {
        const original = root[field]; root[field] = 'foreign';
        await assert.rejects(f.service.observe(f.request, f.input()), { code: 'ERR_PUB_SETUP_OBSERVATION' });
        root[field] = original;
    }
    for (const enterpriseCode of ['foreign', null, '']) {
        f.row.enterpriseCode = enterpriseCode;
        await assert.rejects(f.service.observe(f.request, f.input()));
    }
    delete f.row.enterpriseCode;
    f.state.server = 'online'; f.state.role = 'COMMERCE';
    assert.equal((await f.service.observe(f.request, f.input('TARGET'))).ready, true);
    pointer.version = 'changed'; assert.equal((await f.service.observe(f.request, f.input('TARGET'))).ready, false);
    assert(gate.reads.length >= 6); assert(gate.reads.every(read => read.query.tenant === f.request.tenant));
    f.state.server = 'staged'; f.state.role = 'COMMERCE_STAGED'; root.enterpriseCode = 'foreign';
    await assert.rejects(f.service.observe(f.request, f.input()));
    assert.deepEqual(f.authData.userGroups, []); assert.equal(f.authData.isSystem, undefined);
});

test('installation binds distinct plan and release hashes and permits canonical receipts without an import run', async t => {
    const f = fixture(t), input = f.input('INSTALLATION');
    delete f.installation.runId;
    const result = await f.service.observe(f.request, input);
    assert.equal(result.ready, true);
    assert.equal(result.checksum, input.checksum);
    assert.equal(result.releaseChecksum, f.release.checksum);
    assert.notEqual(result.checksum, result.releaseChecksum);
    assert.equal(result.installationRunId, undefined);
    assert.equal(f.installation.runId, undefined);
    for (const executionId of [undefined, '', 'invalid execution']) {
        f.installation.executionId = executionId;
        assert.equal((await f.service.observe(f.request, input)).ready, false);
    }
});

test('owner result cannot overwrite sealed plan or deployment response bindings', async t => {
    const f = fixture(t);
    f.service.source = async () => ({ ready: true, checksum: 'foreign', tenant: 'foreign',
        enterpriseCode: 'foreign', stageCode: 'foreign', revision: 999, server: 'foreign' });
    const result = await f.service.observe(f.request, f.input());
    assert.equal(result.checksum, f.input().checksum); assert.equal(result.tenant, f.plan.tenant);
    assert.equal(result.enterpriseCode, 'partnerEnterprise'); assert.equal(result.stageCode, f.input().stageCode);
    assert.equal(result.revision, f.plan.revision); assert.equal(result.server, f.state.server);
});

test('missing non-Product enterprise never delegates to a provider and final journal changes refuse', async t => {
    const f = fixture(t);
    global.SERVICE.PartnerProvider.getPublicationEnterprise = () => { throw new Error('must not delegate'); };
    delete f.row.enterpriseCode;
    await assert.rejects(f.service.observe(f.request, f.input()));
    f.row.enterpriseCode = 'partnerEnterprise'; let count = 0;
    f.state.mutate = kind => { if (kind === 'publication' && ++count === 2) f.row.enterpriseCode = undefined; };
    await assert.rejects(f.service.observe(f.request, f.input()));
});

test('absent predecessor from an unqualified target owner is never inferred as no predecessor', async t => {
    const f = fixture(t);
    f.state.server = 'online'; f.state.role = 'COMMERCE';
    delete f.receipt.previousOnlineVersion;
    assert.equal((await f.service.observe(f.request, f.input('TARGET'))).ready, false);
});
