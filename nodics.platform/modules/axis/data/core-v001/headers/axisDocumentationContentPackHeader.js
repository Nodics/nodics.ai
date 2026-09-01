/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Nodics foundation-import header for the Nodics Axis documentation content pack. */
module.exports = {
  cms: {
    axisDocumentationSiteData: { options: { enabled: true, schemaName: 'cmsSite', operation: 'saveAll', dataFilePrefix: 'axisDocumentationSiteData' }, query: { code: '$code' } },
    axisDocumentationProductData: { options: { enabled: true, schemaName: 'cmsDocumentationProduct', operation: 'saveAll', dataFilePrefix: 'axisDocumentationProductData' }, query: { code: '$code' } },
    axisDocumentationAccessPolicyData: { options: { enabled: true, schemaName: 'cmsDocumentationAccessPolicy', operation: 'saveAll', dataFilePrefix: 'axisDocumentationAccessPolicyData' }, query: { code: '$code' } },
    axisDocumentationNavigationData: { options: { enabled: true, schemaName: 'cmsDocumentationNavigation', operation: 'saveAll', dataFilePrefix: 'axisDocumentationNavigationData' }, query: { code: '$code' } },
    axisDocumentationDashboardData: { options: { enabled: true, schemaName: 'cmsDocumentationDashboard', operation: 'saveAll', dataFilePrefix: 'axisDocumentationDashboardData' }, query: { code: '$code' } },
    axisDocumentationLegacyNavigationCleanupData: { options: { enabled: true, schemaName: 'cmsDocumentationNode', operation: 'remove', dataFilePrefix: 'axisDocumentationLegacyNavigationCleanupData' }, query: { product: 'axisDocumentationProduct', navigation: 'axisDocumentationNavigationMetadata', nodeLevel: { $in: ['GROUP', 'SUBGROUP', 'TOPIC'] } } },
    axisDocumentationNodeData: { options: { enabled: true, schemaName: 'cmsDocumentationNode', operation: 'saveAll', dataFilePrefix: 'axisDocumentationNodeData' }, query: { code: '$code' } },
    axisDocumentationPageMetadataData: { options: { enabled: true, schemaName: 'cmsDocumentationPage', operation: 'saveAll', dataFilePrefix: 'axisDocumentationPageMetadataData' }, query: { code: '$code' } },
    axisDocumentationPublicationStateData: { options: { enabled: true, schemaName: 'cmsDocumentationPublicationState', operation: 'saveAll', dataFilePrefix: 'axisDocumentationPublicationStateData' }, query: { code: '$code' } },
    axisDocumentationSearchMetadataData: { options: { enabled: true, schemaName: 'cmsDocumentationSearchMetadata', operation: 'saveAll', dataFilePrefix: 'axisDocumentationSearchMetadataData' }, query: { code: '$code' } },
    axisDocumentationTypeCodeData: { options: { enabled: true, schemaName: 'cmsTypeCode', operation: 'saveAll', dataFilePrefix: 'axisDocumentationTypeCodeData' }, query: { code: '$code' } },
    axisDocumentationRendererData: { options: { enabled: true, schemaName: 'cmsTypeCode2Renderer', operation: 'saveAll', dataFilePrefix: 'axisDocumentationRendererData' }, query: { code: '$code' } },
    axisDocumentationTemplateData: { options: { enabled: true, schemaName: 'cmsPageTemplate', operation: 'saveAll', dataFilePrefix: 'axisDocumentationTemplateData' }, query: { code: '$code' } },
    axisDocumentationSlotData: { options: { enabled: true, schemaName: 'cmsSlotDefinition', operation: 'saveAll', dataFilePrefix: 'axisDocumentationSlotData' }, query: { code: '$code' } },
    axisDocumentationComponentData: { options: { enabled: true, schemaName: 'cmsComponent', operation: 'saveAll', dataFilePrefix: 'axisDocumentationComponentData' }, query: { code: '$code' } },
    axisDocumentationPageData: { options: { enabled: true, schemaName: 'cmsPage', operation: 'saveAll', dataFilePrefix: 'axisDocumentationPageData' }, query: { code: '$code' } },
    axisDocumentationRouteData: { options: { enabled: true, schemaName: 'cmsPageRoute', operation: 'saveAll', dataFilePrefix: 'axisDocumentationRouteData' }, query: { code: '$code' } },
  },
};
