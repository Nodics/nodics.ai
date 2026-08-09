/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Nodics core-import header for Process documentation. */
module.exports = {
  cms: {
    processDocumentationSiteData: { options: { enabled: true, schemaName: 'cmsSite', operation: 'saveAll', dataFilePrefix: 'processDocumentationSiteData' }, query: { code: '$code' } },
    processDocumentationTypeCodeData: { options: { enabled: true, schemaName: 'cmsTypeCode', operation: 'saveAll', dataFilePrefix: 'processDocumentationTypeCodeData' }, query: { code: '$code' } },
    processDocumentationRendererData: { options: { enabled: true, schemaName: 'cmsTypeCode2Renderer', operation: 'saveAll', dataFilePrefix: 'processDocumentationRendererData' }, query: { code: '$code' } },
    processDocumentationSlotData: { options: { enabled: true, schemaName: 'cmsSlotDefinition', operation: 'saveAll', dataFilePrefix: 'processDocumentationSlotData' }, query: { code: '$code' } },
    processDocumentationTemplateData: { options: { enabled: true, schemaName: 'cmsPageTemplate', operation: 'saveAll', dataFilePrefix: 'processDocumentationTemplateData' }, query: { code: '$code' } },
    processDocumentationComponentData: { options: { enabled: true, schemaName: 'cmsComponent', operation: 'saveAll', dataFilePrefix: 'processDocumentationComponentData' }, query: { code: '$code' } },
    processDocumentationPageData: { options: { enabled: true, schemaName: 'cmsPage', operation: 'saveAll', dataFilePrefix: 'processDocumentationPageData' }, query: { code: '$code' } },
    processDocumentationRouteData: { options: { enabled: true, schemaName: 'cmsPageRoute', operation: 'saveAll', dataFilePrefix: 'processDocumentationRouteData' }, query: { code: '$code' } },
  },
};
