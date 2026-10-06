/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');

/**
 * @module database/service/procs/update/DefaultModelsUpdateInitializerService
 * @description Pipeline step service for generated schema update operations. It
 * validates update requests, checks write access, normalizes query options,
 * executes schema interceptors/validators, applies updates, populates response
 * data, invalidates cache, and publishes model change events.
 * @layer service
 * @owner nDatabase
 * @override Project modules may override individual update pipeline steps to
 * customize update policy while preserving the generated CRUD pipeline
 * request/response/process contract.
 *
 * @property {Object} request.schemaModel Generated schema model wrapper.
 * @property {Object} request.query Update selector.
 * @property {Object} request.model Update payload.
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
     * Validates update query and model payload.
     *
     * @param {Object} request Nodics update request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    validateRequest: function (request, response, process) {
        this.LOG.debug('Validating remove request: ');
        if (
            !request.query ||
            !UTILS.isObject(request.query) ||
            Array.isArray(request.query) ||
            UTILS.isBlank(request.query)
        ) {
            process.error(
                request,
                response,
                new CLASSES.NodicsError(
                    'ERR_UPD_00003',
                    'Query can not be null or empty for update operation',
                ),
            );
        } else if (
            !request.model ||
            !UTILS.isObject(request.model) ||
            Array.isArray(request.model) ||
            UTILS.isBlank(request.model)
        ) {
            process.error(
                request,
                response,
                new CLASSES.NodicsError(
                    'ERR_UPD_00003',
                    'Model can not be null or empty for update operation',
                ),
            );
        } else {
            process.nextSuccess(request, response);
        }
    },
    /**
     * Checks write access using schema access groups.
     *
     * @param {Object} request Nodics update request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    checkAccess: function (request, response, process) {
        this.LOG.debug('Checking model access');
        let rawSchema = request.schemaModel.rawSchema;
        if (
            SERVICE.DefaultSchemaAccessHandlerService.getAccessPoint(
                request.authData,
                rawSchema.accessGroups,
            ) >= CONFIG.get('accessPoints').writeAccessPoint
        ) {
            SERVICE.DefaultRecordOwnershipPolicyService.enforce(
                request,
                'update',
            )
                .then(() => process.nextSuccess(request, response))
                .catch((error) => process.error(request, response, error));
        } else {
            process.error(
                request,
                response,
                new CLASSES.NodicsError(
                    'ERR_AUTH_00003',
                    'current user do not have access to this resource',
                ),
            );
        }
    },
    /**
     * Builds update execution options.
     *
     * @param {Object} request Nodics update request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     * @sideEffects Mutates `request.options`.
     */
    buildQuery: function (request, response, process) {
        this.LOG.debug('Building query options');
        let inputOptions = request.options || {};
        inputOptions.explain = inputOptions.explain || false;
        inputOptions.snapshot = inputOptions.snapshot || false;

        if (inputOptions.timeout === true) {
            inputOptions.timeout = true;
            inputOptions.maxTimeMS = CONFIG.get('queryMaxTimeMS');
        }
        request.options = inputOptions;
        process.nextSuccess(request, response);
    },
    /**
     * Resolves affected update count from old and current database adapter result shapes.
     *
     * @param {Object} result Update result payload.
     * @returns {number} Number of modified records.
     */
    getAffectedCount: function (result) {
        if (!result) return 0;
        if (typeof result.modifiedCount === 'number')
            return result.modifiedCount;
        if (typeof result.nModified === 'number') return result.nModified;
        if (typeof result.n === 'number') return result.n;
        if (result.result) return this.getAffectedCount(result.result);
        return 0;
    },
    /**
     * Enforces runtime property-level update policies before mutation.
     *
     * @param {Object} request Nodics update request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    enforceUpdateAccessPolicies: function (request, response, process) {
        this.LOG.debug('Applying update access policies');
        if (
            !SERVICE.DefaultSchemaWriteAccessPolicyService ||
            typeof SERVICE.DefaultSchemaWriteAccessPolicyService
                .enforceUpdatePolicies !== 'function'
        ) {
            process.nextSuccess(request, response);
            return;
        }
        SERVICE.DefaultSchemaWriteAccessPolicyService.enforceUpdatePolicies(
            request,
            response,
        )
            .then((success) => {
                process.nextSuccess(request, response);
            })
            .catch((error) => {
                process.error(request, response, error);
            });
    },
    /**
     * Executes pre-update schema interceptors.
     *
     * @param {Object} request Nodics update request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    applyPreInterceptors: function (request, response, process) {
        this.LOG.debug('Applying pre update model interceptors');
        let schemaName = request.schemaModel.schemaName;
        let interceptors =
            SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(
                schemaName,
            );
        if (interceptors && interceptors.preUpdate) {
            SERVICE.DefaultInterceptorService.executeInterceptors(
                [].concat(interceptors.preUpdate),
                request,
                response,
            )
                .then((success) => {
                    process.nextSuccess(request, response);
                })
                .catch((error) => {
                    process.error(
                        request,
                        response,
                        new CLASSES.NodicsError(error, null, 'ERR_UPD_00005'),
                    );
                });
        } else {
            process.nextSuccess(request, response);
        }
    },
    /**
     * Executes pre-update schema validators.
     *
     * @param {Object} request Nodics update request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    applyPreValidators: function (request, response, process) {
        this.LOG.debug('Applying pre model validator');
        let schemaName = request.schemaModel.schemaName;
        let validators =
            SERVICE.DefaultDatabaseConfigurationService.getSchemaValidators(
                request.tenant,
                schemaName,
            );
        if (validators && validators.preUpdate) {
            SERVICE.DefaultValidatorService.executeValidators(
                [].concat(validators.preUpdate),
                request,
                response,
            )
                .then((success) => {
                    process.nextSuccess(request, response);
                })
                .catch((error) => {
                    process.error(
                        request,
                        response,
                        new CLASSES.NodicsError(error, null, 'ERR_UPD_00005'),
                    );
                });
        } else {
            process.nextSuccess(request, response);
        }
    },
    /**
     * Executes the generated model update operation.
     *
     * @param {Object} request Nodics update request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     * @sideEffects Writes `response.success`.
     */
    executeQuery: function (request, response, process) {
        this.LOG.debug('Executing remove query');
        const update = this.persistUpdates(request);
        update
            .then((result) => {
                if (this.getAffectedCount(result) > 0) {
                    result.message = 'Items have been updated successfull';
                }
                response.success = {
                    code: 'SUC_UPD_00000',
                    result: result,
                };
                process.nextSuccess(request, response);
            })
            .catch((error) => {
                process.error(request, response, error);
            });
    },
    /** Selects ordinary provider updates; variants retain shared private-write checks. @param {Object} request Prepared update. @returns {string} Provider method. */
    resolveUpdateMethod: function (request) {
        if (request.schemaModel.versioned) {
            throw new CLASSES.NodicsError(
                'ERR_UPD_00003',
                'Version-aware update capability is unavailable',
            );
        }
        return 'updateItems';
    },
    /** Preserves durable journal and private retirement ownership before provider selection. @param {Object} request Authorized and validated generated update. @returns {Promise<Object>} Native result. */
    persistUpdates: async function (request) {
        if (request.internalPersistence !== undefined)
            return this.updateDurableJournal(request);
        const concurrency = SERVICE.DefaultModelConcurrencyService;
        if (concurrency?.ownsCredentialRetirement?.(request))
            return concurrency.executeCredentialRetirement(request);
        if (
            !request.schemaModel.versioned &&
            concurrency &&
            concurrency.getField(request.schemaModel.rawSchema)
        ) {
            return concurrency.execute(request, 'update');
        }
        const method = this.resolveUpdateMethod(request);
        if (typeof request.schemaModel[method] !== 'function') {
            throw new CLASSES.NodicsError(
                'ERR_UPD_00003',
                'Required update capability is unavailable',
            );
        }
        return request.schemaModel[method](request);
    },
    /** Conditionally updates one private durable journal through the qualified adapter after normal authorization/validation. @param {Object} request Generated request with an exact code predicate and internal protocol selector. @returns {Promise<Object>} Exact atomic match count; no upsert or retry. */
    updateDurableJournal: async function (request) {
        const model = request.schemaModel;
        const capability = model?.persistenceCapabilities?.();
        if (
            request.internalPersistence !== 'DURABLE_JOURNAL' ||
            request.transactionContext ||
            model.rawSchema?.router?.enabled !== false ||
            model.rawSchema?.cache?.enabled !== false ||
            model.rawSchema?.event?.enabled !== false ||
            model.rawSchema?.credentialRetirement !== undefined ||
            model.versioned ||
            SERVICE.DefaultModelConcurrencyService?.getField(model.rawSchema) ||
            capability?.contractVersion !== 1 ||
            capability.durableJournal !== true ||
            capability.primaryMajorityReadback !== true ||
            typeof model.compareAndSetItem !== 'function' ||
            !request.query ||
            typeof request.query.code !== 'string' ||
            !request.query.code ||
            !_.isPlainObject(request.query) ||
            !_.isPlainObject(request.model) ||
            request.options?.recursive === true ||
            request.options?.replaceAllMatchesByQuery === true ||
            Object.keys(request.model).some(
                (key) => key.startsWith('$') || key.includes('.'),
            ) ||
            Object.entries(request.query).some(
                ([key, value]) =>
                    key.startsWith('$') ||
                    value === undefined ||
                    (typeof value === 'object' &&
                        value !== null &&
                        !(value instanceof Date)),
            )
        ) {
            throw new CLASSES.NodicsError(
                'ERR_MDL_00005',
                'Qualified exact durable journal update required',
            );
        }
        const expected =
            typeof model.normalizeModelForWrite === 'function'
                ? model.normalizeModelForWrite(request.model)
                : request.model;
        const result = await model.compareAndSetItem({
            operation: 'update',
            query: request.query,
            model: expected,
            internalPersistence: 'DURABLE_JOURNAL',
        });
        if (result == null)
            return { acknowledged: true, matchedCount: 0, modifiedCount: 0 };
        if (
            Array.isArray(result) ||
            result.code !== request.query.code ||
            result.error ||
            result.success === false ||
            result.acknowledged === false ||
            (result.errors !== undefined &&
                (!Array.isArray(result.errors) || result.errors.length)) ||
            Object.entries(expected).some(
                ([key, value]) => !_.isEqual(result[key], value),
            )
        ) {
            throw new CLASSES.NodicsError(
                'ERR_MDL_00005',
                'Durable journal update was not acknowledged',
            );
        }
        return { acknowledged: true, matchedCount: 1, modifiedCount: 1 };
    },
    /**
     * Populates referenced models in the update response when requested.
     *
     * @param {Object} request Nodics update request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    populateSubModels: function (request, response, process) {
        this.LOG.debug('Populating sub models');
        if (
            response.success.result &&
            response.success.result.models &&
            request.options &&
            request.options.recursive
        ) {
            SERVICE.DefaultModelService.travelModels({
                request: request,
                response: response,
                models: response.success.result.models,
                index: 0,
                callback: SERVICE.DefaultModelService.populateNestedModels,
            })
                .then((success) => {
                    process.nextSuccess(request, response);
                })
                .catch((error) => {
                    process.error(
                        request,
                        response,
                        new CLASSES.NodicsError(error, null, 'ERR_FIND_00003'),
                    );
                });
        } else {
            process.nextSuccess(request, response);
        }
    },
    /**
     * Executes post-update schema validators.
     *
     * @param {Object} request Nodics update request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    applyPostValidators: function (request, response, process) {
        this.LOG.debug('Applying post model validator');
        let schemaName = request.schemaModel.schemaName;
        let validators =
            SERVICE.DefaultDatabaseConfigurationService.getSchemaValidators(
                request.tenant,
                schemaName,
            );
        if (validators && validators.postUpdate) {
            SERVICE.DefaultValidatorService.executeValidators(
                [].concat(validators.postUpdate),
                request,
                response,
            )
                .then((success) => {
                    process.nextSuccess(request, response);
                })
                .catch((error) => {
                    process.error(
                        request,
                        response,
                        new CLASSES.NodicsError(error, null, 'ERR_UPD_00006'),
                    );
                });
        } else {
            process.nextSuccess(request, response);
        }
    },
    /**
     * Executes post-update schema interceptors when records were updated.
     *
     * @param {Object} request Nodics update request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    applyPostInterceptors: function (request, response, process) {
        this.LOG.debug('Applying post update model interceptors');
        if (
            response.success &&
            response.success.result &&
            this.getAffectedCount(response.success.result) > 0
        ) {
            let schemaName = request.schemaModel.schemaName;
            let interceptors =
                SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(
                    schemaName,
                );
            if (interceptors && interceptors.postUpdate) {
                SERVICE.DefaultInterceptorService.executeInterceptors(
                    [].concat(interceptors.postUpdate),
                    request,
                    response,
                )
                    .then((success) => {
                        process.nextSuccess(request, response);
                    })
                    .catch((error) => {
                        process.error(
                            request,
                            response,
                            new CLASSES.NodicsError(
                                error,
                                null,
                                'ERR_UPD_00006',
                            ),
                        );
                    });
            } else {
                process.nextSuccess(request, response);
            }
        } else {
            process.nextSuccess(request, response);
        }
    },
    /**
     * Invalidates schema router cache after successful update.
     *
     * @param {Object} request Nodics update request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    invalidateRouterCache: function (request, response, process) {
        this.LOG.debug('Invalidating router cache for modified model');
        try {
            let schemaModel = request.schemaModel;
            if (
                response.success &&
                response.success.result &&
                this.getAffectedCount(response.success.result) > 0
            ) {
                SERVICE.DefaultCacheService.invalidateResource({
                    tenant: request.tenant,
                    authData: request.authData,
                    moduleName: schemaModel.moduleName,
                    cacheType: 'router',
                    resourceName: schemaModel.schemaName,
                })
                    .then((success) => {
                        this.LOG.debug(
                            'Cache for router: ' +
                                schemaModel.schemaName +
                                ' has been flushed cuccessfully',
                        );
                    })
                    .catch((error) => {
                        this.LOG.error(
                            'Cache for router: ' +
                                schemaModel.schemaName +
                                ' has not been flushed cuccessfully',
                        );
                        this.LOG.error(error);
                    });
            }
        } catch (error) {
            this.LOG.error('Facing issue while invalidating router cache ');
            this.LOG.error(error);
        }
        process.nextSuccess(request, response);
    },
    /**
     * Invalidates schema item cache after successful update.
     *
     * @param {Object} request Nodics update request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    invalidateItemCache: function (request, response, process) {
        this.LOG.debug('Invalidating item cache for removed model');
        try {
            let schemaModel = request.schemaModel;
            if (
                response.success &&
                response.success.result &&
                this.getAffectedCount(response.success.result) > 0 &&
                schemaModel.rawSchema.cache &&
                schemaModel.rawSchema.cache.enabled
            ) {
                SERVICE.DefaultCacheService.invalidateResource({
                    tenant: request.tenant,
                    authData: request.authData,
                    moduleName: schemaModel.moduleName,
                    cacheType: 'schema',
                    resourceName: schemaModel.schemaName,
                })
                    .then((success) => {
                        this.LOG.debug(
                            'Cache for schema: ' +
                                schemaModel.schemaName +
                                ' has been flushed cuccessfully',
                        );
                    })
                    .catch((error) => {
                        this.LOG.error(
                            'Cache for schema: ' +
                                schemaModel.schemaName +
                                ' has not been flushed cuccessfully',
                        );
                        this.LOG.error(error);
                    });
            }
        } catch (error) {
            this.LOG.error('Facing issue while invalidating item cache ');
            this.LOG.error(error);
        }
        process.nextSuccess(request, response);
    },
    /**
     * Publishes schema update events after successful update.
     *
     * @param {Object} request Nodics update request.
     * @param {Object} response Pipeline response accumulator.
     * @param {Object} process Pipeline process controller.
     * @returns {undefined}
     */
    triggerModelChangeEvent: function (request, response, process) {
        this.LOG.debug('Triggering event for modified model');
        try {
            let schemaModel = request.schemaModel;
            if (
                response.success &&
                response.success.result &&
                this.getAffectedCount(response.success.result) > 0 &&
                response.success.result.models &&
                response.success.result.models.length > 0 &&
                schemaModel.rawSchema.event &&
                schemaModel.rawSchema.event.enabled
            ) {
                let event = {
                    tenant: request.tenant,
                    event: schemaModel.schemaName + 'Updated',
                    sourceName: schemaModel.moduleName,
                    sourceId: CONFIG.get('nodeId'),
                    target: schemaModel.moduleName,
                    state: 'NEW',
                    type: schemaModel.rawSchema.event.type || 'ASYNC',
                    targetType:
                        schemaModel.rawSchema.event.targetType ||
                        ENUMS.TargetType.MODULE_NODES.key,
                    active: true,
                    data: {
                        schemaName: schemaModel.schemaName,
                        modelName: schemaModel.modelName,
                        propertyName: schemaModel.rawSchema.definition.code
                            ? 'code'
                            : '_id',
                        models: response.success.result.models.map((model) => {
                            return model.code || model._id;
                        }),
                    },
                };
                this.LOG.debug(
                    'Pushing event for item created : ' +
                        schemaModel.schemaName,
                );
                SERVICE.DefaultEventService.publish(event)
                    .then((success) => {
                        this.LOG.debug('Event successfully posted');
                    })
                    .catch((error) => {
                        this.LOG.error(
                            'While posting model change event : ',
                            error,
                        );
                    });
            }
        } catch (error) {
            this.LOG.error('Facing issue while pushing save event : ', error);
        }
        process.nextSuccess(request, response);
    },
};
