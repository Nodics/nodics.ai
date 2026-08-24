/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/** @module commsCore/data/core/headers/commsRuntimeDefaultHeader @description Imports Communication runtime default templates required before activation. @layer data-header @owner commsCore */
const entry = (schemaName, dataFilePrefix) => ({
    options: { enabled: true, schemaName, operation: 'saveAll', dataFilePrefix },
    query: { code: '$code', tenant: '$tenant' }
});

module.exports = {
    commsSchema: {
        commsRuntimeDefaultTemplateData: entry('commsTemplate', 'commsRuntimeDefaultTemplateData'),
        commsRuntimeDefaultTemplateVersionData: entry('commsTemplateVersion', 'commsRuntimeDefaultTemplateVersionData')
    }
};
