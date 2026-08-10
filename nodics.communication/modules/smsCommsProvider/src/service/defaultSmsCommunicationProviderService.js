/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module smsCommsProvider/src/service/defaultSmsCommunicationProviderService @description Sends SMS through an injected sandbox HTTP transport without exposing credentials or content in returned evidence. @layer service @owner smsCommsProvider */
module.exports = {
    code: 'sms-sandbox',
    /** Delivers one SMS intent through injected sandbox ports. */
    deliver: async function (request, ports, configuration) {
        configuration = configuration || {}; ports = ports || {};
        if (configuration.enabled !== true) throw Object.assign(new Error('SMS provider is disabled'), { code: 'COMMS_PROVIDER_DISABLED' });
        if (configuration.sandboxOnly !== true || configuration.liveQualified === true) throw Object.assign(new Error('SMS provider sandbox policy is invalid'), { code: 'COMMS_PROVIDER_POLICY' });
        if (!configuration.endpoint || !configuration.credentialReference || !configuration.senderReference) throw Object.assign(new Error('SMS provider references are incomplete'), { code: 'COMMS_PROVIDER_CONFIGURATION' });
        if (!request || request.channel !== 'SMS' || !request.intentCode || !request.idempotencyKey || !request.recipientAddressReference) throw Object.assign(new Error('invalid SMS delivery request'), { code: 'COMMS_PROVIDER_REQUEST' });
        if (typeof ports.resolveCredential !== 'function' || typeof ports.send !== 'function') throw Object.assign(new Error('SMS provider ports are unavailable'), { code: 'COMMS_PROVIDER_UNAVAILABLE' });
        const credential = await ports.resolveCredential(configuration.credentialReference);
        if (!credential) throw Object.assign(new Error('SMS provider credential is unavailable'), { code: 'COMMS_PROVIDER_CREDENTIAL' });
        const response = await ports.send({ endpoint: configuration.endpoint, credential, senderReference: configuration.senderReference, recipientAddressReference: request.recipientAddressReference, rendered: request.rendered, idempotencyKey: request.idempotencyKey, timeoutMilliseconds: configuration.timeoutMilliseconds });
        if (!response || !response.reference) throw Object.assign(new Error('SMS provider returned no reference'), { code: 'COMMS_PROVIDER_RESPONSE' });
        return { status: response.accepted === false ? 'FAILED' : 'DELIVERED', providerReference: response.reference, responseCode: response.code || 'SANDBOX_ACCEPTED', sandbox: true };
    },
    /** Reports disabled or sandbox transport availability without exposing secrets. */
    health: async function (ports, configuration) { if (!configuration || configuration.enabled !== true) return { code: this.code, status: 'DISABLED', liveQualified: false }; return { code: this.code, status: await ports.health(configuration.endpoint) ? 'AVAILABLE' : 'UNAVAILABLE', liveQualified: false }; }
};
