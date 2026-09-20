/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/headers/wcms/nexusCorporateContentHeader
 * @description Defines Kickoff project-owned import header records for this data pack.
 * @layer data-header
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle PUBLISHABLE @destination WCMS_STAGED @owner nexus.web */

/** @description Core import header for the Nodics Nexus corporate content release. */
module.exports = {
    catalog: {
        nexusCatalogData: { options: { enabled: true, schemaName: 'catalog', operation: 'saveAll', dataFilePrefix: 'nexusCatalogData' }, query: { code: '$code' } }
    },
    cms: {
        nexusSiteData: { options: { enabled: true, schemaName: 'cmsSite', operation: 'saveAll', dataFilePrefix: 'nexusSiteData' }, query: { code: '$code' } },
        nexusTypeCodeData: { options: { enabled: true, schemaName: 'cmsTypeCode', operation: 'saveAll', dataFilePrefix: 'nexusTypeCodeData' }, query: { code: '$code' } },
        nexusRendererData: { options: { enabled: true, schemaName: 'cmsTypeCode2Renderer', operation: 'saveAll', dataFilePrefix: 'nexusRendererData' }, query: { code: '$code' } },
        nexusComponentTypeGroupData: { options: { enabled: true, schemaName: 'cmsComponentTypeGroup', operation: 'saveAll', dataFilePrefix: 'nexusComponentTypeGroupData' }, query: { code: '$code' } },
        nexusSlotData: { options: { enabled: true, schemaName: 'cmsSlotDefinition', operation: 'saveAll', dataFilePrefix: 'nexusSlotData' }, query: { code: '$code' } },
        nexusTemplateData: { options: { enabled: true, schemaName: 'cmsPageTemplate', operation: 'saveAll', dataFilePrefix: 'nexusTemplateData' }, query: { code: '$code' } },
        nexusComponentData: { options: { enabled: true, schemaName: 'cmsComponent', operation: 'saveAll', dataFilePrefix: 'nexusComponentData' }, query: { code: '$code' } },
        nexusPageData: { options: { enabled: true, schemaName: 'cmsPage', operation: 'saveAll', dataFilePrefix: 'nexusPageData' }, query: { code: '$code' } },
        nexusRouteData: { options: { enabled: true, schemaName: 'cmsPageRoute', operation: 'saveAll', dataFilePrefix: 'nexusRouteData' }, query: { code: '$code' } },
        nexusNavigationData: { options: { enabled: true, schemaName: 'cmsNavigationNode', operation: 'saveAll', dataFilePrefix: 'nexusNavigationData' }, query: { code: '$code' } }
    }
};
