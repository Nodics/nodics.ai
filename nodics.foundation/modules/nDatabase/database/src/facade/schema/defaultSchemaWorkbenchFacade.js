/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/facade/schema/DefaultSchemaWorkbenchFacade
 * @description Stable facade for client-safe schema discovery.
 * @layer facade
 * @owner nDatabase
 * @override Projects may replace this facade through normal layered
 * registration without bypassing the owning discovery service.
 */
module.exports = {
    /** Lists authorized effective schema descriptors. */
    list: request => SERVICE.DefaultSchemaWorkbenchService.list(request),
    /** Reads one authorized effective schema descriptor. */
    get: request => SERVICE.DefaultSchemaWorkbenchService.get(request),
    /** Delegates bounded record search to the owning schema service. */
    search: request => SERVICE.DefaultSchemaWorkbenchService.search(request),
    /** Creates a record through generated CRUD and returns persisted evidence. */
    createRecord: request => SERVICE.DefaultSchemaWorkbenchService.createRecord(request),
    /** Updates a record while retaining its original concurrency token. */
    updateRecord: request => SERVICE.DefaultSchemaWorkbenchService.updateRecord(request),
    /** Deletes one record through the governed generated remove pipeline. */
    deleteRecord: request => SERVICE.DefaultSchemaWorkbenchService.deleteRecord(request),
    /** Inspects governed references without deleting records. */
    previewDeleteImpact: request =>
        SERVICE.DefaultSchemaWorkbenchService.previewDeleteImpact(request),
    /** Delegates explicitly enabled bounded bulk operations. */
    bulk: request => SERVICE.DefaultSchemaWorkbenchService.bulk(request),
    /** Delegates aggregate operations to their declared domain authority. */
    aggregate: request => SERVICE.DefaultSchemaWorkbenchService.aggregate(request)
};
