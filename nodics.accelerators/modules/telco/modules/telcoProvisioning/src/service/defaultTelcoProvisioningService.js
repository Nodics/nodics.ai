/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module telcoProvisioning/service/defaultTelcoProvisioningService @description Creates idempotent provider-neutral Telco service orders. @layer service @owner telcoProvisioning */
module.exports = { init: () => Promise.resolve(true), postInit: () => Promise.resolve(true), create: function (request, existing) { if (!request || !request.tenant || !request.subscriptionCode || !request.orderCode || !request.idempotencyKey) throw new Error('TELCO_PROVISIONING_CONTEXT_REQUIRED'); let match = (existing || []).find(item => item.tenant === request.tenant && item.idempotencyKey === request.idempotencyKey); if (match) return { serviceOrder: match, replayed: true }; return { serviceOrder: { code: request.code || request.idempotencyKey, tenant: request.tenant, subscriptionCode: request.subscriptionCode, orderCode: request.orderCode, idempotencyKey: request.idempotencyKey, action: request.action || 'ACTIVATE', status: 'PENDING', revision: 1 }, replayed: false }; } };
