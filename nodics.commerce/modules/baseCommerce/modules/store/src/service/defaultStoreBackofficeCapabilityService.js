/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available software. See root LICENSE. */
/** @module store/service/DefaultStoreBackofficeCapabilityService @description Publishes the Store-owned BackOffice workspace. @layer service @owner store */
module.exports = {
    /** Registers the Store BackOffice capability provider. */
    init: function () { SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('store', this); return Promise.resolve(true); },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the Store-owned BackOffice capability contract. */
    getCapability: function () { let d = SERVICE.DefaultBackofficeCapabilityDefinitionService; return d.capability({ capabilityId: 'commerce-store', displayName: 'Stores & Channels', category: 'commerce', icon: 'commerce', navigation: [d.workbench({ id: 'stores', parentId: 'catalogs-assortments', parentModuleName: 'product', label: 'Store Assignments', route: '/commerce/catalog/stores', moduleName: 'store', schemaName: 'store', order: 535, permission: 'commerce.store.read', summary: 'Review tenant selling contexts, channels, locale, currency, and activation.', presentation: { defaultColumns: ['code', 'name', 'status', 'defaultCurrency', 'defaultLocale', 'timezone', 'revision'] } })] }); }
};
