/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialArticleAuthoringService @description Owns saved-revision Editorial validation and readiness using current tenant-scoped source and content-type policy. @layer service @owner editorial @override Preserve original actor, saved source authority, exact revision and state acknowledgements. */
module.exports = {
    /** Parses JSON input fields passed through generic lifecycle actions. */
    json: function (value, fallback) {
        if (typeof value !== 'string') return value || fallback;
        try { return JSON.parse(value); } catch (e) { return fallback; }
    },
    /** Builds a canonical Editorial input from Axis lifecycle payloads and direct service calls. */
    input: function (request) {
        let input = Object.assign({}, request.editorial || {});
        if (!input.article && input.model) input.article = input.model;
        if (!input.article && request.model) input.article = request.model;
        if (input.localizations) input.localizations = this.json(input.localizations, []);
        if (!input.localizations && request.localizations) input.localizations = this.json(request.localizations, []);
        if (!input.policy && request.policy) input.policy = request.policy;
        return input;
    },
    /** Reads the actual saved revision, localizations and current active owner policy; supplied copy is never authority. */
    storedInput: async function (request) {
        const configuration = CONFIG.get('editorial') || {};
        if (!configuration.publication || configuration.publication.runtimeRole !== 'STAGED') {
            throw new CLASSES.NodicsError('ERR_EDT_00002', 'Editorial authoring requires the Staged source runtime');
        }
        const input = this.input(request);
        const supplied = input.article || {};
        const params = request.httpRequest && request.httpRequest.params || request.params || {};
        const code = params.articleCode || params.code || supplied.code;
        const revision = typeof supplied.revision === 'string' && /^[1-9]\d*$/.test(supplied.revision)
            ? Number(supplied.revision) : supplied.revision;
        if (typeof code !== 'string' || !code.trim() || code !== code.trim() ||
            supplied.code && supplied.code !== code || !Number.isSafeInteger(revision) || revision < 1) {
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'Select the saved article and its exact revision before continuing');
        }
        const context = { tenant: request.tenant, authData: request.authData, options: { recursive: false },
            ...(request.transactionContext ? { transactionContext: request.transactionContext } : {}) };
        const articleResponse = await SERVICE.DefaultEditorialArticleService.get(Object.assign({}, context, {
            query: { code: code }, searchOptions: { limit: 2 }
        }));
        const articles = articleResponse && articleResponse.result;
        const article = Array.isArray(articles) && articles.length === 1 && articles[0];
        if (!article || article.code !== code || article.revision !== revision) {
            throw new CLASSES.NodicsError('ERR_EDT_00002', 'The saved article revision changed or is unavailable; refresh before continuing');
        }
        // Reference policy is read under original authority; it is not part of the root/copy transaction.
        const typeResponse = await SERVICE.DefaultEditorialContentTypeService.get({ tenant: request.tenant,
            authData: request.authData, options: { recursive: false },
            query: { code: article.contentTypeCode }, searchOptions: { limit: 2 }
        });
        const types = typeResponse && typeResponse.result;
        const contentType = Array.isArray(types) && types.length === 1 && types[0];
        if (!contentType || contentType.code !== article.contentTypeCode || contentType.active !== true ||
            contentType.requiredLocaleCodes !== undefined &&
            (!Array.isArray(contentType.requiredLocaleCodes) || contentType.requiredLocaleCodes.some(locale => typeof locale !== 'string' || !locale.trim()))) {
            throw new CLASSES.NodicsError('ERR_EDT_00002', 'The current Editorial content-type policy is missing or inactive. Review Content Type Policies and Editorial foundations in Data Exchange');
        }
        const maximum = configuration.publication.maximumDependencies;
        if (!Number.isSafeInteger(maximum) || maximum < 1) {
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial dependency boundary is unavailable');
        }
        const localeResponse = await SERVICE.DefaultEditorialArticleLocalizationService.get(Object.assign({}, context, {
            query: { articleCode: code, revision: revision }, searchOptions: { limit: maximum + 1 }
        }));
        const localizations = localeResponse && localeResponse.result;
        const seen = new Set();
        if (!Array.isArray(localizations) || localizations.length > maximum || localizations.some(locale => {
            if (!locale || locale.articleCode !== code || locale.revision !== revision ||
                typeof locale.localeCode !== 'string' || !locale.localeCode.trim() || seen.has(locale.localeCode)) return true;
            seen.add(locale.localeCode);
            return false;
        })) {
            throw new CLASSES.NodicsError('ERR_EDT_00002', 'Saved Editorial localizations are incomplete, ambiguous or outside the article revision boundary');
        }
        return Object.assign({}, input, { article: article, localizations: localizations,
            policy: contentType, contentType: contentType });
    },
    /** Validates saved copy and marks only its eligible exact revision READY after an acknowledged state CAS. */
    validate: async function (request) {
        let input = await this.storedInput(request);
        if (!['DRAFT', 'CHANGES_REQUESTED', 'READY'].includes(input.article.status)) {
            throw new CLASSES.NodicsError('ERR_EDT_00002', 'This article is already governed by review or publication; inspect its current state');
        }
        const featuredMedia = await SERVICE.DefaultEditorialFeaturedMediaService.evaluate(request, input.article);
        let validation = SERVICE.DefaultEditorialReadinessService.evaluate(input.article, input.localizations, input.policy, featuredMedia).validation;
        if (!validation.valid) return validation;
        if (input.article.status === 'READY') return Object.assign({}, validation, { article: input.article });
        const updated = await SERVICE.DefaultEditorialArticleService.update({ tenant: request.tenant, authData: request.authData,
            query: { code: input.article.code, revision: input.article.revision, status: input.article.status },
            model: { status: 'READY' }, options: { recursive: false } });
        if (SERVICE.DefaultModelsUpdateInitializerService.getAffectedCount(updated) !== 1) {
            throw new CLASSES.NodicsError('ERR_EDT_00002', 'The article changed or validation could not be confirmed; inspect the saved revision');
        }
        return Object.assign({}, validation, { article: Object.assign({}, input.article, { status: 'READY' }) });
    },
    /** Evaluates pre-workflow readiness without starting a Process instance. */
    evaluateReadiness: async function (request) {
        const input = await this.storedInput(request);
        const featuredMedia = await SERVICE.DefaultEditorialFeaturedMediaService.evaluate(request, input.article);
        const result = SERVICE.DefaultEditorialReadinessService.evaluate(input.article, input.localizations, input.policy, featuredMedia);
        const eligible = ['DRAFT', 'CHANGES_REQUESTED', 'READY'].includes(input.article.status);
        return Object.assign({}, result, { ready: result.ready && eligible, status: result.ready && eligible ? 'READY' : 'BLOCKED',
            articleRevision: input.article.revision, articleStatus: input.article.status,
            ...(!eligible ? { blockers: [{ code: 'ARTICLE_STATE_NOT_ELIGIBLE', field: 'status',
                message: 'Start a new draft revision before validating this article for another review.' }] } : {}) });
    }
};
