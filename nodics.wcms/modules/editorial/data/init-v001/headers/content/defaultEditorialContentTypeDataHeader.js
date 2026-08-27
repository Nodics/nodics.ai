/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/data/init-v001/headers/content/defaultEditorialContentTypeDataHeader @description Declares the governed initial Editorial content-type import. @layer data @owner editorial */
module.exports = { editorial: { defaultEditorialContentTypeData: { options: { enabled: true, schemaName: 'editorialContentType', operation: 'saveAll', dataFilePrefix: 'defaultEditorialContentTypeData', userGroups: ['adminGroup'] }, query: { code: '$code' } } } };
