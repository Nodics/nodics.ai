/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module nService/service/module/DefaultModuleRegistrationAgentService
 * @description Registers locally served modules with BackOffice asynchronously after traffic startup and renews their observed leases.
 * @layer service
 * @owner nService
 * @override Projects may replace identity, capability, or registration policy while preserving non-blocking startup and service-token boundaries.
 */
module.exports = {
    _timer: null,
    _running: false,
    _registered: [],
    _backofficeCapabilityProviders: new Map(),
    _metrics: { attempts: 0, successes: 0, failures: 0, deregistrations: 0, lastSuccessAt: null, lastFailureAt: null },

    /** Registers this agent with the central runtime lifecycle. */
    init: function () {
        if (SERVICE.DefaultRuntimeLifecycleService) {
            SERVICE.DefaultRuntimeLifecycleService.registerContributor('moduleRegistrationAgent', {
                order: 700,
                ready: () => { this.start(); return true; },
                drain: () => this.stop(true),
                shutdown: () => this.stop(false)
            });
        }
        return Promise.resolve(true);
    },

    /** Completes the standard service post-initialization contract. */
    postInit: function () { return Promise.resolve(true); },
    /** Returns effective registration and heartbeat policy. */
    getConfiguration: function () {
        let config = CONFIG.get('backofficeRegistration');
        if (!config) throw new Error('BackOffice registration configuration is missing');
        if (config.enabled !== false && (!config.moduleName ||
            !Number.isSafeInteger(config.heartbeatIntervalMs) ||
            !Number.isSafeInteger(config.retryIntervalMs) ||
            !Number.isSafeInteger(config.maxModulesPerRegistration))) {
            throw new Error('BackOffice registration configuration is incomplete');
        }
        return config;
    },

    /** Starts asynchronous registration and lease renewal without blocking readiness. */
    start: function () {
        let config = this.getConfiguration();
        if (config.enabled === false || this._timer) return false;
        let schedule = () => this.runRegistration().then(success => {
            let delay = Number(success ? config.heartbeatIntervalMs : config.retryIntervalMs);
            this._timer = setTimeout(schedule, delay);
            if (this._timer.unref) this._timer.unref();
        }).catch(() => {
            this._timer = setTimeout(schedule, Number(config.retryIntervalMs));
            if (this._timer.unref) this._timer.unref();
        });
        this._timer = setTimeout(schedule, 0);
        if (this._timer.unref) this._timer.unref();
        return true;
    },

    /** Returns active local modules, excluding remote-only dependencies using the router's effective topology. */
    getLocalModules: function () {
        return (NODICS.getActiveModules() || []).filter(moduleName =>
            SERVICE.DefaultRouterService.getModuleServerConfig(moduleName).getOptions().remoteOnly !== true);
    },

    /** Registers one concrete module-owned BackOffice capability provider for this runtime instance. */
    registerBackofficeCapabilityProvider: function (moduleName, provider) {
        if (!/^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(moduleName || '') || !provider ||
            typeof provider.getCapability !== 'function') {
            throw new Error('BackOffice capability provider contract is invalid');
        }
        if (this._backofficeCapabilityProviders.has(moduleName) &&
            this._backofficeCapabilityProviders.get(moduleName) !== provider) {
            throw new Error('Duplicate BackOffice capability provider for module ' + moduleName);
        }
        this._backofficeCapabilityProviders.set(moduleName, provider);
        return true;
    },

    /** Resolves module-owned capability metadata, retaining configuration only as a disable switch. */
    getBackofficeCapability: function (moduleName, context) {
        let legacy = (CONFIG.get('backofficeCapabilities') || {})[moduleName];
        if (legacy && legacy.enabled === false) return undefined;
        let provider = this._backofficeCapabilityProviders.get(moduleName);
        let capability = provider && provider.getCapability(context || {});
        if (capability && typeof capability.then === 'function') {
            throw new Error('BackOffice capability providers must return synchronously during registration');
        }
        if (!capability || capability.enabled === false) return undefined;
        return JSON.parse(JSON.stringify(capability));
    },

    /** Builds a process-unique instance identity from selected runtime coordinates. */
    getInstanceId: function () {
        return [NODICS.getSelectedEnvironmentName(), NODICS.getServerName(), NODICS.getNodeName() || 'default', process.pid].join(':');
    },

    /** Returns a bounded authority context for a schema/service claim. */
    getAuthorityContext: function (moduleName, schemaName, schema) {
        let configured = CONFIG.get('runtimeAuthorityContexts') || {};
        let schemas = configured.schemas || {};
        let modules = configured.modules || {};
        return String(schema.authorityContext || schema.runtimeAuthority ||
            schemas[moduleName + '.' + schemaName] || modules[moduleName] || (moduleName + '.' + schemaName));
    },

    /** Builds registry authority claims from the local module's materialized schemas. */
    buildAuthorityClaims: function (moduleName, rawModule) {
        let rawSchema = rawModule.rawSchema || {};
        let claims = [];
        Object.keys(rawSchema).sort().forEach(schemaName => {
            let schema = rawSchema[schemaName];
            if (!schema || typeof schema !== 'object') return;
            let authorityContext = this.getAuthorityContext(moduleName, schemaName, schema);
            if (schema.model === true) {
                claims.push({
                    kind: 'schema',
                    moduleName: moduleName,
                    claimName: schemaName,
                    authorityContext: authorityContext
                });
            }
            if (schema.service && schema.service.enabled === true) {
                claims.push({
                    kind: 'service',
                    moduleName: moduleName,
                    claimName: schemaName,
                    authorityContext: authorityContext
                });
            }
        });
        return claims;
    },

    /** Returns module-owned activation data packages declared in this module's data manifest. */
    buildActivationDataPackages: function (moduleName, rawModule) {
        if (!rawModule || !rawModule.path) return [];
        let fs = require('fs');
        let path = require('path');
        let manifestPath = path.join(rawModule.path, 'data', 'manifest.json');
        if (!fs.existsSync(manifestPath)) return [];
        let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        let sections = manifest && manifest.sections || {};
        return Object.keys(sections).sort().map(sectionCode => {
            let section = sections[sectionCode] || {};
            if (section.kind !== 'DATA_RELEASE') return undefined;
            let dataType = String(section.dataType || this.inferActivationDataType(section, sectionCode));
            let isActivationRequired = dataType !== 'sample' &&
                section.initialPublicationPolicy !== 'ADMIN_INITIATED';
            let pack = {
                code: String((manifest.module || moduleName) + ':' + sectionCode),
                classification: String(dataType === 'sample' ? 'sample' : section.lifecycle || dataType || 'core').toLowerCase(),
                owner: String(moduleName),
                required: isActivationRequired,
                trigger: isActivationRequired ? 'ACTIVATION' : 'USER',
                targetModule: String(moduleName),
                operation: 'IMPORT',
                dataType: dataType
            };
            let targetServer = typeof NODICS !== 'undefined' && NODICS.getServerName ? String(NODICS.getServerName() || '') : '';
            if (targetServer) pack.targetServer = targetServer;
            return pack;
        }).filter(Boolean);
    },

    /** Infers a release type for activation package descriptors from manifest metadata. */
    inferActivationDataType: function (section, sectionCode) {
        let sourceRoot = String(section.sourceRoot || sectionCode || '').toLowerCase();
        let code = String(sectionCode || '').toLowerCase();
        if (sourceRoot.startsWith('sample') || code.includes('sample')) return 'sample';
        if (sourceRoot.startsWith('init') || code.includes('init')) return 'init';
        return 'core';
    },

    /** Builds a bounded module registration payload from authoritative runtime metadata. */
    buildRegistration: function (moduleName) {
        let rawModule = NODICS.getRawModule(moduleName) || {};
        let metadata = rawModule.metaData || {};
        let nodicsMetadata = metadata.nodics || {};
        let runtime = nodicsMetadata.runtime || {};
        let config = this.getConfiguration();
        let registration = {
            moduleName: moduleName,
            displayName: nodicsMetadata.displayName || moduleName,
            parentModule: rawModule.parent || undefined,
            canonicalIdentity: rawModule.canonicalIdentity || moduleName,
            instanceId: this.getInstanceId(),
            version: metadata.version || 'unknown',
            moduleIndex: metadata.index || undefined,
            moduleKind: nodicsMetadata.kind || 'unknown',
            capabilities: (nodicsMetadata.owns || []).slice(),
            clientCallable: runtime.router === true,
            runtime: {
                router: runtime.router === true,
                publish: runtime.publish === true,
                web: runtime.web === true
            },
            healthPath: config.healthPath,
            leaseTtlMs: config.leaseTtlMs,
            authorityClaims: this.buildAuthorityClaims(moduleName, rawModule),
            activationDataPackages: this.buildActivationDataPackages(moduleName, rawModule)
        };
        if (nodicsMetadata.functionalModule) {
            registration.functionalModule = JSON.parse(JSON.stringify(nodicsMetadata.functionalModule));
        }
        let backoffice = this.getBackofficeCapability(moduleName, {
            moduleName: moduleName,
            rawModule: rawModule,
            runtime: runtime
        });
        if (backoffice) registration.backoffice = backoffice;
        if (registration.clientCallable) {
            registration.endpoint = SERVICE.DefaultRouterService.prepareUrl({
                moduleName: metadata.prefix || moduleName
            });
        }
        return registration;
    },

    /** Resolves the tenant-scoped internal service authorization header. */
    getAuthorizationHeader: function () {
        let tenant = CONFIG.get('defaultTenant');
        if (!tenant) throw new Error('Default tenant configuration is missing');
        let token = NODICS.getInternalAuthToken(tenant);
        return token ? { Authorization: 'Bearer ' + token } : null;
    },

    /** Registers or renews all locally served module leases in one bounded cycle. */
    runRegistration: async function () {
        if (this._running) return false;
        this._running = true;
        this._metrics.attempts++;
        try {
            let header = this.getAuthorizationHeader();
            if (!header) throw new Error('Internal service token is not available');
            let config = this.getConfiguration();
            let modules = this.getLocalModules();
            if (modules.length > Number(config.maxModulesPerRegistration)) throw new Error('Active module registration limit exceeded');
            await SERVICE.DefaultModuleService.fetch(SERVICE.DefaultModuleService.buildRequest({
                moduleName: config.moduleName,
                connectionName: config.connectionName,
                apiName: '/registry/instances',
                methodName: 'PUT',
                header: Object.assign({ 'Idempotency-Key': this.getInstanceId() }, header),
                requestBody: {
                    instanceId: this.getInstanceId(),
                    project: NODICS.getEnvironmentName(),
                    environment: NODICS.getSelectedEnvironmentName(),
                    server: NODICS.getServerName(),
                    node: NODICS.getNodeName() || null,
                    runtimeRole: CONFIG.get('runtimeRole'),
                    registrations: modules.map(moduleName => this.buildRegistration(moduleName))
                },
                timeoutMs: config.requestTimeoutMs
            }));
            this._registered = modules;
            this._metrics.successes++;
            this._metrics.lastSuccessAt = new Date().toISOString();
            return true;
        } catch (error) {
            this._metrics.failures++;
            this._metrics.lastFailureAt = new Date().toISOString();
            this._metrics.lastFailureCode = error.code || error.name || 'REGISTRATION_FAILED';
            this.LOG.warn('BackOffice registration is unavailable; runtime traffic remains enabled', {
                server: NODICS.getServerName(), code: this._metrics.lastFailureCode,
                reason: String(error.message || 'Registration request failed').slice(0, 256)
            });
            return false;
        } finally {
            this._running = false;
        }
    },

    /** Attempts idempotent removal of locally registered leases during drain. */
    deregister: async function () {
        let header = this.getAuthorizationHeader();
        if (!header || this._registered.length === 0) return false;
        let config = this.getConfiguration();
        try {
            await SERVICE.DefaultModuleService.fetch(SERVICE.DefaultModuleService.buildRequest({
                moduleName: config.moduleName,
                apiName: '/registry/instances/' + encodeURIComponent(this.getInstanceId()),
                methodName: 'DELETE',
                header: Object.assign({ 'Idempotency-Key': this.getInstanceId() + ':delete' }, header),
                requestBody: {},
                timeoutMs: config.requestTimeoutMs
            }));
            this._metrics.deregistrations++;
            return true;
        } catch (error) {
            return false;
        }
    },

    /** Stops heartbeat scheduling and optionally deregisters observed instances. */
    stop: async function (deregister) {
        if (this._timer) clearInterval(this._timer);
        this._timer = null;
        if (deregister) await this.deregister();
        return true;
    },

    /** Returns sanitized registration attempt and outcome counters. */
    getDiagnostics: function () { return Object.assign({}, this._metrics, { registeredModuleCount: this._registered.length }); }
};
