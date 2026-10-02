/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nodics.platform/modules/profile/src/service/interceptors/defaultEnterpriseUpdateInterceptorService
 * @description Implements profile default enterprise update interceptor service business behavior and extension logic.
 * @layer service
 * @owner profile
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {

    // Enterprise Save Events
    /**
     * Executes enterprise pre save behavior.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @returns {*} Method result.
     */
    enterprisePreSave: function (request, response) {
        return new Promise((resolve, reject) => {
            request.options.returnModified = request.options.returnModified || true;
            request.options.recursive = request.options.recursive || true;
            resolve(true);
        });
    },

    /**

     * Executes enterprise pre update behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    enterprisePreUpdate: function (request, response) {
        return new Promise((resolve, reject) => {
            request.options.returnModified = request.options.returnModified || true;
            request.options.recursive = request.options.recursive || true;
            resolve(true);
        });
    },
    /**
     * Executes enterprise pre remove behavior.
     *
     * @param {*} request Method input.
     * @param {*} response Method input.
     * @returns {*} Method result.
     */
    enterprisePreRemove: function (request, response) {
        return new Promise((resolve, reject) => {
            request.options.returnModified = request.options.returnModified || true;
            request.options.recursive = request.options.recursive || true;
            resolve(true);
        });
    },

    /**

     * Executes enterprise save event behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    enterpriseSaveEvent: function (request, response) {
        const defaultTenant = CONFIG.get('defaultTenant') || 'default';
        const tenantCode = typeof request.model?.tenant === 'object' ? request.model.tenant.code : request.model?.tenant;
        if (request.tenant === defaultTenant && tenantCode === defaultTenant &&
            SERVICE.DefaultDataReleaseService?.isStartupReleaseExecution(defaultTenant) === true) {
            // Startup installs the default seed before identity grants/tokens, then
            // discovers enterprises. Do not recursively prepare or notify here.
            return Promise.resolve(true);
        }
        return this.triggerEnterpriseUpdateEvent(request.model).then(() => true);
    },

    /**

     * Executes enterprise update event behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    enterpriseUpdateEvent: function (request, response) {
        const models = request.result?.models || response?.success?.result?.models || [];
        return Promise.all(models.map(model => this.triggerEnterpriseUpdateEvent(model))).then(() => true);
    },

    /**

     * Executes enterprise remove event behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @returns {*} Method result.

     */

    enterpriseRemoveEvent: function (request, response) {
        return new Promise((resolve, reject) => {
            resolve(true);
            if (request.result && request.result.models && request.result.models.length > 0) {
                request.result.models.forEach(model => {
                    this.triggerEnterpriseUpdateEvent(model, true).then(success => {
                        this.LOG.debug('All modules have been informed about Enterprise model changes: ' + model.code);
                    }).catch(error => {
                        this.LOG.error('Failed to update modules about Enterprise model changes: ' + model.code);
                        this.LOG.error(error);
                    });
                });
            }
        });
    },

    /**

     * Processes enterprise update event behavior.

     *

     * @param {*} enterprise Method input.

     * @param {*} isRemoved Method input.

     * @returns {*} Method result.

     */

    triggerEnterpriseUpdateEvent: async function (enterprise, isRemoved) {
        if (enterprise.active && enterprise.tenant && !isRemoved) {
            const tenantCode = typeof enterprise.tenant === 'object' ? enterprise.tenant.code : enterprise.tenant;
            const tenants = await SERVICE.DefaultEnterpriseTenantProvisioningService.rows('DefaultTenantService', { code: tenantCode });
            if (tenants.length !== 1 || tenants[0].active !== true) {
                throw new CLASSES.NodicsError('ERR_PROFILE_TENANT_PROVISIONING_HELD');
            }
            // Events carry identity only. Receivers use authenticated inventory
            // for configuration; future private Enterprise fields cannot leak.
            enterprise = { code: enterprise.code, active: true, tenant: { code: tenantCode, active: true } };
        }
        enterprise = { code: enterprise.code, active: enterprise.active === true,
            tenant: { code: typeof enterprise.tenant === 'object' ? enterprise.tenant.code : enterprise.tenant,
                active: enterprise.tenant?.active === true } };
        return new Promise((resolve, reject) => {
            let profileModuleName = CONFIG.get('profileModuleName') || 'profile';
            let defaultTenant = CONFIG.get('defaultTenant') || 'default';
            let event = {
                tenant: defaultTenant,
                sourceName: profileModuleName,
                sourceId: CONFIG.get('nodeId'),
                target: profileModuleName,
                state: "NEW",
                type: "SYNC",
                active: true,
                targetType: ENUMS.TargetType.MODULE_NODES.key,
                data: {
                    enterprise: enterprise
                }
            };
            if ((isRemoved || !enterprise.active || !enterprise.tenant.active) && NODICS.getActiveTenants().includes(enterprise.tenant.code)) {
                SERVICE.DefaultEnterpriseService.get({
                    tenant: defaultTenant,
                    query: {
                        tenant: enterprise.tenant.code,
                        active: true
                    }
                }).then(success => {
                    if (!success.result || success.result.length <= 0) {
                        SERVICE.DefaultTenantHandlerService.removeTenants([enterprise.tenant.code]).then(success => {
                            NODICS.removeInternalAuthToken(enterprise.tenant.code);
                            NODICS.removeActiveEnterprise(enterprise.code);
                            this.LOG.debug('Tenant: ' + enterprise.tenant.code + ' has been successfully deactivated from profile module');
                            event.event = 'removeEnterprise';
                            this.LOG.debug('Pushing event for enterprise removed or deactivated');
                            SERVICE.DefaultEventService.publish(event).then(success => {
                                this.LOG.debug('Event successfully posted');
                                resolve(success);
                            }).catch(error => {
                                this.LOG.error('While posting model change event : ', error);
                                reject(error);
                            });
                        }).catch(error => {
                            this.LOG.error('Tenant: ' + enterprise.tenant.code + ' can not be deactivated from profile module');
                            this.LOG.error(error);
                            reject(error);
                        });
                    } else {
                        this.LOG.debug('Tenant: ' + enterprise.tenant.code + ' is already being used with other enterprises as well');
                        resolve(success);
                    }
                }).catch(error => {
                    this.LOG.error('Failed to check if current tenant is associated with other active enterprises as well : ', error);
                    reject(error);
                });
            } else if (enterprise.active && enterprise.tenant.active) {
                SERVICE.DefaultEnterpriseHandlerService.buildEnterprise([enterprise]).then(success => {
                    this.LOG.debug('Enterprise: ' + enterprise.code + ' has been successfully activated within profile module');
                    event.event = 'addEnterprise';
                    this.LOG.debug('Pushing event for enterprise activation');
                    SERVICE.DefaultEventService.publish(event).then(success => {
                        this.LOG.debug('Event successfully posted');
                        resolve(success);
                    }).catch(error => {
                        this.LOG.error('While posting model change event : ', error);
                        reject(error);
                    });
                }).catch(error => {
                    this.LOG.error('Enterprise: ' + enterprise.code + ' can not be activated within profile module');
                    this.LOG.error(error);
                    reject(error);
                });
            } else {
                this.LOG.warn('For enterprise: ' + enterprise.code + ' no action required');
                resolve(true);
            }
        });
    }
};
