/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/headers/media/nexusMediaReferenceHeader
 * @description Defines Nexus media reference import headers for corporate content media.
 * @layer data-header
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle PUBLISHABLE @destination WCMS_STAGED @owner nexus.web */

const entry = (schemaName, dataFilePrefix) => ({
  options: { enabled: true, schemaName, operation: 'saveAll', dataFilePrefix },
  query: { code: '$code', tenant: '$tenant' }
});

module.exports = {
  media: {
    nexusMediaData: entry('media', 'nexusMediaData'),
    nexusMediaReferenceData: entry('mediaReference', 'nexusMediaReferenceData')
  },
  cms: {
    nexusComponentMediaData: {
      options: { enabled: true, schemaName: 'cmsComponentMedia', operation: 'saveAll', dataFilePrefix: 'nexusComponentMediaData' },
      query: { componentMediaCode: '$componentMediaCode' }
    }
  }
};
