/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module discoveryConfig/router/routers @description Fixed internal read APIs only; no generic CRUD exposure. @layer router @owner discoveryConfig */
module.exports = {discoveryConfig: {configurationRead: {
    readIndex: {secured:true, authTokenTypes:['service'], accessGroups:['serviceAccountUserGroup'],
        permission:'discovery.config.read', apiExposure:'moduleInternal', cache:{enabled:false},
        key:'/internal/configuration/index', method:'POST', controller:'DefaultDiscoveryConfigurationReadController', operation:'readIndex'},
    readQueryProfile: {secured:true, authTokenTypes:['service'], accessGroups:['serviceAccountUserGroup'],
        permission:'discovery.config.read', apiExposure:'moduleInternal', cache:{enabled:false},
        key:'/internal/configuration/query-profile', method:'POST', controller:'DefaultDiscoveryConfigurationReadController', operation:'readQueryProfile'},
}}};
