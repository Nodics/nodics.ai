/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module copilotConversation/service/DefaultCopilotRecordedSearchService
 * @description Owns bounded literal recorded-content search with pre-read durable access receipts and canonical conversation/turn reauthorization.
 * @layer service @owner copilotConversation
 * @override Retain opt-in, independent search/inspection grants, current enterprise, literal matching, original identity and no reconstruction of unrecorded or legacy unbound messages.
 */
module.exports = {
    /** Advertises search only for independently authorized sensitive-read users. @param {Object} request Trusted identity. @param {Object} configuration Conversation policy. @returns {boolean} Available. */
    available: function (request, configuration) {
        return (
            configuration.recordedSearch?.enabled === true &&
            SERVICE.DefaultCopilotTranscriptService.available(
                request,
                configuration,
            ) &&
            Array.isArray(request.authData?.permissions) &&
            request.authData.permissions.some((value) =>
                ['*', 'copilot.activity.content.search'].includes(value),
            )
        );
    },
    /** Requires a canonical instant for a bounded query window. @param {*} value Candidate. @returns {boolean} Valid. */
    instant: function (value) {
        return (
            typeof value === 'string' &&
            Number.isFinite(Date.parse(value)) &&
            new Date(value).toISOString() === value
        );
    },
    /** Sanitizes persistence failures without returning partial content or retrying audit. @param {Object} request Trusted command. @param {Object} configuration Conversation policy. @returns {Promise<Object>} Search page. */
    search: async function (request, configuration) {
        try {
            return await this.searchPage(request, configuration);
        } catch (error) {
            throw new CLASSES.NodicsError(
                ['ERR_CPC_00001', 'ERR_CPC_00003', 'ERR_CPC_00004'].includes(
                    error.code,
                )
                    ? error.code
                    : 'ERR_CPC_00005',
            );
        }
    },
    /** Queries enterprise-bound recorded messages only after audit and validates every hit against its canonical owners. @param {Object} request Trusted command. @param {Object} configuration Conversation policy. @returns {Promise<Object>} Minimized snippets. */
    searchPage: async function (request, configuration) {
        const transcript = SERVICE.DefaultCopilotTranscriptService;
        if (!this.available(request, configuration))
            throw new CLASSES.NodicsError('ERR_CPC_00003');
        const scope = transcript.scope(request, configuration);
        const body = request.body || {};
        const policy = configuration.recordedSearch;
        const page = body.page ?? 1;
        if (
            Object.keys(body).some(
                (key) =>
                    !['term', 'from', 'to', 'purpose', 'page'].includes(key),
            ) ||
            !Number.isSafeInteger(policy.maximumWindowDays) ||
            policy.maximumWindowDays < 1 ||
            policy.maximumWindowDays > 90 ||
            !Number.isSafeInteger(policy.minimumTermLength) ||
            policy.minimumTermLength < 3 ||
            policy.minimumTermLength > 128 ||
            typeof body.term !== 'string' ||
            body.term.trim() !== body.term ||
            body.term.length < policy.minimumTermLength ||
            body.term.length > 128 ||
            /[\u0000-\u001f]/.test(body.term) ||
            !this.instant(body.from) ||
            !this.instant(body.to) ||
            Date.parse(body.to) < Date.parse(body.from) ||
            Date.parse(body.to) - Date.parse(body.from) >
                policy.maximumWindowDays * 86400000 ||
            !Number.isSafeInteger(page) ||
            page < 1 ||
            page > 1000 ||
            !configuration.transcriptInspection.purposes.some(
                (item) => item.code === body.purpose,
            )
        )
            throw new CLASSES.NodicsError('ERR_CPC_00004');
        if (
            SERVICE.DefaultCopilotConversationService.assertStorage(
                configuration,
            ) !== 'GENERATED_SERVICE'
        )
            throw new CLASSES.NodicsError('ERR_CPC_00005');
        const receipt = await transcript.audit(request, scope, {
            conversationCode: 'enterprise-search',
            purpose: body.purpose,
            page,
            accessType: 'RECORDED_SEARCH',
            searchWindow: { from: body.from, to: body.to },
        });
        // Escape regex metacharacters: the user supplies literal text, never executable query syntax.
        const literal = body.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const messages = transcript.rows(
            await SERVICE.DefaultCopilotMessageService.get({
                tenant: request.tenant,
                authData: request.authData,
                query: {
                    ...scope,
                    role: { $in: ['user', 'assistant'] },
                    content: { $regex: literal },
                    createdAt: {
                        $gte: new Date(body.from),
                        $lte: new Date(body.to),
                    },
                },
                searchOptions: {
                    pageNumber: page,
                    pageSize: 25,
                    sort: { createdAt: -1, code: 1 },
                },
            }),
        );
        if (
            messages.length > 25 ||
            Buffer.byteLength(JSON.stringify(messages)) > 262144 ||
            new Set(messages.map((item) => item.code)).size !== messages.length
        )
            throw new CLASSES.NodicsError('ERR_CPC_00005');
        const records = new Map();
        const turns = new Map();
        const items = [];
        for (const message of messages) {
            if (
                message.tenantCode !== scope.tenantCode ||
                message.enterpriseCode !== scope.enterpriseCode ||
                !['user', 'assistant'].includes(message.role) ||
                ![
                    message.code,
                    message.conversationCode,
                    message.turnCode,
                    message.principalCode,
                ].every(
                    (value) =>
                        typeof value === 'string' &&
                        value.length > 0 &&
                        value.length <= 128,
                ) ||
                typeof message.content !== 'string' ||
                !message.content.includes(body.term) ||
                !Number.isFinite(Date.parse(message.createdAt)) ||
                Date.parse(message.createdAt) < Date.parse(body.from) ||
                Date.parse(message.createdAt) > Date.parse(body.to)
            )
                throw new CLASSES.NodicsError('ERR_CPC_00005');
            if (!records.has(message.conversationCode))
                records.set(
                    message.conversationCode,
                    transcript.rows(
                        await SERVICE.DefaultCopilotConversationRecordService.get(
                            {
                                tenant: request.tenant,
                                authData: request.authData,
                                query: {
                                    ...scope,
                                    code: message.conversationCode,
                                    principalCode: message.principalCode,
                                },
                                searchOptions: { pageSize: 2, pageNumber: 1 },
                            },
                        ),
                    ),
                );
            if (!turns.has(message.turnCode))
                turns.set(
                    message.turnCode,
                    transcript.rows(
                        await SERVICE.DefaultCopilotTurnService.get({
                            tenant: request.tenant,
                            authData: request.authData,
                            query: {
                                ...scope,
                                code: message.turnCode,
                                conversationCode: message.conversationCode,
                                principalCode: message.principalCode,
                            },
                            searchOptions: { pageSize: 2, pageNumber: 1 },
                        }),
                    ),
                );
            const conversation = records.get(message.conversationCode);
            const turn = turns.get(message.turnCode);
            if (
                conversation.length !== 1 ||
                turn.length !== 1 ||
                conversation[0].code !== message.conversationCode ||
                turn[0].code !== message.turnCode ||
                turn[0].conversationCode !== message.conversationCode ||
                [conversation[0], turn[0]].some(
                    (item) =>
                        item.tenantCode !== scope.tenantCode ||
                        item.enterpriseCode !== scope.enterpriseCode ||
                        item.principalCode !== message.principalCode,
                ) ||
                turn[0].recording?.enabled === false
            )
                throw new CLASSES.NodicsError('ERR_CPC_00005');
            const start = Math.max(0, message.content.indexOf(body.term) - 80);
            items.push({
                messageCode: message.code,
                conversationCode: message.conversationCode,
                turnCode: message.turnCode,
                principalCode: message.principalCode,
                role: message.role,
                createdAt: new Date(message.createdAt).toISOString(),
                excerpt: message.content.slice(start, start + 320),
            });
        }
        if (!this.available(request, configuration))
            throw new CLASSES.NodicsError('ERR_CPC_00003');
        transcript.scope(request, configuration);
        return {
            contractVersion: 1,
            context: scope,
            page,
            limit: 25,
            mayHaveMore: messages.length === 25,
            accessReceipt: receipt,
            from: body.from,
            to: body.to,
            matching: 'CASE_SENSITIVE_LITERAL',
            coverage: 'ENTERPRISE_BOUND_RECORDED_MESSAGES_ONLY',
            items,
        };
    },
};
