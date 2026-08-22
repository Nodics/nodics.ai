/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module database/service/schema/DefaultSchemaUtilityService
 * @description Shared generated-schema utility operations for browser-safe
 * data administration. These contracts are generated beside CRUD APIs so Axis
 * and customer BackOffice screens do not need Workbench-specific route sprawl.
 * @layer service
 * @owner nDatabase
 * @override Domain modules still own business lifecycle operations. This
 * service is limited to generic schema utility behavior such as safe delete
 * impact inspection.
 */
module.exports = {
    /**
     * Returns the generated schema's browser-safe capability descriptor.
     * @param {Object} request Generated schema service request.
     * @returns {Promise<Object>} Client-safe schema capabilities.
     */
    capabilitiesGenerated: function (request) {
        let descriptor = this.resolveDescriptor(request, request.moduleName, request.schemaName);
        if (!descriptor) {
            return Promise.reject(new CLASSES.NodicsError('ERR_DBS_00004', 'Generated schema capabilities are not available'));
        }
        return Promise.resolve({ code: 'SUC_DBS_00000', data: descriptor });
    },

    /**
     * Executes a generated schema delete-impact preview without mutating data.
     * @param {Object} request Generated schema service request.
     * @returns {Promise<Object>} Safe delete-impact response.
     */
    deleteImpactGenerated: function (request) {
        let descriptor = this.resolveDescriptor(request, request.moduleName, request.schemaName);
        if (!descriptor || !descriptor.operations || !descriptor.operations.includes('delete')) {
            return Promise.reject(new CLASSES.NodicsError('ERR_DBS_00004', 'Generated delete impact is not available for schema'));
        }
        let identity = this.buildIdentityQuery((request.utilityBody || {}).identity, descriptor);
        if (!request.schemaModel) {
            return Promise.reject(new CLASSES.NodicsError('ERR_DBS_00004', 'Schema model is not available'));
        }
        return SERVICE.DefaultReferenceIntegrityService.inspectRemove({
            tenant: request.tenant,
            authData: request.authData,
            schemaModel: request.schemaModel,
            query: identity,
        }).then((impact) => {
            return { code: 'SUC_DBS_00000', data: impact };
        });
    },

    /**
     * Resolves the effective client-safe descriptor for a generated schema.
     * @param {Object} request Authenticated request.
     * @param {string} moduleName Owning module name.
     * @param {string} schemaName Logical schema name.
     * @returns {Object|undefined} Client-safe schema descriptor.
     */
    resolveDescriptor: function (request, moduleName, schemaName) {
        if (!SERVICE.DefaultSchemaWorkbenchService || typeof SERVICE.DefaultSchemaWorkbenchService.resolveSchemaModule !== 'function') {
            throw new CLASSES.NodicsError('ERR_DBS_00004', 'Generated schema descriptor service is not available');
        }
        let schemaModule = SERVICE.DefaultSchemaWorkbenchService.resolveSchemaModule(moduleName);
        if (!schemaModule || !schemaModule.moduleObject || typeof SERVICE.DefaultSchemaWorkbenchService.buildDescriptor !== 'function') {
            throw new CLASSES.NodicsError('ERR_DBS_00004', 'Generated schema descriptor is not available');
        }
        return SERVICE.DefaultSchemaWorkbenchService.buildDescriptor(request, schemaModule.moduleObject, schemaName, schemaModule.moduleName);
    },

    /**
     * Builds a safe single-record identity query for utility operations.
     * @param {Object} identity Browser-provided identity envelope.
     * @param {Object} descriptor Client-safe schema descriptor.
     * @returns {Object} Internal generated-service query.
     */
    buildIdentityQuery: function (identity, descriptor) {
        if (!identity || typeof identity !== 'object' || Array.isArray(identity)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema utility identity is invalid');
        }
        let primary = descriptor.fields.find((field) => field.primary) ||
            descriptor.fields.find((field) => field.name === descriptor.displayProperty) || { name: descriptor.displayProperty };
        let value = identity[primary.name];
        if (!primary.name || !['string', 'number', 'boolean'].includes(typeof value)) {
            throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema utility identity is invalid');
        }
        let query = { [primary.name]: value };
        if (descriptor.concurrency && descriptor.concurrency.mode === 'COMPARE_AND_SET' && descriptor.concurrency.required === true) {
            let expected = identity[descriptor.concurrency.field];
            if (!['string', 'number'].includes(typeof expected)) {
                throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema utility concurrency value is required');
            }
            query[descriptor.concurrency.field] = expected;
        }
        return query;
    },
};
