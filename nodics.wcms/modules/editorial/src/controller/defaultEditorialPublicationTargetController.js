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
    invoke: async function (operation, request, callback) {
        try {
            SERVICE.DefaultServiceTokenService.requireRuntimePrincipal(request, 'editorial');
            SERVICE.DefaultEditorialPublicationTargetService.assertOnlineRuntime();
            const targetRequest = Object.assign({}, request, {
                editorialPublicationTarget: request.httpRequest && request.httpRequest.body || request.editorialPublicationTarget || {},
                authData: Object.assign({}, request.authData,
                    SERVICE.DefaultIdentityGovernanceService.getSystemAuthData()),
            });
            const result = await SERVICE.DefaultEditorialPublicationTargetService[operation](targetRequest);
            return callback ? callback(null, { code: 'SUC_SYS_00000', result: result }) : result;
        } catch (error) {
            if (callback) return callback(error);
            throw error;
        }
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
