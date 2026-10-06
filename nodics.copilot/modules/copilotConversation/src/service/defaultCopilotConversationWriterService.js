/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
'use strict';
const crypto = require('node:crypto');

/**
 * @module copilotConversation/service/DefaultCopilotConversationWriterService
 * @description Serializes content persistence against its active parent inside the existing database transaction owner.
 * @layer service
 * @owner copilotConversation
 * @override Preserve exact actor/tenant/enterprise binding, parent touch and content write in one transaction, no fallback, and insert-only parent creation.
 */
module.exports = {
    /** Fails without exposing parent state or database details. @returns {never} Throws. */
    fail: function () {
        throw new CLASSES.NodicsError(
            'ERR_CPC_00005',
            'Conversation write is unavailable or unconfirmed',
        );
    },
    /** Validates generated envelopes without interpreting a partial acknowledgement as success. @param {Object} response Generated result. @returns {Object} Result. */
    result: function (response) {
        if (
            !response ||
            !/^SUC_/.test(response.code || '') ||
            [response, response.result].some(
                (value) =>
                    !value ||
                    value.error ||
                    value.success === false ||
                    value.acknowledged === false ||
                    (value.errors !== undefined &&
                        (!Array.isArray(value.errors) || value.errors.length)),
            )
        )
            this.fail();
        return response.result;
    },
    /** Writes one content record after exact parent qualification, retaining opaque transaction scope through generated persistence. @param {string} name Generated content service. @param {Object} request Original trusted employee request. @param {Object} model Content model. @param {boolean} creating Whether a new parent is being created. @returns {Promise<Object>} Acknowledged generated envelope after transaction completion. */
    save: async function (name, request, model, creating = false) {
        try {
            const names = [
                'DefaultCopilotConversationRecordService',
                'DefaultCopilotTurnService',
                'DefaultCopilotMessageService',
                'DefaultCopilotEventService',
            ];
            const parentName = names[0];
            const owner = SERVICE.DefaultCopilotConversationService;
            const identity = owner.identity(request);
            const code =
                name === parentName ? model.code : model.conversationCode;
            const initialScope = JSON.stringify(identity);
            const guard = () => {
                if (
                    CONFIG.get('copilot')?.conversation?.writerFence
                        ?.enabled !== true ||
                    JSON.stringify(owner.identity(request)) !== initialScope
                )
                    this.fail();
            };
            guard();
            if (
                !names.includes(name) ||
                !model ||
                typeof code !== 'string' ||
                !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(code) ||
                !SERVICE[name]?.save ||
                !SERVICE.DefaultDatabaseTransactionService?.execute ||
                (creating && name !== parentName) ||
                (name === parentName && model.state !== 'ACTIVE') ||
                Object.entries(identity).some(
                    ([key, value]) =>
                        model[key] !== undefined && model[key] !== value,
                )
            )
                this.fail();
            return await SERVICE.DefaultDatabaseTransactionService.execute(
                { moduleName: 'copilotConversation', tenant: request.tenant },
                async (transactionContext) => {
                    const common = {
                        tenant: request.tenant,
                        authData: request.authData,
                        transactionContext,
                    };
                    guard();
                    let writerToken = crypto.randomUUID();
                    if (!creating) {
                        const rows = this.result(
                            await SERVICE[parentName].get({
                                ...common,
                                query: { code, ...identity },
                                options: { skipItemCache: true },
                                searchOptions: { pageNumber: 1, pageSize: 2 },
                            }),
                        );
                        if (!Array.isArray(rows) || rows.length !== 1)
                            this.fail();
                        const parent = rows[0];
                        if (
                            parent.code !== code ||
                            parent.state !== 'ACTIVE' ||
                            Object.entries(identity).some(
                                ([key, value]) => parent[key] !== value,
                            ) ||
                            (parent.writerToken != null &&
                                (typeof parent.writerToken !== 'string' ||
                                    !/^[a-f0-9-]{36}$/.test(
                                        parent.writerToken,
                                    )))
                        )
                            this.fail();
                        guard();
                        const touched = this.result(
                            await SERVICE[parentName].update({
                                ...common,
                                query: {
                                    code,
                                    ...identity,
                                    state: 'ACTIVE',
                                    writerToken: parent.writerToken ?? null,
                                },
                                model: { writerToken },
                            }),
                        );
                        if (touched.matchedCount !== 1) this.fail();
                    }
                    guard();
                    const record = {
                        ...model,
                        ...identity,
                        ...(name === parentName ? { writerToken } : {}),
                    };
                    const response = await SERVICE[name].save({
                        ...common,
                        model: record,
                        ...(creating ||
                        name === 'DefaultCopilotMessageService' ||
                        name === 'DefaultCopilotEventService'
                            ? { options: { insertOnly: true } }
                            : {}),
                    });
                    const saved = this.result(response);
                    if (
                        Array.isArray(saved) ||
                        saved.code !== record.code ||
                        [
                            'tenantCode',
                            'enterpriseCode',
                            'principalCode',
                            'conversationCode',
                            'turnCode',
                            'state',
                            'writerToken',
                        ].some(
                            (key) =>
                                record[key] !== undefined &&
                                saved[key] !== record[key],
                        )
                    )
                        this.fail();
                    guard();
                    return response;
                },
            );
        } catch {
            this.fail();
        }
    },
};
