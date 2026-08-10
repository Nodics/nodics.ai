/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
'use strict';
/** @module engagementApi/src/service/defaultEngagementApiPolicyService @description Enforces anonymous allow-listing, tenant scope, customer ownership, service identity, limits, and correlation. @layer service @owner engagementApi @override Later modules may narrow access but may not bypass tenant or ownership checks. */
module.exports = {
    /** Handles fail within the module-owned contract. */
    fail: function (code, message) { let error = new Error(message); error.code = code; throw error; },
    /** Handles is anonymous allowed within the module-owned contract. */
    isAnonymousAllowed: function (routeName, configuration) { return (configuration.anonymousRouteAllowList || []).includes(routeName); },
    /** Handles assert anonymous allowed within the module-owned contract. */
    assertAnonymousAllowed: function (routeName, request, configuration) {
        if (!(request.authData && request.authData.tokenType) && !this.isAnonymousAllowed(routeName, configuration)) this.fail('ERR_ENG_API_00001', 'anonymous route is not allowed');
        return request;
    },
    /** Handles prepare within the module-owned contract. */
    prepare: function (request, configuration) {
        request = request || {}; configuration = configuration || {};
        let auth = request.authData || {};
        let tenant = String(request.tenant || auth.tenant || '').trim();
        if (!tenant) this.fail('ERR_ENG_00001', 'tenant is required');
        if (request.tenant && auth.tenant && request.tenant !== auth.tenant) this.fail('ERR_ENG_API_00002', 'cross-tenant request denied');
        let correlationId = String(request.correlationId || (request.httpRequest && request.httpRequest.headers && request.httpRequest.headers['x-correlation-id']) || '').trim();
        if (!correlationId) this.fail('ERR_ENG_00002', 'correlationId is required');
        let limit = Number(request.query && request.query.limit || configuration.limits && configuration.limits.defaultQueryLimit || 25);
        request.tenant = tenant; request.correlationId = correlationId;
        request.query = Object.assign({}, request.query, { limit: Math.max(1, Math.min(limit, configuration.limits && configuration.limits.maximumQueryLimit || 100)) });
        return request;
    },
    /** Handles assert owner within the module-owned contract. */
    assertOwner: function (record, request) {
        let auth = request.authData || {};
        let principalId = String(auth.principalId || auth.customerCode || auth.code || '').trim();
        if (!record || record.tenant !== request.tenant || !principalId || record.ownerId !== principalId) this.fail('ERR_ENG_API_00003', 'submission ownership denied');
        return record;
    },
    /** Handles assert tenant within the module-owned contract. */
    assertTenant: function (record, request) {
        if (!record || record.tenant !== request.tenant) this.fail('ERR_ENG_API_00002', 'cross-tenant record denied');
        return record;
    },
    /** Handles assert service within the module-owned contract. */
    assertService: function (request) {
        let auth = request.authData || {};
        if (auth.tokenType !== 'service' || !(auth.userGroups || []).includes('serviceAccountUserGroup')) this.fail('ERR_ENG_API_00004', 'service authentication required');
        return request;
    },
    /** Handles assert payload within the module-owned contract. */
    assertPayload: function (payload, configuration) {
        let bytes = Buffer.byteLength(JSON.stringify(payload || {}), 'utf8');
        if (bytes > (configuration.limits && configuration.limits.maximumPayloadBytes || 65536)) this.fail('ERR_ENG_00006', 'payload exceeds configured maximum');
        return payload || {};
    }
};
