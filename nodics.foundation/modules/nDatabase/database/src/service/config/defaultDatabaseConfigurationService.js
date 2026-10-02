/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');
const util = require('util');
const crypto = require('node:crypto');

/**
 * @module database/service/config/DefaultDatabaseConfigurationService
 * @description Runtime registry for Nodics database configuration, tenant database
 * handles, raw schema contracts, schema interceptors, and schema validators.
 * This service is part of the schema-driven persistence layer and must remain
 * compatible with layered module overrides.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override this service to customize database
 * configuration resolution, connection registry behavior, or schema-level
 * interceptor/validator caching while preserving tenant and module isolation.
 *
 * @property {Object} rawSchema Effective merged raw schema registry.
 * @property {Object} dbs Tenant database connection registry grouped by module.
 * @property {Object} interceptors Cached schema interceptor configuration.
 * @property {Object} validators Cached tenant-aware schema validator configuration.
 * @property {Object} CONFIG.database Layered database configuration per tenant.
 * @property {Object} SERVICE.DefaultFilesLoaderService Loads schema model files.
 * @property {Object} SERVICE.DefaultInterceptorConfigurationService Builds schema interceptor chains.
 * @property {Object} SERVICE.DefaultValidatorConfigurationService Builds schema validator chains.
 */
module.exports = {
    rawSchema: {},
    dbs: {},
    interceptors: {},
    validators: {},

    /**
     * Initializes the database configuration registry.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves when initialization is complete.
     */
    init: function (options) {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },

    /**
     * Loads raw model definitions after framework services are available.
     *
     * @param {Object} options Startup options supplied by the module initializer.
     * @returns {Promise<boolean>} Resolves after raw model files are loaded.
     * @sideEffects Updates `NODICS` raw model registry from `/src/schemas/model.js` files.
     */
    postInit: function (options) {
        return new Promise((resolve, reject) => {
            this.LOG.debug('Collecting database middlewares');
            NODICS.setRawModels(SERVICE.DefaultFilesLoaderService.loadFiles('/src/schemas/model.js'));
            resolve(true);
        });
    },

    /**
     * Returns the effective raw schema registry.
     *
     * @returns {Object} Raw schema definitions grouped by module and schema code.
     */
    getRawSchema: function () {
        return this.rawSchema;
    },

    /**
     * Replaces the effective raw schema registry.
     *
     * @param {Object} rawSchema Raw schema definitions grouped by module and schema code.
     * @returns {undefined}
     * @sideEffects Mutates the service-level schema registry.
     */
    setRawSchema: function (rawSchema) {
        this.rawSchema = rawSchema;
    },

    /**
     * Finds active modules that have database configuration.
     *
     * @returns {string[]} Active module names with a database configuration block.
     */
    getDatabaseActiveModules: function () {
        let modules = NODICS.getModules();
        let dbModules = [];
        _.each(modules, (value, moduleName) => {
            if (CONFIG.get('database')[moduleName]) {
                dbModules.push(moduleName);
            }
        });
        return dbModules;
    },

    /**
     * Validates the module and tenant owning a database registry operation.
     *
     * @param {string} moduleName Active module name.
     * @param {string} tenant Active tenant code.
     * @returns {void}
     * @throws {CLASSES.NodicsError} When either scope is missing or inactive.
     */
    validateModuleTenant: function (moduleName, tenant) {
        if (!moduleName || !NODICS.isModuleActive(moduleName) || !NODICS.getModule(moduleName)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Invalid or inactive database module: ' + moduleName);
        }
        let activeTenants = NODICS.getActiveTenants();
        let defaultTenant = CONFIG.get('defaultTenant') || 'default';
        let isBootstrapDefaultTenant = activeTenants.length === 0 && tenant === defaultTenant;
        if (!tenant || (!isBootstrapDefaultTenant && !activeTenants.includes(tenant))) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Invalid or inactive database tenant: ' + tenant);
        }
    },

    /**
     * Validates one effective database adapter configuration before connection creation.
     *
     * @param {string} moduleName Active module name.
     * @param {string} tenant Active tenant code.
     * @param {Object} databaseConfiguration Tenant-effective database configuration.
     * @returns {Object} Validated adapter configuration.
     * @throws {CLASSES.NodicsError} When database type, handler, or master endpoint is missing.
     */
    validateDatabaseConfiguration: function (moduleName, tenant, databaseConfiguration) {
        if (!databaseConfiguration || !databaseConfiguration.options || !databaseConfiguration.options.databaseType) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'database.' + moduleName + '.options.databaseType is required for tenant: ' + tenant);
        }
        let databaseType = databaseConfiguration.options.databaseType;
        let adapter = databaseConfiguration[databaseType];
        if (!adapter || !adapter.options || !adapter.options.connectionHandler) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'database.' + moduleName + '.' + databaseType + '.options.connectionHandler is required for tenant: ' + tenant);
        }
        if (!adapter.master || !adapter.master.URI || !adapter.master.databaseName) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'database.' + moduleName + '.' + databaseType + '.master requires URI and databaseName for tenant: ' + tenant);
        }
        return adapter;
    },

    /**
     * Resolves the database connection configuration for a module and tenant.
     *
     * @param {string} moduleName Active module requesting a database connection.
     * @param {string} tenant Active tenant code.
     * @returns {Object} Database-type-specific connection configuration with merged options.
     * @throws {CLASSES.NodicsError} When the module, tenant, or database type configuration is invalid.
     */
    getDatabaseConfiguration: function (moduleName, tenant) {
        this.validateModuleTenant(moduleName, tenant);
        const connConfig = this.resolveTenantDatabaseConfiguration(moduleName, tenant);
        this.assertTenantDatabaseIsolation(moduleName, tenant, connConfig);
        this.assertTenantNamespaceBinding(tenant);
        return connConfig;
    },

    /**
     * Reads stable selected deployment/server identity, never a replica instance or process ID.
     * @returns {Object} Non-secret scopeKey and explicit deployment scope.
     */
    getTenantNamespaceBindingScope: function () {
        const projectCode = NODICS.getEnvironmentName?.();
        const environmentCode = NODICS.getSelectedEnvironmentName?.();
        const serverCode = NODICS.getServerName?.();
        if (![projectCode, environmentCode, serverCode].every(value => typeof value === 'string' &&
            /^[A-Za-z0-9._-]{1,128}$/.test(value))) {
            throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_BINDING', 'Stable deployment/server scope is required');
        }
        const scopeKey = 'deployment_' + crypto.createHash('sha256')
            .update(JSON.stringify([projectCode, environmentCode, serverCode])).digest('hex');
        return { scopeKey, scope: { projectCode, environmentCode, serverCode } };
    },

    /**
     * Builds the exact pure candidate BEFORE pin admission. Profile owns durable CAS persistence.
     * Uses only the current runtime's fully effective module configuration; no network or writes.
     * @param {string} tenantCode Tenant with prepared effective properties and DERIVED intent.
     * @returns {Object} Independent scopeKey/binding suitable for existing Tenant.properties.
     */
    buildTenantNamespaceBinding: function (tenantCode) {
        this.createTenantNamespaceIntent(tenantCode);
        if (!CONFIG.get('database', tenantCode)?.tenantNamespace) {
            throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_BINDING', 'Tenant namespace intent is required');
        }
        const { scopeKey, scope } = this.getTenantNamespaceBindingScope();
        const modules = {};
        const defaultTenant = CONFIG.get('defaultTenant') || 'default';
        for (const moduleName of [...new Set(['default', ...this.getDatabaseActiveModules()])].sort()) {
            const destination = this.resolveTenantDatabaseConfiguration(moduleName, tenantCode);
            this.assertTenantDatabaseIsolation(moduleName, tenantCode, destination);
            const base = this.resolveTenantDatabaseConfiguration(moduleName, defaultTenant);
            const baseConfig = CONFIG.get('database', defaultTenant);
            const targetConfig = CONFIG.get('database', tenantCode);
            const baseType = _.merge({}, baseConfig.default, baseConfig[moduleName] || {}).options.databaseType;
            const databaseType = _.merge({}, targetConfig.default, targetConfig[moduleName] || {}).options.databaseType;
            const channels = {};
            for (const channel of ['master', 'test']) {
                if (!destination[channel]) continue;
                if (!base[channel]) {
                    throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_BINDING', 'Channel has no qualified base identity');
                }
                channels[channel] = {
                    base: { databaseType: baseType, connectionHandler: base.options.connectionHandler,
                        databaseName: base[channel].databaseName,
                        endpointFingerprint: this.getTenantEndpointFingerprint(base.options.connectionHandler, base[channel]) },
                    destination: { databaseName: destination[channel].databaseName,
                        endpointFingerprint: this.getTenantEndpointFingerprint(destination.options.connectionHandler, destination[channel]) }
                };
            }
            modules[moduleName] = { databaseType, connectionHandler: destination.options.connectionHandler, channels };
        }
        const candidate = { scopeKey, binding: { version: 1, tenantCode, scope, modules } };
        this.validateTenantNamespaceBindingCandidate(candidate, { tenantCode, ...scope });
        return candidate;
    },

    /**
     * Requires the selected provider's pure, non-secret endpoint configuration fingerprint.
     * @param {string} handler Selected connection provider.
     * @param {Object} channel Effective channel configuration; never persisted directly.
     * @returns {string} Bounded SHA-256 fingerprint, not installed cluster proof.
     */
    getTenantEndpointFingerprint: function (handler, channel) {
        const provider = typeof SERVICE === 'undefined' ? undefined : SERVICE[handler];
        if (!provider || typeof provider.getTenantEndpointFingerprint !== 'function') {
            throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_BINDING', 'Provider has no qualified endpoint fingerprint');
        }
        let fingerprint;
        try { fingerprint = provider.getTenantEndpointFingerprint(channel); }
        catch (_) { throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_BINDING', 'Invalid endpoint configuration identity'); }
        if (typeof fingerprint !== 'string' || !/^[a-f0-9]{64}$/.test(fingerprint)) {
            throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_BINDING', 'Provider did not admit endpoint configuration identity');
        }
        return fingerprint;
    },

    /**
     * Validates bounded transport shape against fresh owner-derived scope, not caller authority.
     * Does not recompute another runtime's configuration or authorize first binding/persistence.
     * @param {Object} candidate Exact scopeKey/binding transport DTO.
     * @param {Object} expected Fresh owner-approved tenantCode/projectCode/environmentCode/serverCode.
     * @returns {boolean} Exactly true for a structurally admitted candidate.
     */
    validateTenantNamespaceBindingCandidate: function (candidate, expected) {
        const fail = () => { throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_BINDING', 'Invalid tenant namespace binding candidate'); };
        const exact = (value, keys) => value && Object.getPrototypeOf(value) === Object.prototype &&
            _.isEqual(Object.keys(value).sort(), [...keys].sort());
        const code = value => typeof value === 'string' && /^[A-Za-z0-9._-]{1,128}$/.test(value) &&
            !['__proto__', 'prototype', 'constructor'].includes(value);
        const name = value => typeof value === 'string' && value.length > 0 && Buffer.byteLength(value, 'utf8') <= 256 &&
            !/[\u0000-\u001f\u007f]/u.test(value);
        const fingerprint = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
        if (!expected || !code(expected.projectCode) || !code(expected.environmentCode) || !code(expected.serverCode) || !name(expected.tenantCode) ||
            !exact(candidate, ['scopeKey', 'binding'])) fail();
        const scope = { projectCode: expected.projectCode, environmentCode: expected.environmentCode, serverCode: expected.serverCode };
        const scopeKey = 'deployment_' + crypto.createHash('sha256')
            .update(JSON.stringify([scope.projectCode, scope.environmentCode, scope.serverCode])).digest('hex');
        const binding = candidate.binding;
        if (candidate.scopeKey !== scopeKey || !exact(binding, ['version', 'tenantCode', 'scope', 'modules']) ||
            binding.version !== 1 || binding.tenantCode !== expected.tenantCode ||
            !exact(binding.scope, ['projectCode', 'environmentCode', 'serverCode']) || !_.isEqual(binding.scope, scope) ||
            !binding.modules || Object.getPrototypeOf(binding.modules) !== Object.prototype) fail();
        const modules = Object.keys(binding.modules);
        if (!modules.includes('default') || modules.length > 256 || !modules.every(code)) fail();
        for (const moduleName of modules) {
            const module = binding.modules[moduleName];
            if (!exact(module, ['databaseType', 'connectionHandler', 'channels']) || !code(module.databaseType) ||
                !code(module.connectionHandler) || !module.channels || Object.getPrototypeOf(module.channels) !== Object.prototype) fail();
            const channels = Object.keys(module.channels);
            if (!channels.includes('master') || channels.some(channel => !['master', 'test'].includes(channel))) fail();
            for (const channel of channels) {
                const entry = module.channels[channel];
                if (!exact(entry, ['base', 'destination']) ||
                    !exact(entry.base, ['databaseType', 'connectionHandler', 'databaseName', 'endpointFingerprint']) ||
                    !exact(entry.destination, ['databaseName', 'endpointFingerprint']) ||
                    !code(entry.base.databaseType) || !code(entry.base.connectionHandler) ||
                    !name(entry.base.databaseName) || !name(entry.destination.databaseName) ||
                    !fingerprint(entry.base.endpointFingerprint) || !fingerprint(entry.destination.endpointFingerprint)) fail();
            }
        }
        if (Buffer.byteLength(JSON.stringify(candidate), 'utf8') > 262144) fail();
        return true;
    },

    /**
     * Admits DERIVED access only against a previously owner-persisted exact complete binding.
     * Missing pins never adopt configuration or connect storage. Legacy explicit tenants are unchanged.
     * @param {string} tenant Tenant code.
     * @returns {boolean} True for an exact binding or a non-DERIVED/default tenant.
     */
    assertTenantNamespaceBinding: function (tenant) {
        if (tenant === (CONFIG.get('defaultTenant') || 'default') ||
            CONFIG.get('database', tenant)?.tenantNamespace === undefined) return true;
        const candidate = this.buildTenantNamespaceBinding(tenant);
        const bindings = CONFIG.get('database', tenant)?.tenantNamespaceBindings;
        if (!bindings || Object.getPrototypeOf(bindings) !== Object.prototype ||
            !Object.hasOwn(bindings, candidate.scopeKey) || !_.isEqual(bindings[candidate.scopeKey], candidate.binding)) {
            throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_BINDING', 'Missing or mismatched durable tenant namespace binding');
        }
        return true;
    },

    /**
     * Creates non-secret intent for NEW provisioning, persisted in Tenant.properties.
     * @param {string} tenantCode Exact tenant code.
     * @returns {Object} Independent fragment, never a physical database override.
     */
    createTenantNamespaceIntent: function (tenantCode) {
        if (typeof tenantCode !== 'string' || !tenantCode || tenantCode.trim() !== tenantCode ||
            Buffer.byteLength(tenantCode, 'utf8') > 256 || /[\u0000-\u001f\u007f]/u.test(tenantCode) ||
            tenantCode === (CONFIG.get('defaultTenant') || 'default')) {
            throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_NAMESPACE', 'Invalid tenant namespace intent');
        }
        return { database: { tenantNamespace: { version: 1, mode: 'DERIVED', tenantCode } } };
    },

    /**
     * Resolves layered configuration without provider operations or recursive peer checks.
     * @param {string} moduleName Module code.
     * @param {string} tenant Tenant code.
     * @returns {Object} Independent resolved adapter configuration.
     */
    resolveTenantDatabaseConfiguration: function (moduleName, tenant) {
        let tenantConfig = CONFIG.get('database', tenant);
        if (!tenantConfig || !tenantConfig.default) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Tenant database configuration must define database.default for tenant: ' + tenant);
        }
        let dbConfig = _.merge({}, tenantConfig.default, tenantConfig[moduleName] || {});
        let connConfig = this.validateDatabaseConfiguration(moduleName, tenant, dbConfig);
        connConfig.options = _.merge({}, dbConfig.options, connConfig.options);
        const defaultTenant = CONFIG.get('defaultTenant') || 'default';
        if (tenant === defaultTenant) return connConfig;
        const intent = tenantConfig.tenantNamespace;
        if (intent !== undefined) {
            const expected = this.createTenantNamespaceIntent(tenant).database.tenantNamespace;
            if (!intent || Object.getPrototypeOf(intent) !== Object.prototype ||
                Object.keys(intent).length !== 3 || !_.isEqual(intent, expected)) {
                throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_NAMESPACE', 'Invalid tenant namespace intent');
            }
        }
        const baseConfig = CONFIG.get('database', defaultTenant);
        if (!baseConfig || !baseConfig.default) {
            throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_NAMESPACE', 'Missing base database namespace');
        }
        const base = _.merge({}, baseConfig.default, baseConfig[moduleName] || {});
        const baseAdapter = this.validateDatabaseConfiguration(moduleName, defaultTenant, base);
        const sameProvider = base.options.databaseType === dbConfig.options.databaseType;
        const provider = typeof SERVICE === 'undefined' ? undefined : SERVICE[connConfig.options.connectionHandler];
        if (!provider || typeof provider.validateTenantDatabaseName !== 'function') {
            throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_NAMESPACE', 'Provider has no tenant namespace contract');
        }
        for (const channel of ['master', 'test']) {
            if (!connConfig[channel]) continue;
            const configured = connConfig[channel].databaseName;
            if (intent && baseAdapter[channel] && configured === baseAdapter[channel].databaseName) {
                if (!sameProvider || typeof provider.deriveTenantDatabaseName !== 'function') {
                    throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_NAMESPACE', 'Provider has no qualified automatic tenant derivation');
                }
                connConfig[channel].databaseName = provider.deriveTenantDatabaseName(configured, tenant);
            }
            if (provider.validateTenantDatabaseName(connConfig[channel].databaseName) !== true) {
                throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_NAMESPACE', 'Provider did not admit tenant database namespace');
            }
        }
        return connConfig;
    },

    /**
     * Rejects aliases and registered-handle relocation before connection/model/Init work.
     * Comparison is deliberately endpoint-independent and case-insensitive.
     * @param {string} moduleName Module code.
     * @param {string} tenant Tenant code.
     * @param {Object} connection Resolved adapter.
     * @returns {boolean} True when isolated against configured active peers.
     */
    assertTenantDatabaseIsolation: function (moduleName, tenant, connection) {
        const defaultTenant = CONFIG.get('defaultTenant') || 'default';
        if (tenant === defaultTenant) return true;
        const modules = [...new Set(['default', ...this.getDatabaseActiveModules()])];
        const tenants = [...new Set([defaultTenant, ...NODICS.getActiveTenants()])];
        for (const peer of tenants) {
            if (peer === tenant) continue;
            for (const module of modules) {
                const other = this.resolveTenantDatabaseConfiguration(module, peer);
                for (const channel of ['master', 'test']) {
                    if (!connection[channel]) continue;
                    if (['master', 'test'].some(otherChannel => other[otherChannel] &&
                        other[otherChannel].databaseName.toLowerCase() === connection[channel].databaseName.toLowerCase())) {
                        throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_NAMESPACE', 'Tenant database namespace aliases another tenant');
                    }
                }
            }
        }
        if (connection.test && connection.master.databaseName.toLowerCase() === connection.test.databaseName.toLowerCase()) {
            throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_NAMESPACE', 'Tenant database channels alias');
        }
        const held = this.dbs[moduleName]?.[tenant];
        for (const channel of ['master', 'test']) {
            const original = held?.[channel]?.getConnection?.()?.databaseName;
            if (original && original !== connection[channel]?.databaseName) {
                throw new CLASSES.NodicsError('ERR_DATABASE_TENANT_NAMESPACE', 'Established tenant namespace cannot be relocated');
            }
        }
        return true;
    },

    /**
     * Registers a tenant database handle for a module.
     *
     * @param {string} moduleName Active module name.
     * @param {string} tenant Active tenant code.
     * @param {Object} database Database handle or connection wrapper.
     * @returns {undefined}
     * @sideEffects Mutates the in-memory `dbs` registry.
     * @throws {CLASSES.NodicsError} When module or tenant input is invalid.
     */
    addTenantDatabase: function (moduleName, tenant, database) {
        this.validateModuleTenant(moduleName, tenant);
        if (!database || typeof database !== 'object') {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Tenant database handle is required for module: ' + moduleName + ', tenant: ' + tenant);
        }
        if (!this.dbs[moduleName]) this.dbs[moduleName] = {};
        this.dbs[moduleName][tenant] = database;
    },

    /**
     * Reads a tenant database handle from the module registry.
     *
     * @param {string} moduleName Active module name. Falls back to `default` registry when unavailable.
     * @param {string} tenant Active tenant code.
     * @returns {Object|undefined} Database handle for the tenant.
     * @throws {CLASSES.NodicsError} When module or tenant input is invalid.
     */
    getTenantDatabase: function (moduleName, tenant) {
        this.validateModuleTenant(moduleName, tenant);
        if (tenant !== (CONFIG.get('defaultTenant') || 'default')) {
            this.getDatabaseConfiguration(moduleName, tenant);
        }
        let database = this.dbs[moduleName] || (moduleName !== 'default' ? this.dbs.default : undefined);
        return database ? database[tenant] : undefined;
    },

    /**
     * Checks acquired required handles with fresh scope/isolation admission. The whole-runtime
     * durable binding is checked once per tenant per synchronous observation, not once per
     * module. No evidence survives this call; ordinary reads retain their existing guards.
     * @returns {boolean} False for invalid configuration, missing pins or missing master handles.
     * @override Preserve current binding/isolation checks; never open connections from a probe.
     */
    areRequiredConnectionsReady: function () {
        const modules = this.getDatabaseActiveModules();
        const tenants = NODICS.getActiveTenants();
        const requiredTenants = tenants.length ? tenants : [CONFIG.get('defaultTenant') || 'default'];
        try {
            const origins = this.xNodics && this.xNodics.memberOrigins;
            const readinessOrigin = origins && origins.areRequiredConnectionsReady;
            const legacyAdmissionCustomized = ['getTenantDatabase', 'getDatabaseConfiguration'].some(name =>
                this[name] !== module.exports[name] ||
                (origins && origins[name] && readinessOrigin &&
                    origins[name].contributionIndex > readinessOrigin.contributionIndex));
            // Startup composition preserves function identity. Generated/rebound/custom legacy
            // admissions conservatively keep their getter path, never the direct handle path.
            if (legacyAdmissionCustomized) {
                return modules.every(moduleName => requiredTenants.every(tenant => {
                    const handle = this.getTenantDatabase(moduleName, tenant);
                    return !!(handle && handle.master && handle.master.getConnection && handle.master.getConnection());
                }));
            }
            return requiredTenants.every(tenant => {
                this.assertTenantNamespaceBinding(tenant);
                return modules.every(moduleName => {
                    this.validateModuleTenant(moduleName, tenant);
                    if (tenant !== (CONFIG.get('defaultTenant') || 'default')) {
                        const configuration = this.resolveTenantDatabaseConfiguration(moduleName, tenant);
                        this.assertTenantDatabaseIsolation(moduleName, tenant, configuration);
                    }
                    const database = this.dbs[moduleName] || (moduleName !== 'default' ? this.dbs.default : undefined);
                    const handle = database && database[tenant];
                    return !!(handle && handle.master && handle.master.getConnection && handle.master.getConnection());
                });
            });
        } catch (error) {
            return false;
        }
    },

    /**
     * Enumerates acquired registry scopes for internal cleanup, including inactive tenants/modules.
     * Never resolves configuration, connects a provider, or grants a write admission.
     * @returns {Object[]} Independent exact moduleName/tenant pairs, without handles.
     */
    getRetainedDatabaseScopesForCleanup: function () {
        return Object.keys(this.dbs).flatMap(moduleName =>
            Object.keys(this.dbs[moduleName] || {}).map(tenant => ({ moduleName, tenant })));
    },

    /**
     * Reads ONLY an exact owned retained handle for internal closure, without active/config admission.
     * No module fallback or connection creation is permitted; ordinary readers use getTenantDatabase.
     * @param {string} moduleName Exact retained registry module.
     * @param {string} tenant Exact retained registry tenant.
     * @returns {Object|undefined} Owned retained master/test wrapper.
     */
    getRetainedTenantDatabaseForCleanup: function (moduleName, tenant) {
        if (typeof moduleName !== 'string' || typeof tenant !== 'string' ||
            !Object.hasOwn(this.dbs, moduleName) || !Object.hasOwn(this.dbs[moduleName] || {}, tenant)) return undefined;
        return this.dbs[moduleName][tenant];
    },

    /**
     * Removes a tenant database handle from the module registry.
     *
     * @param {string} moduleName Active module name.
     * @param {string} tenant Active tenant code.
     * @returns {boolean} Always returns true after attempting removal.
     * @sideEffects Deletes an in-memory database handle.
     * @throws {CLASSES.NodicsError} When module or tenant input is invalid.
     */
    removeTenantDatabase: function (moduleName, tenant) {
        this.validateModuleTenant(moduleName, tenant);
        if (this.dbs[moduleName] && this.dbs[moduleName][tenant]) {
            delete this.dbs[moduleName][tenant];
        }
        return true;
    },

    /**
     * Converts a value into the configured database object id type when required.
     *
     * @param {Object} schemaModel Schema model containing database options.
     * @param {*} value Raw identifier or already converted object id.
     * @returns {*} Converted object id when the model handler supports conversion.
     */
    toObjectId: function (schemaModel, value) {
        let modelHandlerName = schemaModel.dataBase.getOptions().modelHandler;
        if (UTILS.isObject(value)) {
            return value;
        } else if (!UTILS.isObjectId(value) && SERVICE[modelHandlerName] && SERVICE[modelHandlerName].toObjectId) {
            return SERVICE[modelHandlerName].toObjectId(value);
        } else {
            return value;
        }
    },

    /**
     * Replaces the cached schema interceptor registry.
     *
     * @param {Object} interceptors Interceptor registry keyed by schema name.
     * @returns {undefined}
     */
    setSchemaInterceptors: function (interceptors) {
        this.interceptors = interceptors;
    },

    /**
     * Returns schema interceptors, building the cache on first access.
     *
     * @param {string} schemaName Schema code.
     * @returns {Object} Prepared schema interceptor configuration.
     */
    getSchemaInterceptors: function (schemaName) {
        if (!this.interceptors[schemaName]) {
            this.interceptors[schemaName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(schemaName, ENUMS.InterceptorType.schema.key);
        }
        return this.interceptors[schemaName];
    },

    /**
     * Refreshes cached schema interceptor definitions.
     *
     * @param {string[]} schemaNames Schema names to refresh, or `default` to refresh all cached schemas.
     * @returns {undefined}
     * @sideEffects Rebuilds entries in the interceptor cache.
     */
    refreshSchemaInterceptors: function (schemaNames) {
        if (this.interceptors && !UTILS.isBlank(this.interceptors) && schemaNames && schemaNames.length > 0) {
            schemaNames.forEach(schemaName => {
                if (!schemaName || schemaName === 'default') {
                    let tmpInterceptors = {};
                    Object.keys(this.interceptors).forEach(schemaName => {
                        tmpInterceptors[schemaName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(schemaName, ENUMS.InterceptorType.schema.key);
                    });
                    this.interceptors = tmpInterceptors;
                } else if (this.interceptors[schemaName]) {
                    this.interceptors[schemaName] = SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(schemaName, ENUMS.InterceptorType.schema.key);
                }
            });
        }
    },

    /**
     * Handles schema interceptor update events.
     *
     * @param {Object} request Nodics event request.
     * @param {Object} request.event Event payload.
     * @param {string[]} request.event.data Schema names affected by the update.
     * @param {Function} callback Node-style callback.
     * @returns {undefined}
     */
    handleSchemaInterceptorUpdated: function (request, callback) {
        try {
            this.refreshSchemaInterceptors(request.event.data);
            callback(null, { code: 'SUC_EVNT_00000' });
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    },

    /**
     * Replaces the cached schema validator registry.
     *
     * @param {Object} validators Validator registry keyed by tenant and schema name.
     * @returns {undefined}
     */
    setSchemaValidators: function (validators) {
        this.validators = validators;
    },

    /**
     * Returns schema validators for a tenant and schema, building the cache on first access.
     *
     * @param {string} tenant Active tenant code.
     * @param {string} schemaName Schema code.
     * @returns {Object} Prepared validator configuration.
     */
    getSchemaValidators: function (tenant, schemaName) {
        if (!this.validators[tenant] || !this.validators[tenant][schemaName]) {
            if (!this.validators[tenant]) this.validators[tenant] = {};
            this.validators[tenant][schemaName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, schemaName, ENUMS.InterceptorType.schema.key);
        }
        return this.validators[tenant][schemaName];
    },

    /**
     * Refreshes cached schema validator definitions for a tenant.
     *
     * @param {string} tenant Active tenant code.
     * @param {string[]} schemaNames Schema names to refresh, or `default` to refresh all cached schemas.
     * @returns {undefined}
     * @sideEffects Rebuilds entries in the tenant validator cache.
     */
    refreshSchemaValidators: function (tenant, schemaNames) {
        if (this.validators[tenant] && !UTILS.isBlank(this.validators[tenant]) && schemaNames && schemaNames.length > 0) {
            schemaNames.forEach(schemaName => {
                if (!schemaName || schemaName === 'default') {
                    let tenantValidators = {};
                    Object.keys(this.validators[tenant]).forEach(schemaName => {
                        tenantValidators[schemaName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, schemaName, ENUMS.InterceptorType.schema.key);
                    });
                    this.validators[tenant] = tenantValidators;
                } else if (this.validators[tenant][schemaName]) {
                    this.validators[tenant][schemaName] = SERVICE.DefaultValidatorConfigurationService.prepareItemValidators(tenant, schemaName, ENUMS.InterceptorType.schema.key);
                }
            });
        }
    },

    /**
     * Handles schema validator update events.
     *
     * @param {Object} request Nodics event request.
     * @param {string} request.tenant Active tenant code.
     * @param {Object} request.event Event payload.
     * @param {string[]} request.event.data Schema names affected by the update.
     * @param {Function} callback Node-style callback.
     * @returns {undefined}
     */
    handleSchemaValidatorUpdated: function (request, callback) {
        try {
            this.refreshSchemaValidators(request.tenant, request.event.data);
            callback(null, { code: 'SUC_EVNT_00000' });
        } catch (error) {
            callback(new CLASSES.NodicsError(error, null, 'ERR_EVNT_00000'));
        }
    },
};
