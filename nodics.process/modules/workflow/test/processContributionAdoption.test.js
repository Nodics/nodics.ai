/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module workflow/test/processContributionAdoption @description Exercises provenance adoption and forward migration with real definition lifecycle and isolated generated services. @layer test @owner workflow */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const contributions = require('../src/service/definition/defaultProcessDefinitionContributionService');
const lifecycle = require('../src/service/definition/defaultProcessDefinitionLifecycleService');
const runtime = require('../src/service/operation/defaultProcessRuntimeLifecycleService');
const graphValidation = require('../src/service/designer/defaultProcessGraphValidationService');
const defaults = require('../config/properties').process.definitionContributions;
const clone = value => JSON.parse(JSON.stringify(value));

function fixture() {
    const records = [], versions = [], policy = clone(defaults);
    let writes = 0;
    const request = { tenant: 'tenantA', authData: { loginId: 'migrationOperator' } };
    const store = rows => ({
        get: async input => ({ result: input.tenant === request.tenant ? clone(rows.filter(row =>
            Object.entries(input.query || {}).every(([key, value]) => row[key] === value))) : [] }),
        save: async input => {
            assert.equal(input.tenant, request.tenant);
            assert.deepEqual(input.authData, request.authData);
            writes++;
            rows.push(clone(input.model));
            return { result: input.model };
        },
        update: async input => {
            assert.equal(input.tenant, request.tenant);
            assert.deepEqual(input.authData, request.authData);
            const row = rows.find(row => Object.entries(input.query).every(([key, value]) => row[key] === value));
            assert.ok(row, 'lifecycle precondition');
            writes++;
            Object.assign(row, clone(input.model.$set));
            return { result: { modifiedCount: 1 } };
        }
    });
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message); this.code = code; } } };
    global.CONFIG = { get: name => name === 'process' ? { definitionContributions: policy } : undefined };
    global.SERVICE = {
        DefaultProcessDefinitionLifecycleService: lifecycle,
        DefaultProcessGraphValidationService: graphValidation,
        DefaultProcessDefinitionService: store(records),
        DefaultProcessDefinitionVersionService: store(versions)
    };
    const definition = { code: 'domainReview', ownerModule: 'domain', name: 'Review', graph: {
        nodes: [{ code: 'start', type: 'START' }, { code: 'review', type: 'TASK', assignee: 'reviewers' }, { code: 'end', type: 'END' }],
        transitions: [{ code: 'start_review', source: 'start', target: 'review' }, { code: 'review_end', source: 'review', target: 'end' }]
    } };
    const old = { moduleName: 'deployment', releaseCode: 'deployment:review', version: '1.0.0', checksum: 'a'.repeat(64),
        owningDomain: 'domain', installer: 'PROCESS_DEFINITION', destinationRole: 'PROCESS' };
    const next = { ...old, moduleName: 'domain', releaseCode: 'domain:review', checksum: 'b'.repeat(64) };
    const service = Object.assign({}, contributions, { loadPayload: () => ({ definitions: [clone(definition)] }) });
    const install = contribution => service.installContribution({ ...request, contribution });
    const authorize = (mode = 'RETAIN') => policy.ownershipTransitions.push({ definitionCode: definition.code,
        source: service.provenance(records[0]), target: service.provenance(service.model(definition, next)),
        publishedChecksum: versions[0].checksum, mode });
    return { records, versions, policy, request, definition, old, next, service, install, authorize, writes: () => writes };
}

test('fresh owner installation and same-source replay are idempotent', async () => {
    const f = fixture();
    assert.equal((await f.service.planContribution({ ...f.request, contribution: f.next })).definitions[0].action, 'CREATE');
    assert.equal(f.writes(), 0);
    await f.install(f.next);
    const count = f.writes();
    assert.equal((await f.install(f.next)).data.definitions[0].status, 'CURRENT');
    assert.equal(f.writes(), count);
    assert.deepEqual(f.service.provenance(f.versions[0]), f.service.provenance(f.records[0]));
});

test('equivalent adoption retains every installed identity and immutable checksum with no writes', async () => {
    const f = fixture();
    await f.install(f.old);
    f.authorize();
    const before = clone([f.records, f.versions]), count = f.writes();
    const plan = await f.service.planContribution({ ...f.request, contribution: f.next });
    assert.equal(plan.definitions[0].action, 'RETAIN');
    for (let index = 0; index < 2; index++) assert.equal((await f.install(f.next)).data.definitions[0].retained, true);
    await f.install(f.old);
    assert.deepEqual([f.records, f.versions], before);
    assert.equal(f.writes(), count);
});

test('unselected owner change, owner spoof, same-version drift and request-supplied authority fail closed', async () => {
    const f = fixture();
    await f.install(f.old);
    const count = f.writes();
    await assert.rejects(f.install(f.next), /another contribution/);
    await assert.rejects(f.install({ ...f.old, moduleName: 'intruder' }), /another contribution/);
    await assert.rejects(f.install({ ...f.old, checksum: 'c'.repeat(64) }), /version change/);
    await assert.rejects(f.service.installContribution({ ...f.request, contribution: f.next,
        ownershipTransitions: [{ source: f.old, target: f.next, mode: 'FORWARD' }] }), /another contribution/);
    f.records[0].ownerModule = 'intruder';
    await assert.rejects(f.install(f.old), /domain owner conflict/);
    assert.equal(f.writes(), count);
});

