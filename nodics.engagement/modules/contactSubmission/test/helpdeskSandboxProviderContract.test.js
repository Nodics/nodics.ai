/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
const assert = require('assert');
const helpdesk = require('../src/service/defaultHelpdeskSandboxAdapterService');
(async () => {
    const configuration = { enabled: true, sandboxOnly: true, liveQualified: false, endpoint: 'https://sandbox.invalid/helpdesk', credentialReference: 'secret://helpdesk/test', workspaceReference: 'workspace://test' };
    let ticket = await helpdesk.send({ tenant: 't1', contactRequestCode: 'C1', correlationId: 'corr1' }, {}, { resolveCredential: async () => 'opaque', send: async () => ({ reference: 'ticket-1' }) }, configuration); assert.strictEqual(ticket.reference, 'ticket-1'); assert.strictEqual(ticket.sandbox, true);
    let state = await helpdesk.lookup({ externalReference: 'ticket-1', correlationId: 'corr1' }, {}, { resolveCredential: async () => 'opaque', lookup: async () => ({ status: 'CLOSED' }) }, configuration); assert.strictEqual(state.terminal, true);
    await assert.rejects(helpdesk.send({ tenant: 't1', contactRequestCode: 'C1', correlationId: 'corr1' }, {}, {}, Object.assign({}, configuration, { enabled: false })), error => error.code === 'HELPDESK_DISABLED');
    console.log('Engagement helpdesk sandbox provider contract validated');
})().catch(error => { console.error(error); process.exitCode = 1; });
