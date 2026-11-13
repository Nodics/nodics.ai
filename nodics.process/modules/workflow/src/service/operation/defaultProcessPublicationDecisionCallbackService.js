/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module workflow/service/operation/DefaultProcessPublicationDecisionCallbackService
 * @description Returns a bounded workflow decision to the configured domain publication authority using internal service authentication.
 * @layer service
 * @owner workflow
 * @override Projects may replace transport or connection coordinates while preserving allowlisted context, service identity, idempotency, and domain ownership.
 */
module.exports = {
    /** Resolves the same Staged CMS authority for evidence reads and decisions. */
    target: function () {
        const target = CONFIG.get('process')?.publicationDecisionCallback?.target || {};
        if (target.moduleName !== 'cms' || !target.connectionName || target.connectionName === 'default' ||
            !SERVICE.DefaultProcessActionAdapterRegistryService.validRemoteAuthority(target) ||
            target.targetAuthority.publication !== 'STAGED') {
            throw new CLASSES.NodicsError('ERR_PROCESS_00019', 'Publication decision callback target is unavailable');
        }
        return target;
    },
    /** Relays one private CMS evidence read. The CMS owner rechecks the task and the original human. */
    readReview: async function (request) {
        const { instanceCode, taskCode } = request.httpRequest?.params || {};
        const headers = request.httpRequest?.headers || {};
        const authorization = headers.authorization || headers.Authorization;
        const auth = request.authData || {};
        const identity = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(value);
        if (!identity(instanceCode) || !identity(taskCode) || auth.tokenType !== 'access' ||
            auth.principalType !== 'human' || auth.isSystem || auth.tenant !== request.tenant ||
            !identity(auth.entCode) || !/^Bearer \S+$/.test(authorization || ''))
            throw new CLASSES.NodicsError('ERR_AUTH_00003');
        const target = this.target();
        try {
            const result = await SERVICE.DefaultModuleService.invokeModule({
                moduleName: target.moduleName, connectionName: target.connectionName,
                connectionType: target.connectionType || 'abstract', targetAuthority: { ...target.targetAuthority },
                local: false, tenant: request.tenant, methodName: 'GET',
                apiName: '/publication/reviews/' + encodeURIComponent(instanceCode) + '/tasks/' + encodeURIComponent(taskCode),
                timeoutMs: target.timeoutMs, maxAttempts: 1,
                header: { Authorization: authorization, tenant: request.tenant, 'x-enterprise-code': auth.entCode },
                responseSelector: response => response?.code === 'SUC_CMS_00000' ? response.result : undefined
            });
            if (result?.instanceCode === instanceCode && result.taskCode === taskCode) return result;
        } catch (error) {
            if (error.code === 'ERR_AUTH_00003' || [401, 403, 404].includes(Number(error.status)))
                throw new CLASSES.NodicsError('ERR_AUTH_00003');
            throw error;
        }
        throw new CLASSES.NodicsError('ERR_PROCESS_00019', 'Exact CMS review evidence is unavailable');
    },
    /** Sends the CMS publication decision without carrying CMS content through Process. */
    applyPublicationDecision: function (request, execution) {
        let context = execution && execution.context || {};
        let decision = execution && execution.decision || {};
        if (!context.publicationCode || typeof decision.approved !== 'boolean') {
            throw new CLASSES.NodicsError('ERR_PROCESS_00019', 'Publication decision callback context is invalid');
        }
        const target = this.target();
        let token = NODICS.getInternalAuthToken(request.tenant);
        if (!token) throw new CLASSES.NodicsError('ERR_PROCESS_00019', 'Publication decision callback authentication is unavailable');
        let payload = {
            publicationCode: context.publicationCode,
            expectedRevision: context.publicationRevision,
            approved: decision.approved,
            reason: decision.reason,
            processInstanceCode: execution.instance && execution.instance.code,
            processDefinitionCode: execution.instance && execution.instance.definitionCode,
            processVersion: execution.instance && execution.instance.version,
            correlationId: context.correlationId || request.correlationId || request.requestId
        };
        return SERVICE.DefaultModuleService.invokeModule({
            moduleName: target.moduleName,
            connectionName: target.connectionName,
            connectionType: target.connectionType || 'abstract',
            targetAuthority: { ...target.targetAuthority },
            local: false, tenant: request.tenant,
            methodName: 'POST',
            apiName: '/publication/process/decision',
            requestBody: payload,
            timeoutMs: target.timeoutMs,
            maxAttempts: target.maxAttempts,
            idempotencyKey: payload.processInstanceCode + ':' + payload.publicationCode,
            header: { Authorization: 'Bearer ' + token },
            responseSelector: response => {
                const receipt = response?.result;
                const expectedState = payload.approved ? 'ONLINE' : 'REJECTED';
                const expectedRevision = Number(payload.expectedRevision) + (payload.approved ? 3 : 1);
                if (response?.code !== 'SUC_CMS_00000' || !receipt || receipt.publicationCode !== payload.publicationCode ||
                    receipt.state !== expectedState || !Number.isSafeInteger(receipt.revision) || receipt.revision !== expectedRevision ||
                    payload.approved && (typeof receipt.targetVersion !== 'string' || !receipt.targetVersion))
                    throw new CLASSES.NodicsError('ERR_PROCESS_00031', 'Exact CMS publication decision receipt is unavailable');
                return { status: 'COMPLETED', adapter: 'cms.applyPublicationDecision',
                    output: { publicationCode: payload.publicationCode, approved: payload.approved,
                        resultCode: response.code, state: receipt.state, revision: receipt.revision,
                        ...(receipt.targetVersion ? { targetVersion: receipt.targetVersion } : {}) } };
            }
        }).catch(error => {
            if (error?.code === 'ERR_PROCESS_00031' || /^ERR_AUTH_/.test(error?.code || '')) throw error;
            throw new CLASSES.NodicsError('ERR_PROCESS_00030');
        });
    }
};
