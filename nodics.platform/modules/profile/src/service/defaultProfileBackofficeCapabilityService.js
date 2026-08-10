/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/service/DefaultProfileBackofficeCapabilityService @description Publishes the concrete profile-owned BackOffice capability projection. @layer service @owner profile */
const capability = {
    "enabled": true,
    "capabilityId": "identity-profile",
    "displayName": "Profiles and Identity",
    "category": "core",
    "icon": "identity",
    "contractVersion": 1,
    "minimumClientContractVersion": 1,
    "roles": [
        "AUTHENTICATION_PROVIDER",
        "FUNCTIONAL_CAPABILITY_PROVIDER"
    ],
    "discovery": {
        "openApiPath": "/nodics/system/v0/contract/openapi/internal",
        "contractVersion": 1
    },
    "requiredPermissions": [
        "profile.backoffice.view"
    ],
    "navigation": [
        {
            "id": "customers",
            "label": "Customers",
            "route": "/profile",
            "icon": "profile",
            "order": 100,
            "group": {
                "id": "organization",
                "label": "Customers and Organization",
                "order": 400
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE",
            "requiredPermissions": [
                "profile.backoffice.view"
            ]
        },
        {
            "id": "customer-segments",
            "label": "Customer Segments",
            "route": "/profile/customer-segments",
            "icon": "profile",
            "order": 110,
            "group": {
                "id": "organization",
                "label": "Customers and Organization",
                "order": 400
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "employees",
            "label": "Employees",
            "route": "/profile/employees",
            "icon": "profile",
            "order": 120,
            "group": {
                "id": "organization",
                "label": "Customers and Organization",
                "order": 400
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "roles",
            "label": "Roles",
            "route": "/profile/roles",
            "icon": "profile",
            "order": 130,
            "group": {
                "id": "organization",
                "label": "Customers and Organization",
                "order": 400
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "permission-groups",
            "label": "Permission Groups",
            "route": "/profile/permission-groups",
            "icon": "profile",
            "order": 140,
            "group": {
                "id": "organization",
                "label": "Customers and Organization",
                "order": 400
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "enterprises",
            "label": "Enterprises",
            "route": "/profile/enterprises",
            "icon": "profile",
            "order": 150,
            "group": {
                "id": "organization",
                "label": "Customers and Organization",
                "order": 400
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED"
        },
        {
            "id": "business-units",
            "label": "Business Units",
            "route": "/profile/business-units",
            "icon": "profile",
            "order": 160,
            "group": {
                "id": "organization",
                "label": "Customers and Organization",
                "order": 400
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "DISABLED"
        }
    ]
};

module.exports = {
    /** Registers this module BackOffice capability provider. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('profile', this);
        return Promise.resolve(true);
    },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns this module owned BackOffice capability contract. */
    getCapability: function () { return JSON.parse(JSON.stringify(capability)); }
};
