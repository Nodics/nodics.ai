/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/facade/DefaultEditorialAuthoringFacade @description Delegates secured Editorial authoring intents to Editorial-owned services. @layer facade @owner editorial */
module.exports = {
    /** Validates an Editorial draft. */ validate: function (request) { return SERVICE.DefaultEditorialArticleAuthoringService.validate(request); },
    /** Evaluates pre-workflow readiness. */ evaluateReadiness: function (request) { return SERVICE.DefaultEditorialArticleAuthoringService.evaluateReadiness(request); },
    /** Submits a ready revision to Process authority. */ submit: function (request) { return SERVICE.DefaultEditorialWorkflowAdapterService.submit(request); },
    /** Inspects Process-owned workflow detail. */ inspectWorkflow: function (request) { return SERVICE.DefaultEditorialWorkflowAdapterService.inspect(request); },
    /** Immediately publishes one approved revision through nPublish. */ publish: function (request) { return SERVICE.DefaultEditorialPublicationService.publishApproved(request); },
    /** Schedules a future publication through Process/Cron metadata. */ schedule: function (request) { return SERVICE.DefaultEditorialScheduleService.schedule(request); },
    /** Withdraws an Online release through nPublish authority. */ withdraw: function (request) { return SERVICE.DefaultPublicationLifecycleService.withdraw(Object.assign({}, request, { publicationCode: request.editorial.publicationCode, expectedRevision: request.editorial.expectedRevision })); }
};
