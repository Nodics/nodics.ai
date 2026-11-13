/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/agora.apparel/data/sample-v001/content/headers/agoraApparelContentHeader
 * @description Defines Kickoff project-owned import header records for this domain storefront content pack.
 * @layer data-header
 * @owner agora.apparel
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

const entry = (schemaName, dataFilePrefix, query = { code: '$code' }) => ({
  options: { enabled: true, schemaName, operation: 'saveAll', dataFilePrefix },
  query
});

module.exports = {
  catalog: {
    contentCatalog: entry('catalog', 'agoraApparelContentCatalogData')
  },
  media: {
    sharedMedia: entry('media', 'agoraApparelSharedMediaData'),
    sharedMediaReferences: entry('mediaReference', 'agoraApparelSharedMediaReferenceData', { code: '$code', tenant: '$tenant' })
  },
  cms: {
    sharedTypes: entry('cmsTypeCode', 'agoraApparelSharedTypeCodeData'),
    types: entry('cmsTypeCode', 'agoraApparelTypeCodeData'),
    sharedRenderers: entry('cmsTypeCode2Renderer', 'agoraApparelSharedRendererData'),
    renderers: entry('cmsTypeCode2Renderer', 'agoraApparelRendererData'),
    sharedComponentGroups: entry('cmsComponentTypeGroup', 'agoraApparelSharedComponentTypeGroupData'),
    sharedSlots: entry('cmsSlotDefinition', 'agoraApparelSharedSlotData'),
    sharedTemplates: entry('cmsPageTemplate', 'agoraApparelSharedTemplateData'),
    sites: entry('cmsSite', 'agoraApparelSiteData'),
    sharedComponents: entry('cmsComponent', 'agoraApparelSharedComponentData'),
    sharedComponentMedia: entry('cmsComponentMedia', 'agoraApparelSharedComponentMediaData', { componentMediaCode: '$componentMediaCode' }),
    pages: entry('cmsPage', 'agoraApparelPageData'),
    routes: entry('cmsPageRoute', 'agoraApparelRouteData')
  },
  wcmsExperience: {
    experiencePlacements: entry('cmsExperiencePlacement', 'agoraApparelExperiencePlacementData')
  }
};
