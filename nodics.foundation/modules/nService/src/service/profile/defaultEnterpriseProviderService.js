/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module service/profile/DefaultEnterpriseProviderService
 * @description Resolves enterprise records for incoming requests. When profile
 * is local it reads generated enterprise services directly; when profile is
 * remote it calls the profile module API using the default internal auth token.
 * @layer service
 * @owner nService
 * @override Project modules may override this provider to integrate external
 * enterprise registries, CIAM systems, or tenant resolution policies while
 * preserving enterprise-code based lookup.
 *
 * @property {string} request.entCode Enterprise code resolved from request token/header.
 * @property {string} CONFIG.defaultTenant Startup/default tenant used for profile lookup.
 */
module.exports = {
    /**
     * This function is used to initiate entity loader process. If there is any functionalities, required to be executed on entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * This function is used to finalize entity loader process. If there is any functionalities, required to be executed after entity loading. 
     * defined it that with Promise way
     * @param {*} options 
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Builds the remote profile enterprise lookup request.
     *
     * @param {Object} input Enterprise lookup input.
     * @param {string} input.entCode Enterprise code.
     * @returns {Object} Internal module fetch options.
     */
    prepareURL: function (input) {
        return SERVICE.DefaultModuleService.buildRequest({
            moduleName: CONFIG.get('profileModuleName') || 'profile',
            methodName: 'GET',
            apiName: '/enterprise/get',
            requestBody: {
                options: {
                    recursive: true,
                },
                query: {
                    code: input.entCode
                }
            },
            responseType: true,
            header: {
                'x-enterprise-code': input.entCode,
                Authorization: 'Bearer ' + NODICS.getInternalAuthToken(CONFIG.get('defaultTenant') || 'default')
            }
        });
    },

    /**
     * Loads enterprise details from local or remote profile module.
     *
     * @param {Object} request Enterprise lookup request.
     * @param {string} request.moduleName Current module name.
     * @param {string} request.entCode Enterprise code.
     * @returns {Promise<Object>} Enterprise model.
     * @throws {CLASSES.NodicsError} When enterprise cannot be found.
     */
    loadEnterprise: function (request) {
        if (CONFIG.get('enterpriseResolution')?.runtimeLookup?.enabled === true) return this.loadRuntimeEnterprise(request);
        return new Promise((resolve, reject) => {
            let profileModuleName = CONFIG.get('profileModuleName') || 'profile';
            let lookupRequest = {
                tenant: CONFIG.get('defaultTenant') || 'default',
                authData: SERVICE.DefaultIdentityGovernanceService &&
                    typeof SERVICE.DefaultIdentityGovernanceService.getSystemAuthData === 'function'
                    ? SERVICE.DefaultIdentityGovernanceService.getSystemAuthData()
                    : undefined,
                options: {
                    recursive: true,
                },
                query: {
                    code: request.entCode
                }
            };
            SERVICE.DefaultModuleService.invokeModule({
                moduleName: profileModuleName,
                serviceName: 'DefaultEnterpriseService',
                operationName: 'get',
                apiName: '/enterprise/get',
                methodName: 'GET',
                request: lookupRequest,
                requestBody: {
                    options: lookupRequest.options,
                    query: lookupRequest.query
                },
                responseType: true,
                header: { 'x-enterprise-code': request.entCode }
            }).then(response => {
                if (response.result && response.result.length > 0) {
                    resolve(response.result[0]);
                } else {
                    reject(new CLASSES.NodicsError('ERR_ENT_00000'));
                }
            }).catch(error => {
                reject(new CLASSES.NodicsError(error));
            });
        });

    },

    /** Resolves public business placement through Profile without borrowing customer claims or changing the signed runtime enterprise. */
    loadRuntimeEnterprise: async function (request) {
        const fail = () => { throw new CLASSES.NodicsError('ERR_ENT_00000'); };
        const code = request.entCode, tenant = CONFIG.get('defaultTenant') || 'default';
        if (typeof code !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/.test(code)) fail();
        const token = NODICS.getInternalAuthToken(tenant);
        if (typeof token !== 'string' || !token) fail();
        const verified = await SERVICE.DefaultAuthorizationProviderService.authorizeToken({ authToken: token });
        if (!/^SUC_/.test(verified?.code || '') || verified.success === false || verified.error ||
            verified.errors && (!Array.isArray(verified.errors) || verified.errors.length) || !verified.result) fail();
        const auth = structuredClone(verified.result), moduleName = CONFIG.get('profileModuleName') || 'profile';
        SERVICE.DefaultServiceTokenService.requireRuntimePrincipal({ tenant, authData: auth }, moduleName);
        if (auth.principalType !== 'service' || auth.isSystem || !auth.permissions?.includes('profile.enterprise.search') ||
            auth.enterpriseCode !== undefined && auth.enterpriseCode !== auth.entCode) fail();
        const own = code === auth.entCode;
        const payload = own ? {} : { contractVersion: 1, enterpriseCode: code };
        const response = await SERVICE.DefaultModuleService.invokeModule({
            local: false, moduleName, connectionName: 'profile', targetAuthority: { runtimeRole: 'PLATFORM' },
            serviceName: 'DefaultEnterpriseService', operationName: own ? 'getRuntimeEnterprise' : 'resolveRuntimeEnterprise',
            apiName: own ? '/enterprise/get' : '/internal/enterprise/resolve', methodName: own ? 'GET' : 'POST',
            tenant, authToken: token, header: { 'x-enterprise-code': auth.entCode },
            request: { tenant, entCode: auth.entCode, authData: auth, payload }, requestBody: payload,
            responseType: true, maxAttempts: 1,
        });
        const rows = response?.result, enterprise = Array.isArray(rows) && rows.length === 1 ? rows[0] : undefined;
        if (!/^SUC_/.test(response?.code || '') || response.success === false || response.error ||
            response.errors && (!Array.isArray(response.errors) || response.errors.length) ||
            !enterprise || enterprise.code !== code || enterprise.active !== true ||
            enterprise.tenant?.code !== auth.tenant || enterprise.tenant.active !== true) fail();
        return structuredClone(enterprise);
    }
};
