/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cms/data/sample-v001/sampleCmsComponentLocalizationDataHeader @description Imports representative component locale variants through the generated CMS service. @layer data @owner cms */
module.exports = {
    cms: {
        sampleCmsComponentLocalizationData: {
            options: {
                enabled: true,
                schemaName: 'cmsComponentLocalization',
                operation: 'saveAll',
                dataFilePrefix: 'sampleCmsComponentLocalizationData'
            },
            query: { code: '$code' }
        }
    }
};
