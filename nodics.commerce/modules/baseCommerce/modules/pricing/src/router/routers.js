/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module pricing/src/router/routers @description Declares internal Pricing publication ingestion APIs. @layer router @owner pricing */
module.exports = {
    pricing: {
        // Selective schema APIs reuse generated controllers; broad CRUD remains disabled.

        operator: {
            restoreOperational: {
                secured: true, authTokenTypes: ['access','service'], accessGroups: ['employeeUserGroup','serviceAccountUserGroup'],
                permission: 'commerce.product.publish', apiExposure: 'commercePublicationIngestion',
                key: '/internal/pricing/publication/operational/restore', method: 'POST',
                controller: 'DefaultPricingPublicationController', operation: 'restoreOperational',
                help: { requestType: 'secured', message: 'Restores evidenced Pricing operational records into the Online Pricing boundary.' }
            }
        }
    }
};

// Runtime service grants and explicit Online role are required; no customer authoring route.
module.exports.pricing.policyPublicationAuthoring = {
    createGoverned: { active: true, secured: true, authTokenTypes: ['access'],
        accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'publish.lifecycle.create',
        apiExposure: 'pricingPublicationAuthoring', key: '/publication/policy', method: 'POST',
        controller: 'DefaultPricingPublicationTargetController', operation: 'createGoverned' }
};
module.exports.pricing.policyPublicationTarget = {
    "prepare": {
        "secured": true,
        "authTokenTypes": [
            "service"
        ],
        "accessGroups": [
            "userGroup"
        ],
        "permissionConfig": "authSecurity.internalToken.routePermission",
        "apiExposure": "commercePublicationIngestion",
        "key": "/publication/policy/prepare",
        "method": "POST",
        "controller": "DefaultPricingPublicationTargetController",
        "operation": "prepare"
    },
    "status": {
        "secured": true,
        "authTokenTypes": [
            "service"
        ],
        "accessGroups": [
            "userGroup"
        ],
        "permissionConfig": "authSecurity.internalToken.routePermission",
        "apiExposure": "commercePublicationIngestion",
        "key": "/publication/policy/status",
        "method": "POST",
        "controller": "DefaultPricingPublicationTargetController",
        "operation": "status"
    },
    "activate": {
        "secured": true,
        "authTokenTypes": [
            "service"
        ],
        "accessGroups": [
            "userGroup"
        ],
        "permissionConfig": "authSecurity.internalToken.routePermission",
        "apiExposure": "commercePublicationIngestion",
        "key": "/publication/policy/activate",
        "method": "POST",
        "controller": "DefaultPricingPublicationTargetController",
        "operation": "activate"
    },
    "reconcile": {
        "secured": true,
        "authTokenTypes": [
            "service"
        ],
        "accessGroups": [
            "userGroup"
        ],
        "permissionConfig": "authSecurity.internalToken.routePermission",
        "apiExposure": "commercePublicationIngestion",
        "key": "/publication/policy/reconcile",
        "method": "POST",
        "controller": "DefaultPricingPublicationTargetController",
        "operation": "reconcile"
    }
};

module.exports.pricing.policyPublicationTarget.authorize = {
    secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'],
    permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'commercePublicationIngestion',
    key: '/publication/policy/authorize', method: 'POST',
    controller: 'DefaultPricingPublicationTargetController', operation: 'authorize'
};
module.exports.pricing.policyPublicationTarget.applyPublicationDecision = {
    secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'],
    permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'commercePublicationIngestion',
    key: '/workflow/actions/applyPublicationDecision', method: 'POST',
    controller: 'DefaultPricingPublicationTargetController', operation: 'applyPublicationDecision'
};
