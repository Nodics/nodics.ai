/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module fulfillmentCore/src/service/defaultCarrierSandboxAdapterService @description Implements a disabled-by-default sandbox HTTP carrier port using secret and account references. @layer service @owner fulfillmentCore */
module.exports = {
    code: 'carrier-sandbox',
    /** Executes one sandbox carrier operation through injected credential and transport ports. */
    execute: async function (request, ports, configuration) {
        configuration = configuration || {}; ports = ports || {};
        if (configuration.enabled !== true) throw Object.assign(new Error('carrier provider is disabled'), { code: 'CARRIER_DISABLED' });
        if (configuration.sandboxOnly !== true || configuration.liveQualified === true) throw Object.assign(new Error('carrier provider policy is invalid'), { code: 'CARRIER_POLICY' });
        if (!configuration.endpoint || !configuration.credentialReference || !configuration.accountReference) throw Object.assign(new Error('carrier provider references are incomplete'), { code: 'CARRIER_CONFIGURATION' });
        if (!request || !request.tenant || !request.idempotencyKey || !['QUOTE', 'CREATE_SHIPMENT', 'CANCEL_SHIPMENT', 'TRACK', 'CREATE_RETURN'].includes(request.operation)) throw Object.assign(new Error('invalid carrier request'), { code: 'CARRIER_REQUEST' });
        let credential = await ports.resolveCredential(configuration.credentialReference); if (!credential) throw Object.assign(new Error('carrier credential unavailable'), { code: 'CARRIER_CREDENTIAL' });
        let response = await ports.send({ endpoint: configuration.endpoint, credential: credential, accountReference: configuration.accountReference, operation: request.operation, shipmentCode: request.shipmentCode, parcels: request.parcels, addressReference: request.addressReference, idempotencyKey: request.idempotencyKey, timeoutMilliseconds: configuration.timeoutMilliseconds });
        if (!response || !response.reference || !response.status) throw Object.assign(new Error('invalid carrier response'), { code: 'CARRIER_RESPONSE' });
        return { reference: response.reference, status: response.status, sandbox: true };
    }
};
