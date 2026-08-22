/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module editorial/controller/DefaultEditorialPublicationTargetController @description Maps internal Editorial Online target operations to target-local persistence. @layer controller @owner editorial */
module.exports = {
    /** Invokes one target operation using the standard callback contract. */
    invoke: function (operation, request, callback) {
        request.editorialPublicationTarget = request.httpRequest && request.httpRequest.body || request.editorialPublicationTarget || {};
        let promise = SERVICE.DefaultEditorialPublicationTargetService[operation](request);
        return callback ? promise.then(result => callback(null, { code: 'SUC_SYS_00000', result: result })).catch(callback) : promise;
    },
    /** Deploys immutable Editorial Online projections. */
    deploy: function (request, callback) { return this.invoke('deploy', request, callback); },
    /** Reads the current immutable projection version. */
    status: function (request, callback) { return this.invoke('status', request, callback); },
    /** Restores a previous immutable projection set. */
    rollback: function (request, callback) { return this.invoke('rollback', request, callback); },
    /** Withdraws current projections for an article. */
    withdraw: function (request, callback) { return this.invoke('withdraw', request, callback); }
};
