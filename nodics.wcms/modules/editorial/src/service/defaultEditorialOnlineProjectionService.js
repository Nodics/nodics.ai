/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const crypto = require('crypto');
/** @module editorial/service/DefaultEditorialOnlineProjectionService @description Builds and switches sanitized Editorial Online projections for nPublish. @layer service @owner editorial */
module.exports = {
    /** Normalizes generated-service results. */ items: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Loads the complete active Online projection set for a publication root. */
    getActiveSet: async function (publication, request) {
        let response = await SERVICE.DefaultEditorialOnlineArticleService.get({ tenant: request.tenant, authData: request.authData, query: { articleCode: publication.rootCode, status: 'CURRENT' }, searchOptions: { limit: 500 } });
        return this.items(response);
    },
    /** Loads one active projection for compatibility with nPublish version inspection. */
    getActive: async function (publication, request) {
        let config = (CONFIG.get('editorial') || {}).publication || {};
        let transportName = config.targetTransportProvider;
        if (transportName) {
            if (!SERVICE[transportName]) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial Online target transport is unavailable');
            return SERVICE[transportName].status({ publication: publication, articleCode: publication.rootCode,
                operationKey: publication.code + ':status:' + String(publication.revision) }, request);
        }
        let items = await this.getActiveSet(publication, request);
        let version = items.map(item => item.code).sort().join(',');
        return version ? { version: version, projectionCodes: items.map(item => item.code).sort() } : null;
    },
    /** Builds immutable per-site/per-locale projection models from Staged source records. */
    buildProjectionModels: async function (publication, request) {
        let article = await SERVICE.DefaultEditorialPublicationVersionProviderService.getVersion(publication, request);
        let response = await SERVICE.DefaultEditorialArticleLocalizationService.get({ tenant: request.tenant, authData: request.authData, query: { articleCode: article.code, revision: article.revision, status: 'READY' }, searchOptions: { limit: 100 } });
        let localizations = this.items(response);
        if (!localizations.length) throw new CLASSES.NodicsError('ERR_EDT_00005', 'Editorial publication requires a ready localization');
        let projections = [];
        for (let siteCode of article.siteCodes || []) for (let localization of localizations) {
            let payload = { articleCode: article.code, contentTypeCode: article.contentTypeCode, siteCode: siteCode, localeCode: localization.localeCode,
                slug: localization.slug || article.slug, title: localization.title, summary: localization.summary, body: localization.body, takeaways: localization.takeaways || [], seo: localization.seo,
                authorCodes: article.authorCodes || [], taxonomyTermCodes: article.taxonomyTermCodes || [], seriesCode: article.seriesCode, featuredMediaCode: article.featuredMediaCode,
                special: article.special === true, specialLabel: article.specialLabel, specialRank: article.specialRank, specialFrom: article.specialFrom,
                specialUntil: article.specialUntil, specialVariant: article.specialVariant,
                publishFrom: article.publishFrom, publishUntil: article.publishUntil };
            let sourceHash = crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
            let code = [article.code, siteCode, localization.localeCode, article.revision].join('-');
            projections.push({ code: code, active: true,
                accessGroups: Array.from(new Set([].concat(article.accessGroups || ['userGroup']).concat(['serviceAccountUserGroup']))), description: 'Online Editorial projection for ' + article.code, articleCode: article.code,
                contentTypeCode: article.contentTypeCode, siteCode: siteCode, localeCode: localization.localeCode, slug: payload.slug, payload: payload,
                sourceRevision: article.revision, sourceHash: sourceHash, status: 'CURRENT', publishedAt: new Date() });
        }
        return { article: article, projections: projections };
    },
    /** Creates immutable per-site/per-locale projections and supersedes the previous visible set only after all writes succeed. */
    activateLocal: async function (publication, request, projectionModels) {
        let previous = await this.getActiveSet(publication, request);
        let projections = [];
        for (let model of projectionModels) {
            let saved = await SERVICE.DefaultEditorialOnlineArticleService.save({ tenant: request.tenant, authData: request.authData, model: model });
            projections.push(saved.result || saved);
        }
        for (let item of previous) if (!projections.some(projection => projection.code === item.code)) await SERVICE.DefaultEditorialOnlineArticleService.update({ tenant: request.tenant, authData: request.authData, query: { code: item.code }, model: { status: 'SUPERSEDED' } });
        let version = projections.map(item => item.code).sort().join(',');
        await SERVICE.DefaultEditorialPublicationReceiptService.save({ tenant: request.tenant, authData: request.authData, model: { code: publication.code + '-receipt', active: true,
            accessGroups: ['serviceAccountUserGroup', 'adminGroup', 'employeeUserGroup'], description: 'Editorial publication receipt for ' + publication.rootCode, articleCode: publication.rootCode,
            sourceRevision: Number(publication.sourceVersion), targetCode: 'editorial-online', status: 'PUBLISHED', sourceHash: projections[0].sourceHash, projectionCodes: projections.map(item => item.code),
            correlationId: request.correlationId || publication.correlationId || publication.code, evidence: { dependencyCount: (publication.dependencies || []).length }, publishedAt: new Date() } });
        return { version: version, projectionCodes: projections.map(item => item.code) };
    },
    /** Creates immutable per-site/per-locale projections in the authoritative Online target. */
    activate: async function (publication, request) {
        let built = await this.buildProjectionModels(publication, request);
        let config = (CONFIG.get('editorial') || {}).publication || {};
        let transportName = config.targetTransportProvider;
        if (transportName) {
            if (!SERVICE[transportName]) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial Online target transport is unavailable');
            return SERVICE[transportName].deploy({ publication: publication, projections: built.projections,
                operationKey: publication.code + ':activate:' + String(publication.revision) }, request);
        }
        return this.activateLocal(publication, request, built.projections);
    },
    /** Restores a previous projection set by stable version identity. */
    rollback: async function (publication, targetVersion, request) {
        if (!targetVersion) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial rollback target is required');
        let codes = String(targetVersion).split(',').filter(Boolean);
        for (let code of codes) await SERVICE.DefaultEditorialOnlineArticleService.update({ tenant: request.tenant, authData: request.authData, query: { code: code }, model: { status: 'CURRENT' } });
        return { version: targetVersion, restored: codes.length };
    },
    /** Withdraws all active projections for an article after an authorized lifecycle intent. */
    withdraw: async function (articleCode, request) {
        let response = await SERVICE.DefaultEditorialOnlineArticleService.get({ tenant: request.tenant, authData: request.authData, query: { articleCode: articleCode, status: 'CURRENT' }, searchOptions: { limit: 500 } });
        let items = this.items(response);
        for (let item of items) await SERVICE.DefaultEditorialOnlineArticleService.update({ tenant: request.tenant, authData: request.authData, query: { code: item.code }, model: { status: 'WITHDRAWN' } });
        return { articleCode: articleCode, withdrawn: items.length };
    }
};
