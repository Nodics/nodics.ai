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
            "id": "customer-workspace",
            "label": "Customer Workspace",
            "route": "/profile",
            "icon": "profile",
            "order": 400,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "id": "customers-profiles",
            "label": "Customers and Profiles",
            "route": "/profile#customers-profiles",
            "icon": "profile",
            "order": 410,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "id": "customer-overview",
            "parentId": "customer-workspace",
            "label": "Customer Overview",
            "route": "/profile#customer-overview",
            "icon": "profile",
            "order": 401,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "id": "search-customer",
            "parentId": "customer-workspace",
            "label": "Search Customer",
            "route": "/profile#search-customer",
            "icon": "search",
            "order": 402,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "id": "create-customer",
            "parentId": "customer-workspace",
            "label": "Create Customer",
            "route": "/profile#create-customer",
            "icon": "add",
            "order": 403,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "id": "customers-needing-attention",
            "parentId": "customer-workspace",
            "label": "Customers Needing Attention",
            "route": "/profile#customers-needing-attention",
            "icon": "validation",
            "order": 404,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "id": "recent-registrations",
            "parentId": "customer-workspace",
            "label": "Recent Registrations",
            "route": "/profile#recent-registrations",
            "icon": "history",
            "order": 405,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "id": "open-customer-requests",
            "parentId": "customer-workspace",
            "label": "Open Customer Requests",
            "route": "/profile#open-customer-requests",
            "icon": "feedback",
            "order": 406,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "id": "complaints-escalations",
            "parentId": "customer-workspace",
            "label": "Complaints and Escalations",
            "route": "/profile#complaints-escalations",
            "icon": "feedback",
            "order": 407,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "id": "consent-privacy-alerts",
            "parentId": "customer-workspace",
            "label": "Consent or Privacy Alerts",
            "route": "/profile#consent-privacy-alerts",
            "icon": "security",
            "order": 408,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "id": "customer-activity-summary",
            "parentId": "customer-workspace",
            "label": "Customer Activity Summary",
            "route": "/profile#customer-activity-summary",
            "icon": "dashboard",
            "order": 409,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "id": "segments-audiences",
            "label": "Segments and Audiences",
            "route": "/profile#segments-audiences",
            "icon": "profile",
            "order": 420,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "featureState": "DISABLED",
            "requiredPermissions": [
                "profile.backoffice.view"
            ]
        },
        {
            "id": "organisations-business-accounts",
            "label": "Organisations and Business Accounts",
            "route": "/profile#organisations-business-accounts",
            "icon": "organization",
            "order": 430,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "featureState": "DISABLED",
            "requiredPermissions": [
                "profile.backoffice.view"
            ]
        },
        {
            "id": "employees-teams",
            "label": "Employees and Teams",
            "route": "/profile#employees-teams",
            "icon": "profile",
            "order": 440,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "featureState": "DISABLED",
            "requiredPermissions": [
                "profile.backoffice.view"
            ]
        },
        {
            "id": "roles-access",
            "label": "Roles and Access",
            "route": "/profile#roles-access",
            "icon": "security",
            "order": 450,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "featureState": "DISABLED",
            "requiredPermissions": [
                "profile.backoffice.view"
            ]
        },
        {
            "id": "privacy-customer-rights",
            "label": "Privacy and Customer Rights",
            "route": "/profile#privacy-customer-rights",
            "icon": "security",
            "order": 490,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "featureState": "DISABLED",
            "requiredPermissions": [
                "profile.backoffice.view"
            ]
        },
        {
            "id": "customers",
            "parentId": "customers-profiles",
            "label": "Customers",
            "route": "/profile",
            "icon": "profile",
            "order": 411,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "id": "customer-profiles",
            "parentId": "customers-profiles",
            "label": "Customer Profiles",
            "route": "/profile/customer-profiles",
            "icon": "profile",
            "order": 412,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "id": "customer-addresses",
            "parentId": "customers-profiles",
            "label": "Addresses",
            "route": "/profile/addresses",
            "icon": "profile",
            "order": 413,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "id": "customer-contact-details",
            "parentId": "customers-profiles",
            "label": "Contact Details",
            "route": "/profile/contact-details",
            "icon": "profile",
            "order": 414,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "id": "customer-groups",
            "parentId": "customers-profiles",
            "label": "Customer Groups",
            "route": "/profile/customer-groups",
            "icon": "profile",
            "order": 415,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "id": "customer-segments",
            "parentId": "segments-audiences",
            "label": "Customer Segments",
            "route": "/profile/customer-segments",
            "icon": "profile",
            "order": 110,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "parentId": "employees-teams",
            "label": "Employees",
            "route": "/profile/employees",
            "icon": "profile",
            "order": 120,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "parentId": "roles-access",
            "label": "Roles",
            "route": "/profile/roles",
            "icon": "profile",
            "order": 130,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "parentId": "roles-access",
            "label": "Permission Groups",
            "route": "/profile/permission-groups",
            "icon": "profile",
            "order": 140,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "parentId": "organisations-business-accounts",
            "label": "Enterprises",
            "route": "/profile/enterprises",
            "icon": "profile",
            "order": 150,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
            "parentId": "organisations-business-accounts",
            "label": "Business Units",
            "route": "/profile/business-units",
            "icon": "profile",
            "order": 160,
            "group": {
                "id": "organization",
                "label": "Customers and Organisation",
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
