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
        if (!input.article || input.article.status !== 'APPROVED' || !input.article.code || !Number.isInteger(Number(input.article.revision))) throw new CLASSES.NodicsError('ERR_EDT_00002', 'Only an approved exact Editorial revision can be published');
        let code = input.publicationCode || 'editorial-' + input.article.code + '-r' + input.article.revision;
        return SERVICE.DefaultPublicationLifecycleService.publishApproved(Object.assign({}, request, { expectedRevision: input.expectedRevision, publication: {
            code: code, domain: 'editorial', rootType: 'article', rootCode: input.article.code, sourceVersion: String(input.article.revision), workflowRef: input.article.workflowInstanceCode
        }})).then(result => SERVICE.DefaultEditorialArticleService.update({ tenant: request.tenant, authData: request.authData, query: { code: input.article.code, revision: Number(input.article.revision) }, model: { status: 'PUBLISHED', publicationCode: code } })
            .then(() => Object.assign({}, result, { article: Object.assign({}, input.article, { status: 'PUBLISHED', publicationCode: code }) })));
    },
    /** Executes the allow-listed scheduled Process ACTION using immutable context. */
    applyProcessPublication: function (request, execution) {
        let context = execution && execution.instance && execution.instance.context || {};
        return this.publishApproved(Object.assign({}, request, { editorial: { article: { code: context.articleCode, revision: Number(context.articleRevision), status: 'APPROVED', workflowInstanceCode: context.workflowInstanceCode }, publicationCode: context.publicationCode } }))
            .then(result => ({ status: 'COMPLETED', output: { publicationCode: result.code, state: result.state } }));
    }
};
