/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commsApi/config/properties @description Defines Communication API projections and callback replay policy. @layer config @owner commsApi @override Projects may narrow projections and callback providers. */
module.exports = { communicationApi: { projections: { inbox: ['code', 'title', 'body', 'actionReferences', 'status', 'createdAt', 'readAt', 'expiresAt', 'correlationId'], operation: ['intentCode', 'status', 'attempt', 'nextAttemptAt', 'correlationId'], callback: ['providerCode', 'providerReference', 'status', 'receivedAt', 'correlationId'] }, maximumQueryLimit: 100 } };