test('adoption requires exact source, target, immutable checksum, policy and lifecycle evidence', async () => {
    for (const change of [
        f => { f.policy.ownershipTransitions[0].source.checksum = 'c'.repeat(64); },
        f => { f.policy.ownershipTransitions[0].target.version = '9.0.0'; },
        f => { f.policy.ownershipTransitions[0].publishedChecksum = 'c'.repeat(64); },
        f => { f.versions[0].contributionOwner = 'intruder'; },
        f => { f.records[0].policy = { requiredApprovals: 5 }; },
        f => { f.records[0].status = 'ARCHIVED'; },
        f => { f.records[0].status = 'DRAFT'; }
    ]) {
        const f = fixture();
        await f.install(f.old);
        f.authorize();
        change(f);
        const count = f.writes();
        await assert.rejects(f.install(f.next));
        assert.equal(f.writes(), count);
    }
});

test('forward migration preserves old versions and pending instance version resolution', async () => {
    const f = fixture();
    await f.install(f.old);
    f.authorize();
    const oldVersion = clone(f.versions[0]);
    const pending = { definitionCode: f.definition.code, version: 1, status: 'WAITING', currentNode: 'review' };
    f.definition.graph.nodes[1].assignee = 'newReviewers';
    await assert.rejects(f.install(f.next), /explicit forward migration/);
    f.policy.ownershipTransitions[0].mode = 'FORWARD';
    await assert.rejects(f.install(f.next), /target execution/);
    f.policy.ownershipTransitions[0].targetExecutionChecksum = f.service.executionChecksum(f.definition);
    assert.equal((await f.service.planContribution({ ...f.request, contribution: f.next })).definitions[0].action, 'FORWARD');
    await f.install(f.next);
    assert.deepEqual(f.versions[0], oldVersion);
    assert.equal(f.versions.length, 2);
    assert.equal(f.records[0].currentVersion, 2);
    assert.equal(f.versions[1].contributionCode, f.next.releaseCode);
    assert.deepEqual(await runtime.requireVersion(f.request, pending.definitionCode, pending.version), oldVersion);
    assert.equal(pending.status, 'WAITING');
    const count = f.writes();
    await f.install(f.next);
    assert.equal(f.writes(), count);
    await assert.rejects(f.install(f.old), /another contribution/);
    await assert.rejects(runtime.requireVersion({ ...f.request, tenant: 'tenantB' }, pending.definitionCode, 1));
});

test('forward migration resumes after draft preparation failure without rewriting history', async () => {
    const f = fixture();
    await f.install(f.old);
    f.authorize('FORWARD');
    f.definition.graph.nodes[1].assignee = 'newReviewers';
    f.policy.ownershipTransitions[0].targetExecutionChecksum = f.service.executionChecksum(f.definition);
    SERVICE.DefaultProcessDefinitionLifecycleService = { ...lifecycle, updateDraft: async () => { throw Error('interrupted'); } };
    await assert.rejects(f.install(f.next), /interrupted/);
    assert.equal(f.records[0].status, 'DRAFT');
    SERVICE.DefaultProcessDefinitionLifecycleService = lifecycle;
    await f.install(f.next);
    assert.equal(f.versions.length, 2);
    assert.equal(f.versions[0].contributionCode, f.old.releaseCode);
});

test('complete release preflight rejects a later conflict before creating the first definition', async () => {
    const f = fixture();
    await f.install(f.old);
    const count = f.writes();
    f.service.loadPayload = () => ({ definitions: [{ ...clone(f.definition), code: 'newDefinition' }, clone(f.definition)] });
    await assert.rejects(f.install(f.next), /another contribution/);
    assert.equal(f.writes(), count);
    assert.equal(f.records.length, 1);
});

test('customer policy drift needs a new contribution version and customization cannot rename definitions', async () => {
    const f = fixture();
    await f.install(f.next);
    f.service.customizeDefinition = definition => ({ ...definition, policy: { requiredApprovals: 2 } });
    await assert.rejects(f.install(f.next), /execution changed/);
    f.service.customizeDefinition = definition => ({ ...definition, code: 'renamed' });
    await assert.rejects(f.install(f.next), /cannot change definition identity/);
});

test('neutral configuration grants no assignments or ownership transition authority', () => {
    assert.deepEqual(defaults.reviewerAssignments, {});
    assert.deepEqual(defaults.ownershipTransitions, []);
});

