/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
const UTILS = require('../utils/utils');
/** @module contactSubmission/src/service/defaultContactHandoffDispatchService @description Creates content-free provider handoff references and safe deferred outcomes. @layer service @owner contactSubmission @override Provider adapters may replace dispatch behavior without moving provider lifecycle authority here. */
module.exports = { dispatch: async function (type, contact, adapter, request) { if (!adapter) return { tenant: contact.tenant, contactRequestCode: contact.code, targetType: type, status: 'PENDING', attempts: 0, revision: 0, deferred: true, correlationId: request.correlationId, updatedAt: UTILS.now(request) }; try { let result = await adapter.send({ tenant: contact.tenant, contactRequestCode: contact.code, definitionCode: request.processDefinitionCode, correlationId: request.correlationId }, request); return { tenant: contact.tenant, contactRequestCode: contact.code, targetType: type, provider: result.provider, externalReference: result.reference, status: result.status || 'IN_PROGRESS', attempts: 1, revision: 0, correlationId: request.correlationId, updatedAt: UTILS.now(request) }; } catch (error) { return { tenant: contact.tenant, contactRequestCode: contact.code, targetType: type, status: 'RETRY_PENDING', attempts: 1, revision: 0, lastErrorCode: error.code || 'UNAVAILABLE', correlationId: request.correlationId, updatedAt: UTILS.now(request) }; } } };
