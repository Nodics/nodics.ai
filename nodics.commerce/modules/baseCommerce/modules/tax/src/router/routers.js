/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module tax/src/router/routers @description Declares internal Tax publication ingestion APIs. @layer router @owner tax */
module.exports = {
    tax: {
        operator: {
            restoreOperational: {
                secured: true, authTokenTypes: ['access'], accessGroups: ['employeeUserGroup'],
                permission: 'commerce.product.publish', apiExposure: 'commercePublicationIngestion',
                key: '/internal/tax/publication/operational/restore', method: 'POST',
                controller: 'DefaultTaxPublicationController', operation: 'restoreOperational',
                help: { requestType: 'secured', message: 'Restores evidenced Tax operational policy records into the Online Tax boundary.' }
            }
        }
    }
};

// Runtime service grants and explicit Online role are required; no customer authoring route.
module.exports.tax.policyPublicationAuthoring = {
    createGoverned: { active: true, secured: true, authTokenTypes: ['access'],
        accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'publish.lifecycle.create',
        apiExposure: 'taxPublicationAuthoring', key: '/publication/policy', method: 'POST',
        controller: 'DefaultTaxPublicationTargetController', operation: 'createGoverned' }
};
module.exports.tax.policyPublicationTarget = {
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
        "controller": "DefaultTaxPublicationTargetController",
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
        "controller": "DefaultTaxPublicationTargetController",
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
        "controller": "DefaultTaxPublicationTargetController",
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
        "controller": "DefaultTaxPublicationTargetController",
        "operation": "reconcile"
    }
};

module.exports.tax.policyPublicationTarget.authorize = {
    secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'],
    permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'commercePublicationIngestion',
    key: '/publication/policy/authorize', method: 'POST',
    controller: 'DefaultTaxPublicationTargetController', operation: 'authorize'
};
module.exports.tax.policyPublicationTarget.applyPublicationDecision = {
    secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'],
    permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'commercePublicationIngestion',
    key: '/workflow/actions/applyPublicationDecision', method: 'POST',
    controller: 'DefaultTaxPublicationTargetController', operation: 'applyPublicationDecision'
};
