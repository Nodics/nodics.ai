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
    /** Prepares a retry from the latest tenant-scoped delivery evidence. */ retry: async function (request) { let response = await SERVICE.DefaultCommsDeliveryAttemptService.get({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, intentCode: request.intentCode }, searchOptions: { limit: 1, sort: { attempt: -1 } } }); let latest = (response.result || [])[0]; if (!latest || !['FAILED', 'RETRY_PENDING', 'DEAD_LETTER'].includes(latest.status)) throw new Error('communication delivery is not retryable'); let policy = CONFIG.get('communication') || {}; let retry = SERVICE.DefaultCommunicationCoreService.retry(latest.attempt, Date.now(), policy); return Object.assign({ intentCode: request.intentCode, correlationId: latest.correlationId }, retry); },
    /** Accepts one service-authenticated, provider-referenced callback without trusting domain identifiers from the body. */ callback: async function (request) { let payload = request.payload || {}; if (!payload.providerReference || !payload.status || !payload.occurredAt) throw new Error('communication callback evidence is incomplete'); return { providerCode: request.providerCode, providerReference: payload.providerReference, status: payload.status, receivedAt: new Date(), correlationId: request.correlationId || request.requestId }; }
};
