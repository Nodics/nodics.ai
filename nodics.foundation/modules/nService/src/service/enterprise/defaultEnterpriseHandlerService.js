/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');

/**
 * @module service/enterprise/DefaultEnterpriseHandlerService
 * @description Loads active enterprises and tenants during startup, then builds
 * tenant-scoped runtime state: active enterprise mapping, tenant properties,
 * database connections, generated models, search engines, cron jobs, initial
 * data, and internal auth tokens.
 * @layer service
 * @owner nService
 * @override Project modules may override enterprise bootstrap behavior to
 * integrate external tenant registries, approval workflows, or custom startup
 * orchestration while preserving active enterprise and tenant registry
 * semantics.
 *
 * @property {string} CONFIG.defaultTenant Startup tenant used before active tenant discovery.
 * @property {string} CONFIG.profileModuleName Module that owns enterprise and tenant records.
 * @property {Object} NODICS.activeTenants Runtime active tenant registry.
 * @property {Object} NODICS.internalAuthTokens Tenant-scoped internal auth token registry.
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
     * Fetches active enterprise records from the local profile module or remote profile service.
     *
     * @returns {Promise<Object[]>} Enterprise records with tenant details.
     * @throws {CLASSES.NodicsError} When enterprise records cannot be loaded.
     */
    fetchEnterprise: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            try {
                let profileModuleName = CONFIG.get('profileModuleName') || 'profile';
                let defaultTenant = CONFIG.get('defaultTenant') || 'default';
                SERVICE.DefaultModuleService.invokeModule({
                    moduleName: profileModuleName,
                    serviceName: 'DefaultEnterpriseService',
                    operationName: 'get',
                    apiName: '/enterprise/get',
                    methodName: 'GET',
                    request: {
                        tenant: defaultTenant,
                        options: {
                            recursive: true,
                        },
                    },
                    requestBody: {},
                    responseType: true,
                    header: {
                        recursive: true,
                        'x-enterprise-code': (CONFIG.get('defaultAuthDetail', defaultTenant) || {}).entCode
                    }
                }).then(success => {
                    if (success.success || success.result.length > 0) {
                        resolve(success.result);
                    } else {
                        _self.LOG.error('Could not found any active enterprises currently');
                        reject(new CLASSES.NodicsError('ERR_ENT_00001', 'Could not found any active enterprises currently'));
                    }
                }).catch(error => {
                    reject(new CLASSES.NodicsError(error, null, 'ERR_ENT_00001'));
                });
            } catch (error) {
                reject(new CLASSES.NodicsError(error, null, 'ERR_ENT_00001'));
            }
        });
    },

    /**
     * Loads required enterprise state before readiness; failure remains a startup failure.
     * @returns {Promise<Object>} Completed enterprise preparation.
     */
    buildEnterprises: async function () {
        await this.buildEnterprise(await this.fetchEnterprise());
        return { code: 'SUC_SYS_00000' };
    },

    /**
     * Builds selected tenants sequentially and awaits their owning resource services.
     * Cron owns scheduling; tenant initialization requests job creation once.
     * @param {Object[]} enterprises Enterprise records to prepare.
     * @returns {Promise<boolean>} Completed preparation.
     */
    buildEnterprise: async function (enterprises) {
        for (const enterprise of enterprises || []) {
            if (enterprise.active) NODICS.addActiveEnterprise(enterprise.code, enterprise.tenant.code);
            else NODICS.removeActiveEnterprise(enterprise.code);
            if (!enterprise.active || !enterprise.tenant || !enterprise.tenant.active ||
                NODICS.getActiveTenants().includes(enterprise.tenant.code)) continue;
            const tenant = enterprise.tenant.code;
            NODICS.addActiveTenant(tenant);
            CONFIG.setProperties(_.merge({}, CONFIG.getProperties(), enterprise.tenant.properties), tenant);
            await SERVICE.DefaultDatabaseConnectionHandlerService.createDatabaseConnection(tenant);
            await SERVICE.DefaultDatabaseModelHandlerService.buildModelsForTenant(tenant);
            if (SERVICE.DefaultSearchEngineConnectionHandlerService) {
                await SERVICE.DefaultSearchEngineConnectionHandlerService.createTenantsSearchEngines([tenant]);
                await SERVICE.DefaultSearchSchemaHandlerService.prepareSearchSchema([tenant]);
                await SERVICE.DefaultSearchModelHandlerService.prepareSearchModels(Object.keys(NODICS.getModules()), [tenant]);
                await SERVICE.DefaultSearchModelHandlerService.updateIndexesSchema();
            }
            if (SERVICE.DefaultCronJobService && CONFIG.get('cronjob') && CONFIG.get('cronjob').runOnStartup) {
                await SERVICE.DefaultCronJobService.createAllJobs([tenant]);
            }
            if (NODICS.isModuleActive(CONFIG.get('profileModuleName') || 'profile')) {
                await SERVICE.DefaultMandatoryIdentityBootstrapService.prepareTenant({
                    tenant, modules: NODICS.getActiveModules(), source: 'tenant-startup'
                });
            }
            const issued = await SERVICE.DefaultInternalAuthenticationProviderService.fetchInternalAuthToken(tenant);
            NODICS.addInternalAuthToken(tenant, issued.authToken);
        }
        return true;
    }
};
