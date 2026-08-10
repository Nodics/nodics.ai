/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module commsApi/src/facade/defaultCommunicationApiFacade @description Applies owner, tenant, and DTO projection boundaries to Communication API operations. @layer facade @owner commsApi @override Later facades may enrich safe DTOs without bypassing policy. */
module.exports = { /** Projects allow-listed fields. */ project: function (value, name) { let fields = (CONFIG.get('communicationApi') || {}).projections[name] || []; let one = item => Object.fromEntries(fields.filter(field => item && item[field] !== undefined).map(field => [field, item[field]])); return Array.isArray(value) ? value.map(one) : one(value); }, /** Lists only messages owned by the authenticated customer. */ listInbox: async function (request) { let result = await SERVICE.DefaultCommsInboxMessageService.get({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, recipientId: request.authData && (request.authData.principalId || request.authData.code) }, searchOptions: { limit: Math.min(Number(request.query && request.query.limit || 25), 100) } }); return this.project(result.result || [], 'inbox'); }, /** Delegates retry to the governed API service. */ retryDelivery: async function (request) { return this.project(await SERVICE.DefaultCommunicationOperationsService.retry(request), 'operation'); }, /** Delegates callback verification and reconciliation. */ receiveCallback: async function (request) { return this.project(await SERVICE.DefaultCommunicationOperationsService.callback(request), 'callback'); } };
