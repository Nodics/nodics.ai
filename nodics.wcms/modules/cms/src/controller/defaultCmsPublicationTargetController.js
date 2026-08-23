/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/controller/DefaultCmsPublicationTargetController
 * @description Maps internal authenticated Staged-to-Online release operations to the target-local CMS deployment service.
 * @layer controller
 * @owner cms
 * @override Online project modules may replace request mapping while retaining internal-token and target-operation boundaries.
 */
module.exports = {
    /** Invokes one target-local publication operation. */
    invoke: function (operation, request, callback) {
        request.cmsPublicationTarget = request.httpRequest && request.httpRequest.body || request.cmsPublicationTarget || {};
        request.correlationId = request.cmsPublicationTarget.correlationId || request.correlationId || request.requestId;
        let promise = SERVICE.DefaultCmsPublicationTargetService[operation](request);
        if (!callback) return promise;
        promise.then(result => callback(null, { code: 'SUC_SYS_00000', result: result || null })).catch(callback);
    },
    /** Imports and activates one immutable release. */
    deploy: function (request, callback) { return this.invoke('deploy', request, callback); },
    /** Returns target-local Online release status. */
    getStatus: function (request, callback) { return this.invoke('getStatus', request, callback); },
    /** Verifies target-local Online pointer state and records verification evidence. */
    verifyOnline: function (request, callback) { return this.invoke('verifyOnline', request, callback); },
    /** Detects same-scope Online collisions before activation. */
    detectCollisions: function (request, callback) { return this.invoke('detectCollisions', request, callback); },
    /** Builds a redacted publication support bundle. */
    supportBundle: function (request, callback) { return this.invoke('supportBundle', request, callback); },
    /** Diagnoses target evidence and repairs only evidence gaps when pointers already agree. */
    reconcile: function (request, callback) { return this.invoke('reconcile', request, callback); },
    /** Runs reference-safe published-media retention through CMS and Media authorities. */
    collectMediaGarbage: function (request, callback) { return this.invoke('collectMediaGarbage', request, callback); },
    /** Replays failed media replication for one immutable manifest/package. */
    reconcileMediaReplication: function (request, callback) { return this.invoke('reconcileMediaReplication', request, callback); },
    /** Runs due pending media replication retries across immutable manifests. */
    retryPendingMediaReplication: function (request, callback) { return this.invoke('retryPendingMediaReplication', request, callback); },
    /** Restores a previously deployed target release. */
    rollback: function (request, callback) { return this.invoke('rollback', request, callback); },
    /** Removes one deployed target release from Online delivery. */
    withdraw: function (request, callback) { return this.invoke('withdraw', request, callback); }
};
