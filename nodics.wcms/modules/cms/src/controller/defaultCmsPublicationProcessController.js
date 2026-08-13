/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module cms/controller/DefaultCmsPublicationProcessController @description Maps the authenticated Process decision callback to the Staged CMS publication authority. */
module.exports = {
    /** Executes the documented bounded module operation. */
    applyDecision: function (request, callback) {
        request.publicationDecision = request.httpRequest && request.httpRequest.body || request.publicationDecision || {};
        request.correlationId = request.publicationDecision.correlationId || request.correlationId || request.requestId;
        let promise = SERVICE.DefaultCmsPublicationWorkflowCallbackService.applyDecision(request);
        if (!callback) return promise;
        promise.then(result => callback(null, { code: 'SUC_CMS_00000', result: result })).catch(callback);
    }
};
