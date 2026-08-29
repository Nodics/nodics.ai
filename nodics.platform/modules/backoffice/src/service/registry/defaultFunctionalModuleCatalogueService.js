/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/service/registry/DefaultFunctionalModuleCatalogueService
 * @description Persists project-scoped functional-module registration state and reconciles it with observed runtime batches without treating project modules as functional modules.
 * @layer service
 * @owner backoffice
 * @override Projects may replace catalogue policy while preserving canonical functional identity, durable registration, protected-module rules, revision semantics, and observed-versus-desired state separation.
 */
module.exports = {
    /** Initializes the functional-module catalogue service. */
    init: function () { return Promise.resolve(true); },
    /** Completes functional-module catalogue initialization. */
    postInit: function () { return Promise.resolve(true); },
    /** Resolves the tenant without accepting a client-supplied cross-tenant override. */
    getTenant: function (request) { return request && request.tenant || CONFIG.get('defaultTenant') || 'default'; },
    /** Returns governed system authentication for private catalogue persistence. */
    getPersistenceAuthData: function (authData) {
        let identity = SERVICE.DefaultIdentityGovernanceService;
        return identity && typeof identity.getSystemAuthData === 'function' ? identity.getSystemAuthData() : authData;
    },
    /** Returns the effective catalogue model generated from the BackOffice schema. */
    getModel: function (tenant) {
        let models = NODICS.getModels('backoffice', tenant);
        let model = models && models.BackofficeFunctionalModuleRegistrationModel;
        if (!model) throw new Error('Functional-module catalogue model is unavailable');
        return model;
    },
    /** Returns the durable activation receipt model generated from the BackOffice schema. */
    getReceiptModel: function (tenant) {
        let models = NODICS.getModels('backoffice', tenant);
        let model = models && models.BackofficeFunctionalModuleActivationReceiptModel;
        if (!model) throw new Error('Functional-module activation receipt model is unavailable');
        return model;
    },
    /** Executes a private schema query through the standard model pipeline. */
    getRecords: function (request) {
        request = Object.assign({}, request, { moduleName: 'backoffice' });
        request.schemaModel = this.getModel(request.tenant);
        return SERVICE.DefaultPipelineService.start('modelsGetInitializerPipeline', request, {});
    },
    /** Executes a private activation receipt query through the standard model pipeline. */
    getReceiptRecords: function (request) {
        request = Object.assign({}, request, { moduleName: 'backoffice' });
        request.schemaModel = this.getReceiptModel(request.tenant);
        return SERVICE.DefaultPipelineService.start('modelsGetInitializerPipeline', request, {});
    },
    /** Creates one private schema record through the standard model pipeline. */
    saveRecord: function (request) {
        request = Object.assign({}, request, { moduleName: 'backoffice' });
        request.schemaModel = this.getModel(request.tenant);
        return SERVICE.DefaultPipelineService.start('modelSaveInitializerPipeline', request, {});
    },
    /** Updates one private schema record through the standard model pipeline. */
    updateRecord: function (request) {
        request = Object.assign({}, request, { moduleName: 'backoffice' });
        request.schemaModel = this.getModel(request.tenant);
        return SERVICE.DefaultPipelineService.start('modelsUpdateInitializerPipeline', request, {});
    },
    /** Creates one durable activation receipt through the standard model pipeline. */
    saveReceiptRecord: function (request) {
        request = Object.assign({}, request, { moduleName: 'backoffice' });
        request.schemaModel = this.getReceiptModel(request.tenant);
        return SERVICE.DefaultPipelineService.start('modelSaveInitializerPipeline', request, {});
    },
    /** Updates one durable activation receipt through the standard model pipeline. */
    updateReceiptRecord: function (request) {
        request = Object.assign({}, request, { moduleName: 'backoffice' });
        request.schemaModel = this.getReceiptModel(request.tenant);
        return SERVICE.DefaultPipelineService.start('modelsUpdateInitializerPipeline', request, {});
    },
    /** Extracts result arrays from model pipeline response envelopes. */
    getItems: function (response) { return response && Array.isArray(response.result) ? response.result : []; },
    /** Extracts affected row counts from supported database response envelopes. */
    getAffectedCount: function (response) {
        let result = response && response.result !== undefined ? response.result : response;
        if (!result) return 0;
        if (typeof result.modifiedCount === 'number') return result.modifiedCount;
        if (typeof result.nModified === 'number') return result.nModified;
        if (typeof result.n === 'number') return result.n;
        if (result.result) return this.getAffectedCount(result.result);
        return 0;
    },
    /** Creates the stable project-scoped functional registration key. */
    getCode: function (project, functionalModule) { return String(project) + '::' + this.normalizeFunctionalModule(functionalModule); },
    /** Resolves deprecated functional identities to their canonical framework identity. */
    normalizeFunctionalModule: function (functionalModule) {
        let identity = String(functionalModule || '');
        let aliases = CONFIG.get('moduleIdentityAliases') || {};
        return String(aliases[identity] || identity);
    },
    /** Returns deprecated identities that resolve to one canonical functional identity. */
    getLegacyFunctionalModules: function (functionalModule) {
        let canonical = this.normalizeFunctionalModule(functionalModule);
        let aliases = CONFIG.get('moduleIdentityAliases') || {};
        return Object.keys(aliases).filter(identity => String(aliases[identity]) === canonical);
    },
    /** Returns stable sorted unique string values. */
    uniqueSorted: function (values) { return Array.from(new Set((values || []).map(String))).sort(); },
    /** Returns module activation-data configuration contributed through normal configuration layering. */
    getActivationDataConfiguration: function () { return CONFIG.get('backofficeFunctionalModuleActivationData') || {}; },
    /** Returns configured package descriptors for one functional module. */
    getActivationDataPackages: function (functionalModule) {
        let modules = this.getActivationDataConfiguration().modules || {};
        return [].concat((modules[this.normalizeFunctionalModule(functionalModule)] || {}).dataPackages || []).map(item => ({
            code: String(item.code || ''),
            classification: String(item.classification || item.kind || 'core'),
            owner: String(item.owner || functionalModule),
            required: item.required !== false,
            trigger: String(item.trigger || (item.required === false ? 'USER' : 'ACTIVATION')),
            targetModule: String(item.targetModule || ''),
            targetServer: String(item.targetServer || ''),
            targetDatabase: String(item.targetDatabase || ''),
            operation: String(item.operation || 'IMPORT'),
            dataType: String(item.dataType || this.inferActivationDataType(item))
        })).filter(item => item.code);
    },
    /** Returns existing functional-module activation prerequisites. */
    getActivationDependencies: function (functionalModule) {
        let modules = this.getActivationDataConfiguration().modules || {};
        return this.uniqueSorted([].concat((modules[this.normalizeFunctionalModule(functionalModule)] || {}).dependencies || [])
            .map(item => this.normalizeFunctionalModule(item)).filter(Boolean));
    },
    /** Infers the existing nImport release type from activation package metadata. */
    inferActivationDataType: function (item) {
        let operation = String(item.operation || '').toUpperCase();
        let classification = String(item.classification || item.kind || '').toLowerCase();
        if (operation.includes('SAMPLE') || classification.includes('sample')) return 'sample';
        if (operation.includes('INIT') || classification.includes('init')) return 'init';
        return 'core';
    },
    /** Creates the stable project-scoped activation receipt key. */
    getReceiptKey: function (project, functionalModule, packageCode) {
        return [String(project), this.normalizeFunctionalModule(functionalModule), String(packageCode)].join('::');
    },
    /** Loads durable receipt records for one project/module identity. */
    getActivationReceipts: async function (project, functionalModule, request) {
        let tenant = this.getTenant(request);
        let response = await this.getReceiptRecords({ tenant: tenant,
            authData: this.getPersistenceAuthData(request && request.authData),
            query: { projectCode: String(project), functionalModule: this.normalizeFunctionalModule(functionalModule) },
            searchOptions: { limit: 256, sort: { packageCode: 1 } } });
        return this.getItems(response);
    },
    /** Loads durable receipts as a map by package code. */
    getActivationReceiptMap: async function (project, functionalModule, request) {
        let records = await this.getActivationReceipts(project, functionalModule, request).catch(() => []);
        return Object.fromEntries(records.map(record => [record.packageCode, record]));
    },
    /** Upserts one durable activation receipt without exposing nImport internals to Axis. */
    upsertActivationReceipt: async function (record, pack, status, context, details) {
        details = details || {};
        let tenant = this.getTenant(context && context.request);
        let authData = this.getPersistenceAuthData(context && context.request && context.request.authData);
        let now = new Date();
        let receiptKey = this.getReceiptKey(record.projectCode, record.functionalModule, pack.code);
        let existing = await this.getReceiptRecords({ tenant: tenant, authData: authData, query: { code: receiptKey },
            searchOptions: { limit: 1 } }).then(response => this.getItems(response)[0]).catch(() => undefined);
        let model = {
            code: receiptKey, active: true, projectCode: record.projectCode,
            functionalModule: this.normalizeFunctionalModule(record.functionalModule), packageCode: pack.code,
            classification: pack.classification, owner: pack.owner, required: pack.required === true, trigger: pack.trigger,
            targetModule: pack.targetModule, targetServer: pack.targetServer, targetDatabase: pack.targetDatabase,
            operation: pack.operation, dataType: pack.dataType, status: status, executionMode: details.executionMode || 'NIMPORT_RELEASE',
            message: String(details.message || ''), importRunId: details.importRunId, releaseStatus: details.releaseStatus,
            revision: Number(existing && existing.revision || 0) + 1, lastAttemptAt: now, updatedAt: now,
            updatedBy: context && context.actor || 'activation-data-service', correlationId: context && context.correlationId
        };
        if (existing) return this.updateReceiptRecord({ tenant: tenant, authData: authData, query: { code: receiptKey }, model: model }).then(() => Object.assign({}, existing, model));
        return this.saveReceiptRecord({ tenant: tenant, authData: authData, model: model }).then(() => model);
    },
    /** Resolves current state for functional-module activation prerequisites. */
    getFunctionalDependencyStates: async function (record, request) {
        let dependencies = this.getActivationDependencies(record.functionalModule);
        let states = [];
        for (let dependency of dependencies) {
            let dependencyRecord = await this.getRecord(record.projectCode, dependency, request).catch(() => undefined);
            states.push({
                functionalModule: dependency,
                displayName: dependencyRecord && dependencyRecord.displayName || dependency,
                registrationState: dependencyRecord && dependencyRecord.registrationState || 'UNAVAILABLE',
                enabled: dependencyRecord && dependencyRecord.enabled === true,
                runtimeState: dependencyRecord && dependencyRecord.runtimeState || 'OFFLINE',
                satisfied: dependencyRecord && dependencyRecord.registrationState === 'REGISTERED' &&
                    dependencyRecord.enabled === true && dependencyRecord.runtimeState === 'ACTIVE'
            });
        }
        return states;
    },
    /** Blocks activation when declared functional-module prerequisites are not active. */
    assertFunctionalDependenciesSatisfied: async function (record, request) {
        let states = await this.getFunctionalDependencyStates(record, request);
        let missing = states.filter(item => item.satisfied !== true);
        if (missing.length) {
            throw new CLASSES.NodicsError('ERR_BOF_00000',
                'Functional module activation is blocked until required modules are active: ' +
                missing.map(item => item.displayName || item.functionalModule).join(', '));
        }
        return true;
    },
    /** Builds the client-safe activation-data plan and receipt projection for the current lifecycle action. */
    buildActivationDataPlan: function (record, action, context) {
        context = context || {};
        let packages = this.getActivationDataPackages(record.functionalModule);
        let receiptMap = context.receiptMap || {};
        let dependencyStates = [].concat(context.dependencyStates || []);
        let dependencies = this.getActivationDependencies(record.functionalModule);
        let missingDependencies = dependencyStates.filter(item => item.satisfied !== true).map(item => item.functionalModule);
        let dryRun = context && context.dryRun === true;
        let blockedReasons = [];
        if (['activate', 'dryRun'].includes(action) && record.registrationState !== 'REGISTERED') blockedReasons.push('MODULE_NOT_REGISTERED');
        if (['activate', 'dryRun'].includes(action) && record.runtimeState !== 'ACTIVE') blockedReasons.push('RUNTIME_NOT_ACTIVE');
        if (['activate', 'dryRun'].includes(action)) missingDependencies.forEach(item => blockedReasons.push('MISSING_DEPENDENCY:' + item));
        let receipts = packages.map(item => {
            let persisted = receiptMap[item.code];
            let status = persisted && persisted.status || 'NOT_APPLICABLE';
            let message = persisted && persisted.message;
            if (!persisted) {
                if (action === 'activate' || action === 'dryRun') {
                    if (item.required && item.trigger === 'ACTIVATION') {
                        status = dryRun ? 'PLANNED' : 'PENDING_IMPORT';
                    } else if (!item.required || item.trigger === 'USER') {
                        status = 'SKIPPED_USER_TRIGGERED';
                    }
                } else if (action === 'deactivate' || action === 'deregister' || action === 'rollback') {
                    status = 'DATA_LEFT_INTACT';
                }
            }
            return Object.assign({}, item, {
                receiptKey: this.getReceiptKey(record.projectCode, record.functionalModule, item.code),
                status: status, idempotent: true,
                executionMode: persisted && persisted.executionMode || (item.required && item.trigger === 'ACTIVATION' ? 'NIMPORT_RELEASE' : 'USER_TRIGGERED'),
                releaseStatus: persisted && persisted.releaseStatus, importRunId: persisted && persisted.importRunId,
                lastAttemptAt: persisted && persisted.lastAttemptAt, revision: persisted && persisted.revision,
                message: message || (status === 'PENDING_IMPORT'
                    ? 'Required package will be imported through the existing nImport data-release executor during activation.'
                    : status === 'PLANNED'
                        ? 'Dry-run preview only; no data will be changed.'
                        : status === 'SKIPPED_USER_TRIGGERED'
                            ? 'Optional/sample package must be triggered explicitly by the user.'
                            : status === 'DATA_LEFT_INTACT'
                                ? 'Capability rollback or deactivation hides capabilities; imported data is left intact.'
                                : 'No data mutation is required for this lifecycle action.')
            });
        });
        let failed = receipts.some(item => item.required && item.status === 'FAILED');
        let running = receipts.some(item => item.required && ['QUEUED', 'RUNNING', 'PENDING_IMPORT'].includes(item.status));
        let requiredPending = receipts.some(item => item.required && item.status === 'PENDING_IMPORT');
        return {
            action: action, dryRun: dryRun, executionMode: receipts.some(item => item.executionMode === 'NIMPORT_RELEASE') ? 'NIMPORT_RELEASE' : 'USER_TRIGGERED',
            readiness: blockedReasons.length ? 'BLOCKED' : failed ? 'DATA_FAILED' : running || requiredPending ? 'DATA_RUNNING' : 'READY',
            preflight: { runtimeActive: record.runtimeState === 'ACTIVE', registered: record.registrationState === 'REGISTERED',
                protectedModule: record.required === true, dependencies: dependencies, dependencyStates: dependencyStates,
                missingDependencies: missingDependencies, blockedReasons: blockedReasons },
            packages: packages, receipts: receipts,
            nextActions: [].concat(failed ? ['RETRY_REQUIRED_DATA_IMPORT'] : [],
                receipts.some(item => item.status === 'SKIPPED_USER_TRIGGERED') ? ['OPTIONAL_SAMPLE_DATA_USER_ACTION'] : [],
                ['BROWSER_JOURNEY_VALIDATION'])
        };
    },
    /** Returns whether two string lists represent the same governed value. */
    sameList: function (left, right) { return JSON.stringify(this.uniqueSorted(left)) === JSON.stringify(this.uniqueSorted(right)); },
    /** Resolves the nearest functional root for one observed runtime module. */
    resolveFunctionalRoot: function (registration, registrationsByName) {
        let current = registration;
        let visited = new Set();
        while (current && !visited.has(current.moduleName)) {
            visited.add(current.moduleName);
            if (current.functionalModule) return current;
            current = current.parentModule && registrationsByName.get(current.parentModule);
        }
        return undefined;
    },
    /** Builds one functional-module observation from an authoritative runtime registration batch. */
    buildObservations: function (batch) {
        let registrations = batch.registrations || [];
        let registrationsByName = new Map(registrations.map(item => [item.moduleName, item]));
        let roots = registrations.filter(item => item.functionalModule);
        return roots.map(root => {
            let identity = this.normalizeFunctionalModule(root.functionalModule.identity);
            let technicalModules = registrations.filter(item => item.moduleName !== root.moduleName &&
                this.resolveFunctionalRoot(item, registrationsByName) === root).map(item => item.moduleName);
            return {
                projectCode: batch.project,
                functionalModule: identity,
                displayName: root.functionalModule.displayName,
                registeredVersion: root.version || 'unknown',
                moduleIndex: root.moduleIndex,
                required: root.functionalModule.protected === true,
                technicalModules: this.uniqueSorted(technicalModules),
                observedServer: [batch.environment, batch.server, batch.node || 'default'].join(':')
            };
        });
    },
    /** Maps every runtime module in a batch to its declared functional root identity. */
    buildLeaseFunctionalModuleIndex: function (batch) {
        let registrations = batch.registrations || [];
        let registrationsByName = new Map(registrations.map(item => [item.moduleName, item]));
        let index = {};
        registrations.forEach(registration => {
            let root = this.resolveFunctionalRoot(registration, registrationsByName);
            if (root && root.functionalModule && root.functionalModule.identity) {
                index[registration.moduleName] = this.normalizeFunctionalModule(root.functionalModule.identity);
            }
        });
        return index;
    },
    /** Loads one durable functional-module record. */
    getRecordForExactIdentity: async function (project, functionalModule, request) {
        let tenant = this.getTenant(request);
        let response = await this.getRecords({ tenant: tenant,
            authData: this.getPersistenceAuthData(request && request.authData),
            query: { code: String(project) + '::' + String(functionalModule) }, searchOptions: { limit: 1 } });
        return this.getItems(response)[0];
    },
    /** Loads one durable functional-module record, including a deprecated identity during upgrade. */
    getRecord: async function (project, functionalModule, request) {
        let canonical = this.normalizeFunctionalModule(functionalModule);
        let identities = [canonical].concat(this.getLegacyFunctionalModules(canonical));
        for (let identity of identities) {
            let record = await this.getRecordForExactIdentity(project, identity, request);
            if (record) return record;
        }
        return undefined;
    },
    /** Retires duplicate deprecated catalogue rows when the canonical record already exists. */
    retireDuplicateLegacyRecords: async function (project, functionalModule, request, canonicalRecord) {
        if (!canonicalRecord || canonicalRecord.code !== this.getCode(project, functionalModule)) return 0;
        let tenant = this.getTenant(request);
        let authData = this.getPersistenceAuthData(request && request.authData);
        let retired = 0;
        for (let identity of this.getLegacyFunctionalModules(functionalModule)) {
            let legacy = await this.getRecordForExactIdentity(project, identity, { tenant: tenant, authData: authData });
            if (!legacy || legacy.code === canonicalRecord.code ||
                (legacy.registrationState === 'DEREGISTERED' && legacy.functionalModule === functionalModule)) continue;
            await this.updateRecord({ tenant: tenant, authData: authData, query: { code: legacy.code }, model: {
                functionalModule: this.normalizeFunctionalModule(functionalModule), registrationState: 'DEREGISTERED',
                enabled: false, runtimeState: 'OFFLINE', observedServers: [],
                catalogueRevision: Number(legacy.catalogueRevision || 1) + 1,
                updatedAt: new Date(), updatedBy: 'functional-identity-migrator'
            } });
            retired++;
        }
        return retired;
    },
    /** Reconciles one observed functional module without recreating durable registration on restart. */
    reconcileObservation: async function (observation, request) {
        let tenant = this.getTenant(request);
        let authData = this.getPersistenceAuthData(request && request.authData);
        let existing = await this.getRecord(observation.projectCode, observation.functionalModule, { tenant: tenant, authData: authData });
        observation = Object.assign({}, observation, {
            functionalModule: this.normalizeFunctionalModule(observation.functionalModule)
        });
        let now = new Date();
        if (!existing) {
            let registrationState = observation.required ? 'REGISTERED' : 'AVAILABLE';
            let model = Object.assign({
                code: this.getCode(observation.projectCode, observation.functionalModule), active: true,
                registrationState: registrationState, enabled: observation.required, runtimeState: 'ACTIVE',
                observedServers: [observation.observedServer], catalogueRevision: 1,
                registeredAt: now, registeredBy: 'runtime-reconciler', updatedAt: now,
                updatedBy: 'runtime-reconciler', lastObservedAt: now
            }, observation);
            await this.saveRecord({ tenant: tenant, authData: authData, model: model });
            return model;
        }
        await this.retireDuplicateLegacyRecords(observation.projectCode, observation.functionalModule,
            { tenant: tenant, authData: authData }, existing);
        let observedServers = this.uniqueSorted((existing.observedServers || []).concat([observation.observedServer]));
        let desiredRegistrationState = observation.required ? 'REGISTERED' :
            existing.registrationState === 'DEREGISTERED' ? 'AVAILABLE' : existing.registrationState;
        let desiredEnabled = observation.required ? true : existing.enabled === true;
        let canonicalCode = this.getCode(observation.projectCode, observation.functionalModule);
        let changed = existing.code !== canonicalCode || existing.functionalModule !== observation.functionalModule ||
            existing.registrationState !== desiredRegistrationState || existing.enabled !== desiredEnabled ||
            existing.runtimeState !== 'ACTIVE' || existing.registeredVersion !== observation.registeredVersion ||
            existing.displayName !== observation.displayName || existing.moduleIndex !== observation.moduleIndex ||
            existing.required !== observation.required ||
            !this.sameList(existing.technicalModules, observation.technicalModules) ||
            !this.sameList(existing.observedServers, observedServers);
        let model = {
            code: canonicalCode, functionalModule: observation.functionalModule,
            registrationState: desiredRegistrationState, enabled: desiredEnabled, runtimeState: 'ACTIVE',
            displayName: observation.displayName, registeredVersion: observation.registeredVersion,
            moduleIndex: observation.moduleIndex,
            required: observation.required, technicalModules: observation.technicalModules,
            observedServers: observedServers, catalogueRevision: Number(existing.catalogueRevision || 1) + (changed ? 1 : 0),
            updatedAt: changed ? now : existing.updatedAt, updatedBy: changed ? 'runtime-reconciler' : existing.updatedBy,
            lastObservedAt: now
        };
        await this.updateRecord({ tenant: tenant, authData: authData, query: { code: existing.code }, model: model });
        return Object.assign({}, existing, model);
    },
    /** Reconciles every explicitly declared functional root in one runtime batch. */
    reconcileRuntimeBatch: async function (batch, authData) {
        if (!batch.project) throw new Error('Runtime registration batch is missing project identity');
        let observations = this.buildObservations(batch);
        let records = [];
        for (let observation of observations) {
            records.push(await this.reconcileObservation(observation, { authData: authData }));
        }
        return records;
    },
    /** Reconciles durable runtime state and current servers from active capability leases. */
    reconcileActiveRuntimeLeases: async function (activeLeases, affectedProjects, request) {
        activeLeases = activeLeases || [];
        let projects = new Set((affectedProjects || []).filter(Boolean).map(String));
        activeLeases.forEach(lease => { if (lease.projectCode) projects.add(String(lease.projectCode)); });
        let tenant = this.getTenant(request);
        let authData = this.getPersistenceAuthData(request && request.authData);
        let changed = 0;
        for (let project of projects) {
            let response = await this.getRecords({ tenant: tenant, authData: authData, query: { projectCode: project },
                searchOptions: { limit: 256, sort: { functionalModule: 1 } } });
            for (let record of this.getItems(response)) {
                let matching = activeLeases.filter(lease => lease.projectCode === project &&
                    lease.functionalModuleIdentity === record.functionalModule);
                let observedServers = this.uniqueSorted(matching.map(lease =>
                    [lease.environment, lease.server, lease.node || 'default'].join(':')));
                let runtimeState = matching.length > 0 ? 'ACTIVE' : 'OFFLINE';
                if (record.runtimeState === runtimeState && this.sameList(record.observedServers, observedServers)) continue;
                let model = { runtimeState: runtimeState, observedServers: observedServers,
                    catalogueRevision: Number(record.catalogueRevision || 1) + 1,
                    updatedAt: new Date(), updatedBy: 'runtime-lease-reconciler' };
                await this.updateRecord({ tenant: tenant, authData: authData, query: { code: record.code }, model: model });
                changed++;
            }
        }
        return changed;
    },
    /** Returns a client-safe functional-module registration projection. */
    projectClientSafe: function (record, options) {
        options = options || {};
        return {
            project: record.projectCode,
            functionalModule: this.normalizeFunctionalModule(record.functionalModule),
            displayName: record.displayName,
            registeredVersion: record.registeredVersion,
            moduleIndex: record.moduleIndex,
            registrationState: record.registrationState,
            enabled: record.enabled === true,
            required: record.required === true,
            runtimeState: record.runtimeState,
            technicalModules: this.uniqueSorted(record.technicalModules),
            observedServers: this.uniqueSorted(record.observedServers),
            catalogueRevision: Number(record.catalogueRevision || 1),
            registeredAt: record.registeredAt,
            lastObservedAt: record.lastObservedAt,
            activationData: this.buildActivationDataPlan(record, options.action || 'status', options)
        };
    },
    /** Returns a client-safe projection enriched with durable activation receipt history. */
    projectClientSafeWithReceipts: async function (record, options, request) {
        let receiptMap = await this.getActivationReceiptMap(record.projectCode, record.functionalModule, request);
        let dependencyStates = await this.getFunctionalDependencyStates(record, request);
        return this.projectClientSafe(record, Object.assign({}, options, {
            receiptMap: receiptMap, dependencyStates: dependencyStates
        }));
    },
    /** Returns normalized HTTP or internal query parameters. */
    getQuery: function (request) { return request && (request.query || request.httpRequest && request.httpRequest.query) || {}; },
    /** Returns the normalized HTTP or internal request body. */
    getBody: function (request) { return request && (request.body || request.httpRequest && request.httpRequest.body) || {}; },
    /** Lists durable functional-module records in one governed state for the authenticated project. */
    listByState: async function (request, registrationState, code) {
        let project = request && request.project || this.getQuery(request).project;
        if (!project) throw new CLASSES.NodicsError('ERR_BOF_00000', 'Functional-module project is required');
        let tenant = this.getTenant(request);
        let response = await this.getRecords({ tenant: tenant, authData: this.getPersistenceAuthData(request.authData),
            query: { projectCode: project, registrationState: registrationState }, searchOptions: { limit: 256, sort: { functionalModule: 1 } } });
        let items = [];
        for (let item of this.getItems(response)) {
            items.push(await this.projectClientSafeWithReceipts(item, {}, request));
        }
        return { code: code, data: { project: project, items: items } };
    },
    /** Lists optional observed functional modules awaiting project registration. */
    listAvailable: function (request) { return this.listByState(request, 'AVAILABLE', 'SUC_BOF_00017'); },
    /** Lists durable project functional-module registrations. */
    listRegistrations: function (request) { return this.listByState(request, 'REGISTERED', 'SUC_BOF_00018'); },
    /** Returns governed technical-module presentation eligibility for one project. */
    getPresentationEligibility: async function (request) {
        let query = this.getQuery(request);
        let project = request && request.project || query.project ||
            (typeof NODICS !== 'undefined' && NODICS.getEnvironmentName && NODICS.getEnvironmentName());
        if (!project) throw new CLASSES.NodicsError('ERR_BOF_00000', 'Functional-module project is required');
        let tenant = this.getTenant(request);
        let response = await this.getRecords({ tenant: tenant,
            authData: this.getPersistenceAuthData(request && request.authData), query: { projectCode: project },
            searchOptions: { limit: 256, sort: { functionalModule: 1 } } });
        let governed = new Set();
        let eligible = new Set();
        this.getItems(response).forEach(record => {
            let modules = [record.functionalModule].concat(record.technicalModules || []).filter(Boolean);
            modules.forEach(moduleName => governed.add(moduleName));
            if (record.runtimeState === 'ACTIVE' && record.registrationState === 'REGISTERED' && record.enabled === true) {
                modules.forEach(moduleName => eligible.add(moduleName));
            }
        });
        return { project: project, governedModules: Array.from(governed).sort(), eligibleModules: Array.from(eligible).sort() };
    },
    /** Returns one durable functional-module registration for the authenticated project. */
    detail: async function (request) {
        let params = request.params || request.httpRequest && request.httpRequest.params || {};
        let project = request.project || this.getQuery(request).project;
        let record = await this.getRecord(project, params.functionalModule, request);
        if (!record || record.registrationState === 'DEREGISTERED') throw new CLASSES.NodicsError('ERR_BOF_00000', 'Functional-module registration not found');
        return { code: 'SUC_BOF_00019', data: await this.projectClientSafeWithReceipts(record, {}, request) };
    },
    /** Resolves and validates a human administrative lifecycle request. */
    getLifecycleContext: function (request) {
        let body = this.getBody(request);
        let params = request && (request.params || request.httpRequest && request.httpRequest.params) || {};
        let authData = request && request.authData || {};
        let actor = String(authData.principalId || authData.loginId || authData.code || '');
        if (!actor || authData.tokenType === 'service') throw new CLASSES.NodicsError('ERR_AUTH_00003', 'A human employee principal is required');
        if (!body.project || !params.functionalModule || !Number.isInteger(Number(body.expectedRevision)) || Number(body.expectedRevision) < 1 ||
            !body.reason || String(body.reason).length > 512) {
            throw new CLASSES.NodicsError('ERR_BOF_00000', 'Invalid functional-module lifecycle request');
        }
        return { project: String(body.project), functionalModule: String(params.functionalModule),
            expectedRevision: Number(body.expectedRevision), reason: String(body.reason), actor: actor,
            dryRun: body.dryRun === true, includeActivationData: body.includeActivationData !== false,
            correlationId: String(body.correlationId || Date.now() + '-' + Math.random().toString(36).slice(2)) };
    },
    /** Applies one optimistic durable lifecycle transition without changing runtime composition. */
    transition: async function (request, action) {
        let context = this.getLifecycleContext(request);
        let existing = await this.getRecord(context.project, context.functionalModule, request);
        if (!existing) throw new CLASSES.NodicsError('ERR_BOF_00000', 'Functional module is not available');
        if (Number(existing.catalogueRevision) !== context.expectedRevision) {
            throw new CLASSES.NodicsError('ERR_BOF_00000', 'Functional-module catalogue revision conflict');
        }
        if (context.dryRun === true) {
            return { code: 'SUC_BOF_00020', data: await this.projectClientSafeWithReceipts(existing, {
                action: 'dryRun', dryRun: true
            }, request) };
        }
        if (existing.required === true && ['deactivate', 'deregister', 'rollback'].includes(action)) {
            throw new CLASSES.NodicsError('ERR_BOF_00000', 'Required functional module cannot be ' + action + 'd');
        }
        let next = {};
        if (action === 'register') {
            if (!['AVAILABLE', 'DEREGISTERED'].includes(existing.registrationState)) {
                throw new CLASSES.NodicsError('ERR_BOF_00000', 'Functional module is already registered');
            }
            next = { registrationState: 'REGISTERED', enabled: false };
        } else if (action === 'activate') {
            if (existing.registrationState !== 'REGISTERED') throw new CLASSES.NodicsError('ERR_BOF_00000', 'Functional module must be registered before activation');
            if (existing.runtimeState !== 'ACTIVE') throw new CLASSES.NodicsError('ERR_BOF_00000', 'Functional module has no active compatible runtime');
            await this.assertFunctionalDependenciesSatisfied(existing, request);
            next = { enabled: true };
        } else if (action === 'deactivate') {
            if (existing.registrationState !== 'REGISTERED') throw new CLASSES.NodicsError('ERR_BOF_00000', 'Functional module is not registered');
            next = { enabled: false };
        } else if (action === 'deregister') {
            next = { registrationState: existing.runtimeState === 'ACTIVE' ? 'AVAILABLE' : 'DEREGISTERED', enabled: false };
        } else if (action === 'rollback') {
            if (existing.registrationState !== 'REGISTERED') throw new CLASSES.NodicsError('ERR_BOF_00000', 'Functional module must be registered before rollback');
            if (existing.enabled !== true) throw new CLASSES.NodicsError('ERR_BOF_00000', 'Functional module activation is not active');
            next = { enabled: false };
        } else {
            throw new Error('Unsupported functional-module lifecycle action');
        }
        if (action === 'activate') await this.executeRequiredActivationData(existing, context, request);
        if (['deactivate', 'deregister', 'rollback'].includes(action)) await this.recordDataLeftIntact(existing, context, request);
        let model = Object.assign({}, next, { catalogueRevision: context.expectedRevision + 1,
            updatedAt: new Date(), updatedBy: context.actor });
        let response = await this.updateRecord({ tenant: this.getTenant(request), authData: this.getPersistenceAuthData(request.authData),
            query: { code: existing.code, catalogueRevision: context.expectedRevision }, model: model });
        if (this.getAffectedCount(response) !== 1) throw new CLASSES.NodicsError('ERR_BOF_00000', 'Functional-module catalogue revision conflict');
        let result = Object.assign({}, existing, model);
        if (SERVICE.DefaultBackofficeAuditService) await SERVICE.DefaultBackofficeAuditService.record({
            eventType: 'backoffice.functional-module.' + action, outcome: 'completed', project: context.project,
            moduleName: context.functionalModule, principalId: context.actor, revision: model.catalogueRevision,
            reason: context.reason
        });
        return { code: 'SUC_BOF_00020', data: await this.projectClientSafeWithReceipts(result, { action: action }, request) };
    },
    /** Executes required activation data packages through the existing nImport data-release executor. */
    executeRequiredActivationData: async function (record, context, request) {
        let packages = this.getActivationDataPackages(record.functionalModule)
            .filter(pack => pack.required === true && pack.trigger === 'ACTIVATION');
        if (!packages.length) return true;
        let grouped = packages.reduce((result, pack) => {
            let key = [pack.dataType, pack.targetServer || '', pack.targetModule || ''].join('::');
            result[key] = result[key] || { dataType: pack.dataType, packs: [] };
            result[key].packs.push(pack);
            return result;
        }, {});
        for (let groupKey of Object.keys(grouped)) {
            let dataType = grouped[groupKey].dataType;
            let packs = grouped[groupKey].packs;
            await Promise.all(packs.map(pack => this.upsertActivationReceipt(record, pack, 'RUNNING', Object.assign({}, context, { request: request }), {
                message: 'Required activation data import is running through nImport.', releaseStatus: 'RUNNING'
            })));
            try {
                let releaseRequest = { dataType: dataType, releaseCodes: packs.map(pack => pack.code) };
                let preflight = await this.runActivationDataReleaseOperation('preflight', releaseRequest, packs[0], request);
                let releases = preflight && preflight.data && preflight.data.releases || [];
                let executable = releases.filter(release => ['NOT_INSTALLED', 'UPDATE_AVAILABLE', 'FAILED'].includes(release.status));
                let result = executable.length === 0 ? preflight :
                    await this.runActivationDataReleaseOperation('execute', releaseRequest, packs[0], request);
                let releaseByCode = Object.fromEntries(((result && result.data && result.data.releases) || releases).map(release => [release.releaseCode, release]));
                let importRunId = result && result.data && result.data.importRun && result.data.importRun.runId;
                await Promise.all(packs.map(pack => {
                    let release = releaseByCode[pack.code] || {};
                    let status = ['CURRENT', 'RUNNING'].includes(release.status) || executable.length === 0 ? 'IMPORTED' : String(release.status || 'IMPORTED');
                    return this.upsertActivationReceipt(record, pack, status, Object.assign({}, context, { request: request }), {
                        message: executable.length === 0 ? 'Required activation data release is already current.' : 'Required activation data imported through nImport.',
                        importRunId: importRunId, releaseStatus: release.status || 'CURRENT'
                    });
                }));
            } catch (error) {
                await Promise.all(packs.map(pack => this.upsertActivationReceipt(record, pack, 'FAILED', Object.assign({}, context, { request: request }), {
                    message: error && error.message || 'Required activation data import failed.', releaseStatus: 'FAILED'
                }))).catch(() => false);
                throw error;
            }
        }
        return true;
    },
    /** Runs one activation-data nImport operation on the package target runtime. */
    runActivationDataReleaseOperation: async function (mode, releaseRequest, pack, request) {
        if (this.isLocalActivationDataTarget(pack)) {
            let releaseService = SERVICE.DefaultDataReleaseService;
            if (!releaseService || typeof releaseService.preflight !== 'function' || typeof releaseService.execute !== 'function') {
                throw new CLASSES.NodicsError('ERR_BOF_00000', 'nImport data-release executor is unavailable for required activation data');
            }
            let operationRequest = Object.assign({}, request, { releaseRequest: releaseRequest });
            return mode === 'preflight' ? releaseService.preflight(operationRequest) : releaseService.execute(operationRequest);
        }
        return this.runRemoteActivationDataReleaseOperation(mode, releaseRequest, pack, request);
    },
    /** Returns true when the activation-data package targets the current runtime. */
    isLocalActivationDataTarget: function (pack) {
        let targetServer = pack && pack.targetServer;
        if (!targetServer) return true;
        let currentServer = typeof NODICS !== 'undefined' && NODICS.getServerName && NODICS.getServerName();
        return Boolean(currentServer && String(targetServer) === String(currentServer));
    },
    /** Resolves the runtime registry owner that should execute the remote data release. */
    resolveActivationDataRuntimeOwner: async function (pack) {
        let targetServer = pack && pack.targetServer;
        if (!targetServer) throw new CLASSES.NodicsError('ERR_BOF_00000', 'Activation data target runtime is required');
        let resolver = SERVICE.DefaultBackofficeRegistryService;
        if (!resolver || typeof resolver.resolveRuntimeOwner !== 'function') {
            throw new CLASSES.NodicsError('ERR_BOF_00000', 'Runtime registry resolver is unavailable for activation data');
        }
        let targetAuthority = { server: targetServer };
        let owner = await resolver.resolveRuntimeOwner({
            moduleName: 'system', connectionName: targetServer, targetAuthority: targetAuthority
        });
        if (!owner && pack.targetModule) {
            owner = await resolver.resolveRuntimeOwner({
                moduleName: pack.targetModule, connectionName: targetServer, targetAuthority: targetAuthority
            });
        }
        if (!owner || !owner.endpoint) throw new CLASSES.NodicsError('ERR_BOF_00000',
            'Activation data target runtime is unavailable: ' + targetServer);
        return owner;
    },
    /** Builds the target runtime nImport URL from an observed runtime endpoint. */
    buildActivationDataReleaseUrl: function (owner, dataType, mode) {
        let endpoint = new URL(owner.endpoint);
        let pathParts = endpoint.pathname.split('/').filter(Boolean);
        let configured = CONFIG.get('servers') || {};
        let contextRoot = pathParts[0] || configured.options && configured.options.contextRoot || 'nodics';
        let suffix = mode === 'preflight' ? '/validate' : '/install';
        return endpoint.origin + '/' + contextRoot + '/import/v0/' + dataType + suffix;
    },
    /** Calls the target runtime nImport route with an internal service token. */
    runRemoteActivationDataReleaseOperation: async function (mode, releaseRequest, pack, request) {
        let owner = await this.resolveActivationDataRuntimeOwner(pack);
        let tenant = this.getTenant(request);
        let token = typeof NODICS !== 'undefined' && NODICS.getInternalAuthToken && NODICS.getInternalAuthToken(tenant);
        if (!token) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Internal activation data token is unavailable');
        let moduleService = SERVICE.DefaultModuleService;
        if (!moduleService || typeof moduleService.buildExternalRequest !== 'function' || typeof moduleService.fetch !== 'function') {
            throw new CLASSES.NodicsError('ERR_BOF_00000', 'Module transport is unavailable for activation data');
        }
        let uri = this.buildActivationDataReleaseUrl(owner, releaseRequest.dataType, mode);
        let operationRequest = moduleService.buildExternalRequest({
            uri: uri, methodName: 'POST',
            header: { Authorization: 'Bearer ' + token },
            requestBody: releaseRequest,
            timeoutMs: Number((CONFIG.get('backofficeFunctionalModuleActivationData') || {}).timeoutMs || 30000),
            maxAttempts: 1,
            idempotencyKey: request && (request.correlationId || request.body && request.body.correlationId)
        });
        return moduleService.fetch(operationRequest);
    },
    /** Records deactivation/deregistration data semantics without deleting imported data. */
    recordDataLeftIntact: async function (record, context, request) {
        let packages = this.getActivationDataPackages(record.functionalModule);
        await Promise.all(packages.map(pack => this.upsertActivationReceipt(record, pack, 'DATA_LEFT_INTACT',
            Object.assign({}, context, { request: request }), {
                executionMode: pack.required && pack.trigger === 'ACTIVATION' ? 'NIMPORT_RELEASE' : 'USER_TRIGGERED',
                message: 'Capability visibility changed; imported data was left intact for audit, rollback, or reactivation.'
            })));
        return true;
    },
    /** Registers one optional functional module for the project. */
    register: function (request) { return this.transition(request, 'register'); },
    /** Enables one registered functional module for Axis presentation. */
    activate: function (request) { return this.transition(request, 'activate'); },
    /** Disables one optional functional module without changing its runtime. */
    deactivate: function (request) { return this.transition(request, 'deactivate'); },
    /** Rolls back one optional functional module activation without deleting imported data. */
    rollback: function (request) { return this.transition(request, 'rollback'); },
    /** Removes one optional functional module from the governed project catalogue. */
    deregister: function (request) { return this.transition(request, 'deregister'); }
};
