/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module copilotApi/controller/DefaultCopilotController @description Normalizes secured HTTP input and delegates Copilot operations through the facade. @layer controller @owner copilotApi @override Later API modules may customize mapping without bypassing facade governance. */
module.exports = {
    /** Normalizes body, query, route parameters, and idempotency before facade invocation. */
    invoke: function (operation, request, callback) {
        const http = request.httpRequest || {};
        request.body = http.body || request.body || {};
        request.query = http.query || request.query || {};
        request.conversationCode = http.params && http.params.conversationCode || request.conversationCode;
        request.turnCode = http.params && http.params.turnCode || request.turnCode;
        request.sourceCode = http.params && http.params.sourceCode || request.sourceCode;
        request.actionCode = http.params && http.params.actionCode || request.actionCode;
        request.confirmationCode = http.params && http.params.confirmationCode || request.confirmationCode;
        request.definitionCode = request.body.definitionCode;
        request.title = request.body.title;
        request.message = request.body.message;
        request.maximumOutputTokens = request.body.maximumOutputTokens;
        request.reason = request.body.reason;
        request.confirmed = request.body.confirmed === true;
        request.expectedRevision = request.body.expectedRevision;
        request.argumentsDigest = request.body.argumentsDigest;
        request.idempotencyKey = request.body.idempotencyKey ||
            (typeof http.get === 'function' && http.get('Idempotency-Key')) || request.idempotencyKey;
        const promise = Promise.resolve(FACADE.DefaultCopilotFacade[operation](request));
        return callback ? promise.then(value => callback(null, value)).catch(callback) : promise;
    },
    /** Creates a conversation. */ createConversation: function (request, callback) { return this.invoke('createConversation', request, callback); },
    /** Lists owned conversations. */ listConversations: function (request, callback) { return this.invoke('listConversations', request, callback); },
    /** Gets a conversation. */ getConversation: function (request, callback) { return this.invoke('getConversation', request, callback); },
    /** Gets bounded conversation history. */ getConversationHistory: function (request, callback) { return this.invoke('getConversationHistory', request, callback); },
    /** Submits a turn. */ submitTurn: function (request, callback) { return this.invoke('submitTurn', request, callback); },
    /** Gets a turn. */ getTurn: function (request, callback) { return this.invoke('getTurn', request, callback); },
    /** Replays turn events. */ replayEvents: function (request, callback) { return this.invoke('replayEvents', request, callback); },
    /** Opens the normalized SSE stream. */ streamTurn: function (request, callback) { return this.invoke('streamTurn', request, callback); },
    /** Cancels a turn. */ cancelTurn: function (request, callback) { return this.invoke('cancelTurn', request, callback); },
    /** Gets governed knowledge status. */ getKnowledgeStatus: function (request, callback) { return this.invoke('getKnowledgeStatus', request, callback); },
    /** Refreshes one governed knowledge source. */ refreshKnowledgeSource: function (request, callback) { return this.invoke('refreshKnowledgeSource', request, callback); }
    ,/** Prepares a governed product plan. */ prepareProductPlan: function (request, callback) { return this.invoke('prepareProductPlan', request, callback); }
    ,/** Gets a confirmation. */ getConfirmation: function (request, callback) { return this.invoke('getConfirmation', request, callback); }
    ,/** Approves a confirmation. */ approveConfirmation: function (request, callback) { return this.invoke('approveConfirmation', request, callback); }
    ,/** Rejects a confirmation. */ rejectConfirmation: function (request, callback) { return this.invoke('rejectConfirmation', request, callback); }
    ,/** Executes an approved confirmation. */ executeConfirmation: function (request, callback) { return this.invoke('executeConfirmation', request, callback); }
};
