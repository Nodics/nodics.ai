/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module copilotKnowledge/service/DefaultCopilotKnowledgeHistoryService
 * @description Projects persisted Process refresh execution evidence under current employee source access; never creates a parallel job store or retries work.
 * @layer service @owner copilotKnowledge
 * @override Preserve current group/source permissions, exact runtime scope and original Process definition/version identity.
 */
module.exports = {
    /** Rejects unsafe history without leaking owner responses. @returns {never} Throws. */
    fail: function () {
        throw new CLASSES.NodicsError('ERR_CPK_00017');
    },
    /** Resolves current employee source visibility and one explicitly selected published refresh definition. @param {Object} request Trusted employee request. @returns {Object} Scope and assignment. */
    authorize: function (request) {
        const configuration = CONFIG.get('copilot') || {};
        const runtime = SERVICE.DefaultCopilotKnowledgeRuntimeService;
        const context = runtime.securityContext(request, configuration);
        if (
            configuration.api?.enabled !== true ||
            context.channel !== 'EMPLOYEE' ||
            request.tenant !== context.tenant ||
            !context.enterprise ||
            !SERVICE.DefaultCopilotPolicyService.hasPermission(
                context,
                'copilot.knowledge.internal.read',
            )
        )
            this.fail();
        const source = runtime
            .groupScope(configuration, context, request.knowledgeGroupCodes)
            .registry.sources.find(
                (item) => item.code === request.sourceCode && item.enabled,
            );
        if (
            !source ||
            ['DATABASE', 'EXTERNAL_LOG'].includes(source.sourceType) ||
            !SERVICE.DefaultCopilotPolicyService.decideSourceAccess(
                source,
                context,
                configuration.policy,
            ).allowed
        )
            this.fail();
        return this.selection(source, context, configuration);
    },
    /** Resolves inert history availability from an already policy-filtered source without rebuilding the runtime registry per inventory row. @param {Object} source Authorized source. @param {Object} context Trusted context. @param {Object} configuration Effective configuration. @returns {Object} Selected Process binding, not execution authority. */
    selection: function (source, context, configuration) {
        if (
            !source?.enabled ||
            ['DATABASE', 'EXTERNAL_LOG'].includes(source.sourceType)
        )
            this.fail();
        const settings = configuration.knowledge?.workflowRefresh;
        const target = settings?.actionAuthority;
        if (
            settings?.enabled !== true ||
            !Array.isArray(settings.assignments) ||
            settings.assignments.length > 100 ||
            !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(
                target?.connectionName || '',
            ) ||
            target.connectionName === 'default' ||
            !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(target.runtimeRole || '') ||
            !Number.isSafeInteger(target.timeoutMs) ||
            target.timeoutMs < 1 ||
            target.timeoutMs > 30000
        )
            this.fail();
        const assignments = settings.assignments.filter(
            (item) =>
                item.tenantCode === context.tenant &&
                item.enterpriseCode === context.enterprise &&
                item.projectCode === context.customerProject &&
                item.environmentCode === context.environment &&
                item.sourceCode === source.code,
        );
        if (
            !assignments.length ||
            new Set(assignments.map((item) => item.definitionCode)).size !==
                1 ||
            new Set(assignments.map((item) => item.version)).size !==
                assignments.length ||
            assignments.some(
                (item) =>
                    !Number.isSafeInteger(item.version) ||
                    item.version < 1 ||
                    !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(
                        item.definitionCode || '',
                    ),
            )
        )
            this.fail();
        return {
            source,
            context,
            assignment: structuredClone(
                assignments.reduce((latest, item) =>
                    item.version > latest.version ? item : latest,
                ),
            ),
            assignments: structuredClone(assignments).sort(
                (left, right) => left.version - right.version,
            ),
            target: structuredClone(target),
        };
    },
    /** Returns bounded durable history for the selected source and configured immutable Process version. @param {Object} request Trusted employee request. @returns {Promise<Object>} Minimized evidence, never raw context or errors. */
    history: async function (request) {
        try {
            const initial = this.authorize(request);
            const { source, context, assignment, target } = initial;
            const page = Number(request.query?.page ?? 1);
            if (
                (request.historyInstanceCode !== undefined &&
                    !/^knowledge-manual-[a-f0-9]{64}$/.test(request.historyInstanceCode)) ||
                Object.keys(request.query || {}).some(
                    (key) => key !== 'page',
                ) ||
                !Number.isSafeInteger(page) ||
                page < 1 ||
                page > 1000
            )
                this.fail();
            const scope = {
                tenantCode: context.tenant,
                enterpriseCode: context.enterprise,
                projectCode: context.customerProject,
                environmentCode: context.environment,
            };
            const response = await SERVICE.DefaultModuleService.invokeModule({
                moduleName: 'workflow',
                connectionName: target.connectionName,
                targetAuthority: { runtimeRole: target.runtimeRole },
                local: false,
                tenant: request.tenant,
                header: { tenant: request.tenant },
                methodName: 'POST',
                apiName: '/actions/history/query',
                timeoutMs: target.timeoutMs,
                maxAttempts: 1,
                requestBody: {
                    moduleName: 'copilotApi',
                    actionKey: 'copilotApi.refreshKnowledge',
                    definitionCode: assignment.definitionCode,
                    version: null,
                    historyMode: 'ATTEMPTS',
                    contextMatch: { sourceCode: source.code },
                    page,
                    expectedScope: scope,
                    ...(request.historyInstanceCode === undefined ? {} : { instanceCode: request.historyInstanceCode }),
                },
            });
            const data = response?.data;
            if (
                !/^SUC_/.test(response?.code || '') ||
                response.error ||
                response.success === false ||
                response.acknowledged === false ||
                data?.acknowledged === false ||
                data?.error || data?.success === false ||
                (data?.errors !== undefined && (!Array.isArray(data.errors) || data.errors.length)) ||
                (response.errors !== undefined &&
                    (!Array.isArray(response.errors) ||
                        response.errors.length)) ||
                data?.contractVersion !== 2 ||
                data.evidence !== 'PROCESS_ACTION_ATTEMPTS' ||
                data.page !== page ||
                data.limit !== 25 ||
                typeof data.hasMore !== 'boolean' ||
                !Array.isArray(data.items) ||
                data.items.length > 25 ||
                Object.entries(scope).some(
                    ([key, value]) => data.scope?.[key] !== value,
                )
            )
                this.fail();
            const items = data.items.map((item) => {
                SERVICE.DefaultCopilotKnowledgeWorkflowService.validateContext(
                    item.context,
                    context,
                );
                if (
                    (request.historyInstanceCode !== undefined && item.instanceCode !== request.historyInstanceCode) ||
                    item.definitionCode !== assignment.definitionCode ||
                    !Number.isSafeInteger(item.version) ||
                    item.version < 1 ||
                    item.context?.sourceCode !== source.code ||
                    !/^[a-f0-9]{64}$/.test(
                        item.context.expectedPolicyDigest || '',
                    ) ||
                    !['READY', 'CLAIMED', 'COMPLETED', 'FAILED'].includes(
                        item.status,
                    ) ||
                    !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,191}$/.test(
                        item.instanceCode || '',
                    ) ||
                    !/^[a-f0-9-]{36}$/.test(item.executionCode || '') ||
                    !Number.isFinite(item.expiresAt) ||
                    (['COMPLETED', 'FAILED'].includes(item.status) &&
                        !item.completedAt) ||
                    [item.startedAt, item.completedAt].some(
                        (value) =>
                            value !== null &&
                            (typeof value !== 'string' ||
                                !Number.isFinite(Date.parse(value))),
                    )
                )
                    this.fail();
                const currentPolicy =
                    item.context.expectedPolicyDigest ===
                    source.sourcePolicyDigest;
                const uncertain =
                    ['READY', 'CLAIMED'].includes(item.status) &&
                    item.expiresAt <= Date.now();
                return {
                    instanceCode: item.instanceCode,
                    executionCode: item.executionCode,
                    status: uncertain ? 'INSPECTION_REQUIRED' : item.status,
                    definitionVersion: item.version,
                    startedAt: item.startedAt,
                    completedAt: item.completedAt,
                    currentPolicy,
                    recovery:
                        uncertain || item.status === 'FAILED'
                            ? 'PROCESS_INSPECTION'
                            : 'NONE',
                };
            });
            const fresh = this.authorize(request);
            if (
                new Set(items.map((item) => item.executionCode)).size !==
                items.length
            )
                this.fail();
            if (
                fresh.source.sourcePolicyDigest !== source.sourcePolicyDigest ||
                JSON.stringify(fresh.assignment) !==
                    JSON.stringify(assignment) ||
                JSON.stringify(fresh.assignments) !==
                    JSON.stringify(initial.assignments) ||
                JSON.stringify(fresh.target) !== JSON.stringify(target)
            )
                this.fail();
            return {
                contractVersion: 2,
                evidence: 'PROCESS_ACTION_ATTEMPTS',
                sourceCode: source.code,
                definitionCode: assignment.definitionCode,
                definitionVersion: assignment.version,
                observedAt: new Date().toISOString(),
                page,
                limit: 25,
                hasMore: data.hasMore,
                items,
            };
        } catch {
            this.fail();
        }
    },
};
