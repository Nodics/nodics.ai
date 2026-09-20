/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module workflow/service/DefaultProcessRemoteActionAdapterService @description Dispatches allowed actions using scoped runtime identity and a single-claim execution in the existing Process instance. @layer service @owner workflow @override Select connections and bounded timeouts; preserve authoritative execution, tenant scope and claim atomicity. */
module.exports = {
    /** Returns the existing remote action policy. */
    getPolicy: function () {
        return (CONFIG.get('process') || {}).remoteActions || {};
    },

    /** Retains generated-model tenant and actor boundaries. */
    serviceRequest: function (request, additions) {
        return Object.assign(
            { tenant: request.tenant, authData: request.authData, options: { recursive: false } },
            additions,
        );
    },

    /** Requires exactly one changed instance using the database owner's adapter normalization. */
    requireChanged: function (result) {
        if (SERVICE.DefaultModelsUpdateInitializerService.getAffectedCount(result) !== 1) {
            throw new CLASSES.NodicsError(
                'ERR_PROCESS_00019',
                'Process action execution changed or was already claimed',
            );
        }
    },

    /** Revalidates the current service credential without re-admitting an already-running workflow. */
    runtimeAuthorization: async function (request) {
        const token = NODICS.getInternalAuthToken(request.tenant);
        if (!token)
            throw new CLASSES.NodicsError(
                'ERR_PROCESS_00019',
                'Remote process action runtime authentication is unavailable',
            );
        const verified = await SERVICE.DefaultAuthorizationProviderService.authorizeToken({
            authToken: token,
        });
        const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(
            { tenant: request.tenant, authData: verified && verified.result },
            'workflow',
        );
        if (
            auth.runtimeInstanceId !== SERVICE.DefaultModuleRegistrationAgentService.getInstanceId() ||
            auth.runtimeScope.projectCode !== NODICS.getEnvironmentName() ||
            auth.runtimeScope.environmentCode !== NODICS.getSelectedEnvironmentName() ||
            auth.runtimeScope.serverCode !== NODICS.getServerName() ||
            (request.authData && request.authData.entCode && request.authData.entCode !== auth.entCode)
        ) {
            throw new CLASSES.NodicsError(
                'ERR_PROCESS_00019',
                'Process runtime credential belongs to another deployment or enterprise',
            );
        }
        return { token: token, auth: auth };
    },

    /** Persists the exact published action and completed task decision before sending an opaque callback handle. */
    begin: async function (request, execution, declaration, auth) {
        const lifecycle = SERVICE.DefaultProcessRuntimeLifecycleService;
        const instance = await lifecycle.requireInstance(
            request,
            execution && execution.instance && execution.instance.code,
        );
        const version = await lifecycle.requireVersion(request, instance.definitionCode, instance.version);
        const node = lifecycle.findNode(
            version.graph || {},
            execution && execution.node && execution.node.code,
        );
        const key = SERVICE.DefaultProcessActionAdapterRegistryService.actionKey(node && node.action);
        const allowed = SERVICE.DefaultProcessActionAdapterRegistryService.findAllowedAction(
            node && node.action,
        );
        if (
            !['RUNNING', 'WAITING'].includes(instance.status) ||
            !node ||
            node.type !== 'ACTION' ||
            !allowed ||
            !allowed.remote ||
            key !== declaration.actionKey ||
            allowed.remote.moduleName !== declaration.moduleName ||
            allowed.remote.apiName !== declaration.apiName
        ) {
            throw new CLASSES.NodicsError(
                'ERR_PROCESS_00019',
                'Published Process action execution is unavailable',
            );
        }
        const previous = instance.activeRemoteAction;
        if (
            previous &&
            ['READY', 'CLAIMED'].includes(previous.status) &&
            Number(previous.expiresAt) > Date.now()
        ) {
            throw new CLASSES.NodicsError(
                'ERR_PROCESS_00019',
                'A Process remote action is already in flight',
            );
        }
        let decision = execution.decision || (execution.body && execution.body.decision) || {};
        let task;
        if (declaration.requiresCompletedTask) {
            const query =
                previous && previous.nodeCode === node.code && previous.taskCode
                    ? { code: previous.taskCode, instanceCode: instance.code, status: 'COMPLETED' }
                    : { instanceCode: instance.code, nodeCode: instance.currentNode, status: 'COMPLETED' };
            const result = await lifecycle.taskService().get(
                this.serviceRequest(request, {
                    query: query,
                    searchOptions: { limit: 1, sort: { completedAt: -1 } },
                }),
            );
            task = result && result.result && result.result[0];
            if (!task || !task.completedAt || !task.completedBy) {
                throw new CLASSES.NodicsError(
                    'ERR_PROCESS_00019',
                    'Remote decision requires an authoritative completed Process task',
                );
            }
            // Never let a caller's callback body replace the persisted task decision.
            decision = task.decision || {};
        }
        const age = Number(this.getPolicy().maximumExecutionAgeMs);
        if (!Number.isSafeInteger(age) || age <= 0)
            throw new CLASSES.NodicsError('ERR_PROCESS_00019', 'Process action lifetime is invalid');
        const active = {
            code: require('node:crypto').randomUUID(),
            status: 'READY',
            nodeCode: node.code,
            actionKey: key,
            moduleName: declaration.moduleName,
            taskCode: task && task.code,
            context: instance.context || {},
            decision: decision,
            actor: (task && task.completedBy) || lifecycle.getActor(request),
            runtimeInstanceId: auth.runtimeInstanceId,
            runtimeScope: auth.runtimeScope,
            enterpriseCode: auth.entCode,
            expiresAt: Date.now() + age,
        };
        const query = {
            code: instance.code,
            status: instance.status,
            'activeRemoteAction.code': previous ? previous.code : { $exists: false },
        };
        this.requireChanged(
            await lifecycle.instanceService().update(
                this.serviceRequest(request, {
                    query: query,
                    model: { $set: { activeRemoteAction: active } },
                }),
            ),
        );
        return { instance: instance, active: active };
    },

    /** Sends one authenticated callback; success and failure retire its handle before a governed retry. */
    execute: async function (request, execution, declaration) {
        const policy = this.getPolicy();
        const target = (policy.targets || {})[declaration && declaration.target];
        if (
            !target ||
            !target.connectionName ||
            target.connectionName === 'default' ||
            !declaration.moduleName ||
            !declaration.apiName
        ) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00019', 'Remote process action target is unavailable');
        }
        const authorization = await this.runtimeAuthorization(request);
        const started = await this.begin(request, execution, declaration, authorization.auth);
        const handle = started.active;
        let status = 'FAILED';
        try {
            const result = await SERVICE.DefaultModuleService.invokeModule({
                moduleName: declaration.moduleName,
                connectionName: target.connectionName,
                connectionType: target.connectionType || policy.connectionType,
                targetAuthority: { runtimeRole: declaration.runtimeRole },
                local: false,
                methodName: 'POST',
                apiName: declaration.apiName,
                header: {
                    Authorization: 'Bearer ' + authorization.token,
                    tenant: request.tenant,
                    'x-enterprise-code': authorization.auth.entCode,
                },
                timeoutMs: target.timeoutMs || policy.timeoutMs,
                maxAttempts: 1,
                requestBody: { instanceCode: started.instance.code, executionCode: handle.code },
                responseSelector: (response) => (response && (response.result || response.data)) || response,
            });
            const current = await SERVICE.DefaultProcessRuntimeLifecycleService.requireInstance(
                request,
                started.instance.code,
            );
            if (
                !current.activeRemoteAction ||
                current.activeRemoteAction.code !== handle.code ||
                current.activeRemoteAction.status !== 'CLAIMED'
            ) {
                throw new CLASSES.NodicsError(
                    'ERR_PROCESS_00019',
                    'Remote domain did not claim the Process execution',
                );
            }
            status = 'COMPLETED';
            return result;
        } finally {
            this.requireChanged(
                await SERVICE.DefaultProcessInstanceService.update(
                    this.serviceRequest(request, {
                        query: { code: started.instance.code, 'activeRemoteAction.code': handle.code },
                        model: { $set: { 'activeRemoteAction.status': status } },
                    }),
                ),
            );
        }
    },

    /** Atomically grants the target runtime one use of the currently executing action, returning only Process-owned context. */
    claim: async function (request) {
        const body = request.runtimeOperation || (request.httpRequest && request.httpRequest.body) || {};
        const instance = await SERVICE.DefaultProcessRuntimeLifecycleService.requireInstance(
            request,
            request.instanceCode,
        );
        const active = instance.activeRemoteAction;
        if (
            !active ||
            !['RUNNING', 'WAITING'].includes(instance.status) ||
            active.status !== 'READY' ||
            active.code !== body.executionCode ||
            active.actionKey !== body.actionKey ||
            active.runtimeInstanceId !== body.sourceRuntimeInstanceId ||
            Number(active.expiresAt) <= Date.now()
        ) {
            throw new CLASSES.NodicsError(
                'ERR_PROCESS_00019',
                'Process action execution is unavailable, expired or already claimed',
            );
        }
        const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, active.moduleName);
        if (
            auth.runtimeScope.projectCode !== active.runtimeScope.projectCode ||
            auth.runtimeScope.environmentCode !== active.runtimeScope.environmentCode ||
            auth.entCode !== active.enterpriseCode
        ) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00019', 'Process action runtime scope does not match');
        }
        this.requireChanged(
            await SERVICE.DefaultProcessInstanceService.update(
                this.serviceRequest(request, {
                    query: {
                        code: instance.code,
                        status: instance.status,
                        'activeRemoteAction.code': active.code,
                        'activeRemoteAction.status': 'READY',
                        'activeRemoteAction.expiresAt': { $gt: Date.now() },
                    },
                    model: {
                        $set: {
                            'activeRemoteAction.status': 'CLAIMED',
                            'activeRemoteAction.claimedBy': auth.runtimeInstanceId,
                        },
                    },
                }),
            ),
        );
        return {
            code: 'SUC_PROCESS_00000',
            data: {
                instance: { code: instance.code, context: active.context },
                nodeCode: active.nodeCode,
                executionCode: active.code,
                taskCode: active.taskCode,
                actor: active.actor,
                body: { decision: active.decision },
            },
        };
    },
};
