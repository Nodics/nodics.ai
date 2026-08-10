/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module contactSubmission/src/service/defaultProcessHandoffAdapterService @description Calls the Process-owned instance API without persisting credentials or duplicating workflow state. @layer service @owner contactSubmission @override Customer deployments may replace transport and service-token acquisition while preserving the Process API contract. */
module.exports = {
    /** Handles endpoint within the module-owned contract. */
    endpoint: function (configuration) { let server = CONFIG.get('servers').process; let endpoint = server && server.endpoint || {}; let host = endpoint.httpHost || '127.0.0.1'; let port = endpoint.httpPort; if (!port) { let error = new Error('process endpoint unavailable'); error.code = 'PROCESS_ENDPOINT_UNAVAILABLE'; throw error; } return 'http://' + host + ':' + port + '/nodics/process/v0'; },
    /** Handles token within the module-owned contract. */
    token: function (request) { let authorization = request && request.httpRequest && request.httpRequest.headers && request.httpRequest.headers.authorization; if (!authorization && request && request.authorization) authorization = request.authorization; if (!authorization) { let error = new Error('process authorization unavailable'); error.code = 'PROCESS_AUTH_UNAVAILABLE'; throw error; } return authorization; },
    /** Handles call within the module-owned contract. */
    call: async function (path, options, request) {
        let configuration = CONFIG.get('contactSubmission') || {};
        let controller = new AbortController();
        let timeout = setTimeout(() => controller.abort(), Number(configuration.handoffRecovery && configuration.handoffRecovery.requestTimeoutMs || 10000));
        try {
            let enterprise = request.enterprise && request.enterprise.code || request.enterprise || 'default';
            let headers = Object.assign({ Accept: 'application/json', 'Content-Type': 'application/json', Authorization: this.token(request), 'x-enterprise-code': enterprise, 'x-nodics-tenant': request.tenant, 'x-correlation-id': request.correlationId }, options.headers || {});
            let response = await fetch(this.endpoint(configuration) + path, Object.assign({}, options, { headers: headers, signal: controller.signal }));
            let body = await response.json().catch(() => ({}));
            if (!response.ok) { let error = new Error('process request failed'); error.code = body.code || 'PROCESS_HTTP_' + response.status; throw error; }
            return body.result || body.data || body;
        } finally { clearTimeout(timeout); }
    },
    /** Handles send within the module-owned contract. */
    send: async function (command, request) {
        let result = await this.call('/instances', { method: 'POST', body: JSON.stringify({ definitionCode: command.definitionCode, context: { businessKey: command.contactRequestCode, ownerModule: 'contactSubmission', ownerType: 'CONTACT_REQUEST', ownerCode: command.contactRequestCode, correlationId: command.correlationId } }) }, request);
        let instance = result.instance || result;
        let reference = instance.code || instance.instanceCode;
        if (!reference) { let error = new Error('process instance reference missing'); error.code = 'PROCESS_REFERENCE_MISSING'; throw error; }
        return { provider: 'PROCESS', reference: reference, status: instance.status || 'IN_PROGRESS' };
    },
    /** Handles lookup within the module-owned contract. */
    lookup: async function (command, request) {
        let result = await this.call('/instances/' + encodeURIComponent(command.externalReference), { method: 'GET' }, request);
        let instance = result.instance || result;
        return { provider: 'PROCESS', reference: instance.code || instance.instanceCode, status: instance.status, terminal: ['COMPLETED', 'CANCELLED', 'FAILED'].includes(instance.status) };
    }
};
