/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/headers/wcmsUpdate/nexusCorporatePageUpdateHeader
 * @description Defines Kickoff project-owned import header records for this data pack.
 * @layer data-header
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle PUBLISHABLE @destination WCMS_STAGED @owner nexus.web */

/** @description Imports the independently checksummed Nexus corporate v1.0.1 page delta. */
module.exports = {
  cms: {
    nexusPageUpdateData: {
      options: {
        enabled: true,
        schemaName: 'cmsPage',
        operation: 'saveAll',
        dataFilePrefix: 'nexusPageUpdateData',
      },
      query: { code: '$code' },
    },
  },
};
