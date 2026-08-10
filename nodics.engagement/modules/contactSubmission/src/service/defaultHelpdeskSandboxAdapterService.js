/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module contactSubmission/src/service/defaultHelpdeskSandboxAdapterService @description Creates and reconciles content-minimized sandbox helpdesk tickets without moving Contact lifecycle authority. @layer service @owner contactSubmission */
module.exports = {
    /** Creates one content-minimized helpdesk ticket through injected sandbox ports. */
    send: async function (command, request, ports, configuration) {
        configuration = configuration || {}; ports = ports || {};
        if (configuration.enabled !== true) throw Object.assign(new Error('helpdesk provider is disabled'), { code: 'HELPDESK_DISABLED' });
        if (configuration.sandboxOnly !== true || configuration.liveQualified === true) throw Object.assign(new Error('helpdesk provider policy is invalid'), { code: 'HELPDESK_POLICY' });
        if (!configuration.endpoint || !configuration.credentialReference || !configuration.workspaceReference) throw Object.assign(new Error('helpdesk provider references are incomplete'), { code: 'HELPDESK_CONFIGURATION' });
        if (!command || !command.tenant || !command.contactRequestCode || !command.correlationId) throw Object.assign(new Error('invalid helpdesk request'), { code: 'HELPDESK_REQUEST' });
        let credential = await ports.resolveCredential(configuration.credentialReference); if (!credential) throw Object.assign(new Error('helpdesk credential unavailable'), { code: 'HELPDESK_CREDENTIAL' });
        let result = await ports.send({ endpoint: configuration.endpoint, credential: credential, workspaceReference: configuration.workspaceReference, businessReference: command.contactRequestCode, definitionCode: command.definitionCode, correlationId: command.correlationId, timeoutMilliseconds: configuration.timeoutMilliseconds });
        if (!result || !result.reference) throw Object.assign(new Error('helpdesk reference missing'), { code: 'HELPDESK_RESPONSE' });
        return { provider: 'HELPDESK_SANDBOX', reference: result.reference, status: result.status || 'IN_PROGRESS', sandbox: true };
    },
    /** Reconciles one external helpdesk reference without copying provider lifecycle state. */
    lookup: async function (command, request, ports, configuration) { let credential = await ports.resolveCredential(configuration.credentialReference); let result = await ports.lookup({ endpoint: configuration.endpoint, credential: credential, workspaceReference: configuration.workspaceReference, reference: command.externalReference, correlationId: command.correlationId }); return { provider: 'HELPDESK_SANDBOX', reference: command.externalReference, status: result.status, terminal: ['RESOLVED', 'CLOSED', 'FAILED'].includes(result.status), sandbox: true }; }
};
