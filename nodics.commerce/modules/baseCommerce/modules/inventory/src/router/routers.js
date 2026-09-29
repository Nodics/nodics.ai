/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';
/** @module inventory/src/router/routers @description Declares internal Inventory publication ingestion APIs. @layer router @owner inventory */
module.exports = {
    inventory: {
        operator: {
            balanceAction: {
                secured: true, authTokenTypes: ['access','service'], accessGroups: ['employeeUserGroup','serviceAccountUserGroup'],
                permission: 'commerce.inventory.operate', apiExposure: 'commerceManagement',
                key: '/inventory/balances/:balanceCode/actions/:actionCode', method: 'POST',
                controller: 'DefaultInventoryOperationController', operation: 'balanceAction',
                help: { requestType: 'secured', message: 'Executes Inventory-owned stock operations against a selected balance.' }
            },
            restoreOperational: {
                secured: true, authTokenTypes: ['access','service'], accessGroups: ['employeeUserGroup','serviceAccountUserGroup'],
                permission: 'commerce.product.publish', apiExposure: 'commercePublicationIngestion',
                key: '/internal/inventory/publication/operational/restore', method: 'POST',
                controller: 'DefaultInventoryPublicationController', operation: 'restoreOperational',
                help: { requestType: 'secured', message: 'Restores evidenced Inventory operational records into the Online Inventory boundary.' }
            }
        }
    }
};

// Runtime service grants and explicit Online role are required; no customer authoring route.
module.exports.inventory.policyPublicationAuthoring = {
    createGoverned: { active: true, secured: true, authTokenTypes: ['access'],
        accessGroups: ['runtimeConfigAdminUserGroup'], permission: 'publish.lifecycle.create',
        apiExposure: 'inventoryPublicationAuthoring', key: '/publication/policy', method: 'POST',
        controller: 'DefaultInventoryPublicationTargetController', operation: 'createGoverned' }
};
module.exports.inventory.policyPublicationTarget = {
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
        "controller": "DefaultInventoryPublicationTargetController",
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
        "controller": "DefaultInventoryPublicationTargetController",
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
        "controller": "DefaultInventoryPublicationTargetController",
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
        "controller": "DefaultInventoryPublicationTargetController",
        "operation": "reconcile"
    }
};

module.exports.inventory.policyPublicationTarget.authorize = {
    secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'],
    permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'commercePublicationIngestion',
    key: '/publication/policy/authorize', method: 'POST',
    controller: 'DefaultInventoryPublicationTargetController', operation: 'authorize'
};
module.exports.inventory.policyPublicationTarget.applyPublicationDecision = {
    secured: true, authTokenTypes: ['service'], accessGroups: ['userGroup'],
    permissionConfig: 'authSecurity.internalToken.routePermission', apiExposure: 'commercePublicationIngestion',
    key: '/workflow/actions/applyPublicationDecision', method: 'POST',
    controller: 'DefaultInventoryPublicationTargetController', operation: 'applyPublicationDecision'
};
