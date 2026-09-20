/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/records/wcmsUpdate/corporate/nexusPageUpdateData
 * @description Defines Kickoff project-owned data records for this module data pack.
 * @layer data
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle PUBLISHABLE @destination WCMS_STAGED @owner nexus.web */

/** @description Nexus corporate CMS v1.0.1 page delta used to qualify immutable update and rollback. */
module.exports = {
  record0: {
    code: 'nexusHomePage',
    versionId: 1,
    name: 'Nodics Nexus Home [nexus-corporate-1.0.1]',
    active: true,
  },
};
