/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const crypto = require('crypto');

/** @module copilotConversation/service/DefaultCopilotTranscriptService
 * @description Provides purpose-bound, durably audited administrative reads of recorded human/model messages.
 * @layer service @owner copilotConversation
 * @override Preserve independent authorization, current enterprise, pre-read durable audit, bounded content and no export or provider invocation.
 */
module.exports = {
    /** Resolves optional availability without disclosing protected records. @param {Object} request Trusted request. @param {Object} configuration Owner policy. @returns {boolean} Inspection allowed. */
    available: function (request, configuration) {
        const permissions = (request.authData || {}).permissions;
        return (
            configuration.transcriptInspection &&
            configuration.transcriptInspection.enabled === true &&
            Array.isArray(permissions) &&
            permissions.some((value) =>
                ['*', 'copilot.activity.transcript.read'].includes(value),
            )
        );
    },
    /** Requires both metadata and sensitive-read permissions and an explicit trusted enterprise. @param {Object} request Trusted request. @param {Object} configuration Owner policy. @returns {Object} Trusted scope. */
    scope: function (request, configuration) {
        if (!this.available(request, configuration))
            throw new CLASSES.NodicsError('ERR_CPC_00003');
        return SERVICE.DefaultCopilotActivityService.scope(request);
    },
    /** Accepts acknowledged generated reads only; failures are never empty history. @param {Object} response Generated response. @returns {Array} Rows. */
    rows: function (response) {
        if (
            !response ||
            !/^SUC_/.test(response.code || '') ||
            !Array.isArray(response.result)
        )
            throw new CLASSES.NodicsError('ERR_CPC_00005');
        return response.result;
    },
    /** Appends minimal access evidence before any transcript query. Unknown acknowledgement denies delivery, without retry. @param {Object} request Trusted request. @param {Object} scope Trusted scope. @param {Object} command Validated request. @returns {Promise<string>} Receipt identity. */
    audit: async function (request, scope, command) {
        const store = SERVICE.DefaultCopilotTranscriptAccessService;
        if (!store || typeof store.save !== 'function')
            throw new CLASSES.NodicsError('ERR_CPC_00005');
        const code = 'cta-' + crypto.randomUUID();
        const model = {
            code,
            active: true,
            ...scope,
            principalCode: request.authData.loginId,
            conversationCode: command.conversationCode,
            purpose: command.purpose,
            page: command.page,
            occurredAt: new Date().toISOString(),
            outcome: 'READ_AUTHORIZED',
            accessType: command.accessType || 'TRANSCRIPT',
            ...(command.searchWindow ? { searchWindow: command.searchWindow } : {}),
        };
        const response = await store.save({
            tenant: request.tenant,
            authData: request.authData,
            options: { insertOnly: true },
            model,
        });
        if (
            !response ||
            !/^SUC_/.test(response.code || '') ||
            !response.result ||
            response.result.code !== code
        )
            throw new CLASSES.NodicsError('ERR_CPC_00005');
        return code;
    },
    /** Returns one explicitly requested page after permission, purpose, scope, and audit checks. @param {Object} request Trusted API command. @param {Object} configuration Conversation policy. @returns {Promise<Object>} Plain recorded-message page. */
    inspect: async function (request, configuration) {
        try {
            return await this.inspectPage(request, configuration);
        } catch (error) {
            const code = [
                'ERR_CPC_00001',
                'ERR_CPC_00003',
                'ERR_CPC_00004',
            ].includes(error && error.code)
                ? error.code
                : 'ERR_CPC_00005';
            throw new CLASSES.NodicsError(code);
        }
    },
    /** Executes the owner read after API input normalization, with errors sanitized by inspect. @param {Object} request Trusted API command. @param {Object} configuration Conversation policy. @returns {Promise<Object>} Recorded page. */
    inspectPage: async function (request, configuration) {
        const scope = this.scope(request, configuration);
        const body = request.body || {};
        const conversationCode = request.conversationCode;
        const page = body.page === undefined ? 1 : body.page;
        const policy = configuration.transcriptInspection;
        if (
            !/^[A-Za-z][A-Za-z0-9._-]{0,127}$/.test(conversationCode || '') ||
            Object.keys(body).some(
                (key) => !['purpose', 'page'].includes(key),
            ) ||
            !Number.isSafeInteger(page) ||
            page < 1 ||
            page > 1000 ||
            typeof body.purpose !== 'string' ||
            !Array.isArray(policy.purposes) ||
            !policy.purposes.some((value) => value.code === body.purpose)
        )
            throw new CLASSES.NodicsError('ERR_CPC_00004');
        const owner = SERVICE.DefaultCopilotConversationService;
        if (owner.assertStorage(configuration) !== 'GENERATED_SERVICE')
            throw new CLASSES.NodicsError('ERR_CPC_00005');
        const query = { ...scope, code: conversationCode };
        const conversations = this.rows(
            await SERVICE.DefaultCopilotConversationRecordService.get({
                tenant: request.tenant,
                authData: request.authData,
                query,
                searchOptions: { pageSize: 2, pageNumber: 1 },
            }),
        );
        if (
            conversations.length !== 1 ||
            !SERVICE.DefaultCopilotActivityService.matches(
                conversations[0],
                scope,
                { conversationCode },
            ) ||
            typeof conversations[0].principalCode !== 'string' ||
            !conversations[0].principalCode
        )
            throw new CLASSES.NodicsError('ERR_CPC_00003');
        const accessReceipt = await this.audit(request, scope, {
            conversationCode,
            purpose: body.purpose,
            page,
        });
        const principalCode = conversations[0].principalCode;
        const turns = this.rows(
            await SERVICE.DefaultCopilotTurnService.get({
                tenant: request.tenant,
                authData: request.authData,
                query: { ...scope, conversationCode, principalCode },
                searchOptions: {
                    pageSize: 25,
                    pageNumber: page,
                    sort: { acceptedAt: 1, code: 1 },
                },
            }),
        );
        if (
            turns.length > 25 ||
            turns.some(
                (turn) =>
                    turn.tenantCode !== scope.tenantCode ||
                    turn.enterpriseCode !== scope.enterpriseCode ||
                    turn.conversationCode !== conversationCode ||
                    turn.principalCode !== principalCode ||
                    typeof turn.code !== 'string' ||
                    !turn.code,
            ) ||
            new Set(turns.map((turn) => turn.code)).size !== turns.length
        )
            throw new CLASSES.NodicsError('ERR_CPC_00005');
        const recorded = turns
            .filter(
                (turn) => !turn.recording || turn.recording.enabled === true,
            )
            .map((turn) => turn.code);
        const messages = recorded.length
            ? this.rows(
                  await SERVICE.DefaultCopilotMessageService.get({
                      tenant: request.tenant,
                      authData: request.authData,
                      query: {
                          tenantCode: scope.tenantCode,
                          conversationCode,
                          turnCode: { $in: recorded },
                          role: { $in: ['user', 'assistant'] },
                      },
                      searchOptions: {
                          pageSize: 101,
                          pageNumber: 1,
                          sort: { sequence: 1, code: 1 },
                      },
                  }),
              )
            : [];
        if (
            messages.length > 100 ||
            messages.some(
                (message) =>
                    message.tenantCode !== scope.tenantCode ||
                    message.conversationCode !== conversationCode ||
                    !recorded.includes(message.turnCode) ||
                    !['user', 'assistant'].includes(message.role) ||
                    typeof message.content !== 'string' ||
                    !Number.isSafeInteger(message.sequence) ||
                    message.sequence < 0,
            ) ||
            Buffer.byteLength(JSON.stringify(messages)) > 262144
        )
            throw new CLASSES.NodicsError('ERR_CPC_00005');
        // Recheck current permission after asynchronous reads; no content is delivered on revocation.
        this.scope(request, configuration);
        return {
            contractVersion: 1,
            context: scope,
            conversationCode,
            principalCode,
            page,
            limit: 25,
            mayHaveMore: turns.length === 25,
            accessReceipt,
            items: turns.map((turn) => ({
                turnCode: turn.code,
                recorded: recorded.includes(turn.code),
                messages: messages
                    .filter((message) => message.turnCode === turn.code)
                    .map((message) => ({
                        role: message.role,
                        content: message.content,
                        sequence: message.sequence,
                    })),
            })),
        };
    },
};
