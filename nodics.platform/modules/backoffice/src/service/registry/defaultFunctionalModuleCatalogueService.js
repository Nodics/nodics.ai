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
    /** Executes a private schema query through the standard model pipeline. */
    getRecords: function (request) {
        request = Object.assign({}, request, { moduleName: 'backoffice' });
        request.schemaModel = this.getModel(request.tenant);
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
            existing.displayName !== observation.displayName || existing.required !== observation.required ||
            !this.sameList(existing.technicalModules, observation.technicalModules) ||
            !this.sameList(existing.observedServers, observedServers);
        let model = {
            code: canonicalCode, functionalModule: observation.functionalModule,
            registrationState: desiredRegistrationState, enabled: desiredEnabled, runtimeState: 'ACTIVE',
            displayName: observation.displayName, registeredVersion: observation.registeredVersion,
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
    projectClientSafe: function (record) {
        return {
            project: record.projectCode,
            functionalModule: this.normalizeFunctionalModule(record.functionalModule),
            displayName: record.displayName,
            registeredVersion: record.registeredVersion,
            registrationState: record.registrationState,
            enabled: record.enabled === true,
            required: record.required === true,
            runtimeState: record.runtimeState,
            technicalModules: this.uniqueSorted(record.technicalModules),
            observedServers: this.uniqueSorted(record.observedServers),
            catalogueRevision: Number(record.catalogueRevision || 1),
            registeredAt: record.registeredAt,
            lastObservedAt: record.lastObservedAt
        };
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
        return { code: code, data: { project: project, items: this.getItems(response).map(item => this.projectClientSafe(item)) } };
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
        return { code: 'SUC_BOF_00019', data: this.projectClientSafe(record) };
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
            expectedRevision: Number(body.expectedRevision), reason: String(body.reason), actor: actor };
    },
    /** Applies one optimistic durable lifecycle transition without changing runtime composition. */
    transition: async function (request, action) {
        let context = this.getLifecycleContext(request);
        let existing = await this.getRecord(context.project, context.functionalModule, request);
        if (!existing) throw new CLASSES.NodicsError('ERR_BOF_00000', 'Functional module is not available');
        if (Number(existing.catalogueRevision) !== context.expectedRevision) {
            throw new CLASSES.NodicsError('ERR_BOF_00000', 'Functional-module catalogue revision conflict');
        }
        if (existing.required === true && ['deactivate', 'deregister'].includes(action)) {
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
            next = { enabled: true };
        } else if (action === 'deactivate') {
            if (existing.registrationState !== 'REGISTERED') throw new CLASSES.NodicsError('ERR_BOF_00000', 'Functional module is not registered');
            next = { enabled: false };
        } else if (action === 'deregister') {
            next = { registrationState: existing.runtimeState === 'ACTIVE' ? 'AVAILABLE' : 'DEREGISTERED', enabled: false };
        } else {
            throw new Error('Unsupported functional-module lifecycle action');
        }
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
        return { code: 'SUC_BOF_00020', data: this.projectClientSafe(result) };
    },
    /** Registers one optional functional module for the project. */
    register: function (request) { return this.transition(request, 'register'); },
    /** Enables one registered functional module for Axis presentation. */
    activate: function (request) { return this.transition(request, 'activate'); },
    /** Disables one optional functional module without changing its runtime. */
    deactivate: function (request) { return this.transition(request, 'deactivate'); },
    /** Removes one optional functional module from the governed project catalogue. */
    deregister: function (request) { return this.transition(request, 'deregister'); }
};
