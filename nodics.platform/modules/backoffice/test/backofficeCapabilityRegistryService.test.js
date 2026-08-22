/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
const assert = require('node:assert/strict');
const contract = require('../src/service/contract/defaultBackofficeContractService');
global.CLASSES = { NodicsError: class NodicsError extends Error { constructor(code, message) { super(message); this.code = code; } } };
global.SERVICE = {
    DefaultBackofficeContractService: contract,
    DefaultBackofficeRegistryService: { evaluateCompatibility: () => ({ status: 'COMPATIBLE' }) }
};
const registry = require('../src/service/registry/defaultBackofficeCapabilityRegistryService');
const capability = (id, navigation) => ({ enabled: true, capabilityId: id, displayName: id,
    category: 'commerce', icon: 'commerce', contractVersion: 1, minimumClientContractVersion: 1,
    roles: ['FUNCTIONAL_CAPABILITY_PROVIDER'], navigation: navigation });
const item = (id, parentId, parentModuleName, permission) => Object.assign({ id: id, label: id,
    route: '/' + id, icon: 'commerce', order: 10, perspectives: ['business'], contexts: ['tenant'],
    featureState: 'ACTIVE', requiredPermissions: [permission], workbenchTarget: { moduleName: id, schemaName: id },
    help: { summary: id } }, parentId ? { parentId: parentId } : {}, parentModuleName ? { parentModuleName: parentModuleName } : {});

const modules = {
    product: [{ backoffice: capability('product', [item('catalog', undefined, undefined, 'catalog.read')]) },
        { backoffice: capability('product', [item('catalog', undefined, undefined, 'catalog.read')]) }],
    pricing: [{ backoffice: capability('pricing', [item('prices', 'catalog', 'product', 'pricing.read')]) }]
};
let catalogue = registry.buildCatalogue(modules, 1, { permissions: ['catalog.read', 'pricing.read'] });
assert.deepEqual(Object.keys(catalogue), ['pricing', 'product']);
assert.equal(catalogue.pricing.navigation.length, 1);
assert.equal(catalogue.product.navigation.length, 1, 'identical providers from multiple runtime instances must deduplicate');
catalogue = registry.buildCatalogue(modules, 1, { permissions: ['pricing.read'] });
assert.equal(catalogue.product.navigation.length, 0);
assert.equal(catalogue.pricing.navigation.length, 0, 'cross-module descendants must be removed when the parent is unauthorized');
catalogue = registry.buildCatalogue({
    product: [{ backoffice: capability('product', [Object.assign(item('catalog', undefined, undefined, 'catalog.read'),
        { group: { id: 'products-merchandising', label: 'Products and Merchandising', order: 500 } }),
    item('products', 'catalog', undefined, 'catalog.read')]) }],
    pricing: [{ backoffice: capability('pricing', [item('prices', 'products', 'product', 'pricing.read')]) }]
}, 1, { permissions: ['catalog.read', 'pricing.read'] });
assert.equal(catalogue.product.navigation.find(entry => entry.id === 'products').group.label,
    'Products and Merchandising', 'same-module descendants must inherit the authorized parent group');
assert.equal(catalogue.pricing.navigation.find(entry => entry.id === 'prices').group.label,
    'Products and Merchandising', 'cross-module descendants must inherit the authorized parent group');
let gated = registry.applyFunctionalModuleEligibility(modules, {
    governedModules: ['product', 'pricing'], eligibleModules: ['product']
});
assert.deepEqual(Object.keys(gated), ['product'], 'inactive functional-module members must not enter the effective capability catalogue');
assert.throws(() => registry.buildCatalogue({ product: [{ backoffice: capability('one', []) },
    { backoffice: capability('two', []) }] }, 1, { permissions: ['*'] }), /Inconsistent BackOffice capability providers/);
assert.throws(() => registry.buildCatalogue({ first: [{ backoffice: capability('first', [item('duplicate', undefined, undefined, 'read')]) }],
    second: [{ backoffice: capability('second', [item('duplicate', undefined, undefined, 'read')]) }] }, 1, { permissions: ['*'] }),
    /Duplicate BackOffice navigation id/);
console.log('BackOffice capability registry service validated');
