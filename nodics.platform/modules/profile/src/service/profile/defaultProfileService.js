/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/service/profile/defaultProfileService
 * @description Implements profile default profile service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
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

     * Retrieves profile module name information.

     *

     * @returns {*} Method result.

     */

    getProfileModuleName: function () {
        return (typeof CONFIG !== 'undefined' && CONFIG.get && CONFIG.get('profileModuleName')) || 'profile';
    },

    /**

     * Retrieves default tenant information.

     *

     * @returns {*} Method result.

     */

    getDefaultTenant: function () {
        return (typeof CONFIG !== 'undefined' && CONFIG.get && CONFIG.get('defaultTenant')) || 'default';
    },

    /**
     * Resolves whether the configured bootstrap employee is available after a
     * local reset or partial initialization.
     *
     * @param {string} profileModuleName Profile module owning identity models.
     * @param {string} defaultTenant Tenant code used for bootstrap identity.
     * @returns {Promise<boolean>} Resolves true when the configured employee exists.
     */
    hasBootstrapEmployee: function (profileModuleName, defaultTenant) {
        let defaultAuthDetail = CONFIG.get('defaultAuthDetail') || {};
        let loginId = defaultAuthDetail.loginId;
        if (!loginId) return Promise.resolve(true);
        let models = NODICS.getModels(profileModuleName, defaultTenant);
        if (!models || !models.EmployeeModel || typeof models.EmployeeModel.getItems !== 'function') {
            return Promise.resolve(false);
        }
        return models.EmployeeModel.getItems({
            tenant: defaultTenant,
            query: { loginId: loginId }
        }).then(success => {
            let employees = UTILS.isArray(success) ? success : success.result;
            return Boolean(employees && employees.length > 0);
        });
    },

    /**

     * Validates init required rules.

     *

     * @returns {*} Method result.

     */

    isInitRequired: function () {
        let _self = this;
        return new Promise((resolve, reject) => {
            let profileModuleName = _self.getProfileModuleName();
            let defaultTenant = _self.getDefaultTenant();
            let dbConnection = SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase(profileModuleName, defaultTenant);
            if (dbConnection) {
                let masterDatabase = dbConnection.master;
                if (!masterDatabase.getCollectionList() || masterDatabase.getCollectionList().length <= 0) {
                    _self.LOG.info('System requires initial data to be imported');
                    resolve(true);
                } else {
                    NODICS.getModels(profileModuleName, defaultTenant).EnterpriseModel.getItems({
                        tenant: defaultTenant
                    }).then(success => {
                        let enterprises = UTILS.isArray(success) ? success : success.result;
                        if (!enterprises || enterprises.length <= 0) {
                            resolve(true);
                            return;
                        }
                        _self.hasBootstrapEmployee(profileModuleName, defaultTenant).then(hasEmployee => {
                            if (!hasEmployee) _self.LOG.info('System requires initial data because bootstrap identity is missing');
                            resolve(!hasEmployee);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                reject(new CLASSES.NodicsError('ERR_DBS_00001', 'Invalid database connection handler found for module: ' + profileModuleName + ', and tenant: ' + defaultTenant));
            }
        });
    }
};
