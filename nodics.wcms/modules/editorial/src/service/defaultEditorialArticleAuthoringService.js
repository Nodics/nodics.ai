/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialArticleAuthoringService @description Owns Editorial article authoring validation and readiness intents without replacing generated CRUD. @layer service @owner editorial */
module.exports = {
    /** Parses JSON input fields passed through generic lifecycle actions. */
    json: function (value, fallback) {
        if (typeof value !== 'string') return value || fallback;
        try { return JSON.parse(value); } catch (e) { return fallback; }
    },
    /** Builds a canonical Editorial input from Axis lifecycle payloads and direct service calls. */
    input: function (request) {
        let input = request.editorial || {};
        if (!input.article && input.model) input.article = input.model;
        if (!input.article && request.model) input.article = request.model;
        if (input.localizations) input.localizations = this.json(input.localizations, []);
        if (!input.localizations && request.localizations) input.localizations = this.json(request.localizations, []);
        if (!input.policy && request.policy) input.policy = request.policy;
        return input;
    },
    /** Validates authoring input and marks the exact article revision ready only when the input is valid. */
    validate: async function (request) {
        let input = this.input(request);
        let validation = SERVICE.DefaultEditorialValidationService.validate(input.article, input.localizations, input.policy);
        if (!validation.valid) return validation;
        if (!input.article || !input.article.code || !Number.isInteger(Number(input.article.revision))) return validation;
        if (!['DRAFT', 'CHANGES_REQUESTED'].includes(input.article.status)) return Object.assign({}, validation, { article: input.article });
        await SERVICE.DefaultEditorialArticleService.update({ tenant: request.tenant, authData: request.authData, query: { code: input.article.code, revision: Number(input.article.revision) }, model: { status: 'READY' } });
        return Object.assign({}, validation, { article: Object.assign({}, input.article, { status: 'READY' }) });
    },
    /** Evaluates pre-workflow readiness without starting a Process instance. */
    evaluateReadiness: function (request) { let input = this.input(request); return Promise.resolve(SERVICE.DefaultEditorialReadinessService.evaluate(input.article, input.localizations, input.policy)); }
};
