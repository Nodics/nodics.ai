/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialReadinessService @description Produces deterministic pre-workflow Editorial readiness evidence. @layer service @owner editorial @override Projects may decorate readiness without acquiring workflow authority. */
module.exports = {
    /** Evaluates whether supplied authoring data is ready to be submitted to Process. */
    evaluate: function (article, localizations, policy) {
        let validation = SERVICE.DefaultEditorialValidationService.validate(article, localizations, policy);
        return { articleCode: article && article.code || null, status: validation.valid ? 'READY' : 'BLOCKED', ready: validation.valid, validation: validation, workflowStarted: false };
    }
};
