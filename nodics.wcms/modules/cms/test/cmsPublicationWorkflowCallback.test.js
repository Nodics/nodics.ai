/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** Checks decision replay against committed journal identity without replaying approval or activation. */
const assert = require('node:assert/strict');
class NodicsError extends Error { constructor(code, message) { super(message); this.code = code; } }
global.CLASSES = { NodicsError };
let role = 'STAGED', approved = 0, activated = 0, rejected = 0, stored;
global.CONFIG = { get: key => key === 'cms' ? { publication: { runtimeRole: role } } : undefined };
const reference = publication => 'cmsPublicationApproval-' + require('node:crypto').createHash('sha256')
    .update(publication.code + ':' + publication.revision).digest('hex').slice(0, 24);
const decision = approved => ({ tenant: 'default', authData: { tokenType: 'service' }, publicationDecision: {
    publicationCode: 'home-v2', expectedRevision: 4, approved, reason: approved ? 'Ready' : 'Needs correction',
    processInstanceCode: reference({ code: 'home-v2', revision: 4 }), processDefinitionCode: 'cmsPublicationApproval',
    processVersion: 1, correlationId: 'correlation-1'
} });
function reset() { stored = { code: 'home-v2', domain: 'cms', revision: 4, state: 'PENDING_APPROVAL',
    workflowRef: decision(true).publicationDecision.processInstanceCode, correlationId: 'correlation-1', auditTrail: [] }; }
function transition(state, request, details) {
    assert.equal(request.expectedRevision, stored.revision);
    stored.auditTrail.push({ publicationCode: stored.code, fromState: stored.state, toState: state,
        revision: stored.revision + 1, correlationId: request.correlationId, reason: request.reason, details });
    stored = { ...stored, state, revision: stored.revision + 1 };
    return stored;
}
global.SERVICE = {
    DefaultPublicationLifecycleService: {
        get: async () => structuredClone(stored),
        approve: async request => { approved++; assert.equal(request.authData.isSystem, true);
            return transition('APPROVED', request, { workflow: request.workflowEvidence }); },
        reject: async request => { rejected++; return transition('REJECTED', request, { workflow: request.workflowEvidence }); },
        activate: async request => { activated++;
            if (stored.state === 'APPROVED') transition('ACTIVATING', request);
            transition('ONLINE', { ...request, expectedRevision: stored.revision }, { version: 'v2' });
            stored.targetVersion = 'v2'; return stored; }
    },
    DefaultServiceTokenService: { requireRuntimePrincipal: (request, owner) => {
        assert.equal(owner, 'workflow'); assert.equal(request.authData.tokenType, 'service'); } },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultCmsPublicationWorkflowService: { reference }
};
const service = require('../src/service/publication/defaultCmsPublicationWorkflowCallbackService');
(async () => {
    reset();
    const online = await service.applyDecision(decision(true));
    assert.deepEqual(online, { publicationCode: 'home-v2', state: 'ONLINE', revision: 7, targetVersion: 'v2' });
    const committed = structuredClone(stored);
    assert.deepEqual(await service.applyDecision(decision(true)), online);
    assert.deepEqual(stored, committed); assert.equal(approved, 1); assert.equal(activated, 1);
    for (const change of [d => { d.approved = false; }, d => { d.reason = 'Changed'; },
        d => { d.processVersion = 2; }, d => { d.correlationId = 'other'; },
        d => { d.processInstanceCode = 'cmsPublicationApproval-000000000000000000000000'; },
        d => { d.processDefinitionCode = 'other'; }]) {
        const altered = decision(true); change(altered.publicationDecision);
        await assert.rejects(service.applyDecision(altered), { code: 'ERR_CMS_00118' });
        assert.deepEqual(stored, committed);
    }
    for (const change of [s => { s.domain = 'other'; }, s => { s.auditTrail[1].revision++; },
        s => { s.auditTrail[0].details.workflow.version++; }, s => { s.targetVersion = 'different'; },
        s => { s.revision++; }, s => { s.state = 'FAILED'; }, s => { s.workflowRef = 'different'; }]) {
        stored = structuredClone(committed); change(stored);
        await assert.rejects(service.applyDecision(decision(true)), { code: 'ERR_CMS_00118' });
    }
    for (const state of ['APPROVED', 'ACTIVATING']) {
        stored = structuredClone(committed); const count = state === 'APPROVED' ? 1 : 2;
        stored.state = state; stored.revision = 4 + count; stored.auditTrail = stored.auditTrail.slice(0, count);
        delete stored.targetVersion;
        assert.deepEqual(await service.applyDecision(decision(true)), online);
        assert.equal(approved, 1, 'Resume must retain the original approval');
    }
    reset(); const denied = await service.applyDecision(decision(false));
    assert.equal(denied.state, 'REJECTED');
    assert.deepEqual(await service.applyDecision(decision(false)), denied); assert.equal(rejected, 1);
    role = 'ONLINE'; await assert.rejects(service.applyDecision(decision(true)), /only by CMS Staged/);
    // Use the real error class: unregistered symbolic names otherwise become generic HTTP 500 errors.
    role = 'STAGED'; stored = structuredClone(committed);
    const statuses = require('../src/utils/statusDefinitions');
    SERVICE.DefaultStatusService = { get: code => statuses[code] || { code: '500', message: 'Internal error' } };
    CONFIG.get = key => key === 'cms' ? { publication: { runtimeRole: role } } :
        key === 'defaultErrorCodes' ? { NodicsError: 'ERR_SYS_00000' } : undefined;
    global.UTILS = { extractFromMessage: message => ({ code: 'ERR_SYS_00000', responseCode: '500', message }) };
    CLASSES.NodicsError = require('../../../../nodics.foundation/modules/nCommon/src/lib/nodicsError');
    const conflict = decision(true); conflict.publicationDecision.reason = 'Conflicting decision';
    await assert.rejects(service.applyDecision(conflict), { code: 'ERR_CMS_00118', responseCode: '409' });
    assert.deepEqual(stored, committed);
    console.log('CMS exact callback replay, intermediate recovery and mismatched evidence checks passed');
})().catch(error => { console.error(error); process.exit(1); });
