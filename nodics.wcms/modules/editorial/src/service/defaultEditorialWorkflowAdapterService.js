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
        if (settings.processBaseUrl) return String(settings.processBaseUrl).replace(/\/+$/, '');
        if (!settings.processConnectionName) return '';
        const router = SERVICE.DefaultRouterService;
        const pool = router.getModulesPool();
        if (!pool.isAvailableModuleConfig(settings.processConnectionName)) return '';
        return router.getURL(pool.getModule(settings.processConnectionName).getAbstractEndpoint());
    },

    /** Preserves the authenticated actor and tenant context when delegating to the Process runtime. */
    delegatedHeaders: function (request) {
        let httpRequest = request.httpRequest || {};
        let headers = httpRequest.headers || {};
        let forwarded = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };
        ['authorization', 'tenant', 'x-enterprise-code', 'x-correlation-id'].forEach((name) => {
            let value = headers[name] || headers[name.toLowerCase()];
            if (value) forwarded[name] = value;
        });
        if (!forwarded.tenant && request.tenant) forwarded.tenant = request.tenant;
        if (!forwarded['x-correlation-id'] && (request.correlationId || request.requestId))
            forwarded['x-correlation-id'] = request.correlationId || request.requestId;
        return forwarded;
    },

    /** Calls Process once, preserving denial/setup semantics and holding unconfirmed outcomes. */
    callProcess: async function (request, path, body, method) {
        let baseUrl = this.processBaseUrl();
        if (!baseUrl) throw new CLASSES.NodicsError('ERR_EDT_00010');
        let response;
        let payload;
        try {
            response = await fetch(baseUrl + path, {
                method: method || 'POST',
                headers: this.delegatedHeaders(request),
                body: body === undefined ? undefined : JSON.stringify(body),
            });
        } catch (error) {
            // The request may have reached Process. Never replay it or expose transport diagnostics.
            throw new CLASSES.NodicsError('ERR_EDT_00010');
        }
        if (response.status === 401) throw new CLASSES.NodicsError('ERR_EDT_00012');
        if (response.status === 403) throw new CLASSES.NodicsError('ERR_EDT_00011');
        try {
            let text = await response.text();
            payload = text ? JSON.parse(text) : {};
            if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
                throw new Error('Invalid Process response envelope');
            }
        } catch (error) {
            // The request may have reached Process. Never replay it or expose transport diagnostics.
            throw new CLASSES.NodicsError('ERR_EDT_00010');
        }
        if (!response.ok) {
            if (response.status === 404 && payload.code === 'ERR_PROCESS_00002') {
                throw new CLASSES.NodicsError('ERR_EDT_00009');
            }
            if (response.status === 404 && payload.code === 'ERR_PROCESS_00007' && method === 'GET' &&
                /^\/nodics\/process\/v0\/instances\/[^/]+\/detail$/.test(path)) {
                throw new CLASSES.NodicsError('ERR_EDT_00013');
            }
            throw new CLASSES.NodicsError('ERR_EDT_00010');
        }
        return payload.result || payload.data || payload;
    },

    /** Starts a published definition; missing setup never becomes an article-not-found claim. */
    startProcessInstance: async function (request, runtimeOperation) {
        try {
            if (
                SERVICE.DefaultProcessRuntimeLifecycleService &&
                SERVICE.DefaultProcessRuntimeLifecycleService.startInstance
            ) {
                return await SERVICE.DefaultProcessRuntimeLifecycleService.startInstance(
                    Object.assign({}, request, { runtimeOperation: runtimeOperation }),
                );
            }
            return await this.callProcess(request, '/nodics/process/v0/instances', runtimeOperation, 'POST');
        } catch (error) {
            if (error && error.code === 'ERR_PROCESS_00002') {
                throw new CLASSES.NodicsError('ERR_EDT_00009');
            }
            throw error;
        }
    },

    /** Reads Process instance detail through either same-runtime services or the configured remote Process API. */
    getProcessInstanceDetail: async function (request, instanceCode) {
        try {
            if (
                SERVICE.DefaultProcessRuntimeLifecycleService &&
                SERVICE.DefaultProcessRuntimeLifecycleService.getInstanceDetail
            ) {
                return await SERVICE.DefaultProcessRuntimeLifecycleService.getInstanceDetail(
                    Object.assign({}, request, { instanceCode: instanceCode }),
                );
            }
            return await this.callProcess(
                request,
                '/nodics/process/v0/instances/' + encodeURIComponent(instanceCode) + '/detail',
                undefined,
                'GET',
            );
        } catch (error) {
            if (error && error.code === 'ERR_PROCESS_00007') {
                throw new CLASSES.NodicsError('ERR_EDT_00013');
            }
            throw error;
        }
    },

    /** Lists open review tasks through same-runtime Process services or the configured remote Process API. */
    listReviewTasks: function (request, instanceCode) {
        if (
            SERVICE.DefaultProcessOperationsInspectionService &&
            SERVICE.DefaultProcessOperationsInspectionService.listTasks
        ) {
            return SERVICE.DefaultProcessOperationsInspectionService.listTasks(
                Object.assign({}, request, { query: { instanceCode: instanceCode, limit: 20 } }),
            );
        }
        return this.callProcess(
            request,
            '/nodics/process/v0/tasks?instanceCode=' + encodeURIComponent(instanceCode) + '&limit=20',
            undefined,
            'GET',
        );
    },

    /** Claims a review task through same-runtime Process services or the configured remote Process API. */
    claimReviewTask: function (request, taskCode) {
        if (
            SERVICE.DefaultProcessRuntimeLifecycleService &&
            SERVICE.DefaultProcessRuntimeLifecycleService.claimTask
        ) {
            return SERVICE.DefaultProcessRuntimeLifecycleService.claimTask(
                Object.assign({}, request, {
                    taskCode: taskCode,
                    editorial: undefined,
                    httpRequest: Object.assign({}, request.httpRequest, { body: {} }),
                }),
            );
        }
        return this.callProcess(
            request,
            '/nodics/process/v0/tasks/' + encodeURIComponent(taskCode) + '/claim',
            {},
            'POST',
        );
    },

    /** Completes a review task through same-runtime Process services or the configured remote Process API. */
    completeReviewTask: function (request, taskCode, action, reason) {
        const body = { decision: { approved: action === 'APPROVE', action: action, ...(reason ? { reason } : {}) } };
        if (
            SERVICE.DefaultProcessRuntimeLifecycleService &&
            SERVICE.DefaultProcessRuntimeLifecycleService.completeTask
        ) {
            return SERVICE.DefaultProcessRuntimeLifecycleService.completeTask(
                Object.assign({}, request, {
                    taskCode: taskCode,
                    editorial: undefined,
                    httpRequest: Object.assign({}, request.httpRequest, { body: body }),
                }),
            );
        }
        return this.callProcess(
            request,
            '/nodics/process/v0/tasks/' + encodeURIComponent(taskCode) + '/complete',
            body,
            'POST',
        );
    },

    /** Starts the configured published Process definition with exact article revision correlation. */
    submit: async function (request) {
        const input = await SERVICE.DefaultEditorialArticleAuthoringService.storedInput(request);
        if (!input.article || input.article.status !== 'READY')
            throw new CLASSES.NodicsError(
                'ERR_EDT_00002',
                'Validate the Editorial article before submitting it for review',
            );
        let readiness = SERVICE.DefaultEditorialReadinessService.evaluate(
            input.article,
            input.localizations,
            input.policy,
            await SERVICE.DefaultEditorialFeaturedMediaService.evaluate(request, input.article),
        );
        if (!readiness.ready)
            throw new CLASSES.NodicsError(
                'ERR_EDT_00002',
                'Editorial article is not ready for workflow submission',
            );
        let settings = (CONFIG.get('editorial') || {}).workflow || {};
        let revision = Number(input.article.revision);
        if (!Number.isInteger(revision) || revision < 1)
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial revision is required');
        let result = await this.startProcessInstance(request, {
            definitionCode: input.contentType.workflowDefinitionCode || settings.definitionCode,
            instanceCode: 'editorial-' + input.article.code + '-r' + revision,
            name: 'Editorial review: ' + input.article.internalName,
            context: {
                ownerModule: 'editorial',
                articleCode: input.article.code,
                articleRevision: revision,
                contentTypeCode: input.article.contentTypeCode,
                correlationId: request.correlationId || request.requestId,
            },
        });
        let data = (result && result.data) || result;
        let workflowInstanceCode = (data && data.instance && data.instance.code) || (data && data.code);
        if (workflowInstanceCode !== 'editorial-' + input.article.code + '-r' + revision) {
            throw new CLASSES.NodicsError('ERR_EDT_00002',
                'Process submission could not be confirmed for this exact article revision; inspect Process before continuing');
        }
        if (input.notification && SERVICE.DefaultCommunicationRequestService && request.communicationPorts) {
            await SERVICE.DefaultCommunicationRequestService.request(
                {
                    tenant: request.tenant,
                    sourceModule: 'editorial',
                    sourceType: 'WORKFLOW_TASK',
                    sourceCode: input.article.code,
                    templateCode: input.notification.templateCode,
                    recipientId: input.notification.recipientId,
                    recipientAddressReference: input.notification.recipientAddressReference,
                    purpose: 'TRANSACTIONAL',
                    channel: input.notification.channel || 'INBOX',
                    locale: input.notification.locale || 'en',
                    variables: {
                        articleCode: input.article.code,
                        workflowInstanceCode: workflowInstanceCode,
                    },
                    idempotencyKey: workflowInstanceCode + ':created',
                    correlationId: request.correlationId || request.requestId,
                    now: new Date(),
                },
                request.communicationPorts,
                CONFIG.get('communication') || {},
            );
        }
        const updated = await SERVICE.DefaultEditorialArticleService.update({
            tenant: request.tenant,
            authData: request.authData,
            query: { code: input.article.code, revision: revision, status: 'READY' },
            model: {
                $set: { status: 'IN_REVIEW', workflowInstanceCode: workflowInstanceCode },
            },
            options: { recursive: false },
        });
        if (SERVICE.DefaultModelsUpdateInitializerService.getAffectedCount(updated) !== 1) {
            throw new CLASSES.NodicsError('ERR_EDT_00002',
                'Process accepted the review, but the article changed before its status was confirmed; inspect the exact Process instance before continuing');
        }
        return {
            articleCode: input.article.code,
            articleRevision: revision,
            workflowInstanceCode: workflowInstanceCode,
            article: Object.assign({}, input.article, {
                status: 'IN_REVIEW',
                workflowInstanceCode: workflowInstanceCode,
            }),
            processResult: data,
        };
    },
    /** Resolves the saved article's review under original employee authority, including uncertain submission recovery. */
    inspect: async function (request) {
        const owner = SERVICE.DefaultEditorialDraftCommandService;
        owner.authorize(request, 'editorial.workflow.read');
        const params = request.httpRequest && request.httpRequest.params || request.params || {};
        const code = params.articleCode;
        if (typeof code !== 'string' || !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(code)) {
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'Select the saved article before inspecting its review');
        }
        const article = await owner.root(request, code);
        if (!Number.isSafeInteger(article.revision) || article.revision < 1) {
            throw new CLASSES.NodicsError('ERR_EDT_00008');
        }
        const expected = 'editorial-' + code + '-r' + article.revision;
        if (article.workflowInstanceCode !== undefined && article.workflowInstanceCode !== expected) {
            throw new CLASSES.NodicsError('ERR_EDT_00008');
        }
        // Process may have accepted submission before the source transition was confirmed.
        // Only the source-derived deterministic identity is eligible for that inquiry.
        const result = await this.getProcessInstanceDetail(request, expected);
        const detail = result && (result.data || result.result || result);
        const instance = detail && detail.instance;
        const context = instance && instance.context;
        if (!instance || instance.code !== expected || !context || context.ownerModule !== 'editorial' ||
            context.articleCode !== code || context.articleRevision !== article.revision) {
            throw new CLASSES.NodicsError('ERR_EDT_00008');
        }
        const current = await owner.root(request, code);
        if (current.revision !== article.revision || current.status !== article.status ||
            current.workflowInstanceCode !== article.workflowInstanceCode) {
            throw new CLASSES.NodicsError('ERR_EDT_00008');
        }
        return result;
    },
    /** Keeps reviewer feedback bounded before copying it into an Editorial receipt. */
    rejectionReason: function (action, reason) {
        return action === 'REJECT' && typeof reason === 'string' ? reason.trim().slice(0, 1000) : '';
    },
    /** Converts a completed Process decision into bounded Editorial status evidence. */
    applyDecision: function (article, decision) {
        if (!article || Number(article.revision) !== Number(decision && decision.articleRevision))
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial workflow revision correlation failed');
        let statuses = { APPROVE: 'APPROVED', REJECT: 'CHANGES_REQUESTED', CANCEL: 'DRAFT' };
        let status = statuses[decision.action];
        if (!status) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial workflow decision is invalid');
        const reason = this.rejectionReason(decision.action, decision.reason);
        return {
            code: article.code,
            revision: article.revision,
            status: status,
            workflowInstanceCode: decision.workflowInstanceCode,
            decisionEvidence: {
                action: decision.action,
                actor: decision.actor,
                completedAt: decision.completedAt,
                ...(reason ? { reason } : {}),
            },
        };
    },
    /** Applies a Process-owned decision with exact correlation, optimistic mutation and retry evidence. */
    applyProcessDecision: async function (request, execution) {
        const instance = (execution && execution.instance) || {};
        const context = instance.context || {};
        const decision = (execution.body && execution.body.decision) || execution.decision || {};
        const response = await SERVICE.DefaultEditorialArticleService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { code: context.articleCode, revision: Number(context.articleRevision) },
            searchOptions: { limit: 1 },
        });
        const article = response && response.result && response.result[0];
        if (!article || article.workflowInstanceCode !== instance.code) {
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial workflow revision correlation failed');
        }
        const action =
            decision.action ||
            (decision.approved === true ? 'APPROVE' : decision.approved === false ? 'REJECT' : undefined);
        const nodeCode = execution.nodeCode || (execution.node && execution.node.code);
        const previous = article.decisionEvidence || {};
        if (article.status !== 'IN_REVIEW') {
            if (
                nodeCode &&
                previous.nodeCode === nodeCode &&
                previous.action === action &&
                previous.workflowInstanceCode === instance.code
            ) {
                return {
                    status: 'COMPLETED',
                    output: {
                        articleCode: article.code,
                        articleRevision: article.revision,
                        editorialStatus: article.status,
                    },
                };
            }
            throw new CLASSES.NodicsError(
                'ERR_EDT_00002',
                'Only an in-review Editorial revision can receive a Process decision',
            );
        }
        const patch = this.applyDecision(article, {
            articleRevision: context.articleRevision,
            workflowInstanceCode: instance.code,
            action: action,
            reason: decision.reason,
            actor:
                execution.actor ||
                (request.authData && (request.authData.loginId || request.authData.serviceId)),
            completedAt: new Date(),
        });
        Object.assign(patch.decisionEvidence, {
            workflowInstanceCode: instance.code,
            nodeCode: nodeCode,
            executionCode: execution.executionCode,
        });
        const updated = await SERVICE.DefaultEditorialArticleService.update({
            tenant: request.tenant,
            authData: request.authData,
            query: {
                code: article.code,
                revision: article.revision,
                workflowInstanceCode: instance.code,
                status: 'IN_REVIEW',
            },
            model: patch,
            options: { recursive: false },
        });
        if (SERVICE.DefaultModelsUpdateInitializerService.getAffectedCount(updated) !== 1) {
            throw new CLASSES.NodicsError(
                'ERR_EDT_00002',
                'Editorial review state changed before applying the decision',
            );
        }
        return {
            status: 'COMPLETED',
            output: {
                articleCode: article.code,
                articleRevision: article.revision,
                editorialStatus: patch.status,
            },
        };
    },
    /** Applies a bounded Axis review decision through Process-owned task APIs when Process is colocated. */
    decideReview: async function (request, action) {
        const input = await SERVICE.DefaultEditorialArticleAuthoringService.storedInput(request);
        if (!input.article || input.article.status !== 'IN_REVIEW' || !input.article.workflowInstanceCode)
            throw new CLASSES.NodicsError(
                'ERR_EDT_00002',
                'Only an in-review Editorial article can receive a review decision',
            );
        let listed = await this.listReviewTasks(request, input.article.workflowInstanceCode);
        let items = Array.isArray(listed)
            ? listed
            : (listed &&
                  (listed.items || listed.result || (listed.data && listed.data.items) || listed.data)) ||
              [];
        let task = (Array.isArray(items) ? items : []).find(
            (item) =>
                item &&
                item.instanceCode === input.article.workflowInstanceCode &&
                ['OPEN', 'CLAIMED', 'ESCALATED'].includes(item.status),
        );
        if (!task) throw new CLASSES.NodicsError('ERR_EDT_00008', 'No open Editorial review task was found');
        if (task.status === 'OPEN') {
            await this.claimReviewTask(request, task.code);
        }
        const reason = this.rejectionReason(action, input.reason);
        let completed = await this.completeReviewTask(request, task.code, action, reason);
        let articleStatus = action === 'APPROVE' ? 'APPROVED' : 'CHANGES_REQUESTED';
        return {
            articleCode: input.article.code,
            articleRevision: input.article.revision,
            article: Object.assign({}, input.article, { status: articleStatus }),
            processResult: completed,
        };
    },
};
