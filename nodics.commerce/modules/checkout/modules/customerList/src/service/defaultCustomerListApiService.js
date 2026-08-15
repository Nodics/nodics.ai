/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('node:crypto');

/** @module customerList/src/service/defaultCustomerListApiService @description Owns customer wishlist and compare-list APIs. @layer service @owner customerList */
module.exports = {
    unwrap: response => response && Object.prototype.hasOwnProperty.call(response, 'result') ? response.result : response,
    policy: function () { return ((CONFIG.get('customerList') || {}).customerApi) || {}; },
    supportedTypes: function () { return new Set(this.policy().supportedListTypes || ['WISHLIST', 'COMPARE']); },
    normalizeType: function (listType) {
        const value = String(listType || '').toUpperCase();
        if (!this.supportedTypes().has(value)) throw new Error('Unsupported customer list type');
        return value;
    },
    listCode: function (request) {
        return ['customerList', request.tenant, request.ownerId, this.normalizeType(request.listType), request.payload && request.payload.storeCode || request.query && request.query.storeCode || this.policy().defaultStoreCode || 'default'].join(':');
    },
    limit: function (listType) {
        return listType === 'COMPARE' ? Number(this.policy().maximumCompareItems || 4) : Number(this.policy().maximumWishlistItems || 100);
    },
    entryCode: function (request, listCode) {
        const payload = request.payload || {};
        return [listCode, payload.productCode, payload.variantCode || 'default'].join('|');
    },
    listModel: function (request) {
        const payload = request.payload || {}, query = request.query || {}, listType = this.normalizeType(request.listType);
        return {
            code: this.listCode(request),
            tenant: request.tenant,
            ownerId: request.ownerId,
            listType,
            storeCode: payload.storeCode || query.storeCode || this.policy().defaultStoreCode || 'agoraMainStore',
            locale: payload.locale || query.locale || this.policy().defaultLocale || 'en',
            status: 'ACTIVE',
            active: true,
            revision: 0,
            correlationId: request.correlationId || request.requestId || crypto.createHash('sha1').update([request.tenant, request.ownerId, listType].join('|')).digest('hex')
        };
    },
    loadList: async function (request) {
        const listCode = this.listCode(request);
        const response = await SERVICE.DefaultCustomerListService.get({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, ownerId: request.ownerId, code: listCode, status: 'ACTIVE' }, pageSize: 1 });
        const result = this.unwrap(response);
        const existing = Array.isArray(result) ? result[0] : result;
        if (existing) return existing;
        return SERVICE.DefaultCustomerListService.save({ tenant: request.tenant, authData: request.authData, model: this.listModel(request) }).then(this.unwrap);
    },
    loadEntries: async function (request, list) {
        const response = await SERVICE.DefaultCustomerListEntryService.get({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, ownerId: request.ownerId, listCode: list.code, status: 'ACTIVE' }, pageSize: this.limit(list.listType) + 1 });
        const result = this.unwrap(response);
        return Array.isArray(result) ? result : result ? [result] : [];
    },
    response: async function (request, list) {
        return { list, entries: await this.loadEntries(request, list) };
    },
    read: async function (request) {
        return this.response(request, await this.loadList(request));
    },
    addEntry: async function (request) {
        const payload = request.payload || {};
        if (!payload.productCode) throw new Error('Product code is required for customer list entry');
        const list = await this.loadList(request);
        const current = await this.loadEntries(request, list);
        const code = this.entryCode(request, list.code);
        const existing = current.find(item => item.code === code);
        if (!existing && current.length >= this.limit(list.listType)) throw new Error('Customer list item limit exceeded');
        const model = {
            code,
            tenant: request.tenant,
            ownerId: request.ownerId,
            listCode: list.code,
            listType: list.listType,
            productCode: payload.productCode,
            variantCode: payload.variantCode,
            status: 'ACTIVE',
            active: true,
            revision: existing ? Number(existing.revision || 0) + 1 : 0,
            correlationId: request.correlationId || request.requestId || list.correlationId
        };
        await SERVICE.DefaultCustomerListEntryService.save({ tenant: request.tenant, authData: request.authData, model }).then(this.unwrap);
        return this.response(request, list);
    },
    removeEntry: async function (request) {
        if (!request.entryCode) throw new Error('Customer list entry code is required');
        const list = await this.loadList(request);
        const model = { tenant: request.tenant, code: request.entryCode, ownerId: request.ownerId, listCode: list.code, listType: list.listType, status: 'REMOVED', active: true };
        if (SERVICE.DefaultCustomerListEntryService.update) await SERVICE.DefaultCustomerListEntryService.update({ tenant: request.tenant, authData: request.authData, query: { tenant: request.tenant, ownerId: request.ownerId, code: request.entryCode, listCode: list.code }, model }).then(this.unwrap);
        else await SERVICE.DefaultCustomerListEntryService.save({ tenant: request.tenant, authData: request.authData, model }).then(this.unwrap);
        return this.response(request, list);
    },
    clear: async function (request) {
        const list = await this.loadList(request);
        const entries = await this.loadEntries(request, list);
        for (const entry of entries) {
            await this.removeEntry(Object.assign({}, request, { entryCode: entry.code }));
        }
        return this.response(request, list);
    }
};
