/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module axis/config/properties
 * @description Contributes Axis-specific backend-owned documentation and navigation metadata for BackOffice aggregation.
 * @layer config
 * @owner axis
 */
module.exports = {
    backofficeCapabilities: {
        axis: {
            enabled: true,
            capabilityId: 'axis-product-data',
            displayName: 'Nodics Axis',
            category: 'platform',
            icon: 'content',
            contractVersion: 1,
            minimumClientContractVersion: 1,
            roles: ['UI_COMPOSITION_PROVIDER'],
            documentation: [
                {
                    id: 'nodics-axis',
                    label: 'Nodics Axis',
                    type: 'CMS',
                    route: '/docs/nodics-axis',
                    order: 300,
                    connectionModule: 'cms',
                    site: 'axisDocumentationSite',
                    catalog: 'axisDocumentationContentCatalog',
                    defaultPage: '/docs/nodics-axis',
                    packCode: 'axisDocumentation',
                    dashboard: {
                        kind: 'Application guide',
                        icon: 'schema',
                        summary: 'Short user-facing guidance for the Nodics Axis BackOffice client, shell, workbench, and business workspaces.',
                        audiences: ['administrator', 'business-user', 'operator'],
                        coverage: {
                            score: 45,
                            status: 'PARTIAL',
                            signals: ['Application shell guidance', 'Schema Workbench entry points', 'Media Management flow notes'],
                            gaps: ['More end-to-end user journeys', 'More page-level operator help', 'More role-specific recipes']
                        }
                    }
                }
            ],
            navigation: [
                {
                    id: 'documentation-nodics-axis',
                    parentId: 'documentation',
                    parentModuleName: 'backoffice',
                    label: 'Nodics Axis',
                    route: '/docs/nodics-axis',
                    icon: 'content',
                    order: 130,
                    group: { id: 'documentation', label: 'Documentation', order: 650 },
                    perspectives: ['operations'],
                    contexts: ['environment', 'tenant', 'enterprise'],
                    featureState: 'ACTIVE'
                }
            ]
        }
    }
};
