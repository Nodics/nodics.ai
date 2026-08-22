/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialPublicationTargetService @description Persists Editorial Online projections inside the independently deployed Online WCMS target. @layer service @owner editorial */
module.exports = {
    /** Initializes target publication operations. */
    init: function () { return Promise.resolve(true); },
    /** Completes target publication initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Rejects target mutations unless this process is explicitly the Online runtime. */
    assertOnlineRuntime: function () {
        let publication = (CONFIG.get('editorial') || {}).publication || {};
        if (publication.runtimeRole !== 'ONLINE') {
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial target operations require an Online runtime');
        }
        if (CONFIG.get('publishEnabled') === true) {
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'Online Editorial target must not run publish source modules');
        }
    },
    /** Normalizes one target operation body. */
    input: function (request) {
        return request.editorialPublicationTarget || request;
    },
    /** Restores date instances that were serialized while crossing the Staged-to-Online module boundary. */
    normalizeProjection: function (projection) {
        let model = Object.assign({}, projection || {});
        if (model.publishedAt && !(model.publishedAt instanceof Date)) model.publishedAt = new Date(model.publishedAt);
        if (model.payload) {
            model.payload = Object.assign({}, model.payload);
            ['publishFrom', 'publishUntil', 'specialFrom', 'specialUntil'].forEach(field => {
                if (model.payload[field] && !(model.payload[field] instanceof Date)) model.payload[field] = new Date(model.payload[field]);
            });
        }
        return model;
    },
    /** Saves immutable projections and switches previous visible rows only after all writes succeed. */
    deploy: async function (request) {
        this.assertOnlineRuntime();
        let input = this.input(request);
        let publication = input.publication || {};
        let projections = [].concat(input.projections || []);
        if (!publication.code || !publication.rootCode || !projections.length) {
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial target deployment requires publication and projections');
        }
        let previousResponse = await SERVICE.DefaultEditorialOnlineArticleService.get({ tenant: request.tenant, authData: request.authData,
            query: { articleCode: publication.rootCode, status: 'CURRENT' }, searchOptions: { limit: 500 } });
        let previous = [].concat(previousResponse && previousResponse.result || []);
        let saved = [];
        for (let projection of projections) {
            let model = this.normalizeProjection(projection);
            let response = await SERVICE.DefaultEditorialOnlineArticleService.save({ tenant: request.tenant, authData: request.authData, model: model });
            saved.push(response && response.result || model);
        }
        for (let item of previous) {
            if (!saved.some(projection => projection.code === item.code)) {
                await SERVICE.DefaultEditorialOnlineArticleService.update({ tenant: request.tenant, authData: request.authData,
                    query: { code: item.code }, model: { status: 'SUPERSEDED' } });
            }
        }
        await SERVICE.DefaultEditorialPublicationReceiptService.save({ tenant: request.tenant, authData: request.authData, model: {
            code: publication.code + '-receipt', active: true, accessGroups: ['serviceAccountUserGroup', 'adminGroup', 'employeeUserGroup'],
            description: 'Editorial publication receipt for ' + publication.rootCode, articleCode: publication.rootCode,
            sourceRevision: Number(publication.sourceVersion), targetCode: 'editorial-online', status: 'PUBLISHED',
            sourceHash: saved[0].sourceHash, projectionCodes: saved.map(item => item.code),
            correlationId: input.correlationId || request.correlationId || publication.code,
            evidence: { dependencyCount: (publication.dependencies || []).length }, publishedAt: new Date() } });
        return { version: saved.map(item => item.code).sort().join(','), projectionCodes: saved.map(item => item.code) };
    },
    /** Returns the current Online target version for one Editorial article. */
    status: async function (request) {
        this.assertOnlineRuntime();
        let input = this.input(request);
        let articleCode = input.articleCode || input.publication && input.publication.rootCode;
        if (!articleCode) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial status requires an article code');
        let response = await SERVICE.DefaultEditorialOnlineArticleService.get({ tenant: request.tenant, authData: request.authData,
            query: { articleCode: articleCode, status: 'CURRENT' }, searchOptions: { limit: 500 } });
        let items = [].concat(response && response.result || []);
        let version = items.map(item => item.code).sort().join(',');
        return version ? { version: version, projectionCodes: items.map(item => item.code).sort() } : null;
    },
    /** Restores a previous projection set by stable version identity. */
    rollback: async function (request) {
        this.assertOnlineRuntime();
        let input = this.input(request);
        let codes = String(input.targetVersion || '').split(',').filter(Boolean);
        if (!codes.length) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial rollback target is required');
        for (let code of codes) await SERVICE.DefaultEditorialOnlineArticleService.update({ tenant: request.tenant, authData: request.authData,
            query: { code: code }, model: { status: 'CURRENT' } });
        return { version: input.targetVersion, restored: codes.length };
    },
    /** Withdraws current projections for one article. */
    withdraw: async function (request) {
        this.assertOnlineRuntime();
        let input = this.input(request);
        let articleCode = input.articleCode || input.publication && input.publication.rootCode;
        if (!articleCode) throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial withdrawal requires an article code');
        let response = await SERVICE.DefaultEditorialOnlineArticleService.get({ tenant: request.tenant, authData: request.authData,
            query: { articleCode: articleCode, status: 'CURRENT' }, searchOptions: { limit: 500 } });
        let items = [].concat(response && response.result || []);
        for (let item of items) await SERVICE.DefaultEditorialOnlineArticleService.update({ tenant: request.tenant, authData: request.authData,
            query: { code: item.code }, model: { status: 'WITHDRAWN' } });
        return { articleCode: articleCode, withdrawn: items.length };
    }
};
