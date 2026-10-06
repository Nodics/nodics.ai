/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module copilotConversation/service/DefaultCopilotConversationLifecycleService
 * @description Validates governed retention/hold policy and projects metadata-only disposition candidates without deleting evidence.
 * @layer service @owner copilotConversation
 * @override Preserve enterprise scope, indefinite holds, current policy, generated persistence and disabled destructive execution.
 */
module.exports = {
    /** Resolves current enterprise policy; malformed or duplicate policies fail closed. @param {Object} configuration Conversation configuration. @param {Object} scope Trusted scope. @returns {Object} Effective policy. */
    policy: function (configuration, scope) {
        const entries = configuration?.lifecycle?.enterprisePolicies || [];
        if (
            !Array.isArray(entries) ||
            entries.length > 1000 ||
            (configuration?.lifecycle?.deletionEnabled === true &&
                configuration.writerFence?.enabled !== true)
        )
            throw new CLASSES.NodicsError('ERR_CPC_00004');
        const identities = new Set();
        for (const entry of entries) {
            if (
                !entry ||
                ![entry.tenantCode, entry.enterpriseCode].every(
                    (value) =>
                        typeof value === 'string' &&
                        value.trim() &&
                        value.length <= 128,
                ) ||
                !Number.isSafeInteger(entry.retentionDays) ||
                entry.retentionDays < 1 ||
                entry.retentionDays > 3650 ||
                typeof entry.holdAll !== 'boolean' ||
                !Array.isArray(entry.conversationCodes) ||
                entry.conversationCodes.length > 100 ||
                new Set(entry.conversationCodes).size !==
                    entry.conversationCodes.length ||
                entry.conversationCodes.some(
                    (code) =>
                        typeof code !== 'string' ||
                        !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(code),
                )
            )
                throw new CLASSES.NodicsError('ERR_CPC_00004');
            const key = JSON.stringify([
                entry.tenantCode,
                entry.enterpriseCode,
            ]);
            if (identities.has(key))
                throw new CLASSES.NodicsError('ERR_CPC_00004');
            identities.add(key);
        }
        const selected = entries.find(
            (entry) =>
                entry.tenantCode === scope.tenantCode &&
                entry.enterpriseCode === scope.enterpriseCode,
        );
        const retentionDays =
            selected?.retentionDays ?? configuration.retentionDays;
        if (
            !Number.isSafeInteger(retentionDays) ||
            retentionDays < 1 ||
            retentionDays > 3650
        )
            throw new CLASSES.NodicsError('ERR_CPC_00004');
        return {
            retentionDays,
            holdAll: selected?.holdAll === true,
            conversationCodes: [...(selected?.conversationCodes || [])],
            destructiveExecution: false,
        };
    },
    /** Requires current metadata and lifecycle permissions independently. @param {Object} request Trusted request. @returns {Object} Scope. */
    scope: function (request) {
        const scope = SERVICE.DefaultCopilotActivityService.scope(request);
        if (
            !request.authData.permissions.some((value) =>
                ['*', 'copilot.activity.lifecycle.read'].includes(value),
            )
        )
            throw new CLASSES.NodicsError('ERR_CPC_00003');
        return scope;
    },
    /** Checks held identities against canonical enterprise records before a governed proposal. @param {Object} request Trusted administrator. @param {Object} scope Trusted scope. @param {string[]} codes Proposed holds. @returns {Promise<void>} Resolves only for exact scoped identities. */
    validateHolds: async function (request, scope, codes) {
        if (!Array.isArray(codes) || codes.length > 100)
            throw new CLASSES.NodicsError('ERR_CPC_00004');
        if (!codes.length) return;
        const response =
            await SERVICE.DefaultCopilotConversationRecordService.get({
                tenant: request.tenant,
                authData: request.authData,
                query: { ...scope, code: { $in: codes } },
                searchOptions: { pageSize: 101, pageNumber: 1 },
            });
        const rows = SERVICE.DefaultCopilotTranscriptService.rows(response);
        if (
            rows.length !== codes.length ||
            new Set(rows.map((row) => row.code)).size !== codes.length ||
            rows.some(
                (row) =>
                    !codes.includes(row.code) ||
                    row.tenantCode !== scope.tenantCode ||
                    row.enterpriseCode !== scope.enterpriseCode,
            )
        )
            throw new CLASSES.NodicsError('ERR_CPC_00003');
    },
    /** Lists an oldest-first metadata window with explicit held/active/unknown distinctions; never queries transcript content. @param {Object} request Trusted request. @param {Object} configuration Conversation configuration. @returns {Promise<Object>} Non-destructive preview. */
    preview: async function (request, configuration) {
        const scope = this.scope(request);
        const policy = this.policy(configuration, scope);
        const query = request.query || {};
        const page = query.page === undefined ? 1 : Number(query.page);
        if (
            Object.keys(query).some((key) => key !== 'page') ||
            !Number.isSafeInteger(page) ||
            page < 1 ||
            page > 1000
        )
            throw new CLASSES.NodicsError('ERR_CPC_00004');
        if (
            SERVICE.DefaultCopilotConversationService.assertStorage(
                configuration,
            ) !== 'GENERATED_SERVICE'
        )
            throw new CLASSES.NodicsError('ERR_CPC_00005');
        const observedAt = new Date();
        const cutoff = new Date(
            observedAt.getTime() - policy.retentionDays * 86400000,
        );
        const response =
            await SERVICE.DefaultCopilotConversationRecordService.get({
                tenant: request.tenant,
                authData: request.authData,
                query: { ...scope },
                searchOptions: {
                    pageSize: 25,
                    pageNumber: page,
                    sort: { updatedAt: 1, code: 1 },
                },
            });
        const rows = SERVICE.DefaultCopilotTranscriptService.rows(response);
        if (
            rows.length > 25 ||
            new Set(rows.map((row) => row.code)).size !== rows.length
        )
            throw new CLASSES.NodicsError('ERR_CPC_00005');
        const items = rows.map((row) => {
            if (
                row.tenantCode !== scope.tenantCode ||
                row.enterpriseCode !== scope.enterpriseCode ||
                typeof row.code !== 'string' ||
                !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(row.code)
            )
                throw new CLASSES.NodicsError('ERR_CPC_00005');
            const at =
                row.updatedAt == null ? new Date(NaN) : new Date(row.updatedAt);
            const held =
                policy.holdAll || policy.conversationCodes.includes(row.code);
            const state = held
                ? 'HELD'
                : ['PURGING', 'PURGED', 'RETENTION_STOPPED'].includes(row.state)
                  ? row.state
                  : !Number.isFinite(at.getTime())
                    ? 'UNKNOWN'
                    : !['CLOSED', 'ARCHIVED'].includes(row.state)
                      ? 'ACTIVE'
                      : at < cutoff
                        ? 'EXPIRED_REVIEW_REQUIRED'
                        : 'WITHIN_RETENTION';
            return {
                code: row.code,
                state,
                canClose:
                    row.state === 'ACTIVE' &&
                    !row.retentionOperation &&
                    !row.lifecycleClosure,
                updatedAt: Number.isFinite(at.getTime())
                    ? at.toISOString()
                    : null,
            };
        });
        this.scope(request);
        const current = this.policy(CONFIG.get('copilot').conversation, scope);
        if (JSON.stringify(current) !== JSON.stringify(policy))
            throw new CLASSES.NodicsError('ERR_CPC_00003');
        return {
            contractVersion: 1,
            context: scope,
            page,
            limit: 25,
            mayHaveMore: rows.length === 25,
            observedAt: observedAt.toISOString(),
            cutoff: cutoff.toISOString(),
            policy,
            items,
        };
    },
};
