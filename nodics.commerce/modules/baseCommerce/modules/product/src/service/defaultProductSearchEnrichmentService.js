/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module product/service/defaultProductSearchEnrichmentService
 * @description Orchestrates customer-safe Pricing, Inventory and DigitalCore summaries for Product search projections.
 * @layer service
 * @owner product
 * @override Later projects may override enrichment orchestration while Pricing, Inventory and Promotion retain source-of-truth ownership.
 */
module.exports = {
    /** Initializes the service lifecycle. @returns {Promise<boolean>} Initialization result. */
    init: function () { return Promise.resolve(true); },
    /** Completes the service lifecycle. @returns {Promise<boolean>} Initialization result. */
    postInit: function () { return Promise.resolve(true); },

    /** Returns Product publication policy. @returns {Object} Policy. */
    policy: function () { return ((CONFIG.get('product') || {}).publication) || {}; },

    /** Returns one enrichment policy. @param {string} kind Enrichment kind. @returns {Object} Policy. */
    enrichmentPolicy: function (kind) { return (((this.policy().searchEnrichment || {})[kind]) || {}); },

    /** Returns service account auth data for cross-domain summary calls. @param {Object} request Request. @returns {Object} Auth data. */
    serviceAuthData: function (request) {
        return Object.assign({}, request.authData || {}, {
            tenant: request.tenant,
            loginId: 'productSearchPublication',
            principalType: 'service',
            userGroups: ['serviceAccountUserGroup'],
            groups: ['serviceAccountUserGroup']
        });
    },

    /** Returns Product variant SKUs for internal summary calls. @param {Array} variants Product variants. @returns {Array} SKUs. */
    variantSkus: function (variants) {
        return Array.from(new Set((variants || []).map(variant => variant && variant.sku).filter(Boolean).map(String)));
    },

    /** Checks configured delivery through its owner; never substitutes indexed operational summaries. */
    assertConsumerProvider: function (domain, ownerName, request, input, policy, service) {
        if (((((CONFIG.get(domain) || {}).publication || {}).delivery) || {}).enabled !== true) return;
        const owner = SERVICE[ownerName];
        if (!owner || typeof owner.deliveryEnabled !== 'function') throw new Error('Activated ' + domain + ' owner is unavailable');
        if (owner.deliveryEnabled({ ...request, storeCode: input.storeCode }) &&
            (policy.enabled === false || !service || typeof service.summarize !== 'function')) {
            throw new Error('Activated ' + domain + ' customer summary provider is unavailable');
        }
    },

    /** Resolves indexed identities to retained catalogue records without trusting incomplete indexed scope or payload. */
    retainedProjections: async function (request, rows) {
        if (!rows.length) return [];
        const codes = [...new Set(rows.map(row => row.code))];
        if (codes.some(code => typeof code !== 'string' || !code) || !SERVICE.DefaultProductSearchProjectionService) {
            throw new Error('Retained Product projection authority is unavailable');
        }
        const response = await SERVICE.DefaultProductSearchProjectionService.get({
            tenant: request.tenant, authData: this.serviceAuthData(request),
            query: { tenant: request.tenant, storeCode: request.storeCode, code: { $in: codes } },
            options: { recursive: false, skipItemCache: true },
            searchOptions: { pageSize: codes.length + 1, limit: codes.length + 1, pageNumber: 1 }
        });
        const retained = response && response.result;
        if ((response?.code && !String(response.code).startsWith('SUC_')) || response?.error || response?.errors?.length ||
            !Array.isArray(retained) || retained.length !== codes.length || new Set(retained.map(row => row.code)).size !== codes.length) {
            throw new Error('Retained Product projection authority is incomplete');
        }
        const byCode = new Map(retained.map(row => [row.code, row]));
        return rows.map(row => {
            const stored = byCode.get(row.code);
            if (!stored || ['tenant', 'storeCode', 'productCode', 'locale', 'publicationVersion', 'sourceHash'].some(key => stored[key] !== row[key]) ||
                !['CURRENT', 'STALE'].includes(stored.status) || stored.status !== row.status ||
                (row.enterpriseCode !== undefined && row.enterpriseCode !== stored.enterpriseCode)) {
                throw new Error('Retained Product projection scope mismatch');
            }
            return stored;
        });
    },

    /** Batches live consumer summaries once per owner/result set; retained projections are never mutated. */
    consumerSummaries: async function (request, rows) {
        if (!rows.length) return { prices: {}, availability: {} };
        rows = await this.retainedProjections(request, rows);
        if (rows.some(row => row.status !== 'STALE')) throw new Error('Retained Product projection scope mismatch');
        const enterprises = new Set(rows.map(row => row.enterpriseCode));
        const enterpriseCode = rows[0].enterpriseCode;
        const auth = request.authData || {};
        if (enterprises.size !== 1 || typeof enterpriseCode !== 'string' || !enterpriseCode.trim() ||
            enterpriseCode !== enterpriseCode.trim() ||
            rows.some(row => row.tenant !== request.tenant || row.storeCode !== request.storeCode) ||
            [auth.enterpriseCode, auth.entCode].some(value => value !== undefined && value !== enterpriseCode)) {
            throw new Error('Activated Product enterprise scope is invalid');
        }
        request = { ...request, enterpriseCode, entCode: enterpriseCode,
            authData: { ...auth, enterpriseCode, entCode: enterpriseCode } };
        const pricing = this.enrichmentPolicy('pricing');
        const priceService = SERVICE[pricing.serviceName || 'DefaultCustomerPriceSummaryService'];
        this.assertConsumerProvider('pricing', 'DefaultPricingPublicationService', request, request, pricing, priceService);
        const products = new Map();
        for (const row of rows) {
            const skus = products.get(row.productCode) || new Set();
            Object.values((row.payload || {}).variantSkuMap || {}).filter(sku => typeof sku === 'string' && sku)
                .forEach(sku => skus.add(sku));
            products.set(row.productCode, skus);
        }
        const context = { tenant: request.tenant, enterpriseCode: request.enterpriseCode,
            storeCode: request.storeCode, authData: this.serviceAuthData(request),
            now: request.now, correlationId: request.correlationId };
        let currency;
        if (pricing.enabled !== false && priceService && typeof priceService.summarize === 'function') {
            if (!SERVICE.DefaultStoreService || typeof SERVICE.DefaultStoreService.get !== 'function') {
                throw new Error('Activated Product selling currency owner is unavailable');
            }
            const response = await SERVICE.DefaultStoreService.get({
                tenant: request.tenant, authData: context.authData,
                query: { tenant: request.tenant, code: request.storeCode },
                options: { recursive: false, skipItemCache: true },
                searchOptions: { pageSize: 2, pageNumber: 1 }
            });
            const stores = response && response.result;
            const store = Array.isArray(stores) && stores.length === 1 ? stores[0] : undefined;
            const owner = store && store.enterpriseRef;
            if (!store || store.tenant !== request.tenant || store.code !== request.storeCode ||
                (owner !== undefined && owner?.code !== enterpriseCode) ||
                store.status !== 'ACTIVE' || store.active === false ||
                typeof store.defaultCurrency !== 'string' || !/^[A-Z][A-Z0-9_]{2,15}$/.test(store.defaultCurrency)) {
                throw new Error('Activated Product selling currency is unavailable');
            }
            currency = store.defaultCurrency;
        }
        const [prices, availability] = await Promise.all([
            pricing.enabled !== false && priceService && typeof priceService.summarize === 'function'
                ? priceService.summarize({ ...context, productCodes: [...products.keys()],
                    currency, quantity: pricing.defaultQuantity || '1' }) : {},
            this.consumerAvailability({ ...request, authData: auth }, rows)
        ]);
        return { prices, availability };
    },

    /** Partitions already retained consumer projections by availability owner. @param {Object} request Retained enterprise and selected Store/locale context. @param {Array} rows Product-verified STALE projections. @returns {Promise<Object>} Customer-safe summaries by Product; no catalogue or stock writes. @throws Owner faults reject without indexed/physical fallback for digital offers. @override Preserve one physical batch, distinct Product pool reads and customer redaction. */
    consumerAvailability: async function (request, rows) {
        const policy = this.enrichmentPolicy('inventory');
        const service = SERVICE[policy.serviceName || 'DefaultCustomerAvailabilitySummaryService'];
        const physical = new Map(), digital = new Map();
        for (const row of rows) {
            const attributes = row.payload?.localizedAttributes || {};
            if (attributes.productType === 'DIGITAL' || attributes.inventoryStrategy === 'COUPON_CODE_POOL') {
                if (physical.has(row.productCode)) throw new Error('Conflicting Product availability classification');
                digital.set(row.productCode, row);
            } else {
                if (digital.has(row.productCode)) throw new Error('Conflicting Product availability classification');
                const skus = physical.get(row.productCode) || new Set();
                Object.values(row.payload?.variantSkuMap || {}).filter(sku => typeof sku === 'string' && sku)
                    .forEach(sku => skus.add(sku));
                physical.set(row.productCode, skus);
            }
        }
        const physicalRequest = { ...request, authData: { ...request.authData,
            enterpriseCode: request.enterpriseCode, entCode: request.enterpriseCode } };
        if (physical.size) this.assertConsumerProvider('inventory', 'DefaultInventoryPublicationService', physicalRequest, physicalRequest, policy, service);
        if (policy.enabled === false) return {};
        const digitalService = SERVICE.DefaultDigitalCommerceCheckoutService;
        if (digital.size && typeof digitalService?.availabilityFromProjection !== 'function')
            throw new Error('Digital Product availability owner is unavailable');
        const context = { tenant: request.tenant, enterpriseCode: request.enterpriseCode,
            storeCode: request.storeCode, locale: request.locale, authData: this.serviceAuthData(physicalRequest),
            now: request.now, correlationId: request.correlationId };
        const result = physical.size && service && typeof service.summarize === 'function'
            ? await service.summarize({ ...context, products: [...physical].map(([productCode, skus]) =>
                ({ productCode, skus: [...skus] })) }) : {};
        const summaries = { ...result };
        for (const [productCode, row] of digital) {
            // Retained catalogue scope must not manufacture access-token enterprise authority for a digital owner.
            const authority = request.authData || {}, admission = SERVICE.DefaultPromotionDistributionAdmissionService;
            const read = { ...context, authData: structuredClone(authority), productCode, quantity: '1' };
            const publicRead = row.payload?.localizedAttributes?.digitalDeliveryType === 'COUPON_CODE' &&
                authority.isSystem !== true &&
                (authority.principalType === undefined || authority.principalType === 'anonymous' ||
                    ['human', 'customer'].includes(authority.principalType) && !authority.enterpriseCode && !authority.entCode);
            const admitted = publicRead && admission?.selected(read) ? await admission.publicAvailability(read) : undefined;
            let availability = admitted;
            if (admitted === undefined) {
                try {
                    availability = await digitalService.availabilityFromProjection(read, row);
                } catch (error) {
                    if (error?.code !== 'ERR_DIGITAL_AVAILABILITY_METADATA') throw error;
                    // A malformed offer is unavailable to customers, not a fallback or a checkout classification.
                    availability = { available: false };
                }
            }
            if (!availability || typeof availability.available !== 'boolean' ||
                (availability.code && !String(availability.code).startsWith('SUC_')) ||
                availability.error || availability.errors?.length) throw new Error('Digital Product availability is unavailable');
            summaries[productCode] = { available: availability.available,
                status: availability.available ? 'IN_STOCK' : 'OUT_OF_STOCK' };
        }
        return summaries;
    },

    /** Resolves one Product customer price summary. @param {Object} request Request. @param {Object} input Publication input. @returns {Promise<Object|undefined>} Price. */
    price: async function (request, input) {
        let policy = this.enrichmentPolicy('pricing');
        let service = SERVICE[policy.serviceName || 'DefaultCustomerPriceSummaryService'];
        this.assertConsumerProvider('pricing', 'DefaultPricingPublicationService', request, input, policy, service);
        if (policy.enabled === false) return undefined;
        if (!service || typeof service.summarize !== 'function') return undefined;
        let result = await service.summarize({
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            productCodes: [input.product.code],
            storeCode: input.storeCode,
            currency: input.currency || policy.defaultCurrency,
            quantity: input.quantity || policy.defaultQuantity || '1',
            now: request.now,
            correlationId: request.correlationId
        });
        return result[input.product.code];
    },

    /** Resolves one Product customer availability summary. @param {Object} request Request. @param {Object} input Publication input. @returns {Promise<Object|undefined>} Availability. */
    availability: async function (request, input) {
        let policy = this.enrichmentPolicy('inventory');
        let service = SERVICE[policy.serviceName || 'DefaultCustomerAvailabilitySummaryService'];
        this.assertConsumerProvider('inventory', 'DefaultInventoryPublicationService', request, input, policy, service);
        if (policy.enabled === false) return undefined;
        if (!service || typeof service.summarize !== 'function') return undefined;
        let skus = this.variantSkus(input.variants);
        if (skus.length === 0) return undefined;
        let result = await service.summarize({
            tenant: request.tenant,
            authData: this.serviceAuthData(request),
            products: [{ productCode: input.product.code, skus: skus }],
            storeCode: input.storeCode,
            now: request.now,
            correlationId: request.correlationId
        });
        return result[input.product.code];
    },

    /** Resolves active module-contributed domain projection enrichments without Product depending on any accelerator. */
    domains: async function (request, input) {
        let policy = this.enrichmentPolicy('domains');
        if (policy.enabled === false) return {};
        let result = {};
        for (let code of Object.keys(policy.contributors || {}).sort()) {
            let contribution = policy.contributors[code] || {}, service = SERVICE[contribution.serviceName];
            if (!service || typeof service.enrich !== 'function') {
                if (contribution.required === true) throw new Error('Missing Product domain enrichment service: ' + contribution.serviceName);
                continue;
            }
            Object.assign(result, await service.enrich(request, input));
        }
        return result;
    },

    /** Returns customer-safe summaries for search projection payload. @param {Object} request Request. @param {Object} input Publication input. @returns {Promise<Object>} Enrichment. */
    enrich: async function (request, input) {
        let result = {};
        try {
            let price = await this.price(request, input);
            if (price) result.price = price;
        } catch (error) {
            if (this.enrichmentPolicy('pricing').missingBehavior === 'error') throw error;
        }
        try {
            let availability = await this.availability(request, input);
            if (availability) result.availability = availability;
        } catch (error) {
            if (this.enrichmentPolicy('inventory').missingBehavior === 'error') throw error;
        }
        try { Object.assign(result, await this.domains(request, input)); } catch (error) {
            if (this.enrichmentPolicy('domains').missingBehavior === 'error') throw error;
        }
        return result;
    }
};
