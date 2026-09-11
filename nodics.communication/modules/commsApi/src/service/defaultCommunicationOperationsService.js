/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module commsApi/src/service/defaultCommunicationOperationsService @description Applies bounded retry and idempotent callback reconciliation over Communication-owned evidence. @layer service @owner commsApi @override Provider adapters may enrich mapping while preserving authentication and replay controls. */
module.exports = {
    /** Prepares a retry from the latest tenant-scoped delivery evidence. */ retry: async function (request) { return SERVICE.DefaultCommunicationRuntimeService.retry(request,request.intentCode); },
    /** Accepts one service-authenticated, provider-referenced callback without trusting domain identifiers from the body. */ callback: async function (request) { let payload = request.payload || {}; if (!payload.providerReference || !payload.status || !payload.occurredAt) throw new Error('communication callback evidence is incomplete'); return { providerCode: request.providerCode, providerReference: payload.providerReference, status: payload.status, receivedAt: new Date(), correlationId: request.correlationId || request.requestId }; }
};
