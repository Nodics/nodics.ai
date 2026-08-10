/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics source-available software. See root LICENSE. */
/** @module product/service/DefaultProductBackofficeCapabilityService @description Publishes Product-owned BackOffice catalogue and localization workspaces. @layer service @owner product */
module.exports = {
    /** Registers the Product BackOffice capability provider. */
    init: function () { SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('product', this); return Promise.resolve(true); },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns the Product-owned BackOffice capability contract. */
    getCapability: function () {
        let definitions = SERVICE.DefaultBackofficeCapabilityDefinitionService;
        let item = (id, parentId, label, route, schemaName, order, summary, presentation) => definitions.workbench({
            id: id, parentId: parentId, label: label, route: route, moduleName: 'product', schemaName: schemaName,
            order: order, permission: id === 'catalog-and-products' ? 'commerce.catalog.read' : 'commerce.product.read',
            summary: summary, presentation: presentation,
            group: id === 'catalog-and-products' ? { id: 'commerce', label: 'Commerce', order: 300 } : undefined
        });
        return definitions.capability({ capabilityId: 'commerce-product', displayName: 'Catalog & Products', category: 'commerce', icon: 'commerce', navigation: [
            item('catalog-and-products', undefined, 'Catalog & Products', '/commerce/catalog', 'product', 100, 'Manage Store and Product sellable truth; lifecycle reversals never start here.', { defaultColumns: ['code', 'name', 'status', 'catalogVersion', 'revision'] }),
            item('products', 'catalog-and-products', 'Products', '/commerce/catalog/products', 'product', 120, 'Manage product identity, variants, categories, and staged publication.', { defaultColumns: ['code', 'name', 'status', 'catalogVersion', 'revision'] }),
            item('product-localizations', 'products', 'Product Languages', '/commerce/catalog/products/languages', 'productLocalization', 121, 'Manage Product-owned localized names, descriptions, SEO, attributes, media text, and readiness.', { defaultColumns: ['productCode', 'locale', 'name', 'status', 'revision'], fixedFilters: [] }),
            item('category-localizations', 'products', 'Category Languages', '/commerce/catalog/categories/languages', 'categoryLocalization', 122, 'Manage localized Category presentation while retaining one shared hierarchy.', { defaultColumns: ['categoryCode', 'locale', 'name', 'status', 'revision'], fixedFilters: [] }),
            item('variant-localizations', 'products', 'Variant Languages', '/commerce/catalog/variants/languages', 'productVariantLocalization', 123, 'Manage localized Variant presentation while retaining one shared SKU identity.', { defaultColumns: ['productCode', 'variantCode', 'locale', 'status', 'revision'], fixedFilters: [] }),
            item('product-search-locales', 'products', 'Localized Search Status', '/commerce/catalog/products/search-locales', 'productSearchProjection', 124, 'Inspect deterministic Store-and-locale Product search projection status.', { defaultColumns: ['productCode', 'storeCode', 'locale', 'status', 'sourceHash', 'projectedAt'], fixedFilters: [] })
        ] });
    }
};
