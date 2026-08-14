/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @description Nodics foundation-import header for framework documentation. */
module.exports = {
  cms: {
    nodicsDocumentationSiteData: { options: { enabled: true, schemaName: 'cmsSite', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationSiteData' }, query: { code: '$code' } },
    nodicsDocumentationTypeCodeData: { options: { enabled: true, schemaName: 'cmsTypeCode', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationTypeCodeData' }, query: { code: '$code' } },
    nodicsDocumentationRendererData: { options: { enabled: true, schemaName: 'cmsTypeCode2Renderer', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationRendererData' }, query: { code: '$code' } },
    nodicsDocumentationTemplateBootstrapData: { options: { enabled: true, schemaName: 'cmsPageTemplate', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationTemplateBootstrapData' }, query: { code: '$code' } },
    nodicsDocumentationSlotData: { options: { enabled: true, schemaName: 'cmsSlotDefinition', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationSlotData' }, query: { code: '$code' } },
    nodicsDocumentationTemplateData: { options: { enabled: true, schemaName: 'cmsPageTemplate', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationTemplateData' }, query: { code: '$code' } },
    nodicsDocumentationComponentData: { options: { enabled: true, schemaName: 'cmsComponent', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationComponentData' }, query: { code: '$code' } },
    nodicsDocumentationPageData: { options: { enabled: true, schemaName: 'cmsPage', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationPageData' }, query: { code: '$code' } },
    nodicsDocumentationRouteData: { options: { enabled: true, schemaName: 'cmsPageRoute', operation: 'saveAll', dataFilePrefix: 'nodicsDocumentationRouteData' }, query: { code: '$code' } },
  },
};
