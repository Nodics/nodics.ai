/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
'use strict';
/** @module discoveryConfig/service/defaultDiscoveryConfigurationReadService @description Owner-side bounded configuration lookup retaining tenant and generated-service access checks. @layer service @owner discoveryConfig */
module.exports = {
    /** Reads the fixed index schema. @param {Object} request Trusted context. @returns {Promise<Object>} Generated response. @throws {Error} On denied or invalid lookup. */
    readIndex: function(request) { return this.read(request, 'DefaultDiscoveryIndexConfigurationService', ['ownerType','code']); },
    /** Reads the fixed query-profile schema. @param {Object} request Trusted context. @returns {Promise<Object>} Generated response. @throws {Error} On denied or invalid lookup. */
    readQueryProfile: function(request) { return this.read(request, 'DefaultDiscoveryQueryProfileService', ['code']); },
    /** Applies fixed owner and tenant scope before generated persistence access.
     * @param {Object} request Trusted request context.
     * @param {string} serviceName Fixed internal service selected by the operation.
     * @param {string[]} fields Allowed business selector fields.
     * @returns {Promise<Object>} Generated read result.
     * @throws {Error} For nonowner execution, tenant mismatch or malformed selectors.
     */
    read: async function(request, serviceName, fields) {
        const dms=SERVICE.DefaultModuleService;
        const authority=require('./defaultDiscoveryConfigurationResolverService').targetAuthority();
        if (!authority || !['STAGED','ONLINE','OPERATIONAL'].includes(authority.publication) ||
            !dms.isLocalModuleActive('discoveryConfig') || !dms.isCurrentRuntimeAuthority(authority)) throw new Error('Discovery configuration owner is unavailable');
        if (typeof request.tenant !== 'string' || !request.tenant || !request.authData) throw new Error('Trusted tenant and actor are required');
        const source=request.query||{};
        if (source.tenant!==undefined && source.tenant!==request.tenant) throw new Error('Discovery tenant mismatch');
        const query={tenant:request.tenant,status:'CURRENT'};
        for(const key of Object.keys(source)) {
            if (key==='tenant'||key==='status') continue;
            if (!fields.includes(key)||typeof source[key]!=='string'||!source[key]||source[key].length>128) throw new Error('Invalid Discovery configuration selector');
            query[key]=source[key];
        }
        if (source.status!==undefined && source.status!=='CURRENT') throw new Error('Only current Discovery configuration may be read');
        return SERVICE[serviceName].get({tenant:request.tenant,authData:request.authData,query,pageSize:1});
    }
};
