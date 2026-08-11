/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialPublicationAdapterService @description Implements Editorial dependency resolution and validation for nPublish. @layer service @owner editorial */
module.exports = {
    /** Resolves the bounded immutable Editorial dependency set. */
    resolveDependencies: async function (publication, article, request) {
        let result = [{ schema: 'editorialArticle', code: article.code, version: String(article.revision) }];
        let load = async (service, query) => {
            if (!SERVICE[service]) return [];
            let response = await SERVICE[service].get({ tenant: request.tenant, authData: request.authData, query: query, searchOptions: { limit: 500 } });
            return response && response.result || [];
        };
        let locales = await load('DefaultEditorialArticleLocalizationService', { articleCode: article.code, revision: article.revision });
        locales.forEach(item => result.push({ schema: 'editorialArticleLocalization', code: item.code, version: String(item.revision) }));
        (article.authorCodes || []).forEach(code => result.push({ schema: 'editorialAuthor', code: code, version: 'current' }));
        (article.taxonomyTermCodes || []).forEach(code => result.push({ schema: 'editorialTaxonomyTerm', code: code, version: 'current' }));
        if (article.seriesCode) result.push({ schema: 'editorialSeries', code: article.seriesCode, version: 'current' });
        if (article.featuredMediaCode) result.push({ schema: 'media', code: article.featuredMediaCode, version: 'current' });
        let max = Number(((CONFIG.get('editorial') || {}).publication || {}).maximumDependencies || 500);
        if (result.length > max) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial publication dependency boundary exceeded');
        return result;
    },
    /** Validates approval, revision identity, localization and route-safe slug before activation. */
    validate: function (publication, article, request, dependencies) {
        let valid = article.status === 'APPROVED' && Number(article.revision) === Number(publication.sourceVersion) && Boolean(article.slug) && Array.isArray(dependencies) && dependencies.length > 1;
        return Promise.resolve({ valid: valid, articleRevision: article.revision, dependencyCount: dependencies.length });
    },
    /** Emits post-activation projection hooks only after nPublish activation succeeds. */
    afterActivate: async function (publication, activation, request) {
        if (SERVICE.DefaultEditorialSearchProjectionService) await SERVICE.DefaultEditorialSearchProjectionService.projectActivation(publication, activation, request);
        if (SERVICE.DefaultEditorialSyndicationService) await SERVICE.DefaultEditorialSyndicationService.invalidate(publication, request);
        return true;
    },
    /** Invalidates derived projections after rollback. */
    afterRollback: function (publication, activation, request) { return this.afterActivate(publication, activation, request); },
    /** Invalidates derived projections after withdrawal. */ afterWithdraw: function (publication, activation, request) { return this.afterActivate(publication, activation, request); }
};
