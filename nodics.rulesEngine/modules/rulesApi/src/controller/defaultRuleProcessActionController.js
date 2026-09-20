/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module rulesApi/src/controller/defaultRuleProcessActionController @description Claims one Process-owned remote action before applying its authoritative maker-checker decision to a Rules draft. @layer controller @owner rulesApi */
module.exports = {
    claimExecution: async function (request) {
        let auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, 'workflow');
        let input = request.httpRequest && request.httpRequest.body || {};
        if (Object.keys(input).length !== 2 ||
            !Object.keys(input).every(key => ['instanceCode','executionCode'].includes(key)) ||
            typeof input.instanceCode !== 'string' ||
            !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,191}$/.test(input.instanceCode) ||
            typeof input.executionCode !== 'string' ||
            !/^[0-9a-f-]{36}$/.test(input.executionCode)) {
            throw new Error('Rules Process execution handle is invalid');
        }
        let target = (((CONFIG.get('rulesEngine') || {}).approval) || {}).actionAuthority || {};
        if (!target.connectionName || target.connectionName === 'default') {
            throw new Error('Rules Process action authority is unavailable');
        }
        return SERVICE.DefaultModuleService.invokeModule({
            moduleName: 'workflow',
            connectionName: target.connectionName,
            connectionType: target.connectionType || 'abstract',
            targetAuthority: { runtimeRole: target.runtimeRole || 'PROCESS' },
            local: false,
            tenant: request.tenant,
            methodName: 'POST',
            apiName: '/instances/' + encodeURIComponent(input.instanceCode) + '/actions/claim',
            requestBody: {
                executionCode: input.executionCode,
                actionKey: 'rulesApi.applyDecision',
                sourceRuntimeInstanceId: auth.runtimeInstanceId
            },
            timeoutMs: target.timeoutMs || 10000,
            maxAttempts: 1,
            responseSelector: response => (response && (response.data || response.result)) || response
        });
    },

    applyDecision: async function (request, callback) {
        try {
            let execution = await this.claimExecution(request);
            let systemRequest = Object.assign({}, request, {
                authData: Object.assign({}, request.authData, SERVICE.DefaultIdentityGovernanceService.getSystemAuthData())
            });
            let result = await SERVICE.DefaultRuleApprovalService.applyProcessDecision(systemRequest, execution);
            if (callback) return callback(null, { code: 'SUC_SYS_00000', result: result });
            return result;
        } catch (error) {
            if (callback) return callback(error);
            throw error;
        }
    }
};
