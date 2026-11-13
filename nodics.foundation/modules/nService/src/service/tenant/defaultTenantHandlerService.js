/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module service/tenant/DefaultTenantHandlerService
 * @description Deactivates tenants from the runtime node by removing tenant
 * registry entries, stopping tenant cron jobs, dropping tenant database handles,
 * removing generated models, and cleaning search runtime state.
 * @layer service
 * @owner nService
 * @override Project modules may override tenant removal to add audit, graceful
 * draining, cache cleanup, or external platform deprovisioning while preserving
 * active tenant registry semantics.
 *
 * @property {Object} NODICS.activeTenants Runtime active tenant registry.
 * @property {Object} SERVICE.DefaultDatabaseConnectionHandlerService Removes tenant database handles.
 * @property {Object} SERVICE.DefaultDatabaseModelHandlerService Removes tenant generated models.
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
     * Removes runtime state for a list of tenants.
     *
     * @param {string[]} tenants Tenant codes to deactivate from this node.
     * @returns {Promise<Object>} Acknowledgement after every selected resource has completed.
     * @throws Propagates owner cleanup failure, retaining the active marker for inspection; completed resource effects are not rolled back.
     * @sideEffects Mutates tenant, job, database, model, and search registries.
     */
    removeTenants: async function (tenants = []) {
        if (!Array.isArray(tenants)) throw new TypeError('Tenant cleanup requires a list');
        for (const tenant of new Set(tenants)) {
            // Resource owners validate an active tenant. Retire that marker only
            // after every required cleanup has completed, never on first success.
            if (SERVICE.DefaultCronJobService) {
                await SERVICE.DefaultCronJobService.getCronJobRuntimeService().removeAllJobs([tenant]);
            }
            for (const [moduleName, moduleObject] of Object.entries(NODICS.getModules())) {
                await SERVICE.DefaultDatabaseConnectionHandlerService.removeTenantDatabase(moduleName, tenant);
                await SERVICE.DefaultDatabaseModelHandlerService.removeModelsForTenant(moduleName, tenant);
                if (NODICS.isModuleActive('search')) {
                    await SERVICE.DefaultSearchConfigurationService.removeTenantSearchEngine(moduleName, tenant);
                    await SERVICE.DefaultSearchConfigurationService.removeTenantRawSearchSchema(moduleName, tenant);
                    if (moduleObject.searchModels) delete moduleObject.searchModels[tenant];
                }
            }
            NODICS.removeActiveTenant(tenant);
        }
        return { code: 'SUC_SYS_00000', message: 'Tenant successfully deactivated' };
    }
};
