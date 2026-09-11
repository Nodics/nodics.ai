/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const crypto = require('node:crypto');

/** @module copilotConversation/service/DefaultCopilotConversationService @description Owns tenant-bound durable conversation, turn, message, and event persistence through generated schema services. @layer service @owner copilotConversation @override Projects may change retention and storage configuration but must preserve generated-service authority and ownership checks. */
module.exports = {
    state: { conversations: new Map(), turns: new Map(), messages: new Map(), events: new Map(), idempotency: new Map() },
    /** Creates a bounded Copilot error with a stable code without exposing provider payloads. */
    error: function (code, message) { const error = new Error(message); error.code = code; return error; },
    /** Allows local volatile storage only when both its mode and explicit enablement flag are configured. */
    isVolatile: function (configuration) { return configuration && configuration.storage === 'VOLATILE_LOCAL' && configuration.allowVolatileLocalStorage === true; },
    /** Requires the selected durable generated services or explicitly permitted local storage; missing persistence fails closed. */
    assertStorage: function (configuration) {
        if (this.isVolatile(configuration)) return 'VOLATILE_LOCAL';
        if (!configuration || configuration.storage !== 'GENERATED_SERVICE') throw this.error('COPILOT_PERSISTENCE_NOT_COMPOSED', 'Copilot durable persistence is not composed');
        ['DefaultCopilotConversationRecordService', 'DefaultCopilotTurnService', 'DefaultCopilotMessageService', 'DefaultCopilotEventService'].forEach(name => {
            if (!SERVICE[name] || typeof SERVICE[name].get !== 'function' || typeof SERVICE[name].save !== 'function') throw this.error('COPILOT_PERSISTENCE_NOT_COMPOSED', 'Copilot generated persistence service is unavailable: ' + name);
        });
        return 'GENERATED_SERVICE';
    },
    /** Requires authenticated employee identity and runtime tenant context for conversation ownership. */
    identity: function (request) {
        const auth = request.authData || {};
        if (!request.tenant || !auth.loginId) throw this.error('COPILOT_IDENTITY_REQUIRED', 'Authenticated employee and tenant are required');
        return { tenantCode: request.tenant, principalCode: auth.loginId };
    },
    /** Builds a whitespace-normalized conversation title bounded to 64 characters. */
    titleFromMessage: function (message) {
        const normalized = String(message || '').replace(/\s+/g, ' ').trim();
        if (!normalized) return undefined;
        return normalized.length <= 64 ? normalized : normalized.slice(0, 63).trimEnd() + '…';
    },
    /** Normalizes supported persistence response envelopes into a record array. */
    items: function (response) {
        const value = response && (response.result || response.data || response);
        if (Array.isArray(value)) return value;
        if (value && Array.isArray(value.items)) return value.items;
        return value ? [value] : [];
    },
    /** Saves conversation-owned records through the selected generated service with trusted tenant and actor context. */
    save: async function (name, request, model) {
        const response = await SERVICE[name].save({ tenant: request.tenant, authData: request.authData, model: model });
        return response && (response.result || response.data || response) || model;
    },
    /** Reads a bounded set of records through the generated service and normalizes its response envelope. */
    find: async function (name, request, query, limit) {
        const response = await SERVICE[name].get({ tenant: request.tenant, authData: request.authData, query: query, searchOptions: { pageSize: limit || 100, pageNumber: 1 } });
        return this.items(response);
    },
    /** Builds an active conversation record from an explicit tenant and actor context. */
    createRecord: function (context, code) {
        if (!context || !context.tenant || !context.actor) throw this.error('COPILOT_CONVERSATION_CONTEXT_REQUIRED', 'Conversation context is required');
        const now = new Date();
        return { code: code, active: true, conversationCode: code, definitionCode: 'axisAssistant', tenant: context.tenant, actor: context.actor,
            tenantCode: context.tenant, principalCode: context.actor,
            channel: context.channel || 'axis', state: 'ACTIVE', lastSequence: 0, createdAt: now, updatedAt: now };
    },
    /** Validates the message role and creates sequence-bound conversation/turn evidence. */
    createMessage: function (conversation, role, content, sequence, turnCode) {
        if (!conversation || !conversation.code || !conversation.tenantCode) throw this.error('COPILOT_CONVERSATION_REQUIRED', 'Conversation is required');
        if (!['system', 'user', 'assistant', 'tool'].includes(role)) throw this.error('COPILOT_MESSAGE_ROLE_INVALID', 'Message role is invalid');
        return { code: conversation.code + '-' + sequence, active: true, conversation: conversation.code, tenant: conversation.tenantCode,
            conversationCode: conversation.code, turnCode: turnCode, tenantCode: conversation.tenantCode,
            role: role, content: String(content || ''), sequence: sequence, createdAt: new Date() };
    },
    /** Creates a conversation in the configured storage mode for the authenticated actor. */
    create: async function (request, configuration) {
        const mode = this.assertStorage(configuration), identity = this.identity(request);
        const conversation = this.createRecord({ tenant: identity.tenantCode, actor: identity.principalCode, channel: request.channel }, 'conversation-' + crypto.randomUUID());
        conversation.definitionCode = request.definitionCode || 'axisAssistant'; conversation.title = request.title;
        if (mode === 'VOLATILE_LOCAL') { this.state.conversations.set(conversation.code, conversation); this.state.messages.set(conversation.code, []); return conversation; }
        return this.save('DefaultCopilotConversationRecordService', request, conversation);
    },
    /** Reads a conversation only when tenant and actor match; missing or foreign records return the same not-found error. */
    getOwned: async function (conversationCode, request, configuration) {
        const mode = this.assertStorage(configuration), identity = this.identity(request);
        const conversation = mode === 'VOLATILE_LOCAL' ? this.state.conversations.get(conversationCode) : (await this.find('DefaultCopilotConversationRecordService', request, { code: conversationCode }, 2))[0];
        if (!conversation || conversation.tenantCode !== identity.tenantCode || conversation.principalCode !== identity.principalCode) throw this.error('COPILOT_CONVERSATION_NOT_FOUND', 'Copilot conversation was not found');
        conversation.conversationCode = conversation.code; return conversation;
    },
    /** Lists the authenticated actor's conversations with bounded paging and optional state filtering. */
    listOwned: async function (request, configuration) {
        const mode = this.assertStorage(configuration), identity = this.identity(request), query = request.query || {};
        const page = Math.max(1, Number(query.page || 1)), limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
        let owned = mode === 'VOLATILE_LOCAL' ? Array.from(this.state.conversations.values()) : await this.find('DefaultCopilotConversationRecordService', request, { tenantCode: identity.tenantCode, principalCode: identity.principalCode }, 1000);
        owned = owned.filter(item => item.tenantCode === identity.tenantCode && item.principalCode === identity.principalCode && (!query.state || item.state === query.state)).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        return { page: page, limit: limit, items: owned.slice((page - 1) * limit, page * limit) };
    },
    /** Reuses a prior actor-scoped idempotency key or records a new accepted turn, user message and acceptance event. */
    acceptTurn: async function (conversation, request, configuration) {
        const mode = this.assertStorage(configuration);
        if (!request.idempotencyKey) throw this.error('COPILOT_IDEMPOTENCY_KEY_REQUIRED', 'Idempotency key is required');
        const identityKey = conversation.tenantCode + ':' + conversation.principalCode + ':' + request.idempotencyKey;
        let existing = mode === 'VOLATILE_LOCAL' ? (this.state.idempotency.get(identityKey) && this.state.turns.get(this.state.idempotency.get(identityKey))) : (await this.find('DefaultCopilotTurnService', request, { tenantCode: conversation.tenantCode, principalCode: conversation.principalCode, idempotencyKey: request.idempotencyKey }, 2))[0];
        if (existing) { existing.turnCode = existing.code; return existing; }
        const turnCode = 'turn-' + crypto.randomUUID();
        const turn = { code: turnCode, active: true, turnCode: turnCode, conversationCode: conversation.code, idempotencyKey: request.idempotencyKey, tenantCode: conversation.tenantCode, principalCode: conversation.principalCode, state: 'ACCEPTED', acceptedAt: new Date() };
        if (!conversation.title) conversation.title = this.titleFromMessage(request.message);
        conversation.lastSequence = Number(conversation.lastSequence || 0) + 1; conversation.updatedAt = new Date();
        const message = this.createMessage(conversation, 'user', request.message, conversation.lastSequence, turnCode);
        if (mode === 'VOLATILE_LOCAL') { this.state.turns.set(turnCode, turn); this.state.events.set(turnCode, []); this.state.idempotency.set(identityKey, turnCode); this.state.messages.get(conversation.code).push(message); }
        else { await this.save('DefaultCopilotTurnService', request, turn); await this.save('DefaultCopilotMessageService', request, message); await this.save('DefaultCopilotConversationRecordService', request, conversation); }
        await this.appendEvent(turn, 'TURN_ACCEPTED', {}, request, configuration); return turn;
    },
    /** Appends a versioned turn event with an ordered sequence in the configured storage mode. */
    appendEvent: async function (turn, eventType, data, request, configuration) {
        const mode = this.assertStorage(configuration);
        const events = mode === 'VOLATILE_LOCAL' ? this.state.events.get(turn.turnCode) || [] : await this.find('DefaultCopilotEventService', request, { turnCode: turn.turnCode }, Number(configuration.replayEventLimit || 500));
        const sequence = events.length + 1;
        const event = { code: turn.turnCode + '-' + sequence, active: true, eventCode: turn.turnCode + '-' + sequence, contractVersion: 1, conversationCode: turn.conversationCode, turnCode: turn.turnCode, eventType: eventType, sequence: sequence, createdAt: new Date(), data: data || {} };
        if (mode === 'VOLATILE_LOCAL') { events.push(event); this.state.events.set(turn.turnCode, events); } else await this.save('DefaultCopilotEventService', request, event);
        return event;
    },
    /** Reads sequence-ordered messages for an already-authorized conversation. */
    messages: async function (conversationCode, request, configuration) {
        const values = this.isVolatile(configuration) ? this.state.messages.get(conversationCode) || [] : await this.find('DefaultCopilotMessageService', request, { conversationCode: conversationCode }, 1000);
        return values.sort((a, b) => a.sequence - b.sequence);
    },
    /** Records the assistant message, usage and completion events, then persists the completed turn. */
    complete: async function (conversation, turn, content, providerResult, request, configuration) {
        const mode = this.assertStorage(configuration); conversation.lastSequence = Number(conversation.lastSequence || 0) + 1; conversation.updatedAt = new Date();
        const message = this.createMessage(conversation, 'assistant', content, conversation.lastSequence, turn.turnCode);
        if (mode === 'VOLATILE_LOCAL') this.state.messages.get(conversation.code).push(message); else { await this.save('DefaultCopilotMessageService', request, message); await this.save('DefaultCopilotConversationRecordService', request, conversation); }
        await this.appendEvent(turn, 'TEXT_DELTA', { text: content }, request, configuration); await this.appendEvent(turn, 'USAGE', { phase: 'GENERATION', usage: providerResult.usage || {} }, request, configuration);
        turn.state = 'COMPLETED'; turn.completedAt = new Date(); await this.appendEvent(turn, 'COMPLETED', { finishReason: providerResult.finishReason || 'complete' }, request, configuration);
        if (mode !== 'VOLATILE_LOCAL') await this.save('DefaultCopilotTurnService', request, turn); return turn;
    },
    /** Records a failed turn using its bounded failure code and appends a failure event. */
    fail: async function (turn, error, request, configuration) {
        const mode = this.assertStorage(configuration); turn.state = 'FAILED'; turn.failureCode = error.code || 'COPILOT_TURN_FAILED'; turn.completedAt = new Date();
        await this.appendEvent(turn, 'FAILED', { code: turn.failureCode }, request, configuration); if (mode !== 'VOLATILE_LOCAL') await this.save('DefaultCopilotTurnService', request, turn); return turn;
    },
    /** Checks conversation ownership and verifies that the requested turn belongs to that conversation. */
    getOwnedTurn: async function (conversationCode, turnCode, request, configuration) {
        await this.getOwned(conversationCode, request, configuration); const turn = this.isVolatile(configuration) ? this.state.turns.get(turnCode) : (await this.find('DefaultCopilotTurnService', request, { code: turnCode }, 2))[0];
        if (!turn || turn.conversationCode !== conversationCode) throw this.error('COPILOT_TURN_NOT_FOUND', 'Copilot turn was not found'); turn.turnCode = turn.code; return turn;
    },
    /** Returns a bounded sequence-ordered replay after validating the conversation and turn owner. */
    replayEvents: async function (conversationCode, turnCode, request, configuration) {
        await this.getOwnedTurn(conversationCode, turnCode, request, configuration); const query = request.query || {};
        const afterSequence = Math.max(0, Number(query.afterSequence || 0)), limit = Math.min(Number(configuration.replayEventLimit || 500), Math.max(1, Number(query.limit || 100)));
        const events = this.isVolatile(configuration) ? this.state.events.get(turnCode) || [] : await this.find('DefaultCopilotEventService', request, { turnCode: turnCode }, configuration.replayEventLimit || 500);
        return { afterSequence: afterSequence, limit: limit, items: events.filter(item => item.sequence > afterSequence).sort((a, b) => a.sequence - b.sequence).slice(0, limit) };
    },
    /** Builds bounded owned turn history from messages and replay events without granting access to another actor. */
    history: async function (conversationCode, request, configuration) {
        const conversation = await this.getOwned(conversationCode, request, configuration), query = request.query || {};
        const page = Math.max(1, Number(query.page || 1)), limit = Math.min(50, Math.max(1, Number(query.limit || 20)));
        const turns = this.isVolatile(configuration) ? Array.from(this.state.turns.values()).filter(item => item.conversationCode === conversationCode) : await this.find('DefaultCopilotTurnService', request, { conversationCode: conversationCode }, 1000);
        const messages = await this.messages(conversationCode, request, configuration), items = [];
        for (const turn of turns.slice((page - 1) * limit, page * limit)) {
            turn.turnCode = turn.code; const replay = await this.replayEvents(conversationCode, turn.code, Object.assign({}, request, { query: { limit: configuration.replayEventLimit || 500 } }), configuration);
            items.push({ turn: turn, messages: messages.filter(item => item.turnCode === turn.code), interactions: replay.items.filter(item => !['TURN_ACCEPTED', 'TEXT_DELTA', 'COMPLETED'].includes(item.eventType)) });
        }
        return { conversation: conversation, page: page, limit: limit, items: items, confirmations: [] };
    },
    /** Marks an owned unfinished turn cancelled, preserving completed/failed/cancelled terminal outcomes. */
    cancel: async function (conversationCode, turnCode, request, configuration) {
        const turn = await this.getOwnedTurn(conversationCode, turnCode, request, configuration);
        if (!['COMPLETED', 'FAILED', 'CANCELLED'].includes(turn.state)) { turn.state = 'CANCELLED'; await this.appendEvent(turn, 'CANCELLED', { reason: request.reason || 'Employee requested cancellation' }, request, configuration); if (!this.isVolatile(configuration)) await this.save('DefaultCopilotTurnService', request, turn); }
        return turn;
    }
};
