/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');


/**
 * @module nodics.foundation/modules/nDatabase/mongodb/src/schemas/model
 * @description Defines nDatabase schema metadata, model contracts, and generated capability settings.
 * @layer schemas
 * @owner nDatabase
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    default: {
        /**
         * Builds transaction-aware MongoDB operation options.
         */
        transactionOptions: function (input, schemaModel) {
    if (typeof SERVICE === 'undefined' || !SERVICE.DefaultDatabaseTransactionService) {
        return {};
    }
    return SERVICE.DefaultDatabaseTransactionService.operationOptions(
        input.transactionContext, schemaModel.dataBase, schemaModel
    );
},

        /**
         * Determines whether a model contains MongoDB update operators.
         */
        isMongoUpdateOperatorPayload: function (model) {
    return model && Object.keys(model).some(key => key.indexOf('$') === 0);
},

        /**
         * Resolves schema-declared date fields for generated MongoDB writes.
         */
        dateFieldNames: function () {
    let definition = this.rawSchema && this.rawSchema.definition ? this.rawSchema.definition : {};
    return Object.keys(definition).filter(key => {
        let descriptor = definition[key] || {};
        return String(descriptor.type || '').toLowerCase() === 'date';
    });
},

        /**
         * Coerces JSON date strings into BSON Date values for schema date fields.
         */
        normalizeDateValue: function (value) {
    if (value instanceof Date) return value;
    if (typeof value !== 'string') return value;
    let trimmed = value.trim();
    if (!trimmed) return value;
    let parsed = Date.parse(trimmed);
    return Number.isFinite(parsed) ? new Date(parsed) : value;
},

        /**
         * Coerces schema-declared date properties in a plain object.
         */
        normalizeDateFields: function (model) {
    if (!model || typeof model !== 'object' || Array.isArray(model)) return model;
    let dateFields = this.dateFieldNames();
    if (dateFields.length === 0) return model;
    let normalized = Object.assign({}, model);
    dateFields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(normalized, field)) {
            normalized[field] = this.normalizeDateValue(normalized[field]);
        }
    });
    return normalized;
},

        /**
         * Coerces schema-declared date fields in generated save and update payloads.
         */
        normalizeModelForWrite: function (model) {
    if (!this.isMongoUpdateOperatorPayload(model)) return this.normalizeDateFields(model);
    let normalized = Object.assign({}, model);
    if (normalized.$set && typeof normalized.$set === 'object' && !Array.isArray(normalized.$set)) {
        normalized.$set = this.normalizeDateFields(normalized.$set);
    }
    let dateFields = this.dateFieldNames();
    Object.keys(normalized).forEach(key => {
        if (key.indexOf('$') !== 0 && dateFields.indexOf(key) >= 0) normalized[key] = this.normalizeDateValue(normalized[key]);
    });
    return normalized;
},

        /**
         * Builds the MongoDB update document for a model payload.
         */
        buildUpdateDocument: function (model) {
    let normalizedModel = this.normalizeModelForWrite(model);
    if (!this.isMongoUpdateOperatorPayload(normalizedModel)) return { $set: normalizedModel };
    return Object.keys(normalizedModel).reduce((updateDocument, key) => {
        if (key.indexOf('$') === 0) {
            updateDocument[key] = key === '$set'
                ? Object.assign({}, updateDocument[key] || {}, normalizedModel[key] || {})
                : normalizedModel[key];
        } else {
            updateDocument.$set = Object.assign({}, updateDocument.$set || {}, { [key]: normalizedModel[key] });
        }
        return updateDocument;
    }, {});
},

        /**
         * Applies an update payload to a returned model snapshot.
         */
        mergeUpdatedSnapshot: function (snapshot, model) {
    if (!this.isMongoUpdateOperatorPayload(model)) return _.merge(snapshot, model);
    if (model.$set) _.merge(snapshot, model.$set);
    if (model.$unset) Object.keys(model.$unset).forEach(key => _.unset(snapshot, key));
    return snapshot;
},

        /**
         * Retrieves models matching the requested MongoDB query.
         */
        getItems: function (input) {
            return new Promise((resolve, reject) => {
                try {
                    let operationOptions = this.transactionOptions(input, this);
                    let cursor = this.find(input.query, Object.assign({}, input.searchOptions || {}, operationOptions));
                    if (input.searchOptions && input.searchOptions.sort && !UTILS.isBlank(input.searchOptions.sort)) {
                        cursor = cursor.sort(input.searchOptions.sort);
                    }
                    if (input.transactionContext) {
                        cursor.toArray().then(result => {
                            resolve({
                                options: input.searchOptions,
                                query: input.query,
                                count: result.length,
                                result: result
                            });
                        }).catch(error => {
                            reject(new CLASSES.NodicsError(error, null, 'ERR_MDL_00000'));
                        });
                    } else {
                        this.countDocuments(input.query).then(count => {
                            cursor.toArray().then(result => {
                                resolve({
                                    options: input.searchOptions,
                                    query: input.query,
                                    count: count,
                                    result: result
                                });
                            }).catch(error => {
                                reject(new CLASSES.NodicsError(error, null, 'ERR_MDL_00000'));
                            });
                        }).catch(error => {
                            reject(new CLASSES.NodicsError(error, 'While executing count operation', 'ERR_MDL_00000'));
                        });
                    }
                } catch (error) {
                    reject(new CLASSES.NodicsError(error, 'While executing find operation', 'ERR_MDL_00000'));
                }
            });
        },

        /**
         * Creates or upserts models in MongoDB.
         */
        saveItems: function (input) {
            return new Promise((resolve, reject) => {
                let operationOptions = this.transactionOptions(input, this);
                if (!input.model) {
                    reject(new CLASSES.NodicsError('ERR_MDL_00001'));
                } else if (input.query && !UTILS.isBlank(input.query)) {
                    try {
                        input.model = this.normalizeModelForWrite(input.model);
                        let updateDocument = { $set: input.model };
                        let saveOne = () => this.findOneAndUpdate(input.query,
                            updateDocument,
                            Object.assign({}, this.dataBase.getOptions().modelSaveOptions || {
                                upsert: true,
                                returnDocument: 'after'
                            }, operationOptions));
                        let resolveSaved = result => {
                            if (result && result.ok > 0 && result.value) {
                                resolve(result.value);
                            } else if (result && result.ok > 0) {
                                resolve(_.merge({
                                    _id: result.lastErrorObject.upserted
                                }, input.model));
                            } else {
                                reject(new CLASSES.NodicsError('ERR_MDL_00005'));
                            }
                        };
                        if (input.options && input.options.replaceAllMatchesByQuery === true) {
                            this.countDocuments(input.query).then(count => {
                                if (count > 0) {
                                    return this.updateMany(input.query, updateDocument, Object.assign({ upsert: false }, operationOptions)).then(() => {
                                        return this.find(input.query, Object.assign({ limit: 1 }, operationOptions)).toArray();
                                    }).then(result => {
                                        if (result && result.length > 0) {
                                            resolve(result[0]);
                                        } else {
                                            reject(new CLASSES.NodicsError('ERR_MDL_00005'));
                                        }
                                    });
                                }
                                return saveOne().then(resolveSaved);
                            }).catch(error => {
                                reject(error);
                            });
                        } else {
                            saveOne().then(resolveSaved).catch(error => {
                                reject(error);
                            });
                        }
                    } catch (error) {
                        reject(new CLASSES.NodicsError(error, 'While saving items', 'ERR_MDL_00000'));
                    }
                } else {
                    try {
                        input.model = this.normalizeModelForWrite(input.model);
                        SERVICE.DefaultModelValidatorService.validateMandate(input.model, this.rawSchema).then((success) => {
                            return SERVICE.DefaultModelValidatorService.validateDataType(input.model, this.rawSchema);
                        }).then((success) => {
                            return new Promise((resolve, reject) => {
                                this.insertOne(input.model, operationOptions).then(result => {
                                    if (result.acknowledged || (result.ops && result.ops.length > 0)) {
                                        input.model._id = result.insertedId;
                                        resolve(input.model);
                                    } else {
                                        reject(new CLASSES.NodicsError('ERR_MDL_00005'));
                                    }
                                }).catch(error => {
                                    reject(error);
                                });
                            });
                        }).then((success) => {
                            resolve(success);
                        }).catch(error => {
                            reject(error);
                        });
                    } catch (error) {
                        reject(new CLASSES.NodicsError(error, 'While saving new items', 'ERR_MDL_00000'));
                    }
                }
            });
        },

        /**
         * Updates models matching the requested MongoDB query.
         */
        updateItems: function (input) {
            return new Promise((resolve, reject) => {
                let operationOptions = this.transactionOptions(input, this);
                if (!input.model) {
                    reject(new CLASSES.NodicsError('ERR_MDL_00003'));
                } else if (!input.query || UTILS.isBlank(input.query)) {
                    reject(new CLASSES.NodicsError('ERR_MDL_00003'));
                } else {
                    if (input.options && input.options.returnModified) {
                        this.find(input.query, Object.assign({}, input.searchOptions || {},
                            operationOptions)).toArray((error, response) => {
                            if (error) {
                                reject(new CLASSES.NodicsError(error, null, 'ERR_MDL_00000'));
                            } else {
                                this.updateMany(input.query, this.buildUpdateDocument(input.model), Object.assign({}, this.dataBase.getOptions().modelUpdateOptions || {
                                    upsert: false,
                                    returnNewDocument: true
                                }, operationOptions)).then(success => {
                                    response.forEach(element => {
                                        this.mergeUpdatedSnapshot(element, input.model);
                                    });
                                    success.models = response;
                                    resolve(success);
                                }).catch(error => {
                                    const modelError = new CLASSES.NodicsError(error, null, 'ERR_MDL_00000');
                                    modelError.errInfo = error && error.errInfo;
                                    reject(modelError);
                                });
                            }
                        });
                    } else {
                        this.updateMany(input.query, this.buildUpdateDocument(input.model), Object.assign({}, this.dataBase.getOptions().modelUpdateOptions || {
                            upsert: false,
                            returnNewDocument: true
                        }, operationOptions)).then(success => {
                            resolve(success);
                        }).catch(error => {
                            const modelError = new CLASSES.NodicsError(error, null, 'ERR_MDL_00000');
                            modelError.errInfo = error && error.errInfo;
                            reject(modelError);
                        });
                    }
                }
            });
        },

        /**
         * Removes models matching the requested MongoDB query.
         */
        removeItems: function (input) {
            return new Promise((resolve, reject) => {
                let operationOptions = this.transactionOptions(input, this);
                if (input.query && !UTILS.isBlank(input.query)) {
                    if (input.options && input.options.returnModified) {
                        this.find(input.query, Object.assign({}, input.searchOptions || {},
                            operationOptions)).toArray((error, response) => {
                            if (error) {
                                reject(new CLASSES.NodicsError(error, null, 'ERR_MDL_00000'));
                            } else {
                                this.deleteMany(input.query,
                                    Object.assign({}, this.dataBase.getOptions().modelRemoveOptions || {
                                        j: false
                                    }, operationOptions)).then(success => {
                                        let result = success.result || {};
                                        result.models = response;
                                        resolve(result);
                                    }).catch(error => {
                                        reject(new CLASSES.NodicsError(error, null, 'ERR_MDL_00000'));
                                    });
                            }
                        });
                    } else {
                        this.deleteMany(input.query, Object.assign({}, this.dataBase.getOptions().modelRemoveOptions || {
                            j: false
                        }, operationOptions)).then(success => {
                            resolve(success.result);
                        }).catch(error => {
                            reject(new CLASSES.NodicsError(error, null, 'ERR_MDL_00000'));
                        });
                    }
                } else {
                    reject(new CLASSES.NodicsError('ERR_MDL_00003'));
                }
            });
        }
    }
};
