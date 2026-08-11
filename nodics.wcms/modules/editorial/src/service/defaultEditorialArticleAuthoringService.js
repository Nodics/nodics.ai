/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialArticleAuthoringService @description Owns Editorial article authoring validation and readiness intents without replacing generated CRUD. @layer service @owner editorial */
module.exports = {
    /** Validates authoring input without persistence or workflow side effects. */
    validate: function (request) { let input = request.editorial || {}; return Promise.resolve(SERVICE.DefaultEditorialValidationService.validate(input.article, input.localizations, input.policy)); },
    /** Evaluates pre-workflow readiness without starting a Process instance. */
    evaluateReadiness: function (request) { let input = request.editorial || {}; return Promise.resolve(SERVICE.DefaultEditorialReadinessService.evaluate(input.article, input.localizations, input.policy)); }
};
