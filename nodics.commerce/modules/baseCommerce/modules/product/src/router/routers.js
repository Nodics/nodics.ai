/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module product/router/routers
 * @description Declares Product-owned discovery/PDP APIs and publication orchestration routes.
 * @layer router
 * @owner product
 * @override Later Product extension modules may add routes or replace handlers while preserving tenant, Store, and locale isolation.
 */
module.exports = {
    product: {
        // Selective schema APIs reuse generated controllers; broad CRUD remains disabled.

        customer: {
            list: {
                secured: false, publicAccess: true, accessGroups: ['userGroup'], apiExposure: 'commerceCustomer',
                key: '/products/discovery', method: 'GET',
                controller: 'DefaultProductDiscoveryController', operation: 'list',
                help: { requestType: 'public', message: 'Lists customer-safe Product cards from the Product search projection.' }
            },
            detail: {
                secured: false, publicAccess: true, accessGroups: ['userGroup'], apiExposure: 'commerceCustomer',
                key: '/products/:productCode', method: 'GET',
                controller: 'DefaultProductDiscoveryController', operation: 'detail',
                help: { requestType: 'public', message: 'Resolves one customer-safe Product detail projection.' }
            }
        },
        operator: {
            createGoverned: { active: true, secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'],
                permission: 'commerce.product.publish', apiExposure: 'productPublicationSource', key: '/products/publication', method: 'POST',
                controller: 'DefaultProductPublicationController', operation: 'createGoverned' },
            applyPublicationDecision: { active: true, secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
                permission: 'commerce.product.publish', apiExposure: 'productPublicationSource', key: '/workflow/actions/applyPublicationDecision', method: 'POST',
                controller: 'DefaultProductPublicationController', operation: 'applyPublicationDecision' },
            createListing:{secured:true,authTokenTypes:['service'],accessGroups:['serviceAccountUserGroup'],permission:'commerce.product.publish',apiExposure:'commerceManagement',key:'/internal/products/listings',method:'POST',controller:'DefaultProductListingAuthoringController',operation:'create'},
            publishSearch: {
                secured: true, authTokenTypes: ['access','service'], accessGroups: ['employeeUserGroup','serviceAccountUserGroup'],
                permission: 'commerce.product.publish', apiExposure: 'commerceManagement',
                key: '/products/publication/search', method: 'POST',
                controller: 'DefaultProductPublicationController', operation: 'publishSearch',
                help: { requestType: 'secured', message: 'Publishes persisted Staged Product records into Product search projections.' }
            },
            restoreSearch: {
                secured: true, authTokenTypes: ['access','service'], accessGroups: ['employeeUserGroup','serviceAccountUserGroup'],
                permission: 'commerce.product.publish', apiExposure: 'commercePublicationIngestion',
                key: '/internal/products/publication/search/restore', method: 'POST',
                controller: 'DefaultProductPublicationController', operation: 'restoreSearch',
                help: { requestType: 'secured', message: 'Restores evidenced Product search projections into the Online Product search boundary.' }
            }
        }
    }
};

for (const [operation, path] of Object.entries({ targetDeploy: 'deploy', targetStatus: 'status', targetRollback: 'rollback', targetWithdraw: 'withdraw', authorizeTarget: 'authorize-target' })) {
    module.exports.product.operator[operation] = { active: true, secured: true, authTokenTypes: ['service'],
        accessGroups: ['serviceAccountUserGroup'], permission: 'commerce.product.publish',
        apiExposure: operation === 'authorizeTarget' ? 'productPublicationSource' : 'productPublicationTarget',
        key: '/internal/products/publication/' + path, method: 'POST', controller: 'DefaultProductPublicationController', operation };
}
