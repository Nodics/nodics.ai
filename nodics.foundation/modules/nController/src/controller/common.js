/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');
const ObjectId = require('mongodb').ObjectId;

/**
 * @module nodics.foundation/modules/nController/src/controller/common
 * @description Template controller used by generated schema controllers. During
 * generation, placeholders are replaced with the owning controller, facade,
 * schema, and request mapping identifiers.
 * @layer template
 * @owner nController
 * @sourceTemplate /src/controller/common.js
 * @override This file is consumed by build generators and is not loaded into
 * CONTROLLER directly. Project modules override generated `*Controller.js`
 * artifacts or contribute same-name controller files through `src/controller/**`.
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

     * Retrieves  information.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    get: function (request, callback) {
        request.options = request.options || {};
        request.searchOptions = request.searchOptions || {};
        if (!request.options.recursive && request.httpRequest.get('recursive') && request.httpRequest.get('recursive') === 'true') {
            request.options.recursive = true;
        } else {
            request.options.recursive = false;
        }
        if (request.httpRequest.params.id) {
            request.query = {
                _id: ObjectId(request.httpRequest.params.id)
            };
        } else if (request.httpRequest.params.code) {
            request.query = {
                code: request.httpRequest.params.code
            };
        } else if (!UTILS.isBlank(request.httpRequest.body)) {
            request = this.mapRequestBody(request, ['query', 'searchOptions', 'pageSize', 'pageNumber', 'sort', 'select', 'options']);
        }
        if (callback) {
            FACADE.dsdName.get(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.get(request);
        }
    },

    /**
     * Executes bounded browser-safe schema search through the generated CRUD
     * service. Unlike `POST /schemaName`, this operation never accepts raw
     * database query operators from the browser.
     * @param {*} request Method input.
     * @param {*} callback Method input.
     * @returns {*} Method result.
     */
    safeSearch: function (request, callback) {
        request.browserQuery = request.httpRequest.body || {};
        request.schemaName = 'schmanm';
        if (callback) {
            FACADE.dsdName.safeSearch(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.safeSearch(request);
        }
    },

    /** Executes bounded schema bulk operations without accepting caller request authority. */
    bulk: function (request, callback) {
        return this.executeGenericMutation(request, callback, () => {
            request.utilityBody = request.httpRequest.body || {};
            request.schemaName = 'schmanm';
            return FACADE.dsdName.bulk(request);
        }, 'delete');
    },

    /**
     * Returns browser-safe generated schema capabilities.
     * @param {*} request Method input.
     * @param {*} callback Method input.
     * @returns {*} Method result.
     */
    capabilities: function (request, callback) {
        request.schemaName = 'schmanm';
        if (callback) {
            FACADE.dsdName.capabilities(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.capabilities(request);
        }
    },

    /**

     * Removes or clears  information.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    remove: function (request, callback) {
        return this.executeGenericMutation(request, callback, () => this.removeAuthorized(request), 'delete');
    },

    /** Maps an authorized remove request after the immutable route identity is checked. */
    removeAuthorized: function (request, callback) {
        request = this.mapRequestBody(request, ['query', 'options']);
        if (callback) {
            FACADE.dsdName.remove(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.remove(request);
        }
    },

    /**
     * Previews reference/restrict impact for a generated schema delete without
     * mutating data.
     * @param {*} request Method input.
     * @param {*} callback Method input.
     * @returns {*} Method result.
     */
    deleteImpact: function (request, callback) {
        request.utilityBody = request.httpRequest.body || {};
        request.schemaName = 'schmanm';
        if (callback) {
            FACADE.dsdName.deleteImpact(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.deleteImpact(request);
        }
    },

    /**

     * Removes or clears by id information.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    removeById: function (request, callback) {
        return this.executeGenericMutation(request, callback, () => this.removeByIdAuthorized(request), 'delete');
    },

    /** Maps an authorized ID-based remove request. */
    removeByIdAuthorized: function (request, callback) {
        request.ids = [];
        if (request.httpRequest.params.id) {
            request.ids.push(ObjectId(request.httpRequest.params.id));
        } else {
            request = this.mapRequestBody(request, ['ids', 'query', 'options']);
        }
        if (callback) {
            FACADE.dsdName.removeById(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.removeById(request);
        }
    },

    /**

     * Removes or clears by code information.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    removeByCode: function (request, callback) {
        return this.executeGenericMutation(request, callback, () => this.removeByCodeAuthorized(request), 'delete');
    },

    /** Maps an authorized code-based remove request. */
    removeByCodeAuthorized: function (request, callback) {
        request.codes = [];
        if (request.httpRequest.params.code) {
            request.codes.push(request.httpRequest.params.code);
        } else {
            request = this.mapRequestBody(request, ['codes', 'query', 'options']);
        }
        if (callback) {
            FACADE.dsdName.removeByCode(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.removeByCode(request);
        }
    },

    /**

     * Updates  information.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    save: function (request, callback) {
        return this.executeGenericMutation(request, callback, () => this.saveAuthorized(request), 'create');
    },

    /** Maps an authorized save request. */
    saveAuthorized: function (request, callback) {
        request.model = SERVICE.DefaultSchemaUtilityService.buildGeneratedMutationModel(request.httpRequest.body, request, 'schmanm');
        if (callback) {
            FACADE.dsdName.save(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.save(request);
        }
    },

    /**

     * Updates all information.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    saveAll: function (request, callback) {
        return this.executeGenericMutation(request, callback, () => this.saveAllAuthorized(request), 'create');
    },

    /** Maps an authorized multi-save request. */
    saveAllAuthorized: function (request, callback) {
        if (!Array.isArray(request.httpRequest.body)) throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema models must be an array');
        request.models = request.httpRequest.body.map(model => SERVICE.DefaultSchemaUtilityService.buildGeneratedMutationModel(model, request, 'schmanm'));
        if (callback) {
            FACADE.dsdName.saveAll(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.saveAll(request);
        }
    },

    /**

     * Updates  information.

     *

     * @param {*} request Method input.

     * @param {*} callback Method input.

     * @returns {*} Method result.

     */

    update: function (request, callback) {
        return this.executeGenericMutation(request, callback, () => this.updateAuthorized(request), 'update');
    },

    /** Maps an authorized update request. */
    updateAuthorized: function (request, callback) {
        request = this.mapRequestBody(request, ['query', 'model', 'options']);
        request.model = SERVICE.DefaultSchemaUtilityService.buildGeneratedMutationModel(request.model, request, 'schmanm');
        if (callback) {
            FACADE.dsdName.update(request).then(success => {
                callback(null, success);
            }).catch(error => {
                callback(error);
            });
        } else {
            return FACADE.dsdName.update(request);
        }
    },

    /**
     * Maps declared transport fields without accepting body-supplied authentication,
     * module, tenant, enterprise, transaction or trace authority.
     * @param {Object} request Secured request.
     * @param {string[]} fields Allowed operation input keys.
     * @returns {Object} Request with narrow client input and original trusted context.
     */
    mapRequestBody: function (request, fields) {
        let body = request.httpRequest.body || {};
        if (typeof body !== 'object' || Array.isArray(body)) throw new CLASSES.NodicsError('ERR_DBS_00003', 'Schema request body is invalid');
        let mapped = request;
        fields.forEach(field => {
            if (!Object.prototype.hasOwnProperty.call(body, field)) return;
            if (field === 'options') {
                mapped.options = Object.assign({}, request.options || {});
                ['recursive', 'returnModified'].forEach(option => {
                    if (typeof body.options?.[option] === 'boolean') mapped.options[option] = body.options[option];
                });
            } else {
                mapped[field] = body[field];
            }
        });
        if (request.router && request.router.schemaGoverned === true && request.schemaApiDescriptor && fields.includes('query')) {
            mapped.query = SERVICE.DefaultSchemaUtilityService.buildIdentityQuery(mapped.query, request.schemaApiDescriptor);
        }
        return mapped;
    },

    /** Resolves required shared mutation helpers and rejects stale or missing runtime services. @returns {Object} Effective schema utility service. */
    schemaUtilityService: function () {
        const service = SERVICE.DefaultSchemaUtilityService;
        if (!service || ['resolveSchemaModule', 'buildGeneratedMutationModel', 'getIdempotencyKey'].some(name => typeof service[name] !== 'function')) {
            throw new CLASSES.NodicsError('ERR_DBS_00004', 'Schema mutation utility service is unavailable');
        }
        return service;
    },

    /** Checks server-owned schema authority before any request-body merge or persistence call. */
    executeGenericMutation: function (request, callback, execute, operation) {
        let result = Promise.resolve().then(() => {
            const utility = this.schemaUtilityService();
            const owner = utility.resolveSchemaModule(request.moduleName);
            SERVICE.DefaultSchemaAuthoringPolicyService.assertMutationAllowed(owner.moduleName, 'schmanm', operation);
            if (request.router && request.router.schemaGoverned === true) {
                const descriptor = utility.resolveDescriptor(request, owner.moduleName, 'schmanm');
                if (!descriptor || !descriptor.operations.includes(operation)) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Schema operation is unavailable');
                request.schemaApiDescriptor = descriptor;
                if (operation === 'create' && descriptor.form && descriptor.form.createOperation) throw new CLASSES.NodicsError('ERR_AUTH_00003', 'Use the owning business setup operation');
            }
            request.moduleName = owner.moduleName;
            request.idempotencyKey = utility.getIdempotencyKey(request);
            return execute();
        });
        if (callback) {
            result.then(success => callback(null, success)).catch(error => callback(error));
            return;
        }
        return result;
    }
};
