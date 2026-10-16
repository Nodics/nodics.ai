/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/service/principalScopeAssignment @description Fixed generated-owner import operation for explicit deployment assignment records. @owner profile @layer service */
module.exports = {
    /** Preserves installed assignments and delegates missing insert-only grants to Profile governance. */
    ensureDeploymentAll: function (request) {
        return SERVICE.DefaultRuntimeAuthorizationService.ensureDeploymentAll(this, request);
    },
};
