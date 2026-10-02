/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module nPublish/service/DefaultPublicationApprovalWorkflowService @description Binds a publication approval to a configured Process definition using existing module transport. @layer service @owner nPublish @override Select domain policy and Process connection; preserve immutable scope, deterministic identity and fail-closed authority. */
module.exports = {
    /** Resolves the explicit domain policy without falling back to another approval owner. */
    policy: function (domain) {
        const settings = (CONFIG.get('publish') || {}).approvalWorkflow || {};
        const policy = (settings.domains || {})[domain];
        if (!policy || !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(policy.definitionCode || '') ||
            !/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(policy.ownerModule || '') ||
            policy.actionKey !== policy.ownerModule + '.applyPublicationDecision' ||
            !policy.sourceRuntimeRole ||
            (policy.requesterBinding !== undefined && policy.requesterBinding !== 'NATIVE_ACTOR') ||
            (policy.requesterBinding === 'NATIVE_ACTOR' &&
                (!/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(policy.reviewNodeCode || '') ||
                    !/^[A-Za-z][A-Za-z0-9_.-]{0,127}$/.test(policy.reviewPermission || '')))) {
            throw new CLASSES.NodicsError('ERR_PUB_00001', 'Publication approval domain policy is unavailable');
        }
        return policy;
    },

    /** Rejects execution outside the explicitly selected Staged authority. */
    assertSource: function (policy) {
        const role = CONFIG.get('runtimeRole') || {};
        if (role.publication !== 'STAGED' || role.code !== policy.sourceRuntimeRole) {
            throw new CLASSES.NodicsError('ERR_PUB_00002', 'Publication approval requires its configured Staged runtime');
        }
    },

    /** Resolves only an explicit remote Process connection. */
    target: function () {
        const target = ((CONFIG.get('publish') || {}).approvalWorkflow || {}).target || {};
        if (!target.connectionName || target.connectionName === 'default' ||
            !target.connectionType || target.runtimeRole !== 'PROCESS') {
            throw new CLASSES.NodicsError('ERR_PUB_00001', 'Publication Process authority is unavailable');
        }
        return target;
    },

    /** Rejects missing or oversized identity values before transport or persistence. */
    requireText: function (value, label) {
        if (typeof value !== 'string' || !value.trim() || value !== value.trim() || value.length > 128) {
            throw new CLASSES.NodicsError('ERR_PUB_00000', 'Publication approval ' + label + ' is invalid');
        }
        return value;
    },

    /** Captures only the stored candidate's authenticated native requester before the pending CAS. */
    approvalEvidence: async function (publication, request) {
        if (this.policy(publication.domain).requesterBinding !== 'NATIVE_ACTOR') return {};
        const auth = request.authData || {};
        const requester = this.requireText(auth.loginId, 'requester');
        const actor = this.requireText(SERVICE.DefaultPublicationLifecycleService.getActor(request), 'actor');
        if (auth.tokenType !== 'access' || auth.principalType !== 'human' || auth.isSystem ||
            auth.tenant !== request.tenant || publication.requestedBy !== actor ||
            typeof auth.entCode !== 'string' || !auth.entCode ||
            (publication.tenantCode && publication.tenantCode !== request.tenant) ||
            (publication.enterpriseCode && publication.enterpriseCode !== auth.entCode) ||
            (publication.entCode && publication.entCode !== auth.entCode)) {
            throw new CLASSES.NodicsError('ERR_PUB_00002', 'Publication requires its authenticated native requester');
        }
        const policy = this.policy(publication.domain);
        const target = this.target();
        this.assertSource(policy);
        const headers = request.httpRequest && request.httpRequest.headers || {};
        const authorization = headers.authorization || headers.Authorization;
        if (typeof authorization !== 'string' || !/^Bearer \S+$/.test(authorization)) {
            throw new CLASSES.NodicsError('ERR_PUB_00001', 'Publication requires its authenticated Process reader');
        }
        const read = suffix => SERVICE.DefaultModuleService.invokeModule({
            moduleName: 'workflow', connectionName: target.connectionName,
            connectionType: target.connectionType, targetAuthority: { runtimeRole: 'PROCESS' },
            local: false, tenant: request.tenant,
            header: { Authorization: authorization, tenant: request.tenant, 'x-enterprise-code': auth.entCode },
            methodName: 'GET', apiName: '/definitions/' + encodeURIComponent(policy.definitionCode) + suffix,
            timeoutMs: target.timeoutMs, maxAttempts: 1,
            responseSelector: response => response && (response.data || response.result) || response
        });
        const definition = await read('');
        const versions = await read('/versions');
        const selected = Array.isArray(versions) && versions.length <= 100 ? versions.filter(version =>
            version.definitionCode === policy.definitionCode && version.version === (definition && definition.currentVersion)) : [];
        const candidate = selected.length === 1 && selected[0];
        const nodes = candidate && candidate.graph && candidate.graph.nodes;
        const review = Array.isArray(nodes) && nodes.length <= 100 ? nodes.filter(node => node.code === policy.reviewNodeCode) : [];
        const actorPolicy = candidate && candidate.policy && candidate.policy.actorPolicy;
        const decision = review.length === 1 && review[0].policy && review[0].policy.decisionContract;
        const expectedActor = { permission: policy.reviewPermission, enterpriseContextField: 'enterpriseCode', requesterContextField: 'requestedBy' };
        const keys = ['contractVersion', 'kind', 'approveLabel', 'rejectLabel', 'reasonLabel', 'rejectionReasonRequired', 'maximumReasonLength'];
        if (!definition || definition.code !== policy.definitionCode || definition.ownerModule !== policy.ownerModule ||
            definition.active !== true || definition.status !== 'PUBLISHED' ||
            !Number.isSafeInteger(definition.currentVersion) || definition.currentVersion < 1 ||
            !candidate || candidate.active !== true || candidate.status !== 'PUBLISHED' ||
            !policy.reviewPermission || !policy.reviewNodeCode ||
            !require('node:util').isDeepStrictEqual(actorPolicy, expectedActor) ||
            !decision || Object.keys(decision).length !== keys.length || Object.keys(decision).some(key => !keys.includes(key)) ||
            decision.contractVersion !== 1 || decision.kind !== 'APPROVAL' ||
            decision.rejectionReasonRequired !== true || decision.maximumReasonLength !== 1000 ||
            ['approveLabel', 'rejectLabel', 'reasonLabel'].some(key => typeof decision[key] !== 'string' || !decision[key].trim() || decision[key].length > 200) ||
            (review[0].policy.actorPolicy !== undefined && !require('node:util').isDeepStrictEqual(review[0].policy.actorPolicy, actorPolicy))) {
            throw new CLASSES.NodicsError('ERR_PUB_00004', 'Publication requires its published requester-bound decision candidate');
        }
        const fresh = await read('');
        if (!fresh || fresh.code !== definition.code || fresh.ownerModule !== definition.ownerModule ||
            fresh.status !== 'PUBLISHED' || fresh.active !== true || fresh.currentVersion !== definition.currentVersion) {
            throw new CLASSES.NodicsError('ERR_PUB_00004', 'Publication Process candidate changed during inspection');
        }
        return { requesterBinding: 'NATIVE_ACTOR', requestedBy: requester, requestedActor: actor,
            workflowVersion: candidate.version };
    },

    /** Reads the exact pending-revision journal marker; legacy instances keep their original context. */
    requesterEvidence: function (publication) {
        const journal = publication.auditTrail || [];
        if (!Array.isArray(journal) || journal.length > 10000) {
            throw new CLASSES.NodicsError('ERR_PUB_00004', 'Publication requester journal exceeds its boundary');
        }
        const entries = journal.filter(entry => entry &&
            entry.toState === 'PENDING_APPROVAL' && entry.revision === publication.revision);
        if (entries.length > 1) throw new CLASSES.NodicsError('ERR_PUB_00004', 'Publication requester journal is ambiguous');
        const proof = entries[0] && entries[0].details && entries[0].details.workflow;
        if (!proof || proof.requesterBinding === undefined) return undefined;
        if (proof.requesterBinding !== 'NATIVE_ACTOR' ||
            proof.instanceCode !== publication.workflowRef || proof.requestedActor !== publication.requestedBy) {
            throw new CLASSES.NodicsError('ERR_PUB_00004', 'Publication requester journal does not match');
        }
        if (!Number.isSafeInteger(proof.workflowVersion) || proof.workflowVersion < 1) {
            throw new CLASSES.NodicsError('ERR_PUB_00004', 'Publication Process version journal is invalid');
        }
        return { requestedBy: this.requireText(proof.requestedBy, 'requester'), workflowVersion: proof.workflowVersion };
    },

    /** Derives a stable reference for the pending revision, including its immutable source and domain. */
    reference: function (publication) {
        const policy = this.policy(publication.domain);
        const values = ['code', 'domain', 'rootType', 'rootCode', 'sourceVersion', 'correlationId']
            .map(key => this.requireText(publication[key], key));
        if (!Number.isSafeInteger(publication.revision) || publication.revision < 1) {
            throw new CLASSES.NodicsError('ERR_PUB_00004', 'Publication approval revision is invalid');
        }
        return 'publicationApproval-' + require('node:crypto').createHash('sha256')
            .update(JSON.stringify([policy.definitionCode, policy.actionKey, ...values, publication.revision]))
            .digest('hex');
    },

    /** Builds bounded context from the stored publication and authenticated scope, never a callback decision. */
    context: function (publication, request) {
        const policy = this.policy(publication.domain);
        const auth = request.authData || {};
        const tenant = this.requireText(request.tenant, 'tenant');
        const enterprise = this.requireText(auth.entCode || auth.enterpriseCode, 'enterprise');
        if ((auth.tenant && auth.tenant !== tenant) ||
            (auth.entCode && auth.enterpriseCode && auth.entCode !== auth.enterpriseCode) ||
            (publication.tenantCode && publication.tenantCode !== tenant) ||
            (publication.enterpriseCode && publication.enterpriseCode !== enterprise) ||
            (publication.entCode && publication.entCode !== enterprise)) {
            throw new CLASSES.NodicsError('ERR_PUB_00000', 'Publication approval scope does not match');
        }
        const reference = this.reference(publication);
        if (publication.workflowRef !== reference) {
            throw new CLASSES.NodicsError('ERR_PUB_00004', 'Publication approval workflow reference does not match');
        }
        const context = {
            ownerModule: policy.ownerModule, domain: publication.domain,
            definitionCode: policy.definitionCode, actionKey: policy.actionKey,
            publicationCode: publication.code, publicationRevision: publication.revision,
            rootType: publication.rootType, rootCode: publication.rootCode,
            sourceVersion: publication.sourceVersion, workflowRef: reference,
            tenantCode: tenant, enterpriseCode: enterprise, correlationId: publication.correlationId,
        };
        const requester = this.requesterEvidence(publication);
        if (requester !== undefined) Object.assign(context, requester);
        return context;
    },

    /** Starts the configured definition through the existing human-authorized Process API. */
    requestApproval: async function (publication, request) {
        const policy = this.policy(publication.domain);
        this.assertSource(policy);
        if (publication.state !== 'PENDING_APPROVAL') {
            throw new CLASSES.NodicsError('ERR_PUB_00005', 'Publication is not pending approval');
        }
        const context = this.context(publication, request);
        if (policy.requesterBinding === 'NATIVE_ACTOR') {
            const auth = request.authData || {};
            if (auth.tokenType !== 'access' || auth.principalType !== 'human' || auth.isSystem ||
                auth.tenant !== request.tenant || context.requestedBy !== auth.loginId ||
                publication.requestedBy !== SERVICE.DefaultPublicationLifecycleService.getActor(request) ||
                !Number.isSafeInteger(context.workflowVersion)) {
                throw new CLASSES.NodicsError('ERR_PUB_00004', 'Publication requires a newly governed requester-bound approval cycle');
            }
        }
        const target = this.target();
        const headers = request.httpRequest && request.httpRequest.headers || {};
        const authorization = headers.authorization || headers.Authorization;
        if (typeof authorization !== 'string' || !/^Bearer \S+$/.test(authorization)) {
            throw new CLASSES.NodicsError('ERR_PUB_00001', 'Publication approval requires the authenticated Process starter');
        }
        const result = await SERVICE.DefaultModuleService.invokeModule({
            moduleName: 'workflow', connectionName: target.connectionName,
            connectionType: target.connectionType, targetAuthority: { runtimeRole: target.runtimeRole },
            local: false, tenant: request.tenant,
            header: { Authorization: authorization, tenant: request.tenant, 'x-enterprise-code': context.enterpriseCode },
            methodName: 'POST', apiName: '/instances', timeoutMs: target.timeoutMs,
            maxAttempts: 1, idempotencyKey: context.workflowRef,
            requestBody: { definitionCode: policy.definitionCode, instanceCode: context.workflowRef,
                ...(context.workflowVersion === undefined ? {} : { version: context.workflowVersion }),
                name: 'Publication review: ' + publication.code, context },
            responseSelector: response => response && (response.data || response.result) || response,
        });
        const instance = result && result.instance;
        if (!instance || instance.code !== context.workflowRef || instance.definitionCode !== policy.definitionCode ||
            !Number.isSafeInteger(instance.version) || instance.version < 1 ||
            (context.workflowVersion !== undefined && instance.version !== context.workflowVersion) ||
            Object.keys(context).some(key => !instance.context || instance.context[key] !== context[key])) {
            throw new CLASSES.NodicsError('ERR_PUB_00004', 'Process approval instance identity does not match');
        }
        return result;
    },
};
