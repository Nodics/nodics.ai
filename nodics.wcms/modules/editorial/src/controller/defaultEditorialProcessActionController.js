/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module editorial/controller/DefaultEditorialProcessActionController @description Claims a currently executing Process action before invoking the exact Editorial revision. @layer controller @owner editorial @override Preserve runtime principal scope, single-use Process claims and domain publication authority. */
module.exports = {
    /** Obtains authoritative context from Process; the callback carries no decision or article patch. */
    claimExecution: async function (operation, request) {
        const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, 'workflow');
        const input = (request.httpRequest && request.httpRequest.body) || {};
        if (
            !['applyDecision', 'publishApproved'].includes(operation) ||
            Object.keys(input).length !== 2 ||
            !Object.keys(input).every((key) => ['instanceCode', 'executionCode'].includes(key)) ||
            typeof input.instanceCode !== 'string' ||
            !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,191}$/.test(input.instanceCode) ||
            typeof input.executionCode !== 'string' ||
            !/^[0-9a-f-]{36}$/.test(input.executionCode)
        ) {
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial process execution handle is invalid');
        }
        const target = ((CONFIG.get('editorial') || {}).workflow || {}).actionAuthority || {};
        if (!target.connectionName || target.connectionName === 'default') {
            throw new CLASSES.NodicsError(
                'ERR_EDT_00003',
                'Editorial Process action authority is unavailable',
            );
        }
        return SERVICE.DefaultModuleService.invokeModule({
            moduleName: 'workflow',
            connectionName: target.connectionName,
            connectionType: target.connectionType,
            targetAuthority: { runtimeRole: target.runtimeRole },
            local: false,
            tenant: request.tenant,
            header: { tenant: request.tenant },
            methodName: 'POST',
            apiName: '/instances/' + encodeURIComponent(input.instanceCode) + '/actions/claim',
            requestBody: {
                executionCode: input.executionCode,
                actionKey: 'editorial.' + operation,
                sourceRuntimeInstanceId: auth.runtimeInstanceId,
            },
            timeoutMs: target.timeoutMs,
            maxAttempts: 1,
            responseSelector: (response) => (response && (response.data || response.result)) || response,
        });
    },

    /** Validates the claimed source revision before invoking its existing domain owner. */
    invoke: async function (operation, request, callback) {
        try {
            const execution = await this.claimExecution(operation, request);
            const instance = (execution && execution.instance) || {};
            const context = instance.context || {};
            if (
                !instance.code ||
                !context.articleCode ||
                !Number.isInteger(Number(context.articleRevision)) ||
                Number(context.articleRevision) < 1
            ) {
                throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial process source context is invalid');
            }
            // Use existing internal persistence authority only for the claimed owner operation.
            // These groups never enter the incoming runtime token or remote claim request.
            const domainRequest = Object.assign({}, request, {
                authData: Object.assign(
                    {},
                    request.authData,
                    SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
                ),
            });
            const result =
                operation === 'applyDecision'
                    ? await SERVICE.DefaultEditorialWorkflowAdapterService.applyProcessDecision(
                          domainRequest,
                          execution,
                      )
                    : await SERVICE.DefaultEditorialPublicationService.applyProcessPublication(
                          domainRequest,
                          execution,
                      );
            if (callback) return callback(null, { code: 'SUC_SYS_00000', result: result });
            return result;
        } catch (error) {
            if (callback) return callback(error);
            throw error;
        }
    },
    /** Applies one Process-owned completed review decision. */
    applyDecision: function (request, callback) {
        return this.invoke('applyDecision', request, callback);
    },
    /** Publishes one Process-authorized approved revision through Editorial and nPublish. */
    publishApproved: function (request, callback) {
        return this.invoke('publishApproved', request, callback);
    },
};
