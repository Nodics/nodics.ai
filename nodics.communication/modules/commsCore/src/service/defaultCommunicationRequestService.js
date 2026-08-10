/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module commsCore/src/service/defaultCommunicationRequestService @description Executes the provider-neutral communication port through injected repositories and transports. @layer service @owner commsCore @override Runtime projects bind durable repositories and certified provider transports. */
module.exports = {
    /** Requests one idempotent communication without mutating the consuming domain. */ request: async function (command, ports, policy) { ports = ports || {}; let template = await ports.getTemplate(command.templateCode, command.locale, command.channel); if (!template) throw new Error('communication template not found'); let existing = await ports.findIntent(command.tenant, command.idempotencyKey); let suppressions = await ports.listSuppressions(command.tenant, command.recipientId, command.purpose, command.channel); let prepared = SERVICE.DefaultCommunicationCoreService.intent(command, template, suppressions, existing, policy); if (prepared.duplicate) return { intentCode: existing.code, status: existing.status, duplicate: true, correlationId: existing.correlationId }; let saved = await ports.saveIntent(prepared.intent); if (prepared.suppressed) return { intentCode: saved.code, status: 'SUPPRESSED', duplicate: false, correlationId: saved.correlationId }; let rendered = SERVICE.DefaultCommunicationCoreService.render(Object.assign({}, template, { declaredVariables: template.declaredVariables || [] }), command.variables, policy); let response = await ports.deliver({ intentCode: saved.code, idempotencyKey: saved.idempotencyKey, recipientAddressReference: saved.recipientAddressReference, channel: saved.channel, rendered: rendered }); let outcome = SERVICE.DefaultCommunicationCoreService.outcome(saved.code, ports.providerCode, saved.channel, 1, response, { tenant: saved.tenant, correlationId: saved.correlationId, now: command.now }); await ports.saveOutcome(outcome); return { intentCode: saved.code, status: outcome.status, duplicate: false, providerReference: outcome.providerReference, correlationId: saved.correlationId }; }
};
