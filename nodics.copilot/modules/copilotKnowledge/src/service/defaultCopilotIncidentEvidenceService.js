/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module copilotKnowledge/service/DefaultCopilotIncidentEvidenceService
 * @description Coordinates bounded live incident evidence through an observability-owned provider registered with Discovery. Never copies the lake into a static corpus.
 * @layer service @owner copilotKnowledge
 * @override Preserve current source/group authority, explicit windows, original employee context, owner audit and field minimization.
 */
module.exports = {
    /** Tests an inert bounded identifier, never a query expression. @param {*} value Candidate. @returns {boolean} Valid identifier. */
    identifier: function (value) {
        return (
            typeof value === 'string' &&
            /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(value)
        );
    },
    /** Requires a canonical UTC instant. @param {*} value Candidate. @returns {boolean} Valid instant. */
    instant: function (value) {
        return (
            typeof value === 'string' &&
            Number.isFinite(Date.parse(value)) &&
            new Date(value).toISOString() === value
        );
    },
    /** Converts every connector failure to safe unavailable evidence, never an invented empty timeline. @param {Object} request Trusted command. @param {Object} configuration Effective Copilot config. @returns {Promise<Object>} Scoped timeline. */
    query: async function (request, configuration) {
        try {
            return await this.queryEvidence(request, configuration);
        } catch (error) {
            throw new CLASSES.NodicsError(
                ['ERR_CPK_00002', 'ERR_CPK_00007'].includes(error.code)
                    ? error.code
                    : 'ERR_CPK_00015',
            );
        }
    },
    /** Validates and invokes one registered live source without model, network or database shortcuts. @param {Object} request Trusted request. @param {Object} configuration Effective config. @returns {Promise<Object>} Minimized evidence. */
    queryEvidence: async function (request, configuration) {
        const runtime = SERVICE.DefaultCopilotKnowledgeRuntimeService;
        const policy = SERVICE.DefaultCopilotPolicyService;
        const context = runtime.securityContext(request, configuration);
        if (
            context.channel !== 'EMPLOYEE' ||
            request.tenant !== context.tenant ||
            !context.enterprise ||
            !context.environment ||
            !policy.hasPermission(context, 'copilot.logs.read')
        )
            throw new CLASSES.NodicsError('ERR_CPK_00002');
        const settings = configuration.knowledge?.externalLogs;
        if (
            settings?.enabled !== true ||
            !Number.isSafeInteger(settings.maximumEvents) ||
            settings.maximumEvents < 1 ||
            settings.maximumEvents > 100 ||
            !Number.isSafeInteger(settings.maximumWindowMinutes) ||
            settings.maximumWindowMinutes < 1 ||
            settings.maximumWindowMinutes > 1440
        )
            throw new CLASSES.NodicsError('ERR_CPK_00015');
        const source = runtime
            .groupScope(configuration, context, request.knowledgeGroupCodes)
            .registry.sources.find(
                (item) =>
                    item.code === request.sourceCode &&
                    item.enabled &&
                    item.sourceType === 'EXTERNAL_LOG',
            );
        if (
            !source ||
            !policy.decideSourceAccess(source, context, configuration.policy)
                .allowed
        )
            throw new CLASSES.NodicsError('ERR_CPK_00002');
        if (
            !source.tenantScopes.includes(context.tenant) ||
            !source.enterpriseScopes.includes(context.enterprise) ||
            !source.environmentScopes.includes(context.environment)
        )
            throw new CLASSES.NodicsError('ERR_CPK_00002');
        const selection = (settings.sources || []).filter(
            (item) => item.sourceCode === source.code,
        );
        if (
            selection.length !== 1 ||
            ['runtimeCodes', 'serviceCodes', 'categoryCodes'].some(
                (key) =>
                    !Array.isArray(selection[0][key]) ||
                    !selection[0][key].length ||
                    selection[0][key].length > 100 ||
                    selection[0][key].some((value) => !this.identifier(value)),
            )
        )
            throw new CLASSES.NodicsError('ERR_CPK_00015');
        const body = request.body || {};
        if (
            Object.keys(body).some(
                (key) => !['from', 'to', 'correlationId'].includes(key),
            ) ||
            !this.instant(body.from) ||
            !this.instant(body.to) ||
            !this.identifier(body.correlationId) ||
            Date.parse(body.to) < Date.parse(body.from) ||
            Date.parse(body.to) - Date.parse(body.from) >
                settings.maximumWindowMinutes * 60000
        )
            throw new CLASSES.NodicsError('ERR_CPK_00007');
        const fields = settings.fields;
        const known = [
            'timestamp',
            'severity',
            'message',
            'correlationId',
            'runtimeCode',
            'serviceCode',
            'categoryCode',
            'operation',
            'outcome',
            'revision',
        ];
        if (
            !Array.isArray(fields) ||
            !fields.includes('timestamp') ||
            fields.length > known.length ||
            new Set(fields).size !== fields.length ||
            fields.some((field) => !known.includes(field))
        )
            throw new CLASSES.NodicsError('ERR_CPK_00015');
        const policySnapshot = JSON.stringify(settings);
        const provider = SERVICE.DefaultDiscoverySourceRegistryService.resolve(
            'COPILOT_EXTERNAL_LOG',
            source.code,
        );
        if (!provider || typeof provider.queryEvidence !== 'function')
            throw new CLASSES.NodicsError('ERR_CPK_00015');
        const scope = {
            tenantCode: context.tenant,
            enterpriseCode: context.enterprise,
            projectCode: source.project,
            environmentCode: context.environment,
        };
        const result = await provider.queryEvidence({
            tenant: request.tenant,
            authData: request.authData,
            scope,
            sourceCode: source.code,
            from: body.from,
            to: body.to,
            correlationId: body.correlationId,
            limit: settings.maximumEvents,
            runtimeCodes: selection[0].runtimeCodes.slice(),
            serviceCodes: selection[0].serviceCodes.slice(),
            categoryCodes: selection[0].categoryCodes.slice(),
            purpose: 'INCIDENT_INVESTIGATION',
            requireAudit: true,
        });
        if (
            !result ||
            !this.identifier(result.accessReceipt) ||
            typeof result.hasMore !== 'boolean' ||
            !Array.isArray(result.events) ||
            result.events.length > settings.maximumEvents ||
            !['COMPLETE', 'PARTIAL', 'UNKNOWN'].includes(result.coverage) ||
            !this.instant(result.observedAt)
        )
            throw new CLASSES.NodicsError('ERR_CPK_00015');
        const seen = new Set();
        const events = result.events
            .map((event) => {
                if (
                    !event ||
                    !this.identifier(event.code) ||
                    seen.has(event.code) ||
                    Object.entries(scope).some(
                        ([key, value]) => event[key] !== value,
                    ) ||
                    !this.instant(event.timestamp) ||
                    event.timestamp < body.from ||
                    event.timestamp > body.to ||
                    event.correlationId !== body.correlationId ||
                    !selection[0].runtimeCodes.includes(event.runtimeCode) ||
                    !selection[0].serviceCodes.includes(event.serviceCode) ||
                    !selection[0].categoryCodes.includes(event.categoryCode)
                )
                    throw new CLASSES.NodicsError('ERR_CPK_00015');
                seen.add(event.code);
                const projected = { code: event.code };
                for (const field of fields) {
                    const value = event[field];
                    if (value === undefined) continue;
                    if (
                        typeof value !== 'string' ||
                        value.length > (field === 'message' ? 2000 : 128) ||
                        !SERVICE.DefaultCopilotKnowledgeSecretInspectionService.inspect(
                            value,
                        ).safe
                    )
                        throw new CLASSES.NodicsError('ERR_CPK_00015');
                    projected[field] = value;
                }
                return projected;
            })
            .sort(
                (left, right) =>
                    left.timestamp.localeCompare(right.timestamp) ||
                    left.code.localeCompare(right.code),
            );
        if (Buffer.byteLength(JSON.stringify(events)) > 262144)
            throw new CLASSES.NodicsError('ERR_CPK_00015');
        const current = runtime.configuration();
        const currentContext = runtime.securityContext(request, current);
        const currentSource = runtime
            .groupScope(current, currentContext, request.knowledgeGroupCodes)
            .registry.sources.find(
                (item) => item.code === source.code && item.enabled,
            );
        if (
            policySnapshot !==
                JSON.stringify(current.knowledge?.externalLogs) ||
            !currentSource ||
            currentSource.sourcePolicyDigest !== source.sourcePolicyDigest ||
            !policy.hasPermission(currentContext, 'copilot.logs.read') ||
            !policy.decideSourceAccess(
                currentSource,
                currentContext,
                current.policy,
            ).allowed
        )
            throw new CLASSES.NodicsError('ERR_CPK_00002');
        return {
            contractVersion: 1,
            context: scope,
            sourceCode: source.code,
            sourcePolicyDigest: source.sourcePolicyDigest,
            observedAt: result.observedAt,
            coverage: result.coverage,
            accessReceipt: result.accessReceipt,
            from: body.from,
            to: body.to,
            latestEventAt:
                result.latestEventAt && this.instant(result.latestEventAt)
                    ? result.latestEventAt
                    : null,
            ingestionLagMs:
                Number.isSafeInteger(result.ingestionLagMs) &&
                result.ingestionLagMs >= 0
                    ? result.ingestionLagMs
                    : null,
            hasMore: result.hasMore === true,
            events,
            interpretation: 'OBSERVED_EVENTS_NOT_ROOT_CAUSE',
        };
    },
};
