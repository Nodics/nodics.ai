/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/service/enterprise/defaultEnterpriseService
 * @description Implements profile default enterprise service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    /**
     * Returns only the enterprise/tenant bootstrap projection authorized by a runtime credential.
     * @param {Object} request Verified runtime authentication and selected enterprise context.
     * @returns {Promise<Object>} Canonical response with one approved enterprise.
     */
    getRuntimeEnterprise: async function (request) {
        const auth = request.authData || {};
        const profileModule = CONFIG.get('profileModuleName') || 'profile';
        if (auth.tokenType !== 'service' || !auth.runtimeScope || !auth.runtimeScope.instanceCode ||
            !Array.isArray(auth.modules) || !auth.modules.includes(profileModule) ||
            !Array.isArray(auth.permissions) || !auth.permissions.includes('profile.enterprise.search') ||
            !auth.entCode || request.entCode !== auth.entCode || request.tenant !== auth.tenant) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Runtime enterprise lookup requires its approved enterprise, tenant and permission');
        }
        const enterprise = await this.retrieveEnterprise(auth.entCode);
        if (!enterprise || enterprise.code !== auth.entCode || enterprise.active !== true ||
            !enterprise.tenant || enterprise.tenant.code !== auth.tenant || enterprise.tenant.active !== true) {
            throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Runtime enterprise or tenant is unavailable');
        }
        return { code: 'SUC_FIND_00000', result: [{ code: enterprise.code, active: true,
            tenant: { code: enterprise.tenant.code, active: true, properties: enterprise.tenant.properties || {} } }] };
    },

    /**
     * Retrieves enterprise information.
     *
     * @param {*} entCode Method input.
     * @returns {*} Method result.
     */
    retrieveEnterprise: function (entCode) {
        return new Promise((resolve, reject) => {
            if (UTILS.isBlank(entCode)) {
                reject(new CLASSES.NodicsError('ERR_PRFL_00003', 'Enterprise code can not be null or empty'));
            } else {
                this.get({
                    tenant: CONFIG.get('defaultTenant') || 'default',
                    authData: SERVICE.DefaultIdentityGovernanceService.getSystemAuthData(),
                    options: {
                        recursive: true
                    },
                    query: {
                        code: entCode
                    }
                }).then(enterprises => {
                    if (enterprises.result.length !== 1) {
                        reject(new CLASSES.NodicsError('ERR_PRFL_00003', 'None enterprise found for code: ' + entCode));
                    } else if (!enterprises.result[0].active || !enterprises.result[0].tenant || enterprises.result[0].tenant.active === false) {
                        reject(new CLASSES.NodicsError('ERR_AUTH_00003', 'Enterprise or tenant is inactive'));
                    } else {
                        resolve(enterprises.result[0]);
                    }
                }).catch(error => {
                    reject(error);
                });
            }
        });
    },
};
