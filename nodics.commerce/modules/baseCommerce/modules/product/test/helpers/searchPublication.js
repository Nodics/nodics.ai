/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module product/test/helpers/searchPublication @description Offline publication ports with real Product, Pricing and Inventory services. @layer test @owner product */
const product = require('../../config/properties');
const pricing = require('../../../pricing/config/properties');
const inventory = require('../../../inventory/config/properties');

/** Installs the existing publication test machinery around caller-owned records; no persistence or indexing occurs outside memory. */
module.exports = function searchPublication({ priceBooks = [], priceRows = [], inventoryBalances = [],
    generatedSearch = false } = {}) {
    const persisted = [], indexed = [], updated = [], removed = [];
    global.CONFIG = { get: key => ({ product: product.product, pricing: pricing.pricing, inventory: inventory.inventory })[key] };
    const search = {
        doSave: async request => indexed.push(request),
        doRemoveByQuery: async request => removed.push(request)
    };
    global.SERVICE = {
        DefaultProductLocalizationPolicyService: require('../../src/service/defaultProductLocalizationPolicyService'),
        DefaultProductLocalizedProjectionBuilderService: require('../../src/service/defaultProductLocalizedProjectionBuilderService'),
        DefaultProductSearchEnrichmentService: require('../../src/service/defaultProductSearchEnrichmentService'),
        DefaultProductPublicationPolicyService: require('../../src/service/defaultProductPublicationPolicyService'),
        DefaultCustomerPriceSummaryService: require('../../../pricing/src/service/defaultCustomerPriceSummaryService'),
        DefaultPriceSelectionService: require('../../../pricing/src/service/defaultPriceSelectionService'),
        DefaultExactAmountService: require('../../../pricing/src/service/defaultExactAmountService'),
        DefaultPriceBookService: { get: async () => ({ result: priceBooks }) },
        DefaultPriceRowService: { get: async () => ({ result: priceRows }) },
        DefaultCustomerAvailabilitySummaryService: require('../../../inventory/src/service/defaultCustomerAvailabilitySummaryService'),
        DefaultInventorySourcingService: require('../../../inventory/src/service/defaultInventorySourcingService'),
        DefaultInventoryBalanceService: { get: async () => ({ result: inventoryBalances }) },
        DefaultProductSearchProjectionService: {
            save: async request => persisted.push(request),
            update: async request => updated.push(request),
            ...(generatedSearch ? search : {})
        },
        ...(generatedSearch ? {} : { DefaultSearchService: search })
    };
    return { persisted, indexed, updated, removed };
};
