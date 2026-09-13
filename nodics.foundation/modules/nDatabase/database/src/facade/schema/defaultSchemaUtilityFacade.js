/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/facade/schema/DefaultSchemaUtilityFacade
 * @description Stable discovery facade for the existing schema utility owner.
 * @layer facade
 * @owner nDatabase
 * @override Keep shared metadata and access decisions in the effective Schema Utility service.
 */
module.exports = {
    /** Lists authorized effective schemas through the configured owner. */
    listSchemas: function (request) {
        let service = SERVICE.DefaultSchemaUtilityService;
        if (!service || typeof service.listSchemas !== 'function') throw new CLASSES.NodicsError('ERR_DBS_00004', 'Schema utility service is not available');
        return service.listSchemas(request);
    },
    /** Gets a descriptor selected by the route without rewriting trusted context. */
    getSchema: function (request, schemaName) {
        let service = SERVICE.DefaultSchemaUtilityService;
        if (!service || typeof service.getSchema !== 'function') throw new CLASSES.NodicsError('ERR_DBS_00004', 'Schema utility service is not available');
        return service.getSchema(request, schemaName);
    },
};
