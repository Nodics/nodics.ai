/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/controller/DefaultBackofficeOperationalReadinessController @description Maps operational readiness acknowledgements to governed BackOffice services. */
module.exports = {
    /** Normalizes startup finding acknowledgement request input. */
    prepareAcknowledgement: function (request) {
        let body = request.httpRequest && request.httpRequest.body || {};
        let params = request.httpRequest && request.httpRequest.params || request.params || {};
        request.startupFindingAcknowledgement = {
            code: params.code,
            propertyPath: body.propertyPath,
            reason: body.reason,
            reasonCode: body.reasonCode,
        };
        return request;
    },
    /** Executes one facade operation using the standard promise/callback contract. */
    invoke: function (operation, request, callback) {
        if (operation === 'acknowledgeStartupFinding') this.prepareAcknowledgement(request);
        let promise = FACADE.DefaultBackofficeOperationalReadinessFacade[operation](request)
            .then(data => ({ code: 'SUC_BOF_00021', data: data }));
        if (!callback) return promise;
        promise.then(result => callback(null, result)).catch(callback);
    },
    /** Records auditable acknowledgement for an active startup validation finding. */
    acknowledgeStartupFinding: function (request, callback) {
        return this.invoke('acknowledgeStartupFinding', request, callback);
    }
};
