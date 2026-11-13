/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialPublicationService @description Maps approved Editorial release intents into the authoritative nPublish lifecycle. @layer service @owner editorial */
module.exports = {
    /** Compares only the bounded owner descriptor, independent of persisted object field order. */
    sameIntent: function (actual, expected) {
        return actual && typeof actual === 'object' && !Array.isArray(actual) && Object.keys(actual).length === 3 &&
            actual.contractVersion === 1 && actual.code === expected.code && actual.sourceRevision === expected.sourceRevision;
    },
    /** Requires exact positive source CAS evidence before any subsequent lifecycle effect. */
    confirmedUpdate: function (response, message) {
        if (!response || typeof response.code !== 'string' || !response.code.startsWith('SUC_') || response.success === false ||
            response.acknowledged === false || response.error || response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length) ||
            SERVICE.DefaultModelsUpdateInitializerService.getAffectedCount(response) !== 1) throw new CLASSES.NodicsError('ERR_EDT_00008', message);
    },
    /** Reads exactly the persisted root under the original caller; absent/denied/ambiguous evidence cannot publish. */
    savedSource: async function (request, code, revision) {
        const response = await SERVICE.DefaultEditorialArticleService.get({ tenant: request.tenant, authData: request.authData,
            options: { recursive: false }, query: { code, revision }, searchOptions: { limit: 2 } });
        if (!response || typeof response.code !== 'string' || !response.code.startsWith('SUC_') || response.success === false || response.acknowledged === false || response.error ||
            response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length) ||
            !Array.isArray(response.result) || response.result.length !== 1 || response.result[0]?.code !== code || response.result[0].revision !== revision) {
            throw new CLASSES.NodicsError('ERR_EDT_00008', 'Saved Editorial publication evidence is unavailable; inspect the article');
        }
        return response.result[0];
    },
    /** Immediately publishes one exact approved article revision through nPublish. */
    publishApproved: async function (request) {
        const input = request.editorial || {};
        const supplied = input.article || input.model || {};
        const params = request.httpRequest && request.httpRequest.params || request.params || {};
        const articleCode = params.articleCode || supplied.code;
        const revision = Number(supplied.revision);
        if (typeof articleCode !== 'string' || !articleCode || supplied.code && supplied.code !== articleCode ||
            !Number.isSafeInteger(revision) || revision < 1) {
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'Select the exact saved article revision before publishing');
        }
        const article = await this.savedSource(request, articleCode, revision);
        if (!article || article.code !== articleCode || article.revision !== revision || article.status !== 'APPROVED') {
            throw new CLASSES.NodicsError('ERR_EDT_00002', 'Only the actual saved approved Editorial revision can be published');
        }
        if (article.featuredMediaCode) {
            const featuredMedia = await SERVICE.DefaultEditorialFeaturedMediaService.evaluate(request, article);
            if (featuredMedia.ready !== true) throw new CLASSES.NodicsError('ERR_EDT_00002',
                featuredMedia.presentation?.pending || 'Publish the exact featured image through Media review before publishing this article.');
        }
        const code = input.publicationCode || article.publicationIntent?.code || 'editorial-' + article.code + '-r' + article.revision;
        if (typeof code !== 'string' || !code.trim() || code !== code.trim() || code.length > 256 || /[\u0000-\u001f\u007f]/.test(code)) {
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'A valid Editorial publication reference is required');
        }
        const intent = { contractVersion: 1, code, sourceRevision: revision };
        if (article.publicationIntent !== undefined) {
            if (!this.sameIntent(article.publicationIntent, intent)) {
                throw new CLASSES.NodicsError('ERR_EDT_00008', 'Another publication request is retained; inspect it before publishing');
            }
        } else {
            // This source-row CAS competes with SAVE/ARCHIVE before nPublish can make target effects.
            // The older retained Online reference remains available independently of the new request.
            const claim = await SERVICE.DefaultEditorialArticleService.update({ tenant: request.tenant, authData: request.authData,
                options: { recursive: false }, query: { code: article.code, revision, status: 'APPROVED', publicationIntent: { $exists: false } },
                model: { publicationIntent: intent } });
            this.confirmedUpdate(claim, 'The article changed or publication ownership could not be confirmed; inspect before publishing');
        }
        const claimed = await this.savedSource(request, article.code, revision);
        if (claimed.status !== 'APPROVED' || !this.sameIntent(claimed.publicationIntent, intent)) {
            throw new CLASSES.NodicsError('ERR_EDT_00008', 'The saved publication request changed; inspect before publishing');
        }
        const result = await SERVICE.DefaultPublicationLifecycleService.publishApproved(
            Object.assign({}, request, {
                expectedRevision: input.expectedRevision,
                publication: {
                    code: code,
                    domain: 'editorial',
                    rootType: 'article',
                    rootCode: article.code,
                    sourceVersion: String(article.revision),
                    workflowRef: article.workflowInstanceCode,
                },
            }),
        );
        if (!result || result.code !== code || result.state !== 'ONLINE' || result.domain !== 'editorial' ||
            result.rootType !== 'article' || result.rootCode !== article.code || result.sourceVersion !== String(revision)) {
            throw new CLASSES.NodicsError('ERR_EDT_00008', 'Publication could not be confirmed for this revision; inspect its owning request');
        }
        const updated = await SERVICE.DefaultEditorialArticleService.update({ tenant: request.tenant, authData: request.authData,
            query: { code: article.code, revision, status: 'APPROVED', 'publicationIntent.code': code, 'publicationIntent.sourceRevision': revision },
            model: { $set: { status: 'PUBLISHED', publicationCode: code, publicationSourceRevision: revision }, $unset: { publicationIntent: '' } }, options: { recursive: false } });
        this.confirmedUpdate(updated, 'Publication is Online, but source completion is unconfirmed; inspect the retained publication request');
        const saved = await this.savedSource(request, article.code, revision);
        if (saved.status !== 'PUBLISHED' || saved.publicationCode !== code || saved.publicationSourceRevision !== revision || saved.publicationIntent !== undefined) {
            throw new CLASSES.NodicsError('ERR_EDT_00008', 'Publication is Online, but source readback is unconfirmed; inspect before reconciling');
        }
        return Object.assign({}, result, { article: saved });
    },
    /** Withdraws only the route-owned article's exact publication using the inspected nPublish revision. */
    withdraw: async function (request) {
        const input = request.editorial || {};
        const supplied = input.article || input.model || {};
        const params = request.httpRequest && request.httpRequest.params || request.params || {};
        const articleCode = params.articleCode || supplied.code;
        const rawExpected = input.expectedRevision;
        const expectedRevision = typeof rawExpected === 'string' && /^\d+$/.test(rawExpected)
            ? Number(rawExpected) : rawExpected;
        if (typeof articleCode !== 'string' || !articleCode.trim() || supplied.code && supplied.code !== articleCode ||
            !Number.isSafeInteger(expectedRevision) || expectedRevision < 0) {
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'Inspect the exact article publication before confirming withdrawal');
        }
        const response = await SERVICE.DefaultEditorialArticleService.get({
            tenant: request.tenant, authData: request.authData,
            options: { recursive: false }, query: { code: articleCode }, searchOptions: { limit: 2 }
        });
        const article = response && response.result && response.result[0];
        if (!response || typeof response.code !== 'string' || !response.code.startsWith('SUC_') || response.success === false || response.acknowledged === false || response.error ||
            response.errors !== undefined && (!Array.isArray(response.errors) || response.errors.length) || !Array.isArray(response.result) || response.result.length !== 1 ||
            !article || article.code !== articleCode || typeof input.publicationCode !== 'string' || !input.publicationCode.trim() || input.publicationCode.length > 256 ||
            /[\u0000-\u001f\u007f]/.test(input.publicationCode) ||
            !Number.isSafeInteger(article.revision) || article.revision < 1 ||
            !['DRAFT', 'READY', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'WITHDRAWN', 'ARCHIVED'].includes(article.status) ||
            article.publicationSourceRevision !== undefined && (!Number.isSafeInteger(article.publicationSourceRevision) ||
                article.publicationSourceRevision < 1 || article.publicationSourceRevision > article.revision) ||
            supplied.revision !== undefined && Number(supplied.revision) !== article.revision) {
            throw new CLASSES.NodicsError('ERR_EDT_00002', 'The article or its publication reference changed; inspect it again');
        }
        const context = Object.assign({}, request, {
            publicationCode: input.publicationCode, expectedRevision: expectedRevision
        });
        const publication = await SERVICE.DefaultPublicationLifecycleService.get(context);
        const retained = input.publicationCode === article.publicationCode;
        if (!publication || publication.code !== input.publicationCode ||
            publication.domain !== 'editorial' || publication.rootType !== 'article' ||
            publication.rootCode !== article.code || typeof publication.sourceVersion !== 'string' || !/^[1-9]\d*$/.test(publication.sourceVersion) ||
            !Number.isSafeInteger(Number(publication.sourceVersion)) || Number(publication.sourceVersion) > article.revision ||
            retained && publication.sourceVersion !== String(article.publicationSourceRevision ?? article.revision) ||
            !['ONLINE', 'WITHDRAWN'].includes(publication.state)) {
            throw new CLASSES.NodicsError('ERR_EDT_00002', 'The publication does not match this article revision or is not Online');
        }
        if (publication.revision !== expectedRevision) throw new CLASSES.NodicsError('ERR_EDT_00008', 'The inspected publication changed; inspect before withdrawing');
        if (!retained && publication.state !== 'WITHDRAWN') {
            const deployed = await SERVICE.DefaultEditorialOnlineProjectionService.getDeployment(article.code, request);
            if (deployed.status !== 'DEPLOYED' || deployed.code !== publication.code ||
                deployed.sourceRevision !== Number(publication.sourceVersion) || deployed.version !== publication.targetVersion ||
                deployed.activationKey !== publication.activationOperation?.key) throw new CLASSES.NodicsError('ERR_EDT_00008', 'The current deployment changed or is unverified; refresh before withdrawing');
        }
        const result = publication.state === 'WITHDRAWN' ? publication
            : await SERVICE.DefaultPublicationLifecycleService.withdraw(context);
        if (!result || result.code !== publication.code || result.state !== 'WITHDRAWN' || result.domain !== 'editorial' ||
            result.rootType !== 'article' || result.rootCode !== article.code || result.sourceVersion !== publication.sourceVersion ||
            !Number.isSafeInteger(result.revision) || result.revision < publication.revision || publication.state === 'ONLINE' && result.revision === publication.revision ||
            result.success === false || result.acknowledged === false || result.error || result.errors !== undefined && (!Array.isArray(result.errors) || result.errors.length)) {
            throw new CLASSES.NodicsError('ERR_EDT_00002', 'Editorial withdrawal could not be confirmed; inspect the owning publication');
        }
        const withdrawCurrentRevision = retained && article.status === 'PUBLISHED' &&
            (article.publicationSourceRevision ?? article.revision) === article.revision;
        if (withdrawCurrentRevision) {
            const updated = await SERVICE.DefaultEditorialArticleService.update({
                tenant: request.tenant, authData: request.authData,
                query: { code: article.code, revision: article.revision,
                    publicationCode: article.publicationCode, status: article.status },
                model: { status: 'WITHDRAWN' }, options: { recursive: false }
            });
            this.confirmedUpdate(updated, 'Publication withdrawn, but the article changed before its status was saved; inspect before reconciling');
        }
        const saved = await this.savedSource(request, article.code, article.revision);
        if (saved.status !== (withdrawCurrentRevision ? 'WITHDRAWN' : article.status) ||
            ['publicationCode', 'publicationSourceRevision', 'workflowInstanceCode'].some(field => saved[field] !== article[field])) {
            throw new CLASSES.NodicsError('ERR_EDT_00008', 'The publication is withdrawn, but article readback changed; inspect before reconciling');
        }
        return Object.assign({}, result, { article: saved });
    },
    /** Publishes the actual correlated approved revision; a completed identical retry reuses its domain receipt. */
    applyProcessPublication: async function (request, execution) {
        const instance = (execution && execution.instance) || {};
        const context = instance.context || {};
        const response = await SERVICE.DefaultEditorialArticleService.get({
            tenant: request.tenant,
            authData: request.authData,
            query: { code: context.articleCode, revision: Number(context.articleRevision) },
            searchOptions: { limit: 1 },
        });
        const article = response && response.result && response.result[0];
        if (!article || article.workflowInstanceCode !== instance.code) {
            throw new CLASSES.NodicsError('ERR_EDT_00001', 'Editorial workflow revision correlation failed');
        }
        const publicationCode =
            context.publicationCode || 'editorial-' + article.code + '-r' + article.revision;
        if (article.status === 'PUBLISHED' && article.publicationCode === publicationCode) {
            const current = await SERVICE.DefaultPublicationLifecycleService.get(
                Object.assign({}, request, { publicationCode: publicationCode }),
            );
            return {
                status: 'COMPLETED',
                output: { publicationCode: publicationCode, state: current.state },
            };
        }
        const result = await this.publishApproved(
            Object.assign({}, request, {
                requestedBy: execution.actor,
                editorial: { article: article, publicationCode: publicationCode },
            }),
        );
        return { status: 'COMPLETED', output: { publicationCode: result.code, state: result.state } };
    },
};
