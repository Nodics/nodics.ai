/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const crypto = require('node:crypto');

/** @module rulesApi/src/service/defaultRuleApprovalService @description Bridges Rules policy drafts to Process-owned maker-checker tasks while Rules retains policy lifecycle ownership. @layer service @owner rulesApi */
module.exports = {
    settings: function () {
        return ((CONFIG.get('rulesEngine') || {}).approval) || {};
    },

    instanceCode: function (ruleSetCode, draftRevision) {
        return 'rulesPolicyApproval-' + crypto.createHash('sha256')
            .update(ruleSetCode + ':' + String(draftRevision)).digest('hex').slice(0, 24);
    },

    processTarget: function () {
        return this.settings().processTarget || {};
    },

    actor: function (request) {
        let auth = request && request.authData || {};
        return auth.loginId || auth.code || auth.userId || auth.serviceId;
    },

    startProcess: function (request, runtimeOperation) {
        if (typeof SERVICE !== 'undefined' &&
            SERVICE.DefaultProcessRuntimeLifecycleService &&
            SERVICE.DefaultProcessRuntimeLifecycleService.startInstance) {
            return SERVICE.DefaultProcessRuntimeLifecycleService.startInstance(
                Object.assign({}, request, { runtimeOperation: runtimeOperation })
            );
        }
        let target = this.processTarget();
        if (!target.connectionName || target.connectionName === 'default') {
            throw new Error('Rules Process approval target is unavailable');
        }
        return SERVICE.DefaultModuleService.invokeModule({
            moduleName: 'workflow',
            connectionName: target.connectionName,
            connectionType: target.connectionType || 'abstract',
            targetAuthority: { runtimeRole: target.runtimeRole || 'PROCESS' },
            local: false,
            tenant: request.tenant,
            methodName: 'POST',
            apiName: '/instances',
            header: request.authorization ? { Authorization: request.authorization } : undefined,
            requestBody: runtimeOperation,
            timeoutMs: target.timeoutMs || 10000,
            maxAttempts: 1,
            responseSelector: response => (response && (response.data || response.result)) || response
        });
    },

    submit: async function (request) {
        let lifecycle = SERVICE.DefaultRuleDefinitionLifecycleService;
        let ruleSet = await lifecycle.requireRuleSet(request, request.ruleSetCode);
        if (ruleSet.status !== 'DRAFT') throw new Error('Only a draft rule set can be submitted for approval');
        await lifecycle.validateRuleSetDraft(Object.assign({}, request, { ruleSetCode: ruleSet.code }));

        let draftRevision = Number(ruleSet.draftRevision || 1);
        let previous = ruleSet.approval || {};
        if (previous.status === 'PENDING' && Number(previous.draftRevision) === draftRevision) {
            return { code: 'RULE_APPROVAL_PENDING', data: previous };
        }

        let instanceCode = this.instanceCode(ruleSet.code, draftRevision);
        let runtimeOperation = {
            definitionCode: this.settings().definitionCode || 'rulesPolicyApproval',
            instanceCode: instanceCode,
            name: 'Rules policy review: ' + ruleSet.code,
            context: {
                ruleSetCode: ruleSet.code,
                draftRevision: draftRevision,
                consumerModule: ruleSet.consumerModule,
                policyType: ruleSet.policyType,
                scopeType: ruleSet.scopeType,
                scopeCode: ruleSet.scopeCode,
                correlationId: request.correlationId || request.requestId,
                requestedBy: this.actor(request)
            }
        };
        Object.keys(runtimeOperation.context).forEach(key => runtimeOperation.context[key] === undefined && delete runtimeOperation.context[key]);
        if (Buffer.byteLength(JSON.stringify(runtimeOperation.context), 'utf8') > 65536) {
            throw new Error('Rules approval context exceeds the allowed boundary');
        }
        let result = await this.startProcess(request, runtimeOperation);
        let data = result && result.data || result;
        let actualInstanceCode = data && data.instance && data.instance.code || data && data.code || instanceCode;
        let approval = {
            status: 'PENDING',
            draftRevision: draftRevision,
            processDefinitionCode: runtimeOperation.definitionCode,
            processInstanceCode: actualInstanceCode,
            requestedBy: this.actor(request),
            requestedAt: new Date(),
            correlationId: runtimeOperation.context.correlationId
        };
        await SERVICE.DefaultRuleSetService.update(lifecycle.serviceRequest(request, {
            query: { code: ruleSet.code, status: 'DRAFT', draftRevision: draftRevision },
            model: { $set: { approval: approval } }
        }));
        return { code: 'RULE_APPROVAL_PENDING', data: approval };
    },

    applyProcessDecision: async function (request, execution) {
        let instance = execution && execution.instance || {};
        let context = instance.context || {};
        let decision = execution && execution.body && execution.body.decision || execution && execution.decision || {};
        if (!context.ruleSetCode || !Number.isInteger(Number(context.draftRevision))) {
            throw new Error('Rules Process source context is invalid');
        }
        let lifecycle = SERVICE.DefaultRuleDefinitionLifecycleService;
        let ruleSet = await lifecycle.requireRuleSet(request, context.ruleSetCode);
        let approval = ruleSet.approval || {};
        if (approval.processInstanceCode !== instance.code || Number(approval.draftRevision) !== Number(context.draftRevision)) {
            throw new Error('Rules approval revision correlation failed');
        }
        let approved = decision.approved === true || decision.action === 'APPROVE';
        let rejected = decision.approved === false || decision.action === 'REJECT';
        if (!approved && !rejected) throw new Error('Rules approval decision is invalid');

        let actor = execution.actor || (request.authData && (request.authData.loginId || request.authData.serviceId || request.authData.code));
        let completedAt = new Date();
        if (approval.status === (approved ? 'APPROVED' : 'REJECTED')) {
            return { status: 'COMPLETED', output: { ruleSetCode: ruleSet.code, policyStatus: ruleSet.status } };
        }
        if (approval.status !== 'PENDING' || ruleSet.status !== 'DRAFT') {
            throw new Error('Rules policy is not awaiting this approval decision');
        }

        if (!approved) {
            await SERVICE.DefaultRuleSetService.update(lifecycle.serviceRequest(request, {
                query: { code: ruleSet.code, status: 'DRAFT', draftRevision: Number(context.draftRevision) },
                model: { $set: { approval: Object.assign({}, approval, {
                    status: 'REJECTED',
                    decidedBy: actor,
                    decidedAt: completedAt,
                    reason: decision.reason
                }) } }
            }));
            return { status: 'COMPLETED', output: { ruleSetCode: ruleSet.code, policyStatus: 'DRAFT', decision: 'REJECTED' } };
        }

        let published = await lifecycle.publishRuleSetDraft(Object.assign({}, request, {
            ruleSetCode: ruleSet.code,
            approvedBy: actor,
            approvedAt: completedAt,
            changeReason: decision.reason || 'Approved through Process'
        }));
        await SERVICE.DefaultRuleSetService.update(lifecycle.serviceRequest(request, {
            query: { code: ruleSet.code, currentVersion: published.data.version },
            model: { $set: { approval: Object.assign({}, approval, {
                status: 'APPROVED',
                decidedBy: actor,
                decidedAt: completedAt,
                publishedVersion: published.data.version
            }) } }
        }));
        return { status: 'COMPLETED', output: {
            ruleSetCode: ruleSet.code,
            policyStatus: published.data.status,
            version: published.data.version,
            decision: 'APPROVED'
        } };
    }
};
