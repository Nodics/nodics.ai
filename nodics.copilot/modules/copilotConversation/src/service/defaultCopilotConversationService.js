/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const crypto = require('node:crypto');
// Content exists only while its submit request is executing, never in shared replay storage.
const deliveries = new WeakMap();

/** @module copilotConversation/service/DefaultCopilotConversationService @description Owns tenant-bound durable conversation, turn, message, and event persistence through generated schema services. @layer service @owner copilotConversation @override Projects may change retention and storage configuration but must preserve generated-service authority and ownership checks. */
module.exports = {
    state: {
        conversations: new Map(),
        turns: new Map(),
        messages: new Map(),
        events: new Map(),
        idempotency: new Map(),
    },
    /** Creates a bounded Copilot error with a stable code without exposing provider payloads. */
    error: function (code, message) {
        const error = new Error(message);
        error.code = code;
        return error;
    },
    /** Resolves recording at a turn boundary from trusted effective configuration. @param {Object} configuration Owner configuration. @returns {Object} Versioned recording policy. */
    recordingPolicy: function (configuration) {
        const policy = configuration && configuration.recording;
        if (policy === undefined)
            return {
                enabled: true,
                version: 'legacy',
                notice: 'Recording enabled. Authorized administrators may review recorded content.',
            };
        if (
            !policy ||
            typeof policy.enabled !== 'boolean' ||
            typeof policy.version !== 'string' ||
            !/^[A-Za-z0-9._-]{1,64}$/.test(policy.version)
        )
            throw this.error(
                'COPILOT_RECORDING_POLICY_INVALID',
                'Recording policy is invalid',
            );
        const notice = policy.enabled
            ? policy.enabledNotice
            : policy.disabledNotice;
        if (
            notice !== undefined &&
            (typeof notice !== 'string' ||
                !notice.trim() ||
                notice.length > 500)
        )
            throw this.error(
                'COPILOT_RECORDING_POLICY_INVALID',
                'Recording policy is invalid',
            );
        return {
            enabled: policy.enabled,
            version: policy.version,
            notice:
                notice ||
                (policy.enabled
                    ? 'Recording enabled. Authorized administrators may review recorded content.'
                    : 'Content not recorded. Answers are available in this session only; lost responses and closed sessions cannot be restored.'),
        };
    },
    /** Opens a bounded request-local delivery channel, with no durable or global content cache. @param {Object} request Trusted active request. @returns {void} No return value. */
    beginDelivery: function (request) {
        deliveries.set(request, []);
    },
    /** Removes and returns transient events exactly once, including on failure cleanup. @param {Object} request Trusted active request. @returns {Array} Transient delivery events. */
    takeDelivery: function (request) {
        const events = deliveries.get(request) || [];
        deliveries.delete(request);
        return events;
    },
    /** Allows local volatile storage only when both its mode and explicit enablement flag are configured. */
    isVolatile: function (configuration) {
        return (
            configuration &&
            configuration.storage === 'VOLATILE_LOCAL' &&
            configuration.allowVolatileLocalStorage === true
        );
    },
    /** Requires the selected durable generated services or explicitly permitted local storage; missing persistence fails closed. */
    assertStorage: function (configuration) {
        if (this.isVolatile(configuration)) return 'VOLATILE_LOCAL';
        if (!configuration || configuration.storage !== 'GENERATED_SERVICE')
            throw this.error(
                'COPILOT_PERSISTENCE_NOT_COMPOSED',
                'Copilot durable persistence is not composed',
            );
        [
            'DefaultCopilotConversationRecordService',
            'DefaultCopilotTurnService',
            'DefaultCopilotMessageService',
            'DefaultCopilotEventService',
        ].forEach((name) => {
            if (
                !SERVICE[name] ||
                typeof SERVICE[name].get !== 'function' ||
                typeof SERVICE[name].save !== 'function'
            )
                throw this.error(
                    'COPILOT_PERSISTENCE_NOT_COMPOSED',
                    'Copilot generated persistence service is unavailable: ' +
                        name,
                );
        });
        return 'GENERATED_SERVICE';
    },
    /** Requires authenticated employee identity and runtime tenant context for conversation ownership. */
    identity: function (request) {
        const auth = request.authData || {};
        if (!request.tenant || !auth.loginId)
            throw this.error(
                'COPILOT_IDENTITY_REQUIRED',
                'Authenticated employee and tenant are required',
            );
        const enterpriseCode = auth.enterpriseCode || auth.entCode || null;
        if (
            enterpriseCode !== null &&
            (typeof enterpriseCode !== 'string' || !enterpriseCode.trim())
        )
            throw this.error(
                'COPILOT_IDENTITY_REQUIRED',
                'Enterprise context is invalid',
            );
        return {
            tenantCode: request.tenant,
            principalCode: auth.loginId,
            enterpriseCode: enterpriseCode,
        };
    },
    /** Builds a whitespace-normalized conversation title bounded to 64 characters. */
    titleFromMessage: function (message) {
        const normalized = String(message || '')
            .replace(/\s+/g, ' ')
            .trim();
        if (!normalized) return undefined;
        return normalized.length <= 64
            ? normalized
            : normalized.slice(0, 63).trimEnd() + '…';
    },
    /** Normalizes supported persistence response envelopes into a record array. */
    items: function (response) {
        const value =
            response && (response.result || response.data || response);
        if (Array.isArray(value)) return value;
        if (value && Array.isArray(value.items)) return value.items;
        return value ? [value] : [];
    },
    /** Saves conversation-owned records through the selected generated service with trusted tenant and actor context. */
    save: async function (name, request, model, creating = false) {
        const fenced =
            CONFIG.get('copilot')?.conversation?.writerFence?.enabled === true;
        if (fenced && !SERVICE.DefaultCopilotConversationWriterService?.save)
            throw this.error(
                'COPILOT_PERSISTENCE_UNCONFIRMED',
                'Conversation writer guard is unavailable',
            );
        const response = fenced
            ? await SERVICE.DefaultCopilotConversationWriterService.save(
                  name,
                  request,
                  model,
                  creating,
              )
            : await SERVICE[name].save({
                  tenant: request.tenant,
                  authData: request.authData,
                  model: model,
                  ...(creating ||
                  name === 'DefaultCopilotMessageService' ||
                  name === 'DefaultCopilotEventService'
                      ? { options: { insertOnly: true } }
                      : {}),
              });
        const result = response?.result;
        if (
            !response ||
            !/^SUC_/.test(response.code || '') ||
            response.error ||
            response.success === false ||
            response.acknowledged === false ||
            (response.errors !== undefined &&
                (!Array.isArray(response.errors) || response.errors.length)) ||
            !result ||
            Array.isArray(result) ||
            result.error ||
            result.success === false ||
            result.acknowledged === false ||
            (result.errors !== undefined &&
                (!Array.isArray(result.errors) || result.errors.length)) ||
            result.code !== model.code ||
            [
                'tenantCode',
                'enterpriseCode',
                'principalCode',
                'conversationCode',
                'turnCode',
                'state',
            ].some(
                (key) => model[key] !== undefined && result[key] !== model[key],
            )
        )
            throw this.error(
                'COPILOT_PERSISTENCE_UNCONFIRMED',
                'Conversation persistence was not acknowledged',
            );
        return this.publicRecord(result);
    },
    /** Removes private writer coordination from records returned to conversation clients. @param {Object} record Persisted record. @returns {Object} Public conversation data. */
    publicRecord: function (record) {
        const visible = { ...record };
        delete visible.writerToken;
        delete visible.retentionOperation;
        delete visible.lifecycleClosure;
        return visible;
    },
    /** Reads a bounded set of records through the generated service and normalizes its response envelope. */
    find: async function (name, request, query, limit) {
        const response = await SERVICE[name].get({
            tenant: request.tenant,
            authData: request.authData,
            query: query,
            options: { skipItemCache: true },
            searchOptions: { pageSize: limit || 100, pageNumber: 1 },
        });
        if (
            !response ||
            !/^SUC_/.test(response.code || '') ||
            response.error ||
            response.success === false ||
            response.acknowledged === false ||
            (response.errors !== undefined &&
                (!Array.isArray(response.errors) || response.errors.length)) ||
            !Array.isArray(response.result) ||
            response.result.length > (limit || 100) ||
            response.result.some(
                (record) =>
                    !record ||
                    typeof record !== 'object' ||
                    Array.isArray(record),
            )
        )
            throw this.error(
                'COPILOT_PERSISTENCE_UNCONFIRMED',
                'Conversation read was not acknowledged',
            );
        return response.result.map((record) => this.publicRecord(record));
    },
    /** Builds an active conversation record from an explicit tenant and actor context. */
    createRecord: function (context, code) {
        if (!context || !context.tenant || !context.actor)
            throw this.error(
                'COPILOT_CONVERSATION_CONTEXT_REQUIRED',
                'Conversation context is required',
            );
        const now = new Date();
        return {
            code: code,
            active: true,
            conversationCode: code,
            definitionCode: 'axisAssistant',
            tenant: context.tenant,
            actor: context.actor,
            tenantCode: context.tenant,
            principalCode: context.actor,
            channel: context.channel || 'axis',
            state: 'ACTIVE',
            lastSequence: 0,
            createdAt: now,
            updatedAt: now,
        };
    },
    /** Validates the message role and creates sequence-bound conversation/turn evidence. */
    createMessage: function (conversation, role, content, sequence, turnCode) {
        if (!conversation || !conversation.code || !conversation.tenantCode)
            throw this.error(
                'COPILOT_CONVERSATION_REQUIRED',
                'Conversation is required',
            );
        if (!['system', 'user', 'assistant', 'tool'].includes(role))
            throw this.error(
                'COPILOT_MESSAGE_ROLE_INVALID',
                'Message role is invalid',
            );
        return {
            code: conversation.code + '-' + sequence,
            active: true,
            conversation: conversation.code,
            tenant: conversation.tenantCode,
            conversationCode: conversation.code,
            turnCode: turnCode,
            tenantCode: conversation.tenantCode,
            role: role,
            enterpriseCode: conversation.enterpriseCode || null,
            principalCode: conversation.principalCode,
            content: String(content || ''),
            sequence: sequence,
            createdAt: new Date(),
        };
    },
    /** Creates a conversation in the configured storage mode for the authenticated actor. */
    create: async function (request, configuration) {
        const mode = this.assertStorage(configuration),
            identity = this.identity(request);
        const conversation = this.createRecord(
            {
                tenant: identity.tenantCode,
                actor: identity.principalCode,
                channel: request.channel,
            },
            'conversation-' + crypto.randomUUID(),
        );
        conversation.enterpriseCode = identity.enterpriseCode;
        conversation.definitionCode = request.definitionCode || 'axisAssistant';
        if (this.recordingPolicy(configuration).enabled)
            conversation.title = request.title;
        if (mode === 'VOLATILE_LOCAL') {
            this.state.conversations.set(conversation.code, conversation);
            this.state.messages.set(conversation.code, []);
            return conversation;
        }
        return this.save(
            'DefaultCopilotConversationRecordService',
            request,
            conversation,
            true,
        );
    },
    /** Reads a conversation only when tenant and actor match; missing or foreign records return the same not-found error. */
    getOwned: async function (conversationCode, request, configuration) {
        const mode = this.assertStorage(configuration),
            identity = this.identity(request);
        const matches =
            mode === 'VOLATILE_LOCAL'
                ? [this.state.conversations.get(conversationCode)].filter(
                      Boolean,
                  )
                : await this.find(
                      'DefaultCopilotConversationRecordService',
                      request,
                      Object.assign({ code: conversationCode }, identity),
                      2,
                  );
        const conversation = matches.length === 1 ? matches[0] : null;
        if (
            !conversation ||
            ['PURGING', 'PURGED', 'RETENTION_STOPPED'].includes(conversation.state) ||
            conversation.code !== conversationCode ||
            JSON.stringify(this.identity(request)) !==
                JSON.stringify(identity) ||
            conversation.tenantCode !== identity.tenantCode ||
            conversation.principalCode !== identity.principalCode ||
            (conversation.enterpriseCode || null) !== identity.enterpriseCode
        )
            throw this.error(
                'COPILOT_CONVERSATION_NOT_FOUND',
                'Copilot conversation was not found',
            );
        conversation.conversationCode = conversation.code;
        return conversation;
    },
    /** Lists the authenticated actor's conversations with bounded paging and optional state filtering. */
    listOwned: async function (request, configuration) {
        const mode = this.assertStorage(configuration),
            identity = this.identity(request),
            query = request.query || {};
        const page = Math.max(1, Number(query.page || 1)),
            limit = Math.min(100, Math.max(1, Number(query.limit || 20)));
        let owned =
            mode === 'VOLATILE_LOCAL'
                ? Array.from(this.state.conversations.values())
                : await this.find(
                      'DefaultCopilotConversationRecordService',
                      request,
                      identity,
                      1000,
                  );
        owned = owned
            .filter(
                (item) =>
                    item.tenantCode === identity.tenantCode &&
                    item.principalCode === identity.principalCode &&
                    (item.enterpriseCode || null) === identity.enterpriseCode &&
                    (!query.state || item.state === query.state),
            )
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        return {
            page: page,
            limit: limit,
            items: owned.slice((page - 1) * limit, page * limit),
        };
    },
    /** Rechecks all ownership dimensions on an untrusted persistence projection. @param {Object} item Persisted record. @param {Object} identity Trusted principal context. @returns {boolean} Whether scope matches. */
    matchesIdentity: function (item, identity) {
        return (
            item.tenantCode === identity.tenantCode &&
            item.principalCode === identity.principalCode &&
            (item.enterpriseCode || null) === identity.enterpriseCode
        );
    },
    /** Reads an ordered bounded projection through its existing generated owner. @param {string} name Service identity. @param {Object} request Trusted request. @param {Object} query Owner-scoped query. @param {number} limit Page bound. @param {Object} sort Canonical ordering. @returns {Promise<Array>} Owner records. */
    findWorkspaceRecords: async function (name, request, query, limit, sort) {
        return this.items(
            await SERVICE[name].get({
                tenant: request.tenant,
                authData: request.authData,
                query: query,
                searchOptions: { pageSize: limit, pageNumber: 1, sort: sort },
            }),
        );
    },
    /** Projects bounded owned conversation and turn metadata, never message or event bodies. @param {Object} request Trusted principal request. @param {Object} configuration Conversation storage configuration. @param {number} limit Maximum records per projection. @returns {Promise<Object>} Scoped activity window. */
    workspaceActivity: async function (request, configuration, limit) {
        const mode = this.assertStorage(configuration),
            identity = this.identity(request);
        if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100)
            throw this.error(
                'COPILOT_WORKSPACE_LIMIT_INVALID',
                'Workspace limit is invalid',
            );
        const conversations = (
            mode === 'VOLATILE_LOCAL'
                ? Array.from(this.state.conversations.values())
                : await this.findWorkspaceRecords(
                      'DefaultCopilotConversationRecordService',
                      request,
                      identity,
                      limit + 1,
                      { updatedAt: -1 },
                  )
        )
            .filter((item) => this.matchesIdentity(item, identity))
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        const selected = conversations.slice(0, limit);
        const codes = selected.map((item) => item.code);
        const turns = codes.length
            ? (mode === 'VOLATILE_LOCAL'
                  ? Array.from(this.state.turns.values())
                  : await this.findWorkspaceRecords(
                        'DefaultCopilotTurnService',
                        request,
                        Object.assign({}, identity, {
                            conversationCode: { $in: codes },
                        }),
                        limit + 1,
                        { acceptedAt: -1 },
                    )
              )
                  .filter(
                      (item) =>
                          this.matchesIdentity(item, identity) &&
                          codes.includes(item.conversationCode),
                  )
                  .sort(
                      (a, b) => new Date(b.acceptedAt) - new Date(a.acceptedAt),
                  )
            : [];
        return {
            limit: limit,
            hasMoreConversations: conversations.length > limit,
            hasMoreTurns: turns.length > limit,
            conversations: selected.map((item) => ({
                conversationCode: item.code,
                title: item.title || null,
                state: item.state,
                updatedAt: item.updatedAt,
            })),
            turns: turns.slice(0, limit).map((item) => ({
                turnCode: item.code,
                conversationCode: item.conversationCode,
                state: item.state,
                acceptedAt: item.acceptedAt,
                completedAt: item.completedAt || null,
            })),
        };
    },
    /** Reuses a prior actor-scoped idempotency key or records a new accepted turn, user message and acceptance event. */
    acceptTurn: async function (conversation, request, configuration) {
        const mode = this.assertStorage(configuration);
        const identity = this.identity(request);
        if (!this.matchesIdentity(conversation, identity))
            throw this.error(
                'COPILOT_CONVERSATION_NOT_FOUND',
                'Copilot conversation was not found',
            );
        if (!request.idempotencyKey)
            throw this.error(
                'COPILOT_IDEMPOTENCY_KEY_REQUIRED',
                'Idempotency key is required',
            );
        const identityKey = JSON.stringify([
            conversation.tenantCode,
            conversation.principalCode,
            conversation.enterpriseCode || null,
            conversation.code,
            request.idempotencyKey,
        ]);
        const matches =
            mode === 'VOLATILE_LOCAL'
                ? [
                      this.state.turns.get(
                          this.state.idempotency.get(identityKey),
                      ),
                  ].filter(Boolean)
                : await this.find(
                      'DefaultCopilotTurnService',
                      request,
                      {
                          tenantCode: conversation.tenantCode,
                          principalCode: conversation.principalCode,
                          enterpriseCode: conversation.enterpriseCode || null,
                          conversationCode: conversation.code,
                          idempotencyKey: request.idempotencyKey,
                      },
                      2,
                  );
        if (
            JSON.stringify(this.identity(request)) !==
                JSON.stringify(identity) ||
            matches.length > 1 ||
            matches.some(
                (item) =>
                    !this.matchesIdentity(item, identity) ||
                    item.conversationCode !== conversation.code ||
                    item.idempotencyKey !== request.idempotencyKey ||
                    typeof item.code !== 'string' ||
                    !item.code,
            )
        )
            throw this.error(
                'COPILOT_PERSISTENCE_UNCONFIRMED',
                'Turn recovery was not acknowledged',
            );
        const existing = matches[0];
        if (existing) {
            existing.turnCode = existing.code;
            return existing;
        }
        const turnCode = 'turn-' + crypto.randomUUID();
        const turn = {
            code: turnCode,
            active: true,
            turnCode: turnCode,
            conversationCode: conversation.code,
            idempotencyKey: request.idempotencyKey,
            tenantCode: conversation.tenantCode,
            principalCode: conversation.principalCode,
            state: 'ACCEPTED',
            acceptedAt: new Date(),
        };
        turn.enterpriseCode = conversation.enterpriseCode || null;
        turn.recording = this.recordingPolicy(configuration);
        if (turn.recording.enabled && !conversation.title)
            conversation.title = this.titleFromMessage(request.message);
        conversation.lastSequence = Number(conversation.lastSequence || 0) + 1;
        conversation.updatedAt = new Date();
        const message = this.createMessage(
            conversation,
            'user',
            request.message,
            conversation.lastSequence,
            turnCode,
        );
        message.providerContextEligible =
            request.providerContextEligible !== false;
        if (mode === 'VOLATILE_LOCAL') {
            this.state.turns.set(turnCode, turn);
            this.state.events.set(turnCode, []);
            this.state.idempotency.set(identityKey, turnCode);
            if (turn.recording.enabled)
                this.state.messages.get(conversation.code).push(message);
        } else {
            await this.save('DefaultCopilotTurnService', request, turn);
            if (turn.recording.enabled)
                await this.save(
                    'DefaultCopilotMessageService',
                    request,
                    message,
                );
            await this.save(
                'DefaultCopilotConversationRecordService',
                request,
                conversation,
            );
        }
        await this.appendEvent(
            turn,
            'TURN_ACCEPTED',
            {},
            request,
            configuration,
        );
        return turn;
    },
    /** Appends a versioned turn event with an ordered sequence in the configured storage mode. */
    appendEvent: async function (
        turn,
        eventType,
        data,
        request,
        configuration,
    ) {
        const mode = this.assertStorage(configuration);
        const identity = this.identity(request);
        if (!this.matchesIdentity(turn, identity))
            throw this.error(
                'COPILOT_TURN_NOT_FOUND',
                'Copilot turn was not found',
            );
        const events =
            mode === 'VOLATILE_LOCAL'
                ? this.state.events.get(turn.turnCode) || []
                : await this.find(
                      'DefaultCopilotEventService',
                      request,
                      {
                          turnCode: turn.turnCode,
                          conversationCode: turn.conversationCode,
                          ...identity,
                      },
                      Number(configuration.replayEventLimit || 500),
                  );
        const sequence = events.length + 1;
        const event = {
            code: turn.turnCode + '-' + sequence,
            ...identity,
            active: true,
            eventCode: turn.turnCode + '-' + sequence,
            contractVersion: 1,
            conversationCode: turn.conversationCode,
            turnCode: turn.turnCode,
            eventType: eventType,
            sequence: sequence,
            createdAt: new Date(),
            data: data || {},
        };
        let persisted = event;
        if (turn.recording && turn.recording.enabled === false) {
            const delivery = deliveries.get(request);
            if (delivery) {
                if (
                    delivery.length >= 500 ||
                    Buffer.byteLength(JSON.stringify(delivery)) +
                        Buffer.byteLength(JSON.stringify(event)) >
                        1048576
                )
                    throw this.error(
                        'COPILOT_DELIVERY_LIMIT',
                        'Temporary delivery limit reached',
                    );
                delivery.push(event);
            }
            persisted = {
                ...event,
                eventType: [
                    'TURN_ACCEPTED',
                    'COMPLETED',
                    'FAILED',
                    'CANCELLED',
                    'USAGE',
                ].includes(eventType)
                    ? eventType
                    : 'STATUS',
                data: { contentNotRecorded: true },
            };
            if (eventType === 'USAGE') {
                persisted.data.phase = 'GENERATION';
                persisted.data.usage = Object.fromEntries(
                    [
                        'inputTokens',
                        'outputTokens',
                        'totalTokens',
                        'cachedInputTokens',
                        'reasoningTokens',
                        'embeddingTokens',
                    ].map((key) => {
                        const value = data && data.usage && data.usage[key];
                        return [
                            key,
                            Number.isSafeInteger(value) && value >= 0
                                ? value
                                : null,
                        ];
                    }),
                );
            }
        }
        if (mode === 'VOLATILE_LOCAL') {
            events.push(persisted);
            this.state.events.set(turn.turnCode, events);
        } else
            await this.save('DefaultCopilotEventService', request, persisted);
        return event;
    },
    /** Reads sequence-ordered messages for an already-authorized conversation. */
    messages: async function (conversationCode, request, configuration) {
        const identity = this.identity(request);
        await this.getOwned(conversationCode, request, configuration);
        const values = this.isVolatile(configuration)
            ? this.state.messages.get(conversationCode) || []
            : await this.find(
                  'DefaultCopilotMessageService',
                  request,
                  { conversationCode: conversationCode, ...identity },
                  1000,
              );
        if (JSON.stringify(this.identity(request)) !== JSON.stringify(identity))
            throw this.error(
                'COPILOT_CONVERSATION_NOT_FOUND',
                'Copilot conversation was not found',
            );
        return values
            .filter(
                (item) =>
                    this.matchesIdentity(item, identity) &&
                    item.conversationCode === conversationCode,
            )
            .sort((a, b) => a.sequence - b.sequence);
    },
    /** Records the assistant message, usage and completion events, then persists the completed turn. */
    complete: async function (
        conversation,
        turn,
        content,
        providerResult,
        request,
        configuration,
    ) {
        const mode = this.assertStorage(configuration);
        conversation.lastSequence = Number(conversation.lastSequence || 0) + 1;
        conversation.updatedAt = new Date();
        const message = this.createMessage(
            conversation,
            'assistant',
            content,
            conversation.lastSequence,
            turn.turnCode,
        );
        message.providerContextEligible =
            providerResult.providerContextEligible !== false;
        if (!turn.recording || turn.recording.enabled !== false) {
            if (mode === 'VOLATILE_LOCAL')
                this.state.messages.get(conversation.code).push(message);
            else
                await this.save(
                    'DefaultCopilotMessageService',
                    request,
                    message,
                );
        }
        if (mode !== 'VOLATILE_LOCAL')
            await this.save(
                'DefaultCopilotConversationRecordService',
                request,
                conversation,
            );
        await this.appendEvent(
            turn,
            'TEXT_DELTA',
            { text: content },
            request,
            configuration,
        );
        await this.appendEvent(
            turn,
            'USAGE',
            { phase: 'GENERATION', usage: providerResult.usage || {} },
            request,
            configuration,
        );
        turn.state = 'COMPLETED';
        turn.completedAt = new Date();
        await this.appendEvent(
            turn,
            'COMPLETED',
            { finishReason: providerResult.finishReason || 'complete' },
            request,
            configuration,
        );
        if (mode !== 'VOLATILE_LOCAL')
            await this.save('DefaultCopilotTurnService', request, turn);
        return turn;
    },
    /** Records a failed turn using its bounded failure code and appends a failure event. */
    fail: async function (turn, error, request, configuration) {
        const mode = this.assertStorage(configuration);
        turn.state = 'FAILED';
        turn.failureCode =
            (!turn.recording || turn.recording.enabled !== false) &&
            typeof error.code === 'string' &&
            /^(ERR|COPILOT)_[A-Z0-9_]{1,100}$/.test(error.code)
                ? error.code
                : 'COPILOT_TURN_FAILED';
        turn.completedAt = new Date();
        await this.appendEvent(
            turn,
            'FAILED',
            { code: turn.failureCode },
            request,
            configuration,
        );
        if (mode !== 'VOLATILE_LOCAL')
            await this.save('DefaultCopilotTurnService', request, turn);
        return turn;
    },
    /** Checks conversation ownership and verifies that the requested turn belongs to that conversation. */
    getOwnedTurn: async function (
        conversationCode,
        turnCode,
        request,
        configuration,
    ) {
        const identity = this.identity(request);
        await this.getOwned(conversationCode, request, configuration);
        const matches = this.isVolatile(configuration)
            ? [this.state.turns.get(turnCode)].filter(Boolean)
            : await this.find(
                  'DefaultCopilotTurnService',
                  request,
                  { code: turnCode, conversationCode, ...identity },
                  2,
              );
        const turn = matches.length === 1 ? matches[0] : null;
        if (
            !turn ||
            JSON.stringify(this.identity(request)) !==
                JSON.stringify(identity) ||
            turn.code !== turnCode ||
            turn.conversationCode !== conversationCode ||
            turn.tenantCode !== identity.tenantCode ||
            turn.principalCode !== identity.principalCode ||
            (turn.enterpriseCode || null) !== identity.enterpriseCode
        )
            throw this.error(
                'COPILOT_TURN_NOT_FOUND',
                'Copilot turn was not found',
            );
        turn.turnCode = turn.code;
        return turn;
    },
    /** Returns a bounded sequence-ordered replay after validating the conversation and turn owner. */
    replayEvents: async function (
        conversationCode,
        turnCode,
        request,
        configuration,
    ) {
        const identity = this.identity(request);
        await this.getOwnedTurn(
            conversationCode,
            turnCode,
            request,
            configuration,
        );
        const query = request.query || {};
        const afterSequence = Math.max(0, Number(query.afterSequence || 0)),
            limit = Math.min(
                Number(configuration.replayEventLimit || 500),
                Math.max(1, Number(query.limit || 100)),
            );
        const events = this.isVolatile(configuration)
            ? this.state.events.get(turnCode) || []
            : await this.find(
                  'DefaultCopilotEventService',
                  request,
                  { turnCode: turnCode, conversationCode, ...identity },
                  configuration.replayEventLimit || 500,
              );
        if (JSON.stringify(this.identity(request)) !== JSON.stringify(identity))
            throw this.error(
                'COPILOT_TURN_NOT_FOUND',
                'Copilot turn was not found',
            );
        return {
            afterSequence: afterSequence,
            limit: limit,
            items: events
                .filter(
                    (item) =>
                        this.matchesIdentity(item, identity) &&
                        item.conversationCode === conversationCode &&
                        item.turnCode === turnCode &&
                        item.sequence > afterSequence,
                )
                .sort((a, b) => a.sequence - b.sequence)
                .slice(0, limit),
        };
    },
    /** Builds bounded owned turn history from messages and replay events without granting access to another actor. */
    history: async function (conversationCode, request, configuration) {
        const identity = this.identity(request);
        const conversation = await this.getOwned(
                conversationCode,
                request,
                configuration,
            ),
            query = request.query || {};
        const page = Math.max(1, Number(query.page || 1)),
            limit = Math.min(50, Math.max(1, Number(query.limit || 20)));
        const turns = this.isVolatile(configuration)
            ? Array.from(this.state.turns.values()).filter(
                  (item) => item.conversationCode === conversationCode,
              )
            : await this.find(
                  'DefaultCopilotTurnService',
                  request,
                  { conversationCode: conversationCode, ...identity },
                  1000,
              );
        const messages = await this.messages(
                conversationCode,
                request,
                configuration,
            ),
            items = [];
        const ownedTurns = turns.filter(
            (item) =>
                this.matchesIdentity(item, identity) &&
                item.conversationCode === conversationCode,
        );
        for (const turn of ownedTurns.slice((page - 1) * limit, page * limit)) {
            turn.turnCode = turn.code;
            const replay = await this.replayEvents(
                conversationCode,
                turn.code,
                Object.assign({}, request, {
                    query: { limit: configuration.replayEventLimit || 500 },
                }),
                configuration,
            );
            items.push({
                turn: turn,
                messages: messages.filter(
                    (item) => item.turnCode === turn.code,
                ),
                interactions: replay.items.filter(
                    (item) =>
                        !['TURN_ACCEPTED', 'TEXT_DELTA', 'COMPLETED'].includes(
                            item.eventType,
                        ),
                ),
            });
        }
        if (JSON.stringify(this.identity(request)) !== JSON.stringify(identity))
            throw this.error(
                'COPILOT_CONVERSATION_NOT_FOUND',
                'Copilot conversation was not found',
            );
        return {
            conversation: conversation,
            page: page,
            limit: limit,
            items: items,
            confirmations: [],
        };
    },
    /** Marks an owned unfinished turn cancelled, preserving completed/failed/cancelled terminal outcomes. */
    cancel: async function (
        conversationCode,
        turnCode,
        request,
        configuration,
    ) {
        const turn = await this.getOwnedTurn(
            conversationCode,
            turnCode,
            request,
            configuration,
        );
        if (!['COMPLETED', 'FAILED', 'CANCELLED'].includes(turn.state)) {
            turn.state = 'CANCELLED';
            await this.appendEvent(
                turn,
                'CANCELLED',
                { reason: request.reason || 'Employee requested cancellation' },
                request,
                configuration,
            );
            if (!this.isVolatile(configuration))
                await this.save('DefaultCopilotTurnService', request, turn);
        }
        return turn;
    },
};
