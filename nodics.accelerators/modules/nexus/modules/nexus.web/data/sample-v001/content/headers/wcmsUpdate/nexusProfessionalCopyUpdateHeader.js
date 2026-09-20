/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module modules/nexus.web/data/sample-v001/content/headers/wcmsUpdate/nexusProfessionalCopyUpdateHeader
 * @description Defines the governed import header for the Nexus professional copy update release.
 * @layer data-header
 * @owner nexus.web
 * @override Customer projects may extend or replace this artifact in their own project layer.
 */

/** @lifecycle PUBLISHABLE @destination WCMS_STAGED @owner nexus.web */

/** @description Imports the independently checksummed Nexus corporate v1.0.4 professional copy update. */
module.exports = {
    cms: {
        nexusProfessionalCopyUpdateData: {
            options: {
                enabled: true,
                schemaName: 'cmsComponent',
                operation: 'saveAll',
                dataFilePrefix: 'nexusProfessionalCopyUpdateData'
            },
            query: { code: '$code' }
        }
    }
};
