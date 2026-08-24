/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module commsCore/data/sample/headers/commsSampleTemplateHeader @description Imports optional Communication sample templates for local demos. @layer data-header @owner commsCore */
const entry = (schemaName, dataFilePrefix) => ({
    options: { enabled: true, schemaName, operation: 'saveAll', dataFilePrefix },
    query: { code: '$code', tenant: '$tenant' }
});

module.exports = {
    commsSchema: {
        commsSampleTemplateData: entry('commsTemplate', 'commsSampleTemplateData'),
        commsSampleTemplateVersionData: entry('commsTemplateVersion', 'commsSampleTemplateVersionData')
    }
};
