/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Validates exact Process workflow binding, approved activation, rejection, Staged authority, and invalid evidence denial. */
const assert = require('assert');
class NodicsError extends Error { constructor(code, message) { super(message); this.code = code; } }
global.CLASSES = { NodicsError: NodicsError };
let role = 'STAGED';
global.CONFIG = { get: key => key === 'cms' ? { publication: { runtimeRole: role } } : undefined };
let approved = 0;
let activated = 0;
let rejected = 0;
let runtimePrincipalChecks = 0;
let lifecycleAuth;
global.SERVICE = { DefaultPublicationLifecycleService: {
    approve: async request => { approved++; lifecycleAuth = request.authData; assert.strictEqual(request.expectedRevision, 4);
        return { code: request.publicationCode, state: 'APPROVED', revision: 5 }; },
    activate: async request => { activated++; assert.strictEqual(request.expectedRevision, 5);
        return { code: request.publicationCode, state: 'ONLINE', revision: 7, targetVersion: 'v2' }; },
    reject: async request => { rejected++; lifecycleAuth = request.authData;
        return { code: request.publicationCode, state: 'REJECTED', revision: 5 }; }
}, DefaultServiceTokenService: { requireRuntimePrincipal: (request, owner) => {
    runtimePrincipalChecks++; assert.strictEqual(owner, 'workflow'); assert.strictEqual(request.authData.tokenType, 'service');
    return request.authData;
} }, DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true, userGroups: ['systemGroup'] }) },
DefaultCmsPublicationWorkflowService: { reference: publication => 'cmsPublicationApproval-' +
    require('crypto').createHash('sha256').update(publication.code + ':' + String(publication.revision)).digest('hex').slice(0, 24) } };
const service = require('../src/service/publication/defaultCmsPublicationWorkflowCallbackService');
const decision = approvedDecision => ({ publicationDecision: { publicationCode: 'home-v2', expectedRevision: 4,
    approved: approvedDecision, reason: approvedDecision ? 'Ready' : 'Needs correction',
    processInstanceCode: SERVICE.DefaultCmsPublicationWorkflowService.reference({ code: 'home-v2', revision: 4 }),
    processDefinitionCode: 'cmsPublicationApproval', processVersion: 1,
    correlationId: 'correlation-1' }, tenant: 'default', authData: { tokenType: 'service', principalId: 'process-runtime' } });

(async () => {
    let online = await service.applyDecision(decision(true));
    assert.deepStrictEqual(online, { publicationCode: 'home-v2', state: 'ONLINE', revision: 7, targetVersion: 'v2' });
    assert.strictEqual(approved, 1);
    assert.strictEqual(activated, 1);
    assert.strictEqual(lifecycleAuth.isSystem, true);
    assert.deepStrictEqual(lifecycleAuth.userGroups, ['systemGroup']);
    let denied = await service.applyDecision(decision(false));
    assert.strictEqual(denied.state, 'REJECTED');
    assert.strictEqual(rejected, 1);
    let forged = decision(true);
    forged.publicationDecision.processInstanceCode = 'cmsPublicationApproval-000000000000000000000000';
    await assert.rejects(service.applyDecision(forged), /decision is invalid/);
    await assert.rejects(service.applyDecision({ publicationDecision: Object.assign({}, decision(true).publicationDecision,
        { processDefinitionCode: 'otherWorkflow' }), authData: { tokenType: 'service' } }), /decision is invalid/);
    role = 'ONLINE';
    await assert.rejects(service.applyDecision(decision(true)), /accepted only by CMS Staged/);
    assert.strictEqual(runtimePrincipalChecks, 4);
    console.log('CMS publication Process callback validated');
})().catch(error => { console.error(error); process.exit(1); });
