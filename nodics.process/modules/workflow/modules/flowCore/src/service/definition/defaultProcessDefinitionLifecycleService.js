/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

'use strict';

const crypto = require('crypto');

/**
 * @module nodics.process/modules/workflow/modules/flowCore/src/service/definition/defaultProcessDefinitionLifecycleService
 * @description Owns governed process definition draft, validation, publish, archive, and delete-draft lifecycle over generated persistence services.
 * @layer service
 * @owner flowCore
 * @override Customer process overlays may override individual lifecycle methods for policy, approvals, or versioning while preserving backend validation and audit rules.
 */
module.exports = {
    /**
     * Resolves the tenant for process definition operations without crossing request authorization.
     *
     * @param {Object} request Nodics request context.
     * @returns {string} Tenant code.
     */
    getTenant: function (request) {
        return request && request.tenant || CONFIG.get('defaultTenant') || 'default';
    },

    /**
     * Resolves the authenticated actor for audit fields.
     *
     * @param {Object} request Nodics request context.
     * @returns {string|undefined} Actor identifier when available.
     */
    getActor: function (request) {
        let auth = request && request.authData || {};
        return auth.loginId || auth.serviceId || auth.code || auth.userId;
    },

    /**
     * Builds a generated-service request preserving tenant and authentication context.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} additions Generated-service request additions.
     * @returns {Object} Generated-service request.
     */
    serviceRequest: function (request, additions) {
        return Object.assign({
            tenant: this.getTenant(request),
            authData: request && request.authData,
            options: { recursive: false }
        }, additions || {});
    },

    /**
     * Returns the process definition generated service.
     *
     * @returns {Object} Generated process definition service.
     */
    definitionService: function () {
        return SERVICE.DefaultProcessDefinitionService;
    },

    /**
     * Returns the process definition version generated service.
     *
     * @returns {Object} Generated process definition version service.
     */
    versionService: function () {
        return SERVICE.DefaultProcessDefinitionVersionService;
    },

    /**
     * Normalizes a model from API body or direct service request.
     *
     * @param {Object} request Nodics request context.
     * @returns {Object} Process definition model.
     */
    modelOf: function (request) {
        return request && (request.processDefinition || request.model || request.body) || {};
    },

    /**
     * Validates a stable process definition code.
     *
     * @param {*} value Candidate definition code.
     * @returns {boolean} Whether the code is valid.
     */
    isCode: function (value) {
        return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(value);
    },

    /**
     * Throws a process request error when a definition code is invalid.
     *
     * @param {*} code Candidate code.
     * @returns {string} Valid code.
     * @throws {CLASSES.NodicsError} When code is invalid.
     */
    assertCode: function (code) {
        if (!this.isCode(code)) throw new CLASSES.NodicsError('ERR_PROCESS_00001', 'Process definition code is invalid');
        return code;
    },

    /**
     * Finds one definition by code.
     *
     * @param {Object} request Nodics request context.
     * @param {string} code Definition code.
     * @returns {Promise<Object|undefined>} Matching definition.
     */
    findDefinition: async function (request, code) {
        let response = await this.definitionService().get(this.serviceRequest(request, {
            query: { code: this.assertCode(code) },
            searchOptions: { limit: 2 }
        }));
        let definitions = response && response.result || [];
        return definitions[0];
    },

    /**
     * Requires one definition by code.
     *
     * @param {Object} request Nodics request context.
     * @param {string} code Definition code.
     * @returns {Promise<Object>} Matching definition.
     * @throws {CLASSES.NodicsError} When definition does not exist.
     */
    requireDefinition: async function (request, code) {
        let definition = await this.findDefinition(request, code);
        if (!definition) throw new CLASSES.NodicsError('ERR_PROCESS_00002', 'Process definition was not found');
        return definition;
    },

    /**
     * Loads the latest immutable published version for one definition.
     *
     * @param {Object} request Nodics request context.
     * @param {Object} definition Process definition aggregate.
     * @returns {Promise<Object>} Latest immutable version.
     * @throws {CLASSES.NodicsError} When no published version exists.
     */
    requireLatestVersion: async function (request, definition) {
        let response = await this.versionService().get(this.serviceRequest(request, {
            query: { definitionCode: definition.code, version: Number(definition.currentVersion || 0) },
            searchOptions: { limit: 1 }
        }));
        let version = response && response.result && response.result[0];
        if (!version) throw new CLASSES.NodicsError('ERR_PROCESS_00002', 'Process definition version was not found');
        return version;
    },

    /**
     * Returns a stable checksum for an immutable published graph.
     *
     * @param {Object} definition Process definition.
     * @returns {string} SHA-256 checksum.
     */
    checksum: function (definition) {
        return crypto.createHash('sha256').update(JSON.stringify({
            code: definition.code,
            version: definition.currentVersion,
            graph: definition.graph
        })).digest('hex');
    },

    /**
     * Lists definitions using a bounded query.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Process definitions.
     */
    listDefinitions: async function (request) {
        let response = await this.definitionService().get(this.serviceRequest(request, {
            query: request.query || {},
            searchOptions: Object.assign({ limit: 100 }, request.searchOptions || {})
        }));
        return { code: 'SUC_PROCESS_00000', data: response.result || [] };
    },

    /**
     * Loads a single definition by code.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Definition projection.
     */
    getDefinition: async function (request) {
        return { code: 'SUC_PROCESS_00000', data: await this.requireDefinition(request, request.definitionCode) };
    },

    /**
     * Creates a draft process definition after backend graph validation.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Created definition.
     */
    createDefinition: async function (request) {
        let model = Object.assign({}, this.modelOf(request));
        this.assertCode(model.code);
        if (await this.findDefinition(request, model.code)) {
            throw new CLASSES.NodicsError('ERR_PROCESS_00003', 'Process definition already exists');
        }
        model.active = model.active !== false;
        model.status = 'DRAFT';
        model.currentVersion = 0;
        model.draftRevision = 1;
        model.validation = SERVICE.DefaultProcessGraphValidationService.assertValidGraph(model.graph);
        let response = await this.definitionService().save(this.serviceRequest(request, { model: model }));
        return { code: 'SUC_PROCESS_00001', data: response.result || response };
    },

    /**
     * Updates only a draft definition and revalidates the backend graph.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Updated definition summary.
     */
    updateDraft: async function (request) {
        let definition = await this.requireDefinition(request, request.definitionCode);
        if (definition.status !== 'DRAFT') throw new CLASSES.NodicsError('ERR_PROCESS_00005', 'Only draft process definitions can be updated');
        let model = Object.assign({}, this.modelOf(request));
        delete model.code;
        delete model.status;
        delete model.currentVersion;
        model.draftRevision = Number(definition.draftRevision || 1) + 1;
        if (model.graph) model.validation = SERVICE.DefaultProcessGraphValidationService.assertValidGraph(model.graph);
        await this.definitionService().update(this.serviceRequest(request, {
            query: { code: definition.code, status: 'DRAFT' },
            model: { $set: model }
        }));
        return { code: 'SUC_PROCESS_00002', data: { code: definition.code, draftRevision: model.draftRevision } };
    },

    /**
     * Validates the current draft graph without publishing.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Validation result.
     */
    validateDraft: async function (request) {
        let definition = await this.requireDefinition(request, request.definitionCode);
        let validation = SERVICE.DefaultProcessGraphValidationService.validateGraph(definition.graph);
        await this.definitionService().update(this.serviceRequest(request, {
            query: { code: definition.code },
            model: { $set: { validation: validation } }
        }));
        if (!validation.valid) {
            let error = new CLASSES.NodicsError('ERR_PROCESS_00004', 'Process graph validation failed');
            error.errors = validation.issues;
            throw error;
        }
        return { code: 'SUC_PROCESS_00003', data: validation };
    },

    /**
     * Publishes a valid draft as an immutable version.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Published version summary.
     */
    publishDraft: async function (request) {
        let definition = await this.requireDefinition(request, request.definitionCode);
        if (definition.status !== 'DRAFT') throw new CLASSES.NodicsError('ERR_PROCESS_00005', 'Only draft process definitions can be published');
        let validation = SERVICE.DefaultProcessGraphValidationService.assertValidGraph(definition.graph);
        let version = Number(definition.currentVersion || 0) + 1;
        let now = new Date();
        let versionModel = {
            code: definition.code + '_v' + version,
            active: true,
            name: definition.name,
            definitionCode: definition.code,
            version: version,
            status: 'PUBLISHED',
            graph: definition.graph,
            designer: definition.designer,
            contributionOwner: definition.contributionOwner,
            contributionCode: definition.contributionCode,
            contributionVersion: definition.contributionVersion,
            contributionChecksum: definition.contributionChecksum,
            policy: definition.policy,
            checksum: this.checksum(Object.assign({}, definition, { currentVersion: version })),
            publishedBy: this.getActor(request),
            publishedAt: now
        };
        await this.versionService().save(this.serviceRequest(request, { model: versionModel }));
        await this.definitionService().update(this.serviceRequest(request, {
            query: { code: definition.code, status: 'DRAFT' },
            model: { $set: { status: 'PUBLISHED', currentVersion: version, validation: validation, publishedAt: now } }
        }));
        return { code: 'SUC_PROCESS_00004', data: { code: definition.code, version: version, checksum: versionModel.checksum } };
    },

    /**
     * Prepares the next editable draft from the latest immutable published version.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Prepared draft summary.
     */
    prepareNextDraft: async function (request) {
        let definition = await this.requireDefinition(request, request.definitionCode);
        if (definition.status === 'DRAFT') {
            if (Number(definition.currentVersion || 0) > 0) {
                return { code: 'SUC_PROCESS_00006', data: { code: definition.code, draftRevision: definition.draftRevision, currentVersion: definition.currentVersion, status: 'DRAFT' } };
            }
            throw new CLASSES.NodicsError('ERR_PROCESS_00009', 'Only published process definitions can prepare a next draft');
        }
        if (definition.status !== 'PUBLISHED') throw new CLASSES.NodicsError('ERR_PROCESS_00009', 'Only published process definitions can prepare a next draft');
        let latestVersion = await this.requireLatestVersion(request, definition);
        let draftRevision = Number(definition.draftRevision || 1) + 1;
        let validation = SERVICE.DefaultProcessGraphValidationService.assertValidGraph(latestVersion.graph);
        await this.definitionService().update(this.serviceRequest(request, {
            query: { code: definition.code, status: 'PUBLISHED' },
            model: {
                $set: {
                    active: true,
                    status: 'DRAFT',
                    draftRevision: draftRevision,
                    graph: latestVersion.graph,
                    designer: latestVersion.designer,
                    validation: validation,
                    preparedFromVersion: latestVersion.version,
                    preparedBy: this.getActor(request),
                    preparedAt: new Date()
                }
            }
        }));
        return { code: 'SUC_PROCESS_00006', data: { code: definition.code, draftRevision: draftRevision, currentVersion: definition.currentVersion, preparedFromVersion: latestVersion.version, status: 'DRAFT' } };
    },

    /**
     * Deletes a draft definition or archives a published definition without losing audit evidence.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Lifecycle result.
     */
    deleteOrArchive: async function (request) {
        let definition = await this.requireDefinition(request, request.definitionCode);
        if (definition.status === 'DRAFT') {
            if (Number(definition.currentVersion || 0) > 0) {
                let latestVersion = await this.requireLatestVersion(request, definition);
                await this.definitionService().update(this.serviceRequest(request, {
                    query: { code: definition.code, status: 'DRAFT' },
                    model: {
                        $set: {
                            active: true,
                            status: 'PUBLISHED',
                            graph: latestVersion.graph,
                            designer: latestVersion.designer,
                            validation: SERVICE.DefaultProcessGraphValidationService.validateGraph(latestVersion.graph),
                            publishedAt: latestVersion.publishedAt,
                            draftDiscardedAt: new Date()
                        }
                    }
                }));
                return { code: 'SUC_PROCESS_00005', data: { code: definition.code, status: 'DRAFT_DISCARDED', currentVersion: definition.currentVersion } };
            }
            await this.definitionService().remove(this.serviceRequest(request, { query: { code: definition.code, status: 'DRAFT' } }));
            return { code: 'SUC_PROCESS_00005', data: { code: definition.code, status: 'DELETED_DRAFT' } };
        }
        let archivedAt = new Date();
        await this.definitionService().update(this.serviceRequest(request, {
            query: { code: definition.code },
            model: { $set: { status: 'ARCHIVED', active: false, archivedAt: archivedAt } }
        }));
        await this.versionService().update(this.serviceRequest(request, {
            query: { definitionCode: definition.code, status: 'PUBLISHED' },
            model: { $set: { status: 'ARCHIVED', active: false } },
            options: { recursive: true }
        }));
        return { code: 'SUC_PROCESS_00005', data: { code: definition.code, status: 'ARCHIVED' } };
    },

    /**
     * Lists immutable published versions for one definition.
     *
     * @param {Object} request Nodics request context.
     * @returns {Promise<Object>} Version list.
     */
    listVersions: async function (request) {
        this.assertCode(request.definitionCode);
        let response = await this.versionService().get(this.serviceRequest(request, {
            query: { definitionCode: request.definitionCode },
            searchOptions: { limit: 100, sort: { version: -1 } }
        }));
        return { code: 'SUC_PROCESS_00000', data: response.result || [] };
    }
};
