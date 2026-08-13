/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/modules/workflow/modules/flowCore/src/service/operation/defaultProcessRuntimeLifecycleService
 * @description Owns backend runtime lifecycle for starting published process definitions, generating human tasks, moving instances, and writing audit evidence.
 * @layer service
 * @owner flowCore
 * @override Customer process overlays may override focused runtime methods for domain policy, assignment, SLA, tenant redaction, or execution providers without moving runtime truth into Axis.
 */
module.exports = {
    /**
     * Resolves tenant from the Nodics request context.
     *
     * @param {Object} request Nodics request context.
     * @returns {string} Tenant code.
     */
    getTenant: function (request) {
        return request && request.tenant || CONFIG.get('defaultTenant') || 'default';
    },

    /**
     * Resolves the actor used for runtime audit events.
     *
     * @param {Object} request Nodics request context.
     * @returns {string|undefined} Actor identifier.
     */
    getActor: function (request) {
        let auth = request && request.authData || {};
        return auth.loginId || auth.serviceId || auth.code || auth.userId;
    },

    /**
     * Returns a request body/model without binding the service to HTTP.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Body model.
     */
    bodyOf: function (request) {
        return request && (request.runtimeOperation || request.model || request.body) || {};
    },

    /**
     * Builds a generated-service request preserving tenant and auth data.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} additions Generated-service request additions.
     * @returns {Object} Generated-service request.
     */
    serviceRequest: function (request, additions) {
        return Object.assign({
            tenant: this.getTenant(request),
            authData: request && request.authData,
            options: { recursive: false }
        }, additions || {});
    },

    /** @returns {Object} Generated definition service. */
    definitionService: function () { return SERVICE.DefaultProcessDefinitionService; },
    /** @returns {Object} Generated definition-version service. */
    versionService: function () { return SERVICE.DefaultProcessDefinitionVersionService; },
    /** @returns {Object} Generated instance service. */
    instanceService: function () { return SERVICE.DefaultProcessInstanceService; },
    /** @returns {Object} Generated task service. */
    taskService: function () { return SERVICE.DefaultProcessTaskService; },
    /** @returns {Object} Generated recovery-incident service. */
    incidentService: function () { return SERVICE.DefaultProcessIncidentService; },
    /** @returns {Object} Generated audit service. */
    auditService: function () { return SERVICE.DefaultProcessAuditEventService; },
    /** @returns {Object|undefined} Generated trigger service when the schema is available. */
    triggerService: function () { return SERVICE.DefaultProcessTriggerService; },
    /** @returns {Object|undefined} Process action adapter registry service. */
    actionAdapterRegistryService: function () { return SERVICE.DefaultProcessActionAdapterRegistryService; },

    /**
     * Resolves a bounded retry policy from the ACTION node and merged config.
     *
     * @param {Object} node ACTION node.
     * @returns {Object} Retry policy.
     */
    retryPolicy: function (node) {
        let configured = ((CONFIG.get('process') || {}).runtime || {}).retry || {};
        let declared = node && node.retry || {};
        let maximumAttempts = Number(declared.maximumAttempts || configured.maximumAttempts || 3);
        let delayMs = Number(declared.delayMs || configured.delayMs || 0);
        return {
            maximumAttempts: Math.max(1, Math.min(Number.isFinite(maximumAttempts) ? Math.floor(maximumAttempts) : 3, 10)),
            delayMs: Math.max(0, Math.min(Number.isFinite(delayMs) ? Math.floor(delayMs) : 0, 86400000))
        };
    },

    /**
     * Lists lifecycle states allowed for Process-owned trigger metadata.
     *
     * @returns {string[]} Supported trigger states.
     */
    triggerStatuses: function () {
        return ['DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED'];
    },

    /**
     * Validates a Process trigger lifecycle state.
     *
     * @param {*} status Candidate trigger status.
     * @returns {string} Valid trigger status.
     * @throws {CLASSES.NodicsError} When the status is unsupported.
     */
    assertTriggerStatus: function (status) {
        if (!this.triggerStatuses().includes(status)) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00015', 'Process trigger status is invalid');
        }
        return status;
    },

    /**
     * Validates a stable runtime code.
     *
     * @param {*} value Candidate code.
     * @returns {boolean} Whether the code is safe for runtime use.
     */
    isCode: function (value) {
        return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);
    },

    /**
     * Throws when a process runtime code is invalid.
     *
     * @param {*} code Candidate code.
     * @returns {string} Valid code.
     * @throws {CLASSES.NodicsError} When the code is invalid.
     */
    assertCode: function (code) {
        if (!this.isCode(code)) throw new CLASSES.NodicsError('ERR_PROCESS_00006', 'Process runtime code is invalid');
        return code;
    },

    /**
     * Generates a bounded runtime code when the caller did not provide one.
     *
     * @param {string} prefix Business-readable prefix.
     * @returns {string} Runtime code.
     */
    runtimeCode: function (prefix) {
        return String(prefix || 'process').slice(0, 48) + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    },

    /**
     * Loads a process definition aggregate.
     *
     * @param {Object} request Nodics request context.
     * @param {string} definitionCode Definition code.
     * @returns {Promise<Object>} Process definition.
     */
    requireDefinition: async function (request, definitionCode) {
        let response = await this.definitionService().get(this.serviceRequest(request, {
            query: { code: this.assertCode(definitionCode) },
            searchOptions: { limit: 1 }
        }));
        let definition = response && response.result && response.result[0];
        if (!definition) throw new CLASSES.NodicsError('ERR_PROCESS_00002', 'Process definition was not found');
        return definition;
    },

    /**
     * Loads Process-owned trigger metadata.
     *
     * @param {Object} request Nodics request context.
     * @param {string} triggerCode Trigger code.
     * @returns {Promise<Object>} Trigger metadata.
     */
    requireTrigger: async function (request, triggerCode) {
        if (!this.triggerService()) throw new CLASSES.NodicsError('ERR_PROCESS_00014', 'Process trigger service is unavailable');
        let response = await this.triggerService().get(this.serviceRequest(request, {
            query: { code: this.assertCode(triggerCode) },
            searchOptions: { limit: 1 }
        }));
        let trigger = response && response.result && response.result[0];
        if (!trigger) throw new CLASSES.NodicsError('ERR_PROCESS_00016', 'Process trigger was not found');
        return trigger;
    },

    /**
     * Loads an immutable published version.
     *
     * @param {Object} request Nodics request context.
     * @param {string} definitionCode Definition code.
     * @param {number} version Version number.
     * @returns {Promise<Object>} Published version.
     */
    requireVersion: async function (request, definitionCode, version) {
        let response = await this.versionService().get(this.serviceRequest(request, {
            query: { definitionCode: this.assertCode(definitionCode), version: Number(version) },
            searchOptions: { limit: 1 }
        }));
        let processVersion = response && response.result && response.result[0];
        if (!processVersion || processVersion.status !== 'PUBLISHED') {
            throw new CLASSES.NodicsError('ERR_PROCESS_00011', 'Process definition is not published for runtime start');
        }
        return processVersion;
    },

    /**
     * Resolves the published version used by a runtime request.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} body Runtime operation body.
     * @returns {Promise<Object>} Published version.
     */
    resolveStartVersion: async function (request, body) {
        let definitionCode = body.definitionCode || request.definitionCode;
        let definition = await this.requireDefinition(request, definitionCode);
        let version = Number(body.version || request.version || definition.currentVersion || 0);
        if (definition.status !== 'PUBLISHED' || version < 1) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00011', 'Process definition is not published for runtime start');
        }
        return this.requireVersion(request, definition.code, version);
    },

    /**
     * Finds a node in a published process graph.
     *
     * @param {Object} graph Published graph.
     * @param {string} nodeCode Node code.
     * @returns {Object|undefined} Matching node.
     */
    findNode: function (graph, nodeCode) {
        return (graph.nodes || []).find(node => node && node.code === nodeCode);
    },

    /**
     * Finds all outgoing transitions for a source node.
     *
     * @param {Object} graph Published graph.
     * @param {string} sourceNodeCode Source node code.
     * @returns {Object[]} Outgoing transitions.
     */
    outgoingTransitions: function (graph, sourceNodeCode) {
        return (graph.transitions || []).filter(item => item && item.source === sourceNodeCode);
    },

    /**
     * Resolves the next transition for a runtime node. DECISION nodes can use a
     * selected transition code, target node code, or a simple equals condition
     * against the completion decision/context before falling back to the default
     * transition.
     *
     * @param {Object} graph Published graph.
     * @param {string} sourceNodeCode Source node code.
     * @param {Object} body Runtime request body.
     * @returns {Object|undefined} Selected transition.
     */
    resolveTransition: function (graph, sourceNodeCode, body) {
        let transitions = this.outgoingTransitions(graph, sourceNodeCode);
        let decision = body && body.decision || {};
        if (decision.transitionCode) {
            return transitions.find(transition => transition.code === decision.transitionCode);
        }
        if (decision.targetNodeCode) {
            return transitions.find(transition => transition.target === decision.targetNodeCode);
        }
        let context = Object.assign({}, body && body.context || {}, decision);
        let matched = transitions.find(transition => {
            let condition = transition.condition || {};
            if (!condition.field) return false;
            return context[condition.field] === condition.equals;
        });
        return matched || transitions.find(transition => transition.default === true) || transitions[0];
    },

    /**
     * Finds the next transition target for a source node.
     *
     * @param {Object} graph Published graph.
     * @param {string} sourceNodeCode Source node code.
     * @param {Object} body Runtime request body.
     * @returns {Object|undefined} Next target node.
     */
    nextNode: function (graph, sourceNodeCode, body) {
        let transition = this.resolveTransition(graph, sourceNodeCode, body || {});
        return transition ? this.findNode(graph, transition.target) : undefined;
    },

    /**
     * Resolves the first executable node after START.
     *
     * @param {Object} graph Published graph.
     * @returns {Object|undefined} First runtime node.
     */
    firstRuntimeNode: function (graph) {
        let startNode = (graph.nodes || []).find(node => node && node.type === 'START');
        return startNode ? this.nextNode(graph, startNode.code) : undefined;
    },

    /**
     * Creates an audit event with bounded metadata.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} model Audit model.
     * @returns {Promise<Object>} Saved audit model.
     */
    audit: async function (request, model) {
        let auditModel = Object.assign({
            active: true,
            actor: this.getActor(request),
            outcome: 'success'
        }, model || {});
        let response = await this.auditService().save(this.serviceRequest(request, { model: auditModel }));
        return response.result || response;
    },

    /**
     * Creates an OPEN human task for the current instance node.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} instance Process instance.
     * @param {Object} node Task node.
     * @param {Object} body Runtime request body.
     * @returns {Promise<Object>} Saved task.
     */
    createTaskForNode: async function (request, instance, node, body) {
        let taskModel = {
            code: body.taskCode || this.runtimeCode(instance.code + '-' + node.code),
            active: true,
            name: node.name || node.code,
            instanceCode: instance.code,
            nodeCode: node.code,
            assignee: body.assignee || node.assignee || (node.assignment && node.assignment.assignee),
            status: 'OPEN',
            dueAt: body.dueAt
        };
        let response = await this.taskService().save(this.serviceRequest(request, { model: taskModel }));
        await this.audit(request, {
            definitionCode: instance.definitionCode,
            instanceCode: instance.code,
            eventType: 'process.task.created',
            metadata: { taskCode: taskModel.code, nodeCode: node.code, assignee: taskModel.assignee }
        });
        return response.result || response;
    },

    /**
     * Records that the runtime entered a backend-supported graph node.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} instance Process instance.
     * @param {Object} version Published definition version.
     * @param {Object} node Runtime node.
     * @param {Object} [metadata] Additional bounded metadata.
     * @returns {Promise<Object>} Saved audit event.
     */
    auditNodeEntered: async function (request, instance, version, node, metadata) {
        return this.audit(request, {
            definitionCode: instance.definitionCode,
            instanceCode: instance.code,
            eventType: 'process.node.entered',
            metadata: Object.assign({ version: version.version, nodeCode: node && node.code, nodeType: node && node.type }, metadata || {})
        });
    },

    /**
     * Executes an ACTION node through the configured declarative adapter
     * registry and records the outcome.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} instance Process instance.
     * @param {Object} version Published definition version.
     * @param {Object} node ACTION node.
     * @param {Object} body Runtime request body.
     * @returns {Promise<Object>} Adapter execution summary.
     */
    executeActionNode: async function (request, instance, version, node, body) {
        let registry = this.actionAdapterRegistryService();
        if (!registry || typeof registry.execute !== 'function') {
            throw new CLASSES.NodicsError('ERR_PROCESS_00019', 'Process action adapter registry is unavailable');
        }
        try {
            let result = await registry.execute(request, {
                instance: instance,
                version: version,
                node: node,
                context: instance.context || {},
                decision: body && body.decision || {},
                payload: body && (body.actionPayload || body.payload) || {}
            });
            await this.audit(request, {
                definitionCode: instance.definitionCode,
                instanceCode: instance.code,
                eventType: 'process.action.executed',
                metadata: { nodeCode: node.code, adapter: node.action && node.action.moduleName + '.' + node.action.operation, status: result && result.status }
            });
            return result;
        } catch (error) {
            await this.audit(request, {
                definitionCode: instance.definitionCode,
                instanceCode: instance.code,
                eventType: 'process.action.failed',
                outcome: 'failure',
                metadata: { nodeCode: node.code, errorCode: error.code || 'ERR_PROCESS_00019' }
            });
            throw error;
        }
    },

    /**
     * Fails an instance and creates a Process-owned recovery incident after an
     * ACTION adapter failure. Business compensation remains domain-owned.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} instance Process instance.
     * @param {Object} version Published process version.
     * @param {Object} node Failed ACTION node.
     * @param {Error} error Adapter failure.
     * @param {Object} body Runtime request body.
     * @returns {Promise<Object>} Created incident.
     */
    openIncident: async function (request, instance, version, node, error, body) {
        let policy = this.retryPolicy(node);
        let failedAt = new Date();
        let incident = {
            code: this.runtimeCode(instance.code + '-incident'),
            active: true,
            name: 'Recovery incident for ' + instance.code,
            instanceCode: instance.code,
            definitionCode: instance.definitionCode,
            version: instance.version,
            nodeCode: node.code,
            status: policy.maximumAttempts > 1 ? 'OPEN' : 'DEAD_LETTER',
            errorCode: error.code || 'ERR_PROCESS_00019',
            attempt: 1,
            maximumAttempts: policy.maximumAttempts,
            nextRetryAt: policy.maximumAttempts > 1 ? new Date(failedAt.getTime() + policy.delayMs) : undefined,
            adapter: node.action || {},
            compensationAdapter: node.compensation || {},
            correlationId: body && body.correlationId,
            evidence: { failureStage: 'ACTION_EXECUTION' },
            lastErrorAt: failedAt
        };
        let saved = await this.incidentService().save(this.serviceRequest(request, { model: incident }));
        incident = saved.result || saved;
        await this.instanceService().update(this.serviceRequest(request, {
            query: { code: instance.code },
            model: { $set: { status: 'FAILED', currentNode: node.code, incidentCode: incident.code, failureCode: incident.errorCode, compensationStatus: node.compensation ? 'PENDING' : 'NONE' } }
        }));
        await this.audit(request, {
            definitionCode: instance.definitionCode,
            instanceCode: instance.code,
            eventType: 'process.incident.opened',
            outcome: 'failure',
            metadata: { incidentCode: incident.code, nodeCode: node.code, errorCode: incident.errorCode, maximumAttempts: incident.maximumAttempts }
        });
        return incident;
    },

    /**
     * Moves an instance to the next backend-supported runtime node.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} instance Process instance.
     * @param {Object} version Published definition version.
     * @param {Object} node Target node.
     * @param {Object} body Runtime request body.
     * @returns {Promise<Object>} Updated runtime summary.
     */
    enterNode: async function (request, instance, version, node, body) {
        if (!node || node.type === 'END') {
            let completedAt = new Date();
            await this.instanceService().update(this.serviceRequest(request, {
                query: { code: instance.code },
                model: { $set: { status: 'COMPLETED', currentNode: node && node.code || instance.currentNode, completedAt: completedAt } }
            }));
            await this.audit(request, {
                definitionCode: instance.definitionCode,
                instanceCode: instance.code,
                eventType: 'process.instance.completed',
                metadata: { version: version.version, nodeCode: node && node.code }
            });
            return { instance: Object.assign({}, instance, { status: 'COMPLETED', currentNode: node && node.code || instance.currentNode, completedAt: completedAt }) };
        }
        await this.auditNodeEntered(request, instance, version, node);
        if (node.type === 'TASK') {
            await this.instanceService().update(this.serviceRequest(request, {
                query: { code: instance.code },
                model: { $set: { status: 'WAITING', currentNode: node.code } }
            }));
            let updatedInstance = Object.assign({}, instance, { status: 'WAITING', currentNode: node.code });
            let task = await this.createTaskForNode(request, updatedInstance, node, body);
            return { instance: updatedInstance, task: task };
        }
        if (node.type === 'DECISION') {
            let transition = this.resolveTransition(version.graph || {}, node.code, body || {});
            if (!transition) throw new CLASSES.NodicsError('ERR_PROCESS_00021', 'Process decision could not resolve a transition');
            await this.audit(request, {
                definitionCode: instance.definitionCode,
                instanceCode: instance.code,
                eventType: 'process.decision.evaluated',
                metadata: { nodeCode: node.code, transitionCode: transition.code, targetNodeCode: transition.target }
            });
            return this.enterNode(request, instance, version, this.findNode(version.graph || {}, transition.target), body);
        }
        if (node.type === 'ACTION') {
            try {
                await this.executeActionNode(request, instance, version, node, body || {});
            } catch (error) {
                await this.openIncident(request, instance, version, node, error, body || {});
                throw error;
            }
            return this.enterNode(request, instance, version, this.nextNode(version.graph || {}, node.code, body), body);
        }
        if (node.type === 'TIMER') {
            await this.audit(request, {
                definitionCode: instance.definitionCode,
                instanceCode: instance.code,
                eventType: 'process.timer.observed',
                metadata: { nodeCode: node.code, timer: node.timer || {} }
            });
            return this.enterNode(request, instance, version, this.nextNode(version.graph || {}, node.code, body), body);
        }
        if (node.type === 'SUB_PROCESS') {
            await this.audit(request, {
                definitionCode: instance.definitionCode,
                instanceCode: instance.code,
                eventType: 'process.subProcess.referenced',
                metadata: { nodeCode: node.code, definitionCode: node.subProcessDefinitionCode || (node.subProcess && node.subProcess.definitionCode) }
            });
            return this.enterNode(request, instance, version, this.nextNode(version.graph || {}, node.code, body), body);
        }
        throw new CLASSES.NodicsError('ERR_PROCESS_00018', 'Unsupported process runtime node type');
    },

    /**
     * Starts a published process definition and creates the first task when needed.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Started instance and first task summary.
     */
    startInstance: async function (request) {
        let body = this.bodyOf(request);
        let version = await this.resolveStartVersion(request, body);
        let instanceModel = {
            code: body.instanceCode || this.runtimeCode(version.definitionCode),
            active: true,
            name: body.name || version.name || version.definitionCode,
            definitionCode: version.definitionCode,
            version: version.version,
            status: 'RUNNING',
            context: body.context || {},
            currentNode: 'start',
            startedAt: new Date()
        };
        let saved = await this.instanceService().save(this.serviceRequest(request, { model: instanceModel }));
        let instance = saved.result || saved;
        await this.audit(request, {
            definitionCode: instance.definitionCode,
            instanceCode: instance.code,
            eventType: 'process.instance.started',
            metadata: { version: instance.version }
        });
        let entered = await this.enterNode(request, instance, version, this.firstRuntimeNode(version.graph || {}), body);
        return { code: 'SUC_PROCESS_00007', data: entered };
    },

    /**
     * Loads a process task by code.
     *
     * @param {Object} request Nodics request context.
     * @param {string} taskCode Task code.
     * @returns {Promise<Object>} Process task.
     */
    requireTask: async function (request, taskCode) {
        let response = await this.taskService().get(this.serviceRequest(request, {
            query: { code: this.assertCode(taskCode) },
            searchOptions: { limit: 1 }
        }));
        let task = response && response.result && response.result[0];
        if (!task) throw new CLASSES.NodicsError('ERR_PROCESS_00008', 'Process task was not found');
        return task;
    },

    /**
     * Loads a process instance by code.
     *
     * @param {Object} request Nodics request context.
     * @param {string} instanceCode Instance code.
     * @returns {Promise<Object>} Process instance.
     */
    requireInstance: async function (request, instanceCode) {
        let response = await this.instanceService().get(this.serviceRequest(request, {
            query: { code: this.assertCode(instanceCode) },
            searchOptions: { limit: 1 }
        }));
        let instance = response && response.result && response.result[0];
        if (!instance) throw new CLASSES.NodicsError('ERR_PROCESS_00007', 'Process instance was not found');
        return instance;
    },

    /** Loads one Process-owned recovery incident. */
    requireIncident: async function (request, incidentCode) {
        let response = await this.incidentService().get(this.serviceRequest(request, {
            query: { code: this.assertCode(incidentCode) }, searchOptions: { limit: 1 }
        }));
        let incident = response && response.result && response.result[0];
        if (!incident) throw new CLASSES.NodicsError('ERR_PROCESS_00022', 'Process recovery incident was not found');
        return incident;
    },

    /** Retries the failed ACTION of one Process instance under bounded policy. */
    retryInstance: async function (request) {
        let body = this.bodyOf(request);
        let instance = await this.requireInstance(request, request.instanceCode || body.instanceCode);
        if (instance.status !== 'FAILED' || !instance.incidentCode) throw new CLASSES.NodicsError('ERR_PROCESS_00023', 'Process instance is not retryable');
        let incident = await this.requireIncident(request, instance.incidentCode);
        if (!['OPEN', 'DEAD_LETTER'].includes(incident.status) || incident.attempt >= incident.maximumAttempts) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00023', 'Process incident retry policy is exhausted');
        }
        if (body.expectedAttempt !== undefined && Number(body.expectedAttempt) !== incident.attempt) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00024', 'Process incident changed; refresh before retrying');
        }
        let version = await this.requireVersion(request, instance.definitionCode, instance.version);
        let node = this.findNode(version.graph || {}, incident.nodeCode);
        if (!node || node.type !== 'ACTION') throw new CLASSES.NodicsError('ERR_PROCESS_00023', 'Process incident ACTION node is unavailable');
        let nextAttempt = incident.attempt + 1;
        let claimed = await this.incidentService().update(this.serviceRequest(request, { query: { code: incident.code, attempt: incident.attempt, status: incident.status }, model: { $set: { status: 'RETRYING', attempt: nextAttempt } } }));
        let claimedCount = claimed && claimed.result && (claimed.result.nModified !== undefined ? claimed.result.nModified : claimed.result.n);
        if (claimedCount === 0) throw new CLASSES.NodicsError('ERR_PROCESS_00024', 'Process incident changed; refresh before retrying');
        await this.instanceService().update(this.serviceRequest(request, { query: { code: instance.code, status: 'FAILED' }, model: { $set: { status: 'RUNNING', retryCount: nextAttempt - 1 } } }));
        try {
            await this.executeActionNode(request, instance, version, node, body);
            let resolvedAt = new Date();
            await this.incidentService().update(this.serviceRequest(request, { query: { code: incident.code, attempt: nextAttempt }, model: { $set: { status: 'RESOLVED', resolvedAt: resolvedAt, nextRetryAt: undefined } } }));
            await this.audit(request, { definitionCode: instance.definitionCode, instanceCode: instance.code, eventType: 'process.incident.resolved', metadata: { incidentCode: incident.code, attempt: nextAttempt } });
            let entered = await this.enterNode(request, Object.assign({}, instance, { status: 'RUNNING', retryCount: nextAttempt - 1 }), version, this.nextNode(version.graph || {}, node.code, body), body);
            return { code: 'SUC_PROCESS_00012', data: Object.assign({ incident: Object.assign({}, incident, { status: 'RESOLVED', attempt: nextAttempt, resolvedAt: resolvedAt }) }, entered) };
        } catch (error) {
            let policy = this.retryPolicy(node);
            let exhausted = nextAttempt >= incident.maximumAttempts;
            let lastErrorAt = new Date();
            await this.incidentService().update(this.serviceRequest(request, { query: { code: incident.code, attempt: nextAttempt }, model: { $set: { status: exhausted ? 'DEAD_LETTER' : 'OPEN', errorCode: error.code || 'ERR_PROCESS_00019', lastErrorAt: lastErrorAt, nextRetryAt: exhausted ? undefined : new Date(lastErrorAt.getTime() + policy.delayMs) } } }));
            await this.instanceService().update(this.serviceRequest(request, { query: { code: instance.code }, model: { $set: { status: 'FAILED', failureCode: error.code || 'ERR_PROCESS_00019', retryCount: nextAttempt - 1 } } }));
            await this.audit(request, { definitionCode: instance.definitionCode, instanceCode: instance.code, eventType: exhausted ? 'process.incident.deadLettered' : 'process.incident.retryFailed', outcome: 'failure', metadata: { incidentCode: incident.code, attempt: nextAttempt, errorCode: error.code || 'ERR_PROCESS_00019' } });
            throw error;
        }
    },

    /** Executes a declarative domain-owned compensation adapter. */
    compensateInstance: async function (request) {
        let body = this.bodyOf(request);
        let instance = await this.requireInstance(request, request.instanceCode || body.instanceCode);
        if (instance.status !== 'FAILED' || !instance.incidentCode) throw new CLASSES.NodicsError('ERR_PROCESS_00025', 'Process instance is not compensatable');
        let incident = await this.requireIncident(request, instance.incidentCode);
        let version = await this.requireVersion(request, instance.definitionCode, instance.version);
        let node = this.findNode(version.graph || {}, incident.nodeCode);
        if (!node || !node.compensation) throw new CLASSES.NodicsError('ERR_PROCESS_00025', 'Process node has no declarative compensation adapter');
        await this.incidentService().update(this.serviceRequest(request, { query: { code: incident.code }, model: { $set: { status: 'COMPENSATING' } } }));
        await this.instanceService().update(this.serviceRequest(request, { query: { code: instance.code }, model: { $set: { compensationStatus: 'IN_PROGRESS' } } }));
        try {
            let result = await this.actionAdapterRegistryService().execute(request, { instance: instance, version: version, node: Object.assign({}, node, { action: node.compensation }), context: instance.context || {}, payload: body.payload || {} });
            let compensatedAt = new Date();
            await this.incidentService().update(this.serviceRequest(request, { query: { code: incident.code }, model: { $set: { status: 'COMPENSATED', compensatedAt: compensatedAt } } }));
            await this.instanceService().update(this.serviceRequest(request, { query: { code: instance.code }, model: { $set: { compensationStatus: 'COMPLETED' } } }));
            await this.audit(request, { definitionCode: instance.definitionCode, instanceCode: instance.code, eventType: 'process.incident.compensated', metadata: { incidentCode: incident.code, adapter: node.compensation.moduleName + '.' + node.compensation.operation } });
            return { code: 'SUC_PROCESS_00013', data: { instanceCode: instance.code, incidentCode: incident.code, compensationStatus: 'COMPLETED', result: result } };
        } catch (error) {
            await this.incidentService().update(this.serviceRequest(request, { query: { code: incident.code }, model: { $set: { status: 'DEAD_LETTER', errorCode: error.code || 'ERR_PROCESS_00019' } } }));
            await this.instanceService().update(this.serviceRequest(request, { query: { code: instance.code }, model: { $set: { compensationStatus: 'FAILED' } } }));
            await this.audit(request, { definitionCode: instance.definitionCode, instanceCode: instance.code, eventType: 'process.incident.compensationFailed', outcome: 'failure', metadata: { incidentCode: incident.code, errorCode: error.code || 'ERR_PROCESS_00019' } });
            throw error;
        }
    },

    /**
     * Claims an open task for the authenticated actor or provided assignee.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Claimed task summary.
     */
    claimTask: async function (request) {
        let body = this.bodyOf(request);
        let task = await this.requireTask(request, request.taskCode || body.taskCode);
        if (task.status !== 'OPEN') throw new CLASSES.NodicsError('ERR_PROCESS_00012', 'Process task transition is not allowed');
        let assignee = body.assignee || this.getActor(request);
        await this.taskService().update(this.serviceRequest(request, {
            query: { code: task.code, status: 'OPEN' },
            model: { $set: { status: 'CLAIMED', assignee: assignee } }
        }));
        await this.audit(request, {
            instanceCode: task.instanceCode,
            eventType: 'process.task.claimed',
            metadata: { taskCode: task.code, assignee: assignee }
        });
        return { code: 'SUC_PROCESS_00008', data: Object.assign({}, task, { status: 'CLAIMED', assignee: assignee }) };
    },

    /**
     * Assigns or reassigns an open/claimed/escalated task.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Assigned task summary.
     */
    assignTask: async function (request) {
        let body = this.bodyOf(request);
        let task = await this.requireTask(request, request.taskCode || body.taskCode);
        if (!['OPEN', 'CLAIMED', 'ESCALATED'].includes(task.status)) throw new CLASSES.NodicsError('ERR_PROCESS_00012', 'Process task transition is not allowed');
        let assignee = body.assignee;
        this.assertCode(assignee);
        await this.taskService().update(this.serviceRequest(request, {
            query: { code: task.code },
            model: { $set: { assignee: assignee } }
        }));
        await this.audit(request, {
            instanceCode: task.instanceCode,
            eventType: 'process.task.assigned',
            metadata: { taskCode: task.code, assignee: assignee }
        });
        return { code: 'SUC_PROCESS_00008', data: Object.assign({}, task, { assignee: assignee }) };
    },

    /**
     * Completes a task and advances the owning process instance.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Completed task and next runtime state.
     */
    completeTask: async function (request) {
        let body = this.bodyOf(request);
        let task = await this.requireTask(request, request.taskCode || body.taskCode);
        if (!['OPEN', 'CLAIMED', 'ESCALATED'].includes(task.status)) throw new CLASSES.NodicsError('ERR_PROCESS_00012', 'Process task transition is not allowed');
        let instance = await this.requireInstance(request, task.instanceCode);
        if (!['RUNNING', 'WAITING'].includes(instance.status)) throw new CLASSES.NodicsError('ERR_PROCESS_00013', 'Process instance transition is not allowed');
        let version = await this.requireVersion(request, instance.definitionCode, instance.version);
        let currentNode = this.findNode(version.graph || {}, task.nodeCode);
        let nextNode = currentNode ? this.nextNode(version.graph || {}, currentNode.code, body) : undefined;
        let completedAt = new Date();
        await this.taskService().update(this.serviceRequest(request, {
            query: { code: task.code },
            model: { $set: { status: 'COMPLETED', decision: body.decision || {}, completedAt: completedAt, completedBy: this.getActor(request) } }
        }));
        await this.audit(request, {
            definitionCode: instance.definitionCode,
            instanceCode: instance.code,
            eventType: 'process.task.completed',
            metadata: { taskCode: task.code, nodeCode: task.nodeCode }
        });
        let nextState = await this.enterNode(request, instance, version, nextNode, body);
        return { code: 'SUC_PROCESS_00008', data: Object.assign({ task: Object.assign({}, task, { status: 'COMPLETED', completedAt: completedAt }) }, nextState) };
    },

    /**
     * Cancels a human task without cancelling the owning instance.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Cancelled task summary.
     */
    cancelTask: async function (request) {
        let body = this.bodyOf(request);
        let task = await this.requireTask(request, request.taskCode || body.taskCode);
        if (['COMPLETED', 'CANCELLED'].includes(task.status)) throw new CLASSES.NodicsError('ERR_PROCESS_00012', 'Process task transition is not allowed');
        await this.taskService().update(this.serviceRequest(request, {
            query: { code: task.code },
            model: { $set: { status: 'CANCELLED', cancellationReason: body.reason, cancelledAt: new Date(), cancelledBy: this.getActor(request) } }
        }));
        await this.audit(request, {
            instanceCode: task.instanceCode,
            eventType: 'process.task.cancelled',
            metadata: { taskCode: task.code, reason: body.reason }
        });
        return { code: 'SUC_PROCESS_00008', data: Object.assign({}, task, { status: 'CANCELLED' }) };
    },

    /**
     * Cancels a running or waiting process instance and any open tasks.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Cancelled instance summary.
     */
    cancelInstance: async function (request) {
        let body = this.bodyOf(request);
        let instance = await this.requireInstance(request, request.instanceCode || body.instanceCode);
        if (!['CREATED', 'RUNNING', 'WAITING'].includes(instance.status)) throw new CLASSES.NodicsError('ERR_PROCESS_00013', 'Process instance transition is not allowed');
        let cancelledAt = new Date();
        await this.instanceService().update(this.serviceRequest(request, {
            query: { code: instance.code },
            model: { $set: { status: 'CANCELLED', completedAt: cancelledAt, cancellationReason: body.reason } }
        }));
        await this.taskService().update(this.serviceRequest(request, {
            query: { instanceCode: instance.code, status: 'OPEN' },
            model: { $set: { status: 'CANCELLED', cancelledAt: cancelledAt, cancellationReason: 'INSTANCE_CANCELLED' } },
            options: { recursive: true }
        }));
        await this.audit(request, {
            definitionCode: instance.definitionCode,
            instanceCode: instance.code,
            eventType: 'process.instance.cancelled',
            metadata: { reason: body.reason }
        });
        return { code: 'SUC_PROCESS_00009', data: Object.assign({}, instance, { status: 'CANCELLED', completedAt: cancelledAt }) };
    },

    /**
     * Lists Process-owned trigger metadata while preserving Cron ownership of actual jobs.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Trigger metadata list.
     */
    listTriggers: async function (request) {
        if (!this.triggerService()) return { code: 'SUC_PROCESS_00010', data: [] };
        let response = await this.triggerService().get(this.serviceRequest(request, {
            query: request.query || {},
            searchOptions: { limit: 100, sort: { code: 1 } }
        }));
        return { code: 'SUC_PROCESS_00010', data: response.result || [] };
    },

    /**
     * Creates Process-owned trigger metadata after verifying the referenced
     * definition exists. Cron remains responsible for actual job execution.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Created trigger summary.
     */
    createTrigger: async function (request) {
        let body = this.bodyOf(request);
        if (!this.triggerService()) throw new CLASSES.NodicsError('ERR_PROCESS_00014', 'Process trigger service is unavailable');
        let definitionCode = this.assertCode(body.definitionCode);
        let definition = await this.requireDefinition(request, definitionCode);
        let triggerModel = {
            code: body.code || this.runtimeCode(definitionCode + '-trigger'),
            active: body.active !== false,
            name: body.name || definition.name || definitionCode,
            definitionCode: definitionCode,
            version: body.version ? Number(body.version) : undefined,
            triggerType: body.triggerType || 'CRON',
            ownerModule: body.ownerModule || 'nodics.process',
            cronJobCode: body.cronJobCode,
            status: this.assertTriggerStatus(body.status || 'DRAFT'),
            schedule: body.schedule || {},
            lastObservedAt: new Date()
        };
        this.assertCode(triggerModel.code);
        if (triggerModel.cronJobCode) this.assertCode(triggerModel.cronJobCode);
        let response = await this.triggerService().save(this.serviceRequest(request, { model: triggerModel }));
        let trigger = response.result || response;
        await this.audit(request, {
            definitionCode: definitionCode,
            eventType: 'process.trigger.created',
            metadata: { triggerCode: trigger.code, triggerType: trigger.triggerType, cronJobCode: trigger.cronJobCode }
        });
        return { code: 'SUC_PROCESS_00010', data: trigger };
    },

    /**
     * Updates Process-owned trigger metadata without moving scheduler behavior
     * into Process or Axis.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Updated trigger summary.
     */
    updateTrigger: async function (request) {
        let body = this.bodyOf(request);
        let triggerCode = this.assertCode(request.triggerCode || body.code);
        if (!this.triggerService()) throw new CLASSES.NodicsError('ERR_PROCESS_00014', 'Process trigger service is unavailable');
        let allowed = ['name', 'version', 'triggerType', 'cronJobCode', 'status', 'schedule', 'active'];
        let update = {};
        allowed.forEach(key => {
            if (Object.prototype.hasOwnProperty.call(body, key)) update[key] = body[key];
        });
        let existingTrigger = await this.requireTrigger(request, triggerCode);
        if (existingTrigger.status === 'ARCHIVED') throw new CLASSES.NodicsError('ERR_PROCESS_00017', 'Archived process trigger cannot be updated');
        if (update.cronJobCode) this.assertCode(update.cronJobCode);
        if (update.status) this.assertTriggerStatus(update.status);
        update.lastObservedAt = new Date();
        await this.triggerService().update(this.serviceRequest(request, {
            query: { code: triggerCode },
            model: { $set: update }
        }));
        await this.audit(request, {
            eventType: 'process.trigger.updated',
            metadata: { triggerCode: triggerCode, status: update.status, cronJobCode: update.cronJobCode }
        });
        return { code: 'SUC_PROCESS_00010', data: Object.assign({ code: triggerCode }, update) };
    },

    /**
     * Archives trigger metadata rather than deleting it so operations teams can
     * retain evidence of schedule relationships.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Archived trigger summary.
     */
    archiveTrigger: async function (request) {
        let triggerCode = this.assertCode(request.triggerCode || this.bodyOf(request).code);
        let existingTrigger = await this.requireTrigger(request, triggerCode);
        let archivedAt = new Date();
        await this.triggerService().update(this.serviceRequest(request, {
            query: { code: triggerCode },
            model: { $set: { active: false, status: 'ARCHIVED', archivedAt: archivedAt } }
        }));
        await this.audit(request, {
            eventType: 'process.trigger.archived',
            metadata: { triggerCode: triggerCode, previousStatus: existingTrigger.status }
        });
        return { code: 'SUC_PROCESS_00010', data: { code: triggerCode, active: false, status: 'ARCHIVED', archivedAt: archivedAt } };
    },

    /**
     * Executes a Process-owned trigger by starting the referenced process
     * definition. Cron or another authorized scheduler may call this endpoint,
     * but Process remains the owner of instance creation and audit evidence.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Trigger execution and started instance summary.
     */
    executeTrigger: async function (request) {
        let body = this.bodyOf(request);
        let trigger = await this.requireTrigger(request, request.triggerCode || body.triggerCode);
        if (trigger.active === false || trigger.status !== 'ACTIVE') {
            throw new CLASSES.NodicsError('ERR_PROCESS_00020', 'Process trigger is not active');
        }
        let correlationId = body.correlationId || body.idempotencyKey || this.runtimeCode(trigger.code + '-correlation');
        await this.audit(request, {
            definitionCode: trigger.definitionCode,
            eventType: 'process.trigger.execution.requested',
            metadata: {
                triggerCode: trigger.code,
                cronJobCode: trigger.cronJobCode,
                correlationId: correlationId
            }
        });
        try {
            let started = await this.startInstance(Object.assign({}, request, {
                runtimeOperation: Object.assign({}, body.runtimeOperation || {}, {
                    definitionCode: trigger.definitionCode,
                    version: body.version || trigger.version,
                    instanceCode: body.instanceCode,
                    context: Object.assign({}, body.context || {}, {
                        triggerCode: trigger.code,
                        cronJobCode: trigger.cronJobCode,
                        correlationId: correlationId
                    })
                })
            }));
            await this.audit(request, {
                definitionCode: trigger.definitionCode,
                eventType: 'process.trigger.execution.completed',
                metadata: {
                    triggerCode: trigger.code,
                    correlationId: correlationId,
                    instanceCode: started && started.data && started.data.instance && started.data.instance.code
                }
            });
            return { code: 'SUC_PROCESS_00011', data: { trigger: trigger, correlationId: correlationId, execution: started.data } };
        } catch (error) {
            await this.audit(request, {
                definitionCode: trigger.definitionCode,
                eventType: 'process.trigger.execution.failed',
                outcome: 'failure',
                metadata: { triggerCode: trigger.code, correlationId: correlationId, errorCode: error.code || 'ERR_PROCESS_00020' }
            });
            throw error;
        }
    },

    /**
     * Reads an instance together with tasks and audit timeline.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Aggregated runtime detail.
     */
    getInstanceDetail: async function (request) {
        let instance = await this.requireInstance(request, request.instanceCode);
        let tasks = await this.taskService().get(this.serviceRequest(request, {
            query: { instanceCode: instance.code },
            searchOptions: { limit: 100, sort: { createdAt: 1 } }
        }));
        let auditEvents = await this.auditService().get(this.serviceRequest(request, {
            query: { instanceCode: instance.code },
            searchOptions: { limit: 100, sort: { createdAt: 1 } }
        }));
        return {
            code: 'SUC_PROCESS_00000',
            data: {
                instance: instance,
                tasks: tasks.result || [],
                auditEvents: auditEvents.result || []
            }
        };
    }
};
