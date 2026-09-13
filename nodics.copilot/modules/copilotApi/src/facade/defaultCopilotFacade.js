/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module copilotApi/facade/DefaultCopilotFacade @description Stable API boundary delegating orchestration to copilotCore and transport delivery to copilotApi. @layer facade @owner copilotApi @override Projects may customize facade policy while preserving service ownership. */
module.exports = {
    /** Wraps API data in the standard Nodics success envelope expected by Axis. */
    execute: function (operation, request) {
        return Promise.resolve(SERVICE.DefaultCopilotOrchestrationService[operation](request))
            .then(data => ({ code: 'SUC_SYS_00000', data: data }));
    },
    /** Delegates conversation creation. */ createConversation: function (request) { return this.execute('createConversation', request); },
    /** Delegates conversation listing. */ listConversations: function (request) { return this.execute('listConversations', request); },
    /** Delegates conversation lookup. */ getConversation: function (request) { return this.execute('getConversation', request); },
    /** Delegates history lookup. */ getConversationHistory: function (request) { return this.execute('getConversationHistory', request); },
    /** Delegates turn submission. */ submitTurn: function (request) { return this.execute('submitTurn', request); },
    /** Delegates turn lookup. */ getTurn: function (request) { return this.execute('getTurn', request); },
    /** Delegates event replay. */ replayEvents: function (request) { return this.execute('replayEvents', request); },
    /** Delegates SSE delivery. */ streamTurn: function (request) { return SERVICE.DefaultCopilotSseService.open(request); },
    /** Delegates cancellation. */ cancelTurn: function (request) { return this.execute('cancelTurn', request); },
    /** Delegates caller-visible knowledge status. */ getKnowledgeStatus: function (request) { return this.execute('getKnowledgeStatus', request); },
    /** Delegates a governed source refresh. */ refreshKnowledgeSource: function (request) { return this.execute('refreshKnowledgeSource', request); },
    /** Delegates governed product preparation. */ prepareProductPlan: function (request) { return this.execute('prepareProductPlan', request); },
    /** Delegates confirmation lookup. */ getConfirmation: function (request) { return this.execute('getConfirmation', request); },
    /** Delegates confirmation approval. */ approveConfirmation: function (request) { return this.execute('approveConfirmation', request); },
    /** Delegates confirmation rejection. */ rejectConfirmation: function (request) { return this.execute('rejectConfirmation', request); },
    /** Delegates confirmation execution. */ executeConfirmation: function (request) { return this.execute('executeConfirmation', request); }
};
