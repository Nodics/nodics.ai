/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module axis/service/DefaultAxisBackofficeCapabilityService @description Publishes the concrete axis-owned BackOffice capability projection. @layer service @owner axis */
const capability = {
    "enabled": true,
    "capabilityId": "axis-product-data",
    "displayName": "Nodics Axis",
    "category": "platform",
    "icon": "content",
    "contractVersion": 0,
    "minimumClientContractVersion": 0,
    "roles": [
        "UI_COMPOSITION_PROVIDER"
    ],
    "documentation": [
        {
            "id": "nodics-axis",
            "label": "Nodics Axis",
            "type": "CMS",
            "route": "/docs/nodics-axis",
            "order": 300,
            "connectionModule": "cms",
            "site": "axisDocumentationSite",
            "catalog": "documentationContentCatalog",
            "defaultPage": "/docs/nodics-axis",
            "packCode": "axisDocumentation",
            "initializationProfile": "axisdocs",
            "dashboard": {
                "kind": "Application guide",
                "icon": "schema",
                "summary": "Short user-facing guidance for the Nodics Axis BackOffice client, shell, workbench, and business workspaces.",
                "audiences": [
                    "administrator",
                    "business-user",
                    "operator"
                ],
                "coverage": {
                    "score": 78,
                    "status": "STRONG",
                    "signals": [
                        "Application shell guidance",
                        "Schema Workbench entry points",
                        "Media Management flow notes",
                        "OpenAPI reference grouping",
                        "Common mistakes and verification gates"
                    ],
                    "gaps": [
                        "More screenshot-led walkthroughs",
                        "More role-specific recipes",
                        "More live operator playbooks"
                    ]
                }
            }
        }
    ],
    "navigation": [
        {
            "id": "documentation-nodics-axis",
            "label": "Nodics Axis",
            "route": "/docs/nodics-axis",
            "icon": "content",
            "order": 130,
            "group": {
                "id": "documentation",
                "label": "Documentation",
                "order": 1600
            },
            "perspectives": [
                "operations"
            ],
            "contexts": [
                "environment",
                "tenant",
                "enterprise"
            ],
            "featureState": "ACTIVE"
        }
    ]
};

module.exports = {
    /** Registers this module BackOffice capability provider. */
    init: function () {
        SERVICE.DefaultModuleRegistrationAgentService.registerBackofficeCapabilityProvider('axis', this);
        return Promise.resolve(true);
    },
    /** Completes provider lifecycle initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns this module owned BackOffice capability contract. */
    getCapability: function () { return JSON.parse(JSON.stringify(capability)); }
};