test('qualified inspection supplies evidence without approval; planning requires configured authority', async () => {
    const f = fixture();
    await f.install(f.old);
    const count = f.writes();
    const request = { ...f.request, releaseRequest: { dataType: 'init', releaseCodes: [f.next.releaseCode] },
        contribution: { ...f.next, checksum: 'c'.repeat(64) } };
    SERVICE.DefaultDataReleaseService = { preparePlan: async input => {
        assert.equal(input, request);
        return { releases: [f.next] };
    } };
    const evidence = (await f.service.inspectRelease(request)).definitions[0];
    assert.deepEqual(evidence.installed, f.service.provenance(f.records[0]));
    assert.equal(evidence.publishedChecksum, f.versions[0].checksum);
    assert.equal(evidence.currentVersion, 1);
    assert.equal(evidence.equivalent, true);
    assert.equal(evidence.target.checksum, f.next.checksum);
    assert.equal(evidence.targetExecutionChecksum, f.service.executionChecksum(f.definition));
    await assert.rejects(f.service.planRelease(request), /another contribution/);
    assert.deepEqual(f.policy.ownershipTransitions, []);
    f.policy.ownershipTransitions.push({ definitionCode: evidence.code, source: evidence.installed,
        target: evidence.target, publishedChecksum: evidence.publishedChecksum, mode: 'RETAIN' });
    assert.equal((await f.service.planRelease(request)).definitions[0].action, 'RETAIN');
    assert.equal(f.writes(), count);
    f.records[0].policy = { approvals: 99 };
    await assert.rejects(f.service.inspectRelease(request), /published version/);
    assert.equal(f.writes(), count);
});

test('release inspection rejects implicit selection, qualification failure and wrong installer before loading payload', async () => {
    const f = fixture();
    f.service.loadPayload = () => { throw Error('payload must not load'); };
    for (const releaseRequest of [undefined, {}, { dataType: 'init', releaseCodes: [] },
        { dataType: 'init', releaseCodes: ['one', 'two'] },
        { dataType: 'init', releaseCodes: ['one'], modules: ['domain'] }]) {
        await assert.rejects(f.service.inspectRelease({ ...f.request, releaseRequest }), /exactly one/);
    }
    const request = { ...f.request, releaseRequest: { dataType: 'init', releaseCodes: [f.next.releaseCode] } };
    SERVICE.DefaultDataReleaseService = { preparePlan: async () => { throw Error('destination denied'); } };
    await assert.rejects(f.service.inspectRelease(request), /destination denied/);
    SERVICE.DefaultDataReleaseService.preparePlan = async () => ({ releases: [{ ...f.next, installer: 'OTHER' }] });
    await assert.rejects(f.service.planRelease(request), /not a Process/);
    assert.equal(f.writes(), 0);
});

test('configured reviewer policy changes only the named TASK assignee and preserves source data', async () => {
    const f = fixture();
    f.policy.reviewerAssignments = {
        domainReview: { ownerModule: 'domain', contributionOwner: 'domain', nodeAssignees: { review: 'customerReviewers' } }
    };
    const before = clone(f.definition);
    await f.install(f.next);
    const expected = clone(before);
    expected.graph.nodes[1].assignee = 'customerReviewers';
    assert.deepEqual(f.records[0].graph, expected.graph);
    assert.deepEqual(f.definition, before);
    assert.deepEqual(f.service.customizeDefinition(clone(before), f.old), before);
    const foreignDomain = { ...clone(before), ownerModule: 'otherDomain' };
    assert.deepEqual(f.service.customizeDefinition(clone(foreignDomain), f.next), foreignDomain);
    const count = f.writes();
    await f.install(f.next);
    assert.equal(f.writes(), count);
    f.policy.reviewerAssignments.domainReview.nodeAssignees.review = 'changedReviewers';
    await assert.rejects(f.install(f.next), /execution changed/);
    assert.equal(f.writes(), count);
});

test('configured reviewer policy rejects graph, identity, non-task and malformed assignments before writes', async () => {
    for (const change of [
        policy => { policy.graph = { nodes: [] }; },
        policy => { policy.code = 'renamed'; },
        policy => { policy.ownerModule = undefined; },
        policy => { policy.contributionOwner = undefined; },
        policy => { policy.nodeAssignees = { start: 'reviewers' }; },
        policy => { policy.nodeAssignees = { missing: 'reviewers' }; },
        policy => { policy.nodeAssignees = { review: { assignee: 'reviewers' } }; },
        policy => { policy.nodeAssignees = { review: ' ' }; },
        policy => { policy.nodeAssignees = { review: 'x'.repeat(129) }; },
        policy => { policy.nodeAssignees = []; }
    ]) {
        const f = fixture();
        const policy = { ownerModule: 'domain', contributionOwner: 'domain', nodeAssignees: { review: 'customerReviewers' } };
        change(policy);
        f.policy.reviewerAssignments = { domainReview: policy };
        await assert.rejects(f.install(f.next), /Reviewer/);
        assert.equal(f.writes(), 0);
        assert.equal(f.definition.graph.nodes[1].assignee, 'reviewers');
    }
    const f = fixture();
    f.policy.reviewerAssignments = [];
    await assert.rejects(f.install(f.next), /definition map/);
    assert.equal(f.writes(), 0);
});
