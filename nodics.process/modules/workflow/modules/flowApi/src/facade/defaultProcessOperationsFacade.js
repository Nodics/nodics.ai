/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

/**
 * @module nodics.process/modules/workflow/modules/flowApi/src/facade/defaultProcessOperationsFacade
 * @description Facade boundary for process runtime, human task, and audit inspection APIs.
 * @layer facade
 * @owner flowApi
 * @override Customer process overlays may add authorization, redaction, or domain enrichment before delegating to operation services.
 */
module.exports = {
    /** Delegates runtime instance listing. */
    listInstances: function (request) { return SERVICE.DefaultProcessOperationsInspectionService.listInstances(request); },
    /** Delegates runtime instance read. */
    getInstance: function (request) { return SERVICE.DefaultProcessOperationsInspectionService.getInstance(request); },
    /** Delegates human task listing. */
    listTasks: function (request) { return SERVICE.DefaultProcessOperationsInspectionService.listTasks(request); },
    /** Delegates human task read. */
    getTask: function (request) { return SERVICE.DefaultProcessOperationsInspectionService.getTask(request); },
    /** Delegates audit event listing. */
    listAuditEvents: function (request) { return SERVICE.DefaultProcessOperationsInspectionService.listAuditEvents(request); }
};
