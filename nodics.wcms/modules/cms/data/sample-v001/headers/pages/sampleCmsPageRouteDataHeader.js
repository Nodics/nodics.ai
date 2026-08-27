/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cms/data/sample-v001/sampleCmsPageRouteDataHeader @description Imports the representative English and Arabic CMS routes. @layer data @owner cms */
module.exports = {
    cms: {
        sampleCmsPageRouteData: {
            options: {
                enabled: true,
                schemaName: 'cmsPageRoute',
                operation: 'saveAll',
                dataFilePrefix: 'sampleCmsPageRouteData'
            },
            query: { code: '$code' }
        }
    }
};
