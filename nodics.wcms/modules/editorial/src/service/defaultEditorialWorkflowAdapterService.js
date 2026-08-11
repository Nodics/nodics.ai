/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialWorkflowAdapterService @description Bridges Editorial readiness to Process-owned workflow execution and inspection. @layer service @owner editorial */
module.exports = {
    /** Returns the configured remote Process base URL, when Editorial and Process run in separate runtimes. */
    processBaseUrl: function () {
        let settings = (CONFIG.get('editorial') || {}).workflow || {};
        return settings.processBaseUrl ? String(settings.processBaseUrl).replace(/\/+$/, '') : '';
    },

    /** Preserves the authenticated actor and tenant context when delegating to the Process runtime. */
    delegatedHeaders: function (request) {
        let httpRequest = request.httpRequest || {};
        let headers = httpRequest.headers || {};
        let forwarded = {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        };
        ['authorization', 'tenant', 'x-enterprise-code', 'x-correlation-id'].forEach(name => {
            let value = headers[name] || headers[name.toLowerCase()];
            if (value) forwarded[name] = value;
        });
        if (!forwarded.tenant && request.tenant) forwarded.tenant = request.tenant;
        if (!forwarded['x-correlation-id'] && (request.correlationId || request.requestId)) forwarded['x-correlation-id'] = request.correlationId || request.requestId;
        return forwarded;
    },

    /** Calls the Process-owned HTTP API for split-runtime deployments. */
    callProcess: async function (request, path, body, method) {
        let baseUrl = this.processBaseUrl();
        if (!baseUrl) throw new CLASSES.NodicsError('ERR_EDT_00003', 'Editorial Process runtime endpoint is not configured');
        let response = await fetch(baseUrl + path, {
            method: method || 'POST',
            headers: this.delegatedHeaders(request),
            body: body === undefined ? undefined : JSON.stringify(body)
        });
        let text = await response.text();
        let payload = {};
        try {
            payload = text ? JSON.parse(text) : {};
        } catch (error) {
            throw new CLASSES.NodicsError('ERR_EDT_00003', 'Process runtime returned a non-JSON response');
        }
        if (!response.ok) {
            let message = payload && (payload.message || payload.code) || ('Process runtime returned HTTP ' + response.status);
            throw new CLASSES.NodicsError('ERR_EDT_00003', message);
        }
        return payload.result || payload.data || payload;
    },

    /** Starts a Process instance through either same-runtime services or the configured remote Process API. */
    startProcessInstance: function (request, runtimeOperation) {
        if (SERVICE.DefaultProcessRuntimeLifecycleService && SERVICE.DefaultProcessRuntimeLifecycleService.startInstance) {
            return SERVICE.DefaultProcessRuntimeLifecycleService.startInstance(Object.assign({}, request, { runtimeOperation: runtimeOperation }));
        }
        return this.callProcess(request, '/nodics/process/v0/instances', runtimeOperation, 'POST');
    },

    /** Reads Process instance detail through either same-runtime services or the configured remote Process API. */
    getProcessInstanceDetail: function (request, instanceCode) {
        if (SERVICE.DefaultProcessRuntimeLifecycleService && SERVICE.DefaultProcessRuntimeLifecycleService.getInstanceDetail) {
            return SERVICE.DefaultProcessRuntimeLifecycleService.getInstanceDetail(Object.assign({}, request, { instanceCode: instanceCode }));
        }
        return this.callProcess(request, '/nodics/process/v0/instances/' + encodeURIComponent(instanceCode) + '/detail', undefined, 'GET');
    },

    /** Starts the configured published Process definition with exact article revision correlation. */
    submit: async function (request) {
        let input = request.editorial || {};
        let readiness = SERVICE.DefaultEditorialReadinessService.evaluate(input.article, input.localizations, input.policy);
        if (!readiness.ready) throw new CLASSES.NodicsError('ERR_EDT_00002', 'Editorial article is not ready for workflow submission');
        let settings = (CONFIG.get('editorial') || {}).workflow || {};
        let revision = Number(input.article.revision);
        if (!Number.isInteger(revision) || revision < 1) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial revision is required');
        let result = await this.startProcessInstance(request, {
            definitionCode: input.workflowDefinitionCode || settings.definitionCode,
            instanceCode: 'editorial-' + input.article.code + '-r' + revision,
            name: 'Editorial review: ' + input.article.internalName,
            context: { ownerModule: 'editorial', articleCode: input.article.code, articleRevision: revision, contentTypeCode: input.article.contentTypeCode, correlationId: request.correlationId || request.requestId }
        });
        let data = result && result.data || result;
        let workflowInstanceCode = data && data.instance && data.instance.code || data && data.code;
        if (input.notification && SERVICE.DefaultCommunicationRequestService && request.communicationPorts) {
            await SERVICE.DefaultCommunicationRequestService.request({ tenant: request.tenant, sourceModule: 'editorial', sourceType: 'WORKFLOW_TASK', sourceCode: input.article.code,
                templateCode: input.notification.templateCode, recipientId: input.notification.recipientId, recipientAddressReference: input.notification.recipientAddressReference,
                purpose: 'TRANSACTIONAL', channel: input.notification.channel || 'INBOX', locale: input.notification.locale || 'en', variables: { articleCode: input.article.code, workflowInstanceCode: workflowInstanceCode },
                idempotencyKey: workflowInstanceCode + ':created', correlationId: request.correlationId || request.requestId, now: new Date() }, request.communicationPorts, CONFIG.get('communication') || {});
        }
        return { articleCode: input.article.code, articleRevision: revision, workflowInstanceCode: workflowInstanceCode, processResult: data };
    },
    /** Reads workflow detail from Process without copying Process-owned state. */
    inspect: function (request) {
        let input = request.editorial || {};
        return this.getProcessInstanceDetail(request, input.workflowInstanceCode);
    },
    /** Converts a completed Process decision into bounded Editorial status evidence. */
    applyDecision: function (article, decision) {
        if (!article || Number(article.revision) !== Number(decision && decision.articleRevision)) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial workflow revision correlation failed');
        let statuses = { APPROVE: 'APPROVED', REJECT: 'CHANGES_REQUESTED', CANCEL: 'DRAFT' };
        let status = statuses[decision.action];
        if (!status) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial workflow decision is invalid');
        return { code: article.code, revision: article.revision, status: status, workflowInstanceCode: decision.workflowInstanceCode, decisionEvidence: { action: decision.action, actor: decision.actor, completedAt: decision.completedAt } };
    },
    /** Applies an authorized Process ACTION node result to the exact Editorial revision. */
    applyProcessDecision: async function (request, execution) {
        let context = execution && execution.instance && execution.instance.context || {};
        let decision = execution && execution.body && execution.body.decision || {};
        let response = await SERVICE.DefaultEditorialArticleService.get({ tenant: request.tenant, authData: request.authData, query: { code: context.articleCode, revision: Number(context.articleRevision) }, searchOptions: { limit: 1 } });
        let article = response && response.result && response.result[0];
        if (!article) throw new CLASSES.NodicsError('ERR_EDT_00003', 'Editorial workflow source revision was not found');
        let patch = this.applyDecision(article, { articleRevision: context.articleRevision, workflowInstanceCode: execution.instance.code, action: decision.action || (decision.approved === true ? 'APPROVE' : 'REJECT'), actor: request.authData && request.authData.loginId, completedAt: new Date() });
        await SERVICE.DefaultEditorialArticleService.update({ tenant: request.tenant, authData: request.authData, query: { code: article.code, revision: article.revision }, model: patch });
        return { status: 'COMPLETED', output: { articleCode: article.code, articleRevision: article.revision, editorialStatus: patch.status } };
    }
};
