/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module copilotConversation/service/DefaultCopilotActivityService @description Reads bounded administrative conversation metadata within the currently authorized enterprise without granting transcript access. @layer service @owner copilotConversation @override Preserve explicit activity permission, tenant/enterprise predicates and the metadata allowlist. */
module.exports = {
    /** Validates inert metadata filters; dates use explicit UTC instants, never client timezone assumptions. @param {Object} query API query. @returns {Object} Allowlisted filters. */
    filters: function (query) {
        const result = {};
        for (const key of ['conversationCode', 'state', 'updatedFrom', 'updatedTo']) {
            if (query[key] === undefined) continue;
            const value = query[key];
            if (typeof value !== 'string' || !value.trim() || value.length > 128 ||
                (key.startsWith('updated') && (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(value) || !Number.isFinite(Date.parse(value)) ||
                    new Date(value).toISOString() !== (value.includes('.') ? value : value.replace('Z', '.000Z')))))
                throw new CLASSES.NodicsError('ERR_CPC_00002');
            result[key] = value;
        }
        if (result.updatedFrom && result.updatedTo && Date.parse(result.updatedFrom) > Date.parse(result.updatedTo))
            throw new CLASSES.NodicsError('ERR_CPC_00002');
        return result;
    },
    /** Rechecks every metadata predicate after persistence and in local-only storage. @param {Object} item Candidate. @param {Object} scope Trusted scope. @param {Object} query Validated scalar filters. @returns {boolean} Visible match. */
    matches: function (item, scope, query) {
        return item.tenantCode === scope.tenantCode && item.enterpriseCode === scope.enterpriseCode &&
            (!query.principalCode || item.principalCode === query.principalCode) &&
            (!query.conversationCode || item.code === query.conversationCode) &&
            (!query.state || item.state === query.state) &&
            (!query.updatedFrom || Date.parse(item.updatedAt) >= Date.parse(query.updatedFrom)) &&
            (!query.updatedTo || Date.parse(item.updatedAt) <= Date.parse(query.updatedTo));
    },
    /** Requires a dedicated trusted activity grant before inspecting storage. @param {Object} request Trusted request. @returns {Object} Current scope. */
    scope: function (request) {
        const auth = request.authData || {};
        if (
            !Array.isArray(auth.permissions) ||
            !auth.permissions.some((permission) =>
                ['*', 'copilot.activity.read'].includes(permission),
            )
        )
            throw new CLASSES.NodicsError('ERR_CPC_00001');
        const identity =
            SERVICE.DefaultCopilotConversationService.identity(request);
        if (!identity.enterpriseCode)
            throw new CLASSES.NodicsError('ERR_CPC_00001');
        return {
            tenantCode: identity.tenantCode,
            enterpriseCode: identity.enterpriseCode,
        };
    },
    /** Reads a fixed-size page, rejects operator-shaped filters and discards foreign persistence results. @param {Object} request Trusted request with optional query. @param {Object} configuration Conversation configuration. @returns {Promise<Object>} Metadata-only activity projection. */
    list: async function (request, configuration) {
        const scope = this.scope(request);
        const query = request.query || {};
        const page = query.page === undefined ? 1 : Number(query.page);
        const limit = 25;
        if (
            !Number.isSafeInteger(page) ||
            page < 1 ||
            page > 1000 ||
            (query.principalCode !== undefined &&
                (typeof query.principalCode !== 'string' ||
                    !query.principalCode.trim() ||
                    query.principalCode.length > 128))
        )
            throw new CLASSES.NodicsError('ERR_CPC_00002');
        const filter = { ...scope };
        const selected = this.filters(query);
        if (selected.conversationCode) filter.code = selected.conversationCode;
        if (selected.state) filter.state = selected.state;
        if (selected.updatedFrom || selected.updatedTo) {
            filter.updatedAt = {};
            if (selected.updatedFrom) filter.updatedAt.$gte = new Date(selected.updatedFrom);
            if (selected.updatedTo) filter.updatedAt.$lte = new Date(selected.updatedTo);
        }
        if (query.principalCode !== undefined)
            filter.principalCode = query.principalCode;
        const store = SERVICE.DefaultCopilotConversationService;
        const mode = store.assertStorage(configuration);
        let items;
        if (mode === 'VOLATILE_LOCAL') {
            items = [...store.state.conversations.values()].filter(
                (item) => this.matches(item, scope, { ...selected, principalCode: filter.principalCode }),
            );
            items.sort(
                (a, b) =>
                    new Date(b.updatedAt) - new Date(a.updatedAt) ||
                    String(a.code).localeCompare(String(b.code)),
            );
            items = items.slice((page - 1) * limit, page * limit);
        } else {
            items = store.items(
                await SERVICE.DefaultCopilotConversationRecordService.get({
                    tenant: request.tenant,
                    authData: request.authData,
                    query: filter,
                    searchOptions: {
                        pageNumber: page,
                        pageSize: limit,
                        sort: { updatedAt: -1, code: 1 },
                    },
                }),
            );
        }
        const records = items
            .slice(0, limit)
            .filter(
                (item) => this.matches(item, scope, { ...selected, principalCode: filter.principalCode }),
            );
        return {
            contractVersion: 1,
            context: scope,
            observedAt: new Date().toISOString(),
            page,
            limit,
            filters: selected,
            mayHaveMore: records.length >= limit,
            presentation: { ...configuration.activity.presentation },
            lifecycle: request.authData.permissions?.some(value => ['*', 'copilot.activity.lifecycle.read'].includes(value)) && configuration.lifecycle?.presentation ? { presentation: configuration.lifecycle.presentation,
                execution: SERVICE.DefaultCopilotRetentionExecutionService?.capability(request, configuration),
            } : undefined,
            items: records.map((item) => ({
                conversationCode: item.code,
                principalCode: item.principalCode,
                state: item.state,
                updatedAt: item.updatedAt,
            })),
            transcriptAccess: false,
            auditRetention: SERVICE.DefaultCopilotAuditRetentionService?.capability(request),
            contentSearch: SERVICE.DefaultCopilotRecordedSearchService?.available(request, configuration) === true ? {
                presentation: configuration.recordedSearch.presentation, maximumWindowDays: configuration.recordedSearch.maximumWindowDays,
                minimumTermLength: configuration.recordedSearch.minimumTermLength
            } : null,
            inspection: SERVICE.DefaultCopilotTranscriptService && SERVICE.DefaultCopilotTranscriptService.available(request, configuration)
                ? { purposes: configuration.transcriptInspection.purposes, presentation: configuration.transcriptInspection.presentation }
                : null,
        };
    },
};
