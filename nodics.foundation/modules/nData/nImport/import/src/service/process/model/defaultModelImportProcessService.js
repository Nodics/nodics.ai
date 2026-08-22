/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');

/**
 * @module nodics.foundation/modules/nData/nImport/import/src/service/process/model/defaultModelImportProcessService
 * @description Implements nData default model import process service business behavior and extension logic.
 * @layer service
 * @owner nData
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

     * Validates request rules.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating request');
        if (!request.header) {
            process.error(request, response, new CLASSES.DataImportError('ERR_IMP_00003', 'Please validate request. Mandate property header not have valid value'));
        } else if (!request.dataModel) {
            process.error(request, response, new CLASSES.DataImportError('ERR_IMP_00003', 'Please validate request. Mandate property dataModel not have valid value'));
        } else if (!request.header.options.schemaName && !request.header.options.indexName) {
            process.error(request, response, new CLASSES.DataImportError('ERR_IMP_00003', 'Please validate request. Both schemaName and indexName can not be null or empty'));
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**

     * Retrieves raw schema information.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    loadRawSchema: function (request, response, process) {
        this.LOG.debug('Loading raw schema for header');
        let header = request.header;
        if (header.options.schemaName) {
            header.rawSchema = this.resolveRawSchema(header.options.moduleName, header.options.schemaName);
            header.localSchemaAvailable = Boolean(header.rawSchema);
        }
        process.nextSuccess(request, response);
    },

    /**
     * Resolves the raw schema for a model import target.
     *
     * @param {string} moduleName Header module name.
     * @param {string} schemaName Header schema name.
     * @returns {Object|undefined} Resolved raw schema.
     */
    resolveRawSchema: function (moduleName, schemaName) {
        let targetModule = NODICS.getModule(moduleName);
        let directSchema = targetModule && targetModule.rawSchema && targetModule.rawSchema[schemaName];
        if (directSchema) return directSchema;
        let modules = typeof NODICS.getModules === 'function' ? NODICS.getModules() : {};
        let matchedSchema;
        _.each(modules || {}, moduleObject => {
            if (!matchedSchema && moduleObject && moduleObject.rawSchema && moduleObject.rawSchema[schemaName]) {
                matchedSchema = moduleObject.rawSchema[schemaName];
            }
        });
        return matchedSchema;
    },

    /**
     * Enforces runtime schema/property import policies before relation resolution and insert.
     *
     * @param {Object} request Nodics import request containing header and dataModel.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    enforceImportAccessPolicies: function (request, response, process) {
        this.LOG.debug('Applying import access policies');
        let header = request.header;
        if (!header.options.schemaName || !header.rawSchema ||
            !SERVICE.DefaultSchemaWriteAccessPolicyService ||
            typeof SERVICE.DefaultSchemaWriteAccessPolicyService.enforceImportPolicies !== 'function') {
            process.nextSuccess(request, response);
            return;
        }
        SERVICE.DefaultSchemaWriteAccessPolicyService.enforceImportPolicies({
            tenant: request.tenant,
            authData: {
                userGroups: header.options.userGroups
            },
            schemaModel: {
                moduleName: header.options.moduleName,
                schemaName: header.options.schemaName,
                rawSchema: header.rawSchema
            },
            model: request.dataModel,
            importRun: request.importRun
        }, response).then(success => {
            process.nextSuccess(request, response);
        }).catch(error => {
            process.error(request, response, new CLASSES.DataImportError(error, 'Import payload violates schema access policy', 'ERR_IMP_00003'));
        });
    },

    /**
     * Normalizes finalized import scalar values using the effective schema
     * before generated persistence executes. Finalized JavaScript imports can
     * cross a JSON boundary, so dates and scalar values need the same runtime
     * casting protection normal API payloads receive.
     *
     * @param {Object} header Effective import header carrying raw schema.
     * @param {Object[]} models Import records.
     * @returns {Object[]} Normalized import records.
     */
    normalizeModelsForSchema: function (header, models) {
        let definition = header && header.rawSchema && header.rawSchema.definition || {};
        return (models || []).map(model => this.normalizeModelForSchema(definition, model));
    },

    /**
     * Normalizes one model according to scalar schema definitions.
     *
     * @param {Object} definition Effective schema definition map.
     * @param {Object} model Import model.
     * @returns {Object} Normalized model.
     */
    normalizeModelForSchema: function (definition, model) {
        if (!model || typeof model !== 'object') return model;
        let normalized = Object.assign({}, model);
        Object.keys(definition || {}).forEach(propertyName => {
            if (normalized[propertyName] === undefined || normalized[propertyName] === null) return;
            let property = definition[propertyName] || {};
            normalized[propertyName] = this.normalizeScalarValue(property.type, normalized[propertyName]);
        });
        return normalized;
    },

    /**
     * Normalizes one scalar value for generated schema persistence.
     *
     * @param {string} type Nodics schema scalar type.
     * @param {*} value Import value.
     * @returns {*} Normalized value.
     */
    normalizeScalarValue: function (type, value) {
        if (type === 'date' && typeof value === 'string') {
            let parsed = new Date(value);
            return Number.isNaN(parsed.getTime()) ? value : parsed;
        }
        if ((type === 'int' || type === 'integer') && typeof value === 'string' && value.trim() !== '') {
            let parsed = Number.parseInt(value, 10);
            return Number.isNaN(parsed) ? value : parsed;
        }
        if ((type === 'number' || type === 'float' || type === 'double') && typeof value === 'string' && value.trim() !== '') {
            let parsed = Number(value);
            return Number.isNaN(parsed) ? value : parsed;
        }
        if ((type === 'bool' || type === 'boolean') && typeof value === 'string') {
            if (value.toLowerCase() === 'true') return true;
            if (value.toLowerCase() === 'false') return false;
        }
        return value;
    },

    /**

     * Executes populate schema dependancies behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    populateSchemaDependancies: function (request, response, process) {
        this.LOG.debug('Populating all schema dependancies');
        let header = request.header;
        if (header.macros && header.rawSchema) {
            if (header.rawSchema.refSchema) {
                this.resolveRelationsForModels(request, response, {
                    header: header,
                    refSchema: header.rawSchema.refSchema,
                    macros: header.macros,
                    models: UTILS.isArray(request.dataModel) ? request.dataModel.slice() : [request.dataModel]
                }).then(success => {
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else {
                this.LOG.warn('Macros definition can not be used without schema ref definition');
                process.nextSuccess(request, response);
            }
        } else {
            process.nextSuccess(request, response);
        }
    },

    /**
     * Resolves configured relation macros for every record in an import batch.
     *
     * @param {Object} request Import request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} options Relation resolution options.
     * @returns {Promise<boolean>} Resolves when all models have relation values resolved.
     */
    resolveRelationsForModels: function (request, response, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (options.models && options.models.length > 0) {
                let model = options.models.shift();
                let modelRequest = Object.assign({}, request, {
                    dataModel: model
                });
                _self.resolveRelation(modelRequest, response, {
                    header: options.header,
                    refSchema: options.refSchema,
                    properties: Object.keys(options.macros),
                    macros: options.macros
                }).then(success => {
                    _self.resolveRelationsForModels(request, response, options).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(true);
            }
        });
    },

    /**

     * Retrieves relation information.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} options Method input.

     * @returns {*} Method result.

     */

    resolveRelation: function (request, response, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (options.properties && options.properties.length > 0) {
                let property = options.properties.shift();
                let model = request.dataModel;
                if (options.refSchema[property] && model[property]) {
                    let refObject = options.refSchema[property];
                    if (refObject.type === 'one') {
                        _self.resolveOneToOneRelation(request, response, {
                            refObject: refObject,
                            model: model,
                            property: property,
                            value: model[property],
                            macro: options.macros[property]
                        }).then(success => {
                            model[property] = success[0];
                            _self.resolveRelation(request, response, options).then(success => {
                                resolve(true);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    } else {
                        _self.resolveOneToManyRelation(request, response, {
                            refObject: refObject,
                            model: model,
                            property: property,
                            values: model[property],
                            macro: options.macros[property],
                            result: []
                        }).then(success => {
                            model[property] = success;
                            _self.resolveRelation(request, response, options).then(success => {
                                resolve(true);
                            }).catch(error => {
                                reject(error);
                            });
                        }).catch(error => {
                            reject(error);
                        });
                    }
                } else {
                    this.resolveRelation(request, response, options).then(success => {
                        resolve(true);
                    }).catch(error => {
                        reject(error);
                    });
                }
            } else {
                resolve(true);
            }
        });
    },

    /**

     * Retrieves one to one relation information.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} options Method input.

     * @returns {*} Method result.

     */

    resolveOneToOneRelation: function (request, response, options) {
        return new Promise((resolve, reject) => {
            this.fetchModel(request, response, {
                property: options.property,
                value: options.value,
                macro: options.macro
            }).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    },

    /**

     * Retrieves one to many relation information.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} options Method input.

     * @returns {*} Method result.

     */

    resolveOneToManyRelation: function (request, response, options) {
        let _self = this;
        return new Promise((resolve, reject) => {
            if (options.values && options.values.length > 0) {
                let value = options.values.shift();
                this.fetchModel(request, response, {
                    property: options.property,
                    value: value,
                    macro: options.macro
                }).then(success => {
                    options.result.push(success[0]);
                    _self.resolveOneToManyRelation(request, response, options).then(success => {
                        resolve(options.result);
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            } else {
                resolve(options.result);
            }
        });
    },

    /**

     * Retrieves model information.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} options Method input.

     * @returns {*} Method result.

     */

    fetchModel: function (request, response, options) {
        return new Promise((resolve, reject) => {
            let values = options.value.split(':');
            let query = {};
            let properties = Object.keys(options.macro.rule);
            for (let count = 0; count < properties.length; count++) {
                let propertyName = properties[count];
                let propertyObject = options.macro.rule[propertyName];
                if (propertyObject.type === 'Number' || propertyObject.type === 'number') {
                    query[propertyName] = parseInt(values[propertyObject.index]);
                } else if (propertyObject.type === 'Boolean' ||
                    propertyObject.type === 'boolean' ||
                    propertyObject.type === 'bool' ||
                    propertyObject.type === 'Bool') {
                    query[propertyName] = (values[propertyObject.index] === 'true');
                } else {
                    query[propertyName] = values[propertyObject.index];
                }
            }
            SERVICE['Default' + options.macro.options.model.toUpperCaseFirstChar() + 'Service'].get({
                tenant: request.tenant,
                authData: {
                    userGroups: request.header.options.userGroups
                },
                searchOptions: request.searchOptions,
                options: request.options,
                query: query
            }).then(result => {
                if (result.result && result.result.length > 0) {
                    let data = [];
                    result.result.forEach(element => {
                        data.push(element[options.macro.options.returnProperty || '_id']);
                    });
                    resolve(data);
                } else {
                    reject(new CLASSES.DataImportError('ERR_IMP_00001', 'None ' + options.macro.options.model.toUpperCaseFirstChar() + 's found'));
                }
            }).catch(error => {
                reject(new CLASSES.DataImportError(error, null, 'ERR_IMP_00000'));
            });
        });
    },

    /**

     * Executes populate search dependancies behavior.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    populateSearchDependancies: function (request, response, process) {
        this.LOG.debug('Populating all search dependancies');
        process.nextSuccess(request, response);
    },

    /**

     * Updates model information.

     *

     * @param {*} request Method input.

     * @param {*} response Method input.

     * @param {*} process Method input.

     * @returns {*} Method result.

     */

    insertModel: function (request, response, process) {
        let header = request.header;
        let models = [];
        if (UTILS.isArray(request.dataModel)) {
            _.each(request.dataModel, (modelObject, name) => {
                models.push(modelObject);
            });
        } else {
            models.push(request.dataModel);
        }
        // A module name can be present in the composed catalogue while its schema
        // authority is hosted by another runtime. Only use the local generated
        // service when this node actually loaded the target raw schema; otherwise
        // preserve the existing remote-import dispatch contract.
        let localSchemaTarget = header.options.schemaName && header.localSchemaAvailable !== false;
        let localSearchTarget = header.options.indexName;
        if (NODICS.isModuleActive(header.options.moduleName) && (localSchemaTarget || localSearchTarget)) {
            if (header.options.schemaName) {
                this.insertLocalSchemaModel(request, models).then(success => {
                    response.success = success;
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, error);
                });
            } else if (header.options.indexName) {
                this.insertLocalSearchModel(request, models).then(success => {
                    response.success = success;
                    process.nextSuccess(request, response);
                }).catch(error => {
                    process.error(request, response, new CLASSES.DataImportError(error));
                });
            } else {
                process.error(request, response, new CLASSES.DataImportError('ERR_IMP_00000', 'Invalid header options, should contain either schemaName or indexName'));
            }
        } else {
            this.insertRemoteModel(request, models).then(success => {
                response.success = success;
                process.nextSuccess(request, response);
            }).catch(error => {
                process.error(request, response, new CLASSES.DataImportError(error));
            });
        }
    },
    /**
     * Updates local schema model information.
     *
     * @param {*} request Method input.
     * @param {*} models Method input.
     * @returns {*} Method result.
     */
    insertLocalSchemaModel: function (request, models) {
        let header = request.header;
        models = this.normalizeModelsForSchema(header, models);
        return this.ensureLocalSchemaService(request).then(schemaService => {
            return this.reconcileContentPackVersions(request, schemaService, models);
        }).then(reconciledModels => {
            let schemaService = SERVICE['Default' + header.options.schemaName.toUpperCaseFirstChar() + 'Service'];
            let options = Object.assign({}, request.options || {});
            if (this.isGovernedContentPackRun(request)) {
                options.allowCmsAssociationReplacement = true;
                options.replaceAllMatchesByQuery = true;
                options.replaceArraysOnVersionMerge = true;
                if (header.rawSchema && header.rawSchema.isVersionedEnabled === true) {
                    options.versionedImport = true;
                }
            }
            return new Promise((resolve, reject) => {
                schemaService[header.options.operation]({
                tenant: request.tenant,
                authData: {
                    userGroups: header.options.userGroups
                },
                options: options,
                searchOptions: request.searchOptions,
                query: header.query,
                models: reconciledModels,
                suppressRetryErrorLog: request.suppressRetryErrorLog === true
            }).then(success => {
                if (success && success.result && success.result.length > 0) {
                    resolve(success.result);
                } else if (success && success.errors && success.errors.length > 0) {
                    let error = new CLASSES.DataImportError(success.errors[0]);
                    if (success.errors.length > 1) {
                        for (let count = 1; count < success.errors.length; count++) {
                            error.add(new CLASSES.DataImportError(success.errors[count]));
                        }
                    }
                    reject(error);
                } else {
                    reject(new CLASSES.DataImportError('ERR_IMP_00001', 'Could not found any response from data access layer'));
                }
            }).catch(error => {
                reject(new CLASSES.DataImportError(error));
            });
            });
        });
    },

    /**
     * Ensures a generated schema service exists for an active local import target.
     *
     * Some runtime compositions activate optional accelerator schemas without
     * pre-generating their runtime service artifact. Import must create the
     * same local model/service contract used by schema activation instead of
     * failing with an opaque JavaScript `undefined.saveAll` error.
     *
     * @param {Object} request Import request carrying the current header.
     * @returns {Promise<Object>} Resolved generated schema service.
     * @throws {CLASSES.DataImportError} When the local schema cannot be activated.
     */
    ensureLocalSchemaService: function (request) {
        let header = request.header;
        let schemaName = header.options.schemaName;
        let serviceName = 'Default' + schemaName.toUpperCaseFirstChar() + 'Service';
        let operation = header.options.operation;
        let schemaService = SERVICE[serviceName];
        if (schemaService && typeof schemaService[operation] === 'function') {
            return Promise.resolve(schemaService);
        }
        if (!header.rawSchema) {
            return Promise.reject(new CLASSES.DataImportError('ERR_IMP_00003',
                'Target schema service operation not found: ' + serviceName + '.' + operation));
        }
        return this.ensureLocalSchemaModel(request).then(() => {
            return this.ensureRuntimeSchemaService(request);
        }).then(() => {
            schemaService = SERVICE[serviceName];
            if (!schemaService || typeof schemaService[operation] !== 'function') {
                throw new CLASSES.DataImportError('ERR_IMP_00003',
                    'Target schema service operation not found after generation: ' + serviceName + '.' + operation);
            }
            return schemaService;
        }).catch(error => {
            throw new CLASSES.DataImportError(error, 'Target schema runtime generation failed for import: ' +
                header.options.moduleName + '.' + schemaName, 'ERR_IMP_00003');
        });
    },

    /**
     * Ensures the active local module has a database model for the import
     * schema. This is intentionally scoped to the current import schema; it does
     * not activate routers, facades, or any externally exposed API contract.
     *
     * @param {Object} request Import request carrying the current header.
     * @returns {Promise<boolean>} Resolved when the model is available.
     */
    ensureLocalSchemaModel: function (request) {
        let header = request.header;
        let moduleName = header.options.moduleName;
        let schemaName = header.options.schemaName;
        let modelName = UTILS.createModelName(schemaName);
        let existingModels = NODICS.getModels(moduleName, request.tenant);
        if (existingModels && existingModels[modelName]) {
            return Promise.resolve(true);
        }
        let moduleObject = NODICS.getModule(moduleName);
        if (!moduleObject || !moduleObject.rawSchema || !moduleObject.rawSchema[schemaName] ||
            !SERVICE.DefaultDatabaseModelHandlerService || !SERVICE.DefaultDatabaseConfigurationService) {
            return Promise.reject(new CLASSES.DataImportError('ERR_IMP_00003',
                'Target schema model not available for import: ' + moduleName + '.' + schemaName));
        }
        if (!moduleObject.models) {
            moduleObject.models = {};
        }
        if (!moduleObject.models[request.tenant]) {
            moduleObject.models[request.tenant] = {};
        }
        return SERVICE.DefaultDatabaseModelHandlerService.buildModel({
            tntCode: request.tenant,
            moduleName: moduleName,
            schemaName: schemaName,
            moduleObject: moduleObject,
            dataBase: SERVICE.DefaultDatabaseConfigurationService.getTenantDatabase(moduleName, request.tenant),
            schemas: [schemaName]
        });
    },

    /**
     * Ensures a runtime schema service exists and is registered in SERVICE.
     *
     * @param {Object} request Import request carrying the current header.
     * @returns {Promise<boolean>} Resolved when the service is available.
     */
    ensureRuntimeSchemaService: function (request) {
        let header = request.header;
        let moduleName = header.options.moduleName;
        let schemaName = header.options.schemaName;
        let modelName = UTILS.createModelName(schemaName);
        let serviceName = 'Default' + schemaName.toUpperCaseFirstChar() + 'Service';
        let operation = header.options.operation;
        let schemaService = SERVICE[serviceName];
        if (schemaService && typeof schemaService[operation] === 'function') {
            return Promise.resolve(true);
        }
        if (!SERVICE.DefaultPipelineService) {
            return Promise.reject(new CLASSES.DataImportError('ERR_IMP_00003',
                'Runtime pipeline service is unavailable for import: ' + serviceName));
        }
        SERVICE[serviceName] = this.createRuntimeSchemaService(moduleName, modelName);
        return Promise.resolve(true);
    },

    /**
     * Creates an import-scoped schema service that delegates to the standard
     * Nodics generated-service persistence pipelines.
     *
     * @param {string} moduleName Owning module name.
     * @param {string} modelName Runtime model name.
     * @returns {Object} Runtime schema service.
     */
    createRuntimeSchemaService: function (moduleName, modelName) {
        return {
            /**
             * Executes generated get pipeline for an import-scoped runtime schema.
             *
             * @param {Object} request Generated service request.
             * @returns {Promise<Object>} Pipeline response.
             */
            get: function (request) {
                request.schemaModel = NODICS.getModels(moduleName, request.tenant)[modelName];
                request.moduleName = request.moduleName || moduleName;
                return SERVICE.DefaultPipelineService.start('modelsGetInitializerPipeline', request, {});
            },
            /**
             * Executes generated save pipeline for one import-scoped runtime record.
             *
             * @param {Object} request Generated service request.
             * @returns {Promise<Object>} Pipeline response.
             */
            save: function (request) {
                request.schemaModel = NODICS.getModels(moduleName, request.tenant)[modelName];
                request.moduleName = request.moduleName || moduleName;
                return SERVICE.DefaultPipelineService.start('modelSaveInitializerPipeline', request, {});
            },
            /**
             * Executes generated save-all pipeline for import-scoped runtime records.
             *
             * @param {Object} request Generated service request.
             * @returns {Promise<Object>} Pipeline response.
             */
            saveAll: function (request) {
                request.schemaModel = NODICS.getModels(moduleName, request.tenant)[modelName];
                request.moduleName = request.moduleName || moduleName;
                return SERVICE.DefaultPipelineService.start('modelsSaveInitializerPipeline', request, {});
            },
            /**
             * Executes generated remove pipeline for import-scoped runtime records.
             *
             * @param {Object} request Generated service request.
             * @returns {Promise<Object>} Pipeline response.
             */
            remove: function (request) {
                request.schemaModel = NODICS.getModels(moduleName, request.tenant)[modelName];
                request.moduleName = request.moduleName || moduleName;
                return SERVICE.DefaultPipelineService.start('modelsRemoveInitializerPipeline', request, {});
            }
        };
    },

    /**
     * Reconciles immutable content-pack records with the latest Staged revision.
     *
     * Source-controlled releases intentionally carry portable version zero
     * records and cannot know a target database's current revision. Only a
     * governed content-pack run may resolve that revision through the owning
     * generated service. The subsequent save remains optimistic: a concurrent
     * writer that advances the record after this read is rejected by the
     * versioned persistence provider.
     *
     * @param {Object} request Active import request.
     * @param {Object} schemaService Owning generated schema service.
     * @param {Object[]} models Normalized release records.
     * @returns {Promise<Object[]>} Records carrying the expected next revision.
     */
    reconcileContentPackVersions: function (request, schemaService, models) {
        let header = request.header || {};
        let options = header.options || {};
        let isGovernedRelease = this.isGovernedContentPackRun(request);
        let isVersionedSchema = Boolean(header.rawSchema && header.rawSchema.isVersionedEnabled === true);
        if (!isGovernedRelease || !isVersionedSchema || !options.schemaName ||
            !schemaService || typeof schemaService.get !== 'function') {
            return Promise.resolve(models);
        }
        return Promise.all(models.map(model => {
            let query = this.resolveImportModelQuery(header.query || {}, model);
            return schemaService.get({
                tenant: request.tenant,
                authData: {
                    userGroups: options.userGroups
                },
                query: query,
                searchOptions: {
                    limit: 1,
                    sort: { versionId: -1 }
                },
                options: request.options
            }).then(response => {
                let existing = response && Array.isArray(response.result) ? response.result[0] : undefined;
                if (existing && Number.isInteger(existing.versionId)) {
                    model.versionId = existing.versionId + 1;
                }
                return model;
            });
        }));
    },

    /**
     * Detects immutable release-driven imports that own portable source revisions.
     *
     * Content-pack imports identify themselves with contentPackCode. Guided data-release setup
     * carries the same immutable release contract through dataReleasePlan/importRun.dataReleases.
     *
     * @param {Object} request Active import request.
     * @returns {boolean} True when the import is governed by a declared immutable release.
     */
    isGovernedContentPackRun: function (request) {
        let importRun = request && request.importRun || {};
        if (importRun.contentPackCode) return true;
        if (Array.isArray(importRun.dataReleases) && importRun.dataReleases.length > 0) return true;
        if (Array.isArray(request && request.dataReleasePlan) && request.dataReleasePlan.length > 0) return true;
        return false;
    },

    /** Resolves `$property` import query placeholders from one release record. */
    resolveImportModelQuery: function (query, model) {
        return Object.keys(query || {}).reduce((resolved, propertyName) => {
            let value = query[propertyName];
            if (typeof value === 'string' && value.startsWith('$')) {
                resolved[propertyName] = model[value.substring(1)];
            } else {
                resolved[propertyName] = value;
            }
            return resolved;
        }, {});
    },

    /**

     * Updates local search model information.

     *

     * @param {*} request Method input.

     * @param {*} models Method input.

     * @returns {*} Method result.

     */

    insertLocalSearchModel: function (request, models) {
        let header = request.header;
        return new Promise((resolve, reject) => {
            let searchService = SERVICE['Default' + header.options.indexName.toUpperCaseFirstChar() + 'Service'] || SERVICE.DefaultSearchService;
            searchService[header.options.operation]({
                tenant: request.tenant,
                authData: {
                    userGroups: header.options.userGroups
                },
                indexName: request.indexName || header.options.indexName,
                moduleName: request.moduleName || header.options.moduleName,
                options: request.options || {},
                searchOptions: request.searchOptions,
                query: header.query,
                models: models,
                model: models[0]
            }).then(result => {
                if (result && result.errors && result.errors.length > 0) {
                    let error = new CLASSES.DataImportError(result.errors[0]);
                    for (let count = 1; count < result.errors.length; count++) {
                        error.add(new CLASSES.DataImportError(result.errors[count]));
                    }
                    reject(error);
                } else if (result && result.result !== undefined && result.result !== null) {
                    resolve(result.result);
                } else {
                    reject(new CLASSES.DataImportError('ERR_IMP_00001', 'Could not found any response from search access layer'));
                }
            }).catch(error => {
                reject(new CLASSES.DataImportError(error));
            });
        });
    },

    /**

     * Updates remote model information.

     *

     * @param {*} request Method input.

     * @param {*} models Method input.

     * @returns {*} Method result.

     */

    insertRemoteModel: function (request, models) {
        let header = request.header;
        return new Promise((resolve, reject) => {
            let event = {
                tenant: request.tenant,
                active: true,
                event: 'saveModels',
                sourceName: header.options.moduleName,
                sourceId: CONFIG.get('nodeId'),
                target: header.options.moduleName,
                state: "NEW",
                type: 'SYNC',
                targetType: ENUMS.TargetType.MODULE.key,
                targetNodeId: 'node0',
                data: {
                    header: header,
                    models: models
                }
            };
            this.LOG.debug('Pushing event for item created : ' + event.event);
            SERVICE.DefaultEventService.publish(event).then(success => {
                resolve(success);
            }).catch(error => {
                reject(error);
            });
        });
    }
};
