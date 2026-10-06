/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module copilotKnowledge/service/DefaultCopilotKnowledgeWorkflowService
 * @description Performs one approved source refresh behind an existing Process single-use remote action; Process/Cronjob retain schedules, claims, history and recovery.
 * @layer service @owner copilotKnowledge
 * @override Preserve runtime identity, published definition selection, exact source fingerprint, service source authorization and no blind retry.
 */
module.exports = {
    /** Raises a safe failure without returning provider or claim payloads. @returns {never} Throws. */
    fail: function () {
        throw new CLASSES.NodicsError('ERR_CPK_00017');
    },
    /** Validates source intent plus inert Process/Cron provenance; transport metadata never grants source authority. @param {Object} input Persisted Process context. @param {Object} context Verified scope. @returns {void} Throws for arbitrary fields or foreign schedule metadata. */
    validateContext: function (input, context) {
        const metadata = [
            'triggerCode',
            'cronJobCode',
            'correlationId',
            'source',
            'cronJobTenant',
            'scheduledExpression',
            'firedAt',
        ];
        if (
            !input ||
            typeof input !== 'object' ||
            Array.isArray(input) ||
            Object.keys(input).some(
                (key) =>
                    ![
                        'sourceCode',
                        'expectedPolicyDigest',
                        ...metadata,
                    ].includes(key),
            ) ||
            typeof input.sourceCode !== 'string' ||
            !/^[a-f0-9]{64}$/.test(input.expectedPolicyDigest || '') ||
            metadata.some(
                (key) =>
                    input[key] !== undefined &&
                    (typeof input[key] !== 'string' ||
                        !input[key].trim() ||
                        input[key].length > 256),
            ) ||
            (input.source !== undefined && input.source !== 'cronjob') ||
            (input.cronJobTenant !== undefined &&
                input.cronJobTenant !== context.tenant) ||
            (input.firedAt !== undefined &&
                !Number.isFinite(Date.parse(input.firedAt)))
        )
            this.fail();
    },
    /** Derives source authority exclusively from a router-verified workflow runtime. @param {Object} request Trusted callback. @returns {Object} Runtime principal and policy context. */
    identity: function (request) {
        const auth = SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(
            request,
            'workflow',
        );
        const context =
            SERVICE.DefaultCopilotPolicyService.normalizeSecurityContext(
                {
                    channel: 'SYSTEM',
                    principalType: 'SERVICE',
                    actor: auth.serviceId,
                    tenant: request.tenant,
                    enterprise: auth.entCode,
                    customerProject: auth.runtimeScope.projectCode,
                    environment: auth.runtimeScope.environmentCode,
                    permissions: auth.permissions,
                    roles: auth.roles,
                    groups: auth.groups,
                },
                CONFIG.get('copilot')?.policy,
            );
        if (
            !SERVICE.DefaultCopilotPolicyService.hasPermission(
                context,
                'copilot.knowledge.source.manage',
            )
        )
            this.fail();
        return { auth, context };
    },
    /** Validates approved source/definition scope and fresh source visibility, independently of Process start permission. @param {Object} execution Claimed authoritative execution. @param {Object} context Verified service context. @returns {Object} Current source. */
    source: function (execution, context) {
        const configuration = CONFIG.get('copilot') || {};
        const settings = configuration.knowledge?.workflowRefresh;
        const instance = execution?.instance;
        const input = instance?.context;
        if (
            configuration.api?.enabled !== true ||
            settings?.enabled !== true ||
            !Array.isArray(settings.assignments) ||
            settings.assignments.length > 100 ||
            !input
        )
            this.fail();
        this.validateContext(input, context);
        const matches = settings.assignments.filter(
            (item) =>
                item.tenantCode === context.tenant &&
                item.enterpriseCode === context.enterprise &&
                item.projectCode === context.customerProject &&
                item.environmentCode === context.environment &&
                item.definitionCode === instance.definitionCode &&
                item.version === instance.version &&
                item.sourceCode === input.sourceCode,
        );
        if (
            matches.length !== 1 ||
            !Number.isSafeInteger(matches[0].version) ||
            matches[0].version < 1
        )
            this.fail();
        const runtime = SERVICE.DefaultCopilotKnowledgeRuntimeService;
        const registry = runtime.registry(configuration);
        const groups = configuration.knowledge.groups;
        const scope =
            groups?.enabled === true
                ? SERVICE.DefaultCopilotKnowledgeGroupService.resolve(
                      registry,
                      groups,
                      context,
                      SERVICE.DefaultCopilotPolicyService,
                      configuration.policy,
                      undefined,
                      true,
                  ).registry
                : registry;
        const source = scope.sources.find(
            (item) => item.code === input.sourceCode && item.enabled,
        );
        if (
            !source ||
            ['DATABASE', 'EXTERNAL_LOG'].includes(source.sourceType) ||
            source.sourcePolicyDigest !== input.expectedPolicyDigest ||
            !SERVICE.DefaultCopilotPolicyService.decideSourceAccess(
                source,
                context,
                configuration.policy,
            ).allowed
        )
            this.fail();
        return source;
    },
    /** Claims one opaque published action and refreshes its exact source once; an uncertain claim or write never retries. @param {Object} request Verified runtime callback with two opaque handles. @returns {Promise<Object>} Minimized Process result. */
    refresh: async function (request) {
        try {
            const { auth, context } = this.identity(request);
            const input = request.body || {};
            const settings = CONFIG.get('copilot')?.knowledge?.workflowRefresh;
            const target = settings?.actionAuthority;
            if (
                settings?.enabled !== true ||
                !target ||
                !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(
                    target.connectionName || '',
                ) ||
                target.connectionName === 'default' ||
                !/^[A-Za-z][A-Za-z0-9_-]{0,63}$/.test(
                    target.runtimeRole || '',
                ) ||
                !Number.isSafeInteger(target.timeoutMs) ||
                target.timeoutMs < 1 ||
                target.timeoutMs > 30000 ||
                Object.keys(input).length !== 2 ||
                Object.keys(input).some(
                    (key) => !['instanceCode', 'executionCode'].includes(key),
                ) ||
                typeof input.instanceCode !== 'string' ||
                !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,191}$/.test(
                    input.instanceCode,
                ) ||
                !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(
                    input.executionCode || '',
                )
            )
                this.fail();
            const response = await SERVICE.DefaultModuleService.invokeModule({
                moduleName: 'workflow',
                connectionName: target.connectionName,
                targetAuthority: { runtimeRole: target.runtimeRole },
                local: false,
                tenant: request.tenant,
                header: { tenant: request.tenant },
                methodName: 'POST',
                apiName:
                    '/instances/' +
                    encodeURIComponent(input.instanceCode) +
                    '/actions/claim',
                requestBody: {
                    executionCode: input.executionCode,
                    actionKey: 'copilotApi.refreshKnowledge',
                    sourceRuntimeInstanceId: auth.runtimeInstanceId,
                },
                timeoutMs: target.timeoutMs,
                maxAttempts: 1,
            });
            if (
                !/^SUC_/.test(response?.code || '') ||
                [response, response?.data].some(
                    (value) =>
                        !value ||
                        Array.isArray(value) ||
                        value.error ||
                        value.success === false ||
                        value.acknowledged === false ||
                        (value.errors !== undefined &&
                            (!Array.isArray(value.errors) ||
                                value.errors.length > 0)),
                ) ||
                response.data?.executionCode !== input.executionCode ||
                response.data?.attemptRecorded !== true ||
                response.data?.instance?.code !== input.instanceCode
            )
                this.fail();
            const execution = response.data;
            const source = this.source(execution, context);
            const report =
                await SERVICE.DefaultCopilotKnowledgeRuntimeService.ingest({
                    sourceCode: source.code,
                    indexTenant: context.tenant,
                    indexVersion: source.version,
                    securityContext: context,
                    authData: request.authData,
                    assertCurrent: () =>
                        this.source(execution, this.identity(request).context),
                });
            const current = this.identity(request).context;
            if (
                this.source(execution, current).sourcePolicyDigest !==
                    source.sourcePolicyDigest ||
                report.state !== 'PROJECTED' ||
                report.sourceCode !== source.code ||
                report.sourcePolicyDigest !== source.sourcePolicyDigest
            )
                this.fail();
            return {
                status: 'COMPLETED',
                adapter: 'copilotApi.refreshKnowledge',
                output: {
                    sourceCode: source.code,
                    sourceVersion: source.version,
                    sourcePolicyDigest: source.sourcePolicyDigest,
                    filesRead: report.filesRead,
                    filesAccepted: report.filesAccepted,
                    filesRejected: report.filesRejected,
                    chunksProjected: report.chunksProjected,
                },
            };
        } catch {
            this.fail();
        }
    },
};
