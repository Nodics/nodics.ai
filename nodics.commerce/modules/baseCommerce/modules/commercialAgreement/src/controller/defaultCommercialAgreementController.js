/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module commercialAgreement/controller @description Maps authenticated transport without accepting body authority. @layer controller @owner commercialAgreement */
module.exports = {
    /** Dispatches only declared commands and retains the original authenticated context. */
    dispatch: function (request, operation, callback) {
        const input = { tenant: request.tenant || request.authData?.tenant, authData: request.authData,
            payload: request.httpRequest?.body || request.payload };
        const result = FACADE.DefaultCommercialAgreementFacade[operation](input).then(data => ({ data }));
        if (!callback) return result;
        result.then(value => callback(null, value), error => callback(error));
    },
    /** Records an explicitly agreed creation or amendment. */
    workspace: function (request, callback) { return this.dispatch(request, 'workspace', callback); },
    /** Records an explicitly agreed creation or amendment. */
    record: function (request, callback) { return this.dispatch(request, 'record', callback); },
    /** Lists scoped agreement summaries. */
    search: function (request, callback) { return this.dispatch(request, 'search', callback); },
    /** Reads the authorized retained history. */
    read: function (request, callback) { return this.dispatch(request, 'read', callback); }
};
