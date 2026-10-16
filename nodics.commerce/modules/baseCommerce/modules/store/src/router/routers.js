/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module store/router/routers @description Declares a deployment-bound read-only Store placement route; generic schema APIs remain unchanged. @layer router @owner store @override Retain service authentication, exact read permission and private capture. */
module.exports = { store: { internal: {
    placement: { active: true, secured: true, authTokenTypes: ['service'], accessGroups: ['serviceAccountUserGroup'],
        permission: 'commerce.store.read', apiExposure: 'storePlacementRead', requestPrivacy: { sensitive: true },
        cache: { enabled: false }, key: '/internal/stores/placement', method: 'POST',
        controller: 'DefaultStorePlacementController', operation: 'placement' }
} } };
