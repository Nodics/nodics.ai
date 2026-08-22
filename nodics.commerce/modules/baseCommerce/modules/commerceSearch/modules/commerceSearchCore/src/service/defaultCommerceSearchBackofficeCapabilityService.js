/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module commerceSearchCore/service/defaultCommerceSearchBackofficeCapabilityService @description Publishes Commerce Search Axis capability metadata. @layer service @owner commerceSearchCore */
module.exports = {
    /**
     * Registers Commerce Search as a BackOffice capability provider.
     *
     * @returns {Promise<boolean>} Resolves when registration completes.
     */
    init: function () { SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('commerceSearchCore', this); return Promise.resolve(true); },
    /**
     * Runs post-initialization for the capability provider.
     *
     * @returns {Promise<boolean>} Resolves when post-initialization completes.
     */
    postInit: function () { return Promise.resolve(true); },
    /**
     * Builds Axis/BackOffice capability metadata for Commerce Search.
     *
     * @returns {Object} BackOffice capability definition.
     */
    getCapability: function () {
        let d = SERVICE.DefaultBackofficeCapabilityDefinitionService;
        return d.capability({ capabilityId: 'commerce-search', displayName: 'Commerce Search', category: 'commerce', icon: 'search', navigation: [
            d.workbench({ id: 'commerce-search', parentId: 'search-merchandising-ranking', parentModuleName: 'discoveryConfig', label: 'Commerce Search Rules', route: '/commerce/search', moduleName: 'commerceSearchCore', schemaName: 'commerceSearchRule', order: 652, permission: 'commerce.search.read', summary: 'Manage business search ranking rules for product discovery.', group: { id: 'search-discovery', label: 'Search and Discovery', order: 600 }, presentation: { defaultColumns: ['code', 'name', 'storeCode', 'locale', 'scopeType', 'status', 'priority', 'revision'] } }),
            d.workbench({ id: 'commerce-search-projections', parentId: 'commerce-search', label: 'Published Search Rules', route: '/commerce/search/projections', moduleName: 'commerceSearchCore', schemaName: 'commerceSearchRuleProjection', order: 151, permission: 'commerce.search.read', summary: 'Inspect active boost, bury, and pin rule projections used by customer discovery.', presentation: { defaultColumns: ['code', 'storeCode', 'locale', 'scopeType', 'categoryCode', 'searchTerm', 'status', 'projectedAt'] } })
        ] });
    }
};
