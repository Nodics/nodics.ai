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
    fetchEnterprise: async function () {
        let stage = 'ISSUE_RUNTIME_CREDENTIAL';
        try {
            const defaultTenant = CONFIG.get('defaultTenant') || 'default';
            const issued = await SERVICE.DefaultInternalAuthenticationProviderService.fetchInternalAuthToken(defaultTenant);
            if (typeof issued?.authToken !== 'string' || !issued.authToken) throw new Error();
            const selected = CONFIG.get('profileTenantProvisioning')?.enabled === true;
            let legacyRequest;
            if (!selected) {
                stage = 'VERIFY_RUNTIME_CREDENTIAL';
                const verified = await SERVICE.DefaultAuthorizationProviderService.authorizeToken({ authToken: issued.authToken });
                if (!/^SUC_/.test(verified?.code || '') || !verified.result || verified.result.tenant !== defaultTenant) throw new Error();
                legacyRequest = { tenant: defaultTenant, entCode: verified.result.entCode, authData: verified.result };
            }
            const invocation = {
                moduleName: CONFIG.get('profileModuleName') || 'profile',
                serviceName: selected ? 'DefaultEnterpriseTenantProvisioningService' : 'DefaultEnterpriseService',
                operationName: selected ? 'inventoryWithProof' : 'getRuntimeEnterprise',
                apiName: selected ? '/internal/tenants/bootstrap' : '/enterprise/get', methodName: 'GET', tenant: defaultTenant,
                authToken: issued.authToken, requestBody: {}, responseType: true, maxAttempts: 1,
                header: selected ? undefined : { 'x-enterprise-code': legacyRequest.entCode },
                request: selected ? { tenant: defaultTenant, headers: { Authorization: 'Bearer ' + issued.authToken }, body: {} } : legacyRequest,
                secureTransport: selected ? { required: true, allowInsecureLoopback: CONFIG.get('profileTenantProvisioning')?.allowInsecureLoopback === true } : undefined,
                followRedirects: selected ? false : undefined,
            };
            stage = 'ENTER_PRIVATE_CONTEXT';
            const logger = SERVICE.DefaultLoggerService;
            if (typeof logger?.runSensitiveOperation !== 'function') throw new Error();
            const response = await logger.runSensitiveOperation(invocation, () => {
                stage = 'INVOKE_ENTERPRISE_INVENTORY';
                return SERVICE.DefaultModuleService.invokeModule(invocation);
            });
            stage = 'VALIDATE_ENTERPRISE_INVENTORY';
            if (!/^SUC_/.test(response?.code || '') || response.success === false ||
                !Array.isArray(response.result) || !response.result.length || response.result.length > 256) throw new Error();
            return response.result;
        } catch {
            // Static stage names only: upstream errors can contain credentials or private data.
            try { this.LOG?.error?.('Tenant startup held at ' + stage); } catch {}
            throw new CLASSES.NodicsError('ERR_TNT_PROVISIONING_HELD');
        }
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
     * Provisional tenant addressability is not readiness. Failed preparation is
     * retryable through the same owners without deleting persisted tenant data.
     * @param {Object[]} enterprises Enterprise records to prepare.
     * @returns {Promise<boolean>} Completed preparation.
     */
    buildEnterprise: async function (enterprises) {
        if (!this._tenantPreparations) this._tenantPreparations = new Map();
        for (const enterprise of enterprises || []) {
            if (!enterprise.active) NODICS.removeActiveEnterprise(enterprise.code);
            if (!enterprise.active || !enterprise.tenant || !enterprise.tenant.active) continue;
            const tenant = enterprise.tenant.code;
            if (this._tenantPreparations.has(tenant)) {
                await this._tenantPreparations.get(tenant);
            } else if (!NODICS.getActiveTenants().includes(tenant)) {
                const preparation = this.prepareEnterpriseTenant(enterprise);
                this._tenantPreparations.set(tenant, preparation);
                try { await preparation; }
                finally { this._tenantPreparations.delete(tenant); }
            }
            NODICS.addActiveEnterprise(enterprise.code, tenant);
        }
        return true;
    },

    /**
     * Prepares one tenant through canonical owners; rolls back only provisional
     * runtime activation on failure, retaining persisted data for owner recovery.
     * @param {Object} enterprise Active enterprise with its resolved tenant.
     * @returns {Promise<boolean>} Resolves after identity and internal token preparation.
     */
    prepareEnterpriseTenant: async function (enterprise) {
        const tenant = enterprise.tenant.code;
        const defaultTenant = CONFIG.get('defaultTenant') || 'default';
        const subjectProvisioning = tenant !== defaultTenant && CONFIG.get('profileTenantProvisioning')?.enabled === true;
        try {
            let tenantRecord = enterprise.tenant;
            if (tenant !== (CONFIG.get('defaultTenant') || 'default') &&
                NODICS.isModuleActive(CONFIG.get('profileModuleName') || 'profile')) {
                if (typeof SERVICE.DefaultEnterpriseTenantProvisioningService?.prepare !== 'function') {
                    throw new CLASSES.NodicsError('ERR_TNT_PROVISIONING_HELD');
                }
                tenantRecord = await SERVICE.DefaultEnterpriseTenantProvisioningService.prepare(enterprise);
            }
            // Generated models/search require tenant addressability during preparation.
            NODICS.addActiveTenant(tenant);
            CONFIG.setProperties(_.merge({}, CONFIG.getProperties(), tenantRecord.properties), tenant);
            if (subjectProvisioning && CONFIG.get('database', tenant)?.tenantNamespace === undefined) {
                throw new CLASSES.NodicsError('ERR_TNT_PROVISIONING_HELD');
            }
            if (CONFIG.get('database', tenant)?.tenantNamespace !== undefined) {
                tenantRecord = await this.pinTenantNamespace(tenant);
                CONFIG.setProperties(_.merge({}, CONFIG.getProperties(), tenantRecord.properties), tenant);
                SERVICE.DefaultDatabaseConfigurationService.assertTenantNamespaceBinding(tenant);
            }
            if (tenant !== (CONFIG.get('defaultTenant') || 'default')) {
                const owner = SERVICE.DefaultDatabaseConfigurationService;
                // Resolve every effective namespace before opening the first provider.
                for (const module of new Set(['default', ...owner.getDatabaseActiveModules()])) {
                    owner.getDatabaseConfiguration(module, tenant);
                }
            }
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
            // Namespace admission used default proof; operational issuance must
            // now authenticate the real target principal and target grant.
            const issued = await SERVICE.DefaultInternalAuthenticationProviderService.fetchInternalAuthToken(tenant);
            if (typeof issued?.authToken !== 'string' || !issued.authToken) {
                throw new CLASSES.NodicsError('ERR_TNT_PROVISIONING_HELD');
            }
            NODICS.addInternalAuthToken(tenant, issued.authToken);
        } catch (error) {
            NODICS.removeActiveTenant(tenant);
            throw error;
        }
        return true;
    },

    /** Reports completed canonical runtime preparation without exposing or relabelling credentials. @param {Object} enterprise Current authorized Enterprise record. @returns {boolean} False for provisional, mismatched or unbound subjects. */
    isEnterpriseRuntimeReady: function (enterprise) {
        const tenant = typeof enterprise?.tenant === 'object' ? enterprise.tenant.code : enterprise?.tenant;
        if (!enterprise?.code || !tenant || enterprise.active === false || enterprise.tenant?.active === false ||
            !NODICS.getActiveTenants().includes(tenant) || this._tenantPreparations?.has(tenant) ||
            NODICS.getTenantForEnterprise?.(enterprise.code) !== tenant) return false;
        const defaultTenant = CONFIG.get('defaultTenant') || 'default';
        const subjectProvisioning = tenant !== defaultTenant && CONFIG.get('profileTenantProvisioning')?.enabled === true;
        if (!NODICS.getInternalAuthTokens?.()[tenant]) return false;
        if (subjectProvisioning) {
            try {
                if (CONFIG.get('database', tenant)?.tenantNamespace === undefined ||
                    typeof SERVICE.DefaultDatabaseConfigurationService?.assertTenantNamespaceBinding !== 'function') return false;
                SERVICE.DefaultDatabaseConfigurationService.assertTenantNamespaceBinding(tenant);
            } catch { return false; }
        }
        return true;
    },

    /** Exchanges a pure database-owner candidate using the existing default-tenant runtime proof before any target provider opens. */
    pinTenantNamespace: async function (tenant) {
        try {
            const defaultTenant = CONFIG.get('defaultTenant') || 'default';
            const issued = await SERVICE.DefaultInternalAuthenticationProviderService.fetchInternalAuthToken(defaultTenant);
            if (typeof issued?.authToken !== 'string' || !issued.authToken) throw new Error();
            const candidate = SERVICE.DefaultDatabaseConfigurationService.buildTenantNamespaceBinding(tenant);
            const invocation = {
                moduleName: CONFIG.get('profileModuleName') || 'profile',
                serviceName: 'DefaultEnterpriseTenantProvisioningService', operationName: 'bindWithProof',
                apiName: '/internal/tenants/' + encodeURIComponent(tenant) + '/namespace-bindings', methodName: 'POST',
                tenant: defaultTenant, authToken: issued.authToken,
                request: { tenant: defaultTenant, headers: { Authorization: 'Bearer ' + issued.authToken },
                    params: { tenantCode: tenant }, body: candidate },
                requestBody: candidate, responseType: true, maxAttempts: 1,
                secureTransport: { required: true, allowInsecureLoopback: CONFIG.get('profileTenantProvisioning')?.allowInsecureLoopback === true },
                followRedirects: false,
            };
            const logger = SERVICE.DefaultLoggerService;
            if (typeof logger?.runSensitiveOperation !== 'function') throw new Error();
            const response = await logger.runSensitiveOperation(invocation, () => SERVICE.DefaultModuleService.invokeModule(invocation));
            const record = response?.result || response;
            if (!record || record.code !== tenant || record.active !== true ||
                !_.isEqual(record.properties?.database?.tenantNamespaceBindings?.[candidate.scopeKey], candidate.binding)) throw new Error();
            return record;
        } catch { throw new CLASSES.NodicsError('ERR_TNT_PROVISIONING_HELD'); }
    }
};
