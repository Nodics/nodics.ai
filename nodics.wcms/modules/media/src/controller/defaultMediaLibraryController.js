/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/**
 * @module media/controller/DefaultMediaLibraryController
 * @description Maps fixed Media library HTTP DTOs and never returns raw provider failures.
 * @layer controller
 * @owner media
 * @override Keep no-store envelopes, bounded DTOs and signed tenant/authority mapping.
 */
module.exports = {
    /** Maps one trusted router operation through the mergeable facade. */
    invoke: function (operation, request, callback) {
        const promise = Promise.resolve()
            .then(() => {
                if (
                    !['list', 'inspect', 'requestPublication'].includes(
                        operation
                    )
                )
                    SERVICE.DefaultMediaLibraryService.fail();
                const http = request.httpRequest || {};
                if (
                    request.httpResponse &&
                    typeof request.httpResponse.setHeader === 'function'
                )
                    request.httpResponse.setHeader('Cache-Control', 'no-store');
                const context = {
                    tenant: request.tenant,
                    authData: request.authData,
                    requestId: request.requestId,
                    correlationId: request.correlationId
                };
                {
                    const headers = http.headers || {};
                    context.httpRequest = {
                        headers: {
                            authorization:
                                headers.authorization || headers.Authorization
                        }
                    };
                }
                if (
                    (operation !== 'list' &&
                        Object.keys(http.query || {}).length) ||
                    (operation !== 'requestPublication' &&
                        Object.keys(http.body || {}).length)
                )
                    SERVICE.DefaultMediaLibraryService.fail();
                const input =
                    operation === 'list'
                        ? http.query || {}
                        : operation === 'inspect'
                          ? { mediaCode: (http.params || {}).mediaCode }
                          : http.body || {};
                return FACADE.DefaultMediaLibraryFacade[operation](
                    input,
                    context
                );
            })
            .then((result) => ({ code: 'SUC_MED_00032', data: result }))
            .catch((error) => {
                const stage = operation === 'requestPublication' && error &&
                    ['INSPECT', 'RETAIN', 'CREATE', 'VALIDATE', 'REQUEST_APPROVAL'].includes(error.mediaPublicationStage)
                    ? error.mediaPublicationStage : undefined;
                if (stage && this.LOG && typeof this.LOG.warn === 'function') {
                    const code = /^ERR_[A-Z0-9]+_[0-9]{5}$/.test(error.ownerErrorCode) ? error.ownerErrorCode : 'UNCLASSIFIED';
                    this.LOG.warn('Media publication request stopped at ' + stage + ' (' + code + ')');
                }
                throw new CLASSES.NodicsError(
                    'ERR_MED_00023',
                    stage ? 'Media publication request stopped at ' + stage + '. Reconcile the existing request before retrying.'
                        : 'Media library operation is unavailable or invalid'
                );
            });
        if (!callback) return promise;
        promise.then((result) => callback(null, result)).catch(callback);
    },
    /** Lists scoped safe media rows. */
    list: function (request, callback) {
        return this.invoke('list', request, callback);
    },
    /** Inspects current scoped record metadata. */
    inspect: function (request, callback) {
        return this.invoke('inspect', request, callback);
    },
    /** Initiates exact-version publication approval only. */
    requestPublication: function (request, callback) {
        return this.invoke('requestPublication', request, callback);
    }
};
