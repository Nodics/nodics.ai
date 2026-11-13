/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/service/interceptors/defaultEmployeeGetInterceptorService
 * @description Implements profile default employee get interceptor service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
const scopedReads = new WeakMap();
/** Stable plain selector representation; no credential or record values leave this owner. */
function binding(request) { return JSON.stringify([request.tenant, request.authData]); }
module.exports = {
    /** Public generated human reads require signed Enterprise scope; private owner reads and native Platform authority retain their independent admission. */
    requiresEnterpriseScope: function (request) {
        const publicRead = !!request.httpRequest || SERVICE.DefaultSchemaReadAccessPolicyService?.isGeneratedHttpRead?.(request) === true;
        return publicRead && request.authData?.principalType === 'human' && SERVICE.DefaultSecuredRequestPipelineService?.hasPlatformFullAccess?.(request) !== true;
    },
    /** Confines generated Employee reads to native bindings and current registered assignments using existing bounded Profile owners. */
    restrictEnterpriseRead: async function (request) {
        if (!this.requiresEnterpriseScope(request)) return true;
        if (scopedReads.has(request)) return this.protectProviderRead(request);
        const originalBinding = binding(request);
        const auth = request.authData;
        if (typeof auth.entCode !== 'string' || !auth.entCode || typeof auth.tenant !== 'string' || request.tenant !== auth.tenant)
            throw new CLASSES.NodicsError('ERR_AUTH_00003');
        const business = SERVICE.DefaultEnterpriseBusinessAccessService;
        const membership = SERVICE.DefaultEnterpriseMembershipService;
        if (typeof business?.rows !== 'function' || typeof membership?.authority !== 'function')
            throw new CLASSES.NodicsError('ERR_AUTH_00003');
        const assignments = await business.rows('DefaultEnterpriseAccessAssignmentService', request, membership.authority(),
            { enterpriseCode: auth.entCode, tenantCode: auth.tenant, status: 'REGISTERED', active: true });
        if (originalBinding !== binding(request)) throw new CLASSES.NodicsError('ERR_AUTH_00003');
        const candidates = [{ enterpriseCode: auth.entCode }, { 'metadata.enterpriseCode': auth.entCode },
            { registrationAssignmentCode: { $in: assignments.map(item => item.code) } }];
        if (auth.entCode === CONFIG.get('defaultEnterprise')) candidates.push({ enterpriseCode: { $exists: false },
            'metadata.enterpriseCode': { $exists: false }, registrationAssignmentCode: { $exists: false } });
        const scope = { $and: [{ $or: candidates },
            { $or: [{ enterpriseCode: { $exists: false } }, { enterpriseCode: auth.entCode }] },
            { $or: [{ 'metadata.enterpriseCode': { $exists: false } }, { 'metadata.enterpriseCode': auth.entCode }] }] };
        request.query = { $and: [request.query || {}, scope] };
        scopedReads.set(request, { binding: binding(request), scope: JSON.stringify(scope) });
        return true;
    },
    /** Provider/export entry cannot skip scope preparation or remove its constraint after an await. */
    protectProviderRead: function (request) {
        if (!this.requiresEnterpriseScope(request)) return true;
        const proof = scopedReads.get(request);
        const contains = (query, depth = 0) => depth < 12 && query && typeof query === 'object' &&
            (JSON.stringify(query) === proof?.scope || Array.isArray(query.$and) && query.$and.some(item => contains(item, depth + 1)));
        if (!proof || proof.binding !== binding(request) || !contains(request.query))
            throw new CLASSES.NodicsError('ERR_AUTH_00003');
        return true;
    },
    /**
     * Retrieves employee recursive information.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @returns {*} Method result.
     */
    getEmployeeRecursive: async function (request) {
        await this.restrictEnterpriseRead(request);
        request.options = request.options || {};
        if (request.options.recursive === undefined) request.options.recursive = true;
        return true;
    },

    /**

     * Retrieves all user group codes information.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    getAllUserGroupCodes: function (request, response) {
        return new Promise((resolve, reject) => {
            if (response.success.result && response.success.result.length > 0) {
                response.success.result.forEach(itemModel => {
                    itemModel.userGroupCodes = UTILS.getUserGroupCodes(itemModel.userGroups);
                    itemModel.userGroupPermissions = UTILS.getUserGroupPermissions(itemModel.userGroups);
                });
            }
            resolve(true);
        });
    }
};
