/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/service/defaultProfileReferenceService @description Provides bounded Profile reference display fields to authorized runtime consumers. @layer service @owner profile @override Later layers may narrow reference policy and projection without exposing generic identity CRUD. */
module.exports = {
    /** Resolves Profile-owned reference types and field policy. */
    settings: function () { return CONFIG.get('profileReferenceRead') || {}; },

    /** Checks runtime authority before a bounded owner-controlled persistence read. */
    read: async function (request) {
        const auth = request.authData || {}, payload = request.payload || {}, policy = this.settings();
        const types = policy.types || {}, type = Object.prototype.hasOwnProperty.call(types, payload.type) ? types[payload.type] : null;
        if (!type || auth.tokenType !== 'service' || auth.principalType !== 'service' || !auth.runtimeScope?.instanceCode ||
            !request.tenant || request.tenant !== auth.tenant || !Array.isArray(auth.modules) || !auth.modules.includes('profile') ||
            !Array.isArray(auth.permissions) || !auth.permissions.includes(type.permission)) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Profile reference read requires its approved runtime scope and permission');
        }
        if (!Number.isSafeInteger(policy.maximumCodes) || policy.maximumCodes < 1 || policy.maximumCodes > 100 ||
            !Array.isArray(payload.codes) || !payload.codes.length || payload.codes.length > policy.maximumCodes ||
            payload.codes.some(code => typeof code !== 'string' || !code.trim() || code.length > 191)) {
            throw new CLASSES.NodicsError('ERR_PRFL_00003', 'Provide a bounded list of reference codes');
        }
        const codes = [...new Set(payload.codes)], owner = SERVICE[type.serviceName];
        const result = await owner.get({ tenant: request.tenant,
            authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
            query: { code: { $in: codes }, active: true }, options: { recursive: false, limit: codes.length },
            searchOptions: { limit: codes.length, pageSize: codes.length } });
        if (!result || !/^SUC_/.test(result.code || '') || result.success === false || result.errors?.length || !Array.isArray(result.result)) {
            throw new CLASSES.NodicsError('ERR_PRFL_00003', 'Profile reference records are unavailable');
        }
        return { code: result.code, result: result.result.filter(record => codes.includes(record.code))
            .map(record => this.project(record, type.fields)) };
    },

    /** Returns only configured display fields, never recursive identity or credential metadata. */
    project: function (record, fields) {
        return Object.fromEntries(fields.filter(field => record[field] !== undefined).map(field => [field, record[field]]));
    }
};
