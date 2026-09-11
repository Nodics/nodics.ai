/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module wasteMaterial/data/wasteMaterialCoreHeader @description Imports generic taxonomy through generated owning services. @owner wasteMaterial @layer data-header */
const entry = schema => ({ options: { enabled: true, schemaName: schema, operation: 'saveAll', dataFilePrefix: schema + 'CoreData' }, query: { code: '$code' } });
module.exports = { wasteMaterial: Object.fromEntries(['wasteFamily','wasteCategory','wasteItemType','wasteMaterialType'].map(schema => [schema + 'CoreData', entry(schema)])) };
