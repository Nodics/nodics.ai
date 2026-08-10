/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module store/src/service/defaultStoreContextService @description Resolves an active tenant-scoped selling context. @layer service @owner store */
module.exports = { resolve: function (request, store, channel) {
    if (!request || !store || !channel || request.tenant !== store.tenant || request.tenant !== channel.tenant) throw new Error('Tenant-scoped store and channel are required');
    if (store.status !== 'ACTIVE' || channel.status !== 'ACTIVE' || channel.storeCode !== store.code) throw new Error('Selling context is unavailable');
    return Object.freeze({ tenant: request.tenant, storeCode: store.code, channelCode: channel.code, currency: store.defaultCurrency, locale: request.locale || store.defaultLocale, timezone: store.timezone });
} };
