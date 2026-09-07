/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';

/** @module copilotApi/service/DefaultCopilotSseService @description Delivers authenticated ordered Copilot event replay using the Axis SSE contract. @layer service @owner copilotApi @override Distributed runtimes may add live fan-out while persisted replay remains authoritative. */
module.exports = {
    /** Resolves a numeric replay cursor from query or Last-Event-ID. */
    cursor: function (request) {
        const http = request.httpRequest || {};
        const raw = (typeof http.get === 'function' && http.get('Last-Event-ID')) ||
            (http.headers && http.headers['last-event-id']) || (request.query || {}).afterSequence;
        if (raw === undefined || raw === null || raw === '') return 0;
        if (/^[0-9]+$/.test(String(raw))) return Number(raw);
        const prefix = request.turnCode + '-';
        if (!String(raw).startsWith(prefix)) throw new Error('COPILOT_SSE_CURSOR_INVALID');
        const sequence = String(raw).slice(prefix.length);
        if (!/^[0-9]+$/.test(sequence)) throw new Error('COPILOT_SSE_CURSOR_INVALID');
        return Number(sequence);
    },
    /** Writes the bounded replay and closes after the terminal event. */
    open: async function (request) {
        request.query = Object.assign({}, request.query || {}, { afterSequence: this.cursor(request) });
        const replay = await SERVICE.DefaultCopilotOrchestrationService.replayEvents(request);
        const response = request.httpResponse;
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        response.setHeader('Cache-Control', 'no-cache, no-transform');
        response.setHeader('Connection', 'keep-alive');
        response.setHeader('X-Accel-Buffering', 'no');
        if (typeof response.flushHeaders === 'function') response.flushHeaders();
        replay.items.forEach(event => response.write('id: ' + event.eventCode + '\n' +
            'event: ' + event.eventType.toLowerCase() + '\n' + 'data: ' + JSON.stringify(event) + '\n\n'));
        response.end();
        return Promise.resolve({ metadata: { responseCommitted: true } });
    }
};
