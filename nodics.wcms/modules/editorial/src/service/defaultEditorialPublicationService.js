/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/service/DefaultEditorialPublicationService @description Maps approved Editorial release intents into the authoritative nPublish lifecycle. @layer service @owner editorial */
module.exports = {
    /** Immediately publishes one exact approved article revision through nPublish. */
    publishApproved: function (request) {
        let input = request.editorial || {};
        if (!input.article && input.model) input.article = input.model;
        if (
            !input.article ||
            input.article.status !== 'APPROVED' ||
            !input.article.code ||
            !Number.isInteger(Number(input.article.revision))
        )
            throw new CLASSES.NodicsError(
                'ERR_EDT_00002',
                'Only an approved exact Editorial revision can be published',
            );
        let code = input.publicationCode || 'editorial-' + input.article.code + '-r' + input.article.revision;
        return SERVICE.DefaultPublicationLifecycleService.publishApproved(
            Object.assign({}, request, {
                expectedRevision: input.expectedRevision,
                publication: {
                    code: code,
                    domain: 'editorial',
                    rootType: 'article',
                    rootCode: input.article.code,
                    sourceVersion: String(input.article.revision),
                    workflowRef: input.article.workflowInstanceCode,
                },
            }),
        ).then((result) =>
            SERVICE.DefaultEditorialArticleService.update({
                tenant: request.tenant,
                authData: request.authData,
                query: { code: input.article.code, revision: Number(input.article.revision) },
                model: { status: 'PUBLISHED', publicationCode: code },
            }).then(() =>
                Object.assign({}, result, {
                    article: Object.assign({}, input.article, { status: 'PUBLISHED', publicationCode: code }),
                }),
            ),
        );
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
