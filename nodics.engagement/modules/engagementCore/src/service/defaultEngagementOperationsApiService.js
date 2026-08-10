/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module engagementCore/src/service/defaultEngagementOperationsApiService @description Provides secured read, preview, repair, and export operations over rebuildable Engagement projections. @layer service @owner engagementCore @override Storage/search/export adapters may replace retrieval while domain mutations remain domain-owned. */
module.exports = {
    /** Returns the unified-operations policy. */ policy: function () { return (CONFIG.get('engagementCore') || {}).unifiedOperations || {}; },
    /** Lists a bounded tenant-scoped unified queue. */ listQueue: function (request) { return SERVICE.DefaultEngagementUnifiedQueueItemService.get({ tenant: request.tenant, authData: request.authData, query: Object.assign({ tenant: request.tenant }, request.query || {}), searchOptions: { limit: Math.min(Number(request.query && request.query.limit || 25), 100) } }).then(response => response.result || []); },
    /** Calculates a rebuildable dashboard from the authorized queue page. */ dashboard: async function (request) { let items = await this.listQueue(request); return SERVICE.DefaultEngagementUnifiedOperationsService.dashboard(request.tenant, request.dashboardCode || 'operations', items, { filters: request.query, policyVersion: this.policy().policyVersion, correlationId: request.correlationId || request.requestId }); },
    /** Previews a bounded batch of domain-owned commands without executing them. */ batchPreview: async function (request) { let itemCodes = request.payload.itemCodes || []; let items = await this.listQueue(Object.assign({}, request, { query: { limit: this.policy().maximumBatchSize } })); items = items.filter(item => itemCodes.includes(item.code)); return SERVICE.DefaultEngagementUnifiedOperationsService.batchPreview(items, request.payload, this.policy()); },
    /** Previews a masked export and returns auditable evidence. */ exportPreview: async function (request) { let items = await this.listQueue(request); return SERVICE.DefaultEngagementUnifiedOperationsService.exportPreview(request.tenant, items, Object.assign({}, request.payload, { actorId: request.authData && (request.authData.principalId || request.authData.code), correlationId: request.correlationId || request.requestId }), this.policy()); },
    /** Creates a repair preview against one projection; domain execution requires a later approval action. */ repairPreview: async function (request) { let values = await this.listQueue(Object.assign({}, request, { query: { code: request.itemCode, limit: 1 } })); if (!values[0]) throw new Error('unified queue item not found'); return SERVICE.DefaultEngagementUnifiedOperationsService.repair(values[0], Object.assign({}, request.payload, { actorId: request.authData && (request.authData.principalId || request.authData.code), correlationId: request.correlationId || request.requestId })); }
};
