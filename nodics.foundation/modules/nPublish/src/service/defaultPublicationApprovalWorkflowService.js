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
            !policy.sourceRuntimeRole) {
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
        return {
            ownerModule: policy.ownerModule, domain: publication.domain,
            definitionCode: policy.definitionCode, actionKey: policy.actionKey,
            publicationCode: publication.code, publicationRevision: publication.revision,
            rootType: publication.rootType, rootCode: publication.rootCode,
            sourceVersion: publication.sourceVersion, workflowRef: reference,
            tenantCode: tenant, enterpriseCode: enterprise, correlationId: publication.correlationId,
        };
    },

    /** Starts the configured definition through the existing human-authorized Process API. */
    requestApproval: async function (publication, request) {
        const policy = this.policy(publication.domain);
        this.assertSource(policy);
        if (publication.state !== 'PENDING_APPROVAL') {
            throw new CLASSES.NodicsError('ERR_PUB_00005', 'Publication is not pending approval');
        }
        const context = this.context(publication, request);
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
                name: 'Publication review: ' + publication.code, context },
            responseSelector: response => response && (response.data || response.result) || response,
        });
        const instance = result && result.instance;
        if (!instance || instance.code !== context.workflowRef || instance.definitionCode !== policy.definitionCode ||
            !Number.isSafeInteger(instance.version) || instance.version < 1 ||
            Object.keys(context).some(key => !instance.context || instance.context[key] !== context[key])) {
            throw new CLASSES.NodicsError('ERR_PUB_00004', 'Process approval instance identity does not match');
        }
        return result;
    },
};
