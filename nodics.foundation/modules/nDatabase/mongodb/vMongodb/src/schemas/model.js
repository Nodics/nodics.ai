/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require('lodash');

/**
 * @module nodics.foundation/modules/nDatabase/mongodb/vMongodb/src/schemas/model
 * @description Defines nDatabase schema metadata, model contracts, and generated capability settings.
 * @layer schemas
 * @owner nDatabase
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
    default: {
        /**
         * Normalizes MongoDB getItems responses for versioned model operations.
         *
         * @param {*} response getItems response or direct item array.
         * @returns {Object[]} Matched items.
         */
        getMatchedItems: function (response) {
            if (Array.isArray(response)) {
                return response;
            }
            if (response && Array.isArray(response.result)) {
                return response.result;
            }
            return [];
        },

        /**
         * Detects an idempotent replay of an already persisted version.
         * Runtime-maintained audit fields are excluded because a repeated API
         * or governed import request receives fresh timestamps before it reaches
         * persistence. All business fields must remain identical.
         *
         * @param {Object} previous Latest persisted version.
         * @param {Object} candidate Candidate model supplied by the caller.
         * @returns {boolean} True when the candidate is an unchanged replay.
         */
        isIdempotentVersionReplay: function (previous, candidate) {
            const runtimeFields = ['_id', 'created', 'updated'];
            return _.isEqual(_.omit(previous, runtimeFields), _.omit(candidate, runtimeFields));
        },

        /**
         * Builds the next persisted version from the previous one and the
         * caller-provided model. Governed data refreshes treat arrays as
         * complete field values; lodash's default array merge preserves old tail
         * elements and can leak stale CMS/product relationships into the next
         * published version.
         *
         * @param {Object} previous Latest persisted version.
         * @param {Object} candidate Incoming candidate version.
         * @param {Object} options Save options supplied by the caller.
         * @returns {Object} Merged version candidate.
         */
        mergeNextVersion: function (previous, candidate, options) {
            if (options && options.replaceArraysOnVersionMerge === true) {
                return _.mergeWith(previous, candidate, function (targetValue, sourceValue) {
                    if (Array.isArray(sourceValue)) {
                        return sourceValue;
                    }
                    return undefined;
                });
            }
            return _.merge(previous, candidate);
        },

        /**
         * Validates model rules.
         *
         * @param {*} query Method input.
         * @param {*} searchOptions Method input.
         * @param {*} model Method input.
         * @returns {*} Method result.
         */
        validateModel: function (query, searchOptions, model, options) {
            return new Promise((resolve, reject) => {
                if (!model) {
                    reject(new CLASSES.NodicsError('ERR_MDL_00001'));
                } else if (model.versionId === undefined || model.versionId < 0) {
                    reject(new CLASSES.NodicsError('ERR_MDL_00004'));
                }
                try {
                    let customQuery = _.merge({}, query);
                    delete customQuery.versionId;
                    let customOptions = _.merge(_.merge({}, searchOptions), {
                        limit: 1,
                        sort: { versionId: -1 },
                        projection: { _id: 0 }
                    });
                    this.getItems({
                        query: customQuery,
                        searchOptions: customOptions
                    }).then(success => {
                        let matchedItems = this.getMatchedItems(success);
                        if (matchedItems.length > 0) {
                            let preMoidel = matchedItems[0];
                            preMoidel.versionId = (preMoidel.versionId === undefined) ? -1 : preMoidel.versionId;
                            if (model.versionId === preMoidel.versionId && this.isIdempotentVersionReplay(preMoidel, model)) {
                                resolve({ model: preMoidel, idempotentReplay: true });
                            } else if (model.versionId <= preMoidel.versionId) {
                                reject(new CLASSES.NodicsError('ERR_MDL_00004', model.versionId + ', it should be: ' + (preMoidel.versionId + 1)));
                            } else {
                                model.versionId = preMoidel.versionId + 1;
                                resolve({ model: this.mergeNextVersion(preMoidel, model, options), idempotentReplay: false });
                            }
                        } else {
                            if (model.versionId > 0) {
                                reject(new CLASSES.NodicsError('ERR_MDL_00004', model.versionId + ', it should be: 0'));
                            } else {
                                resolve({ model: model, idempotentReplay: false });
                            }
                        }
                    }).catch(error => {
                        reject(error);
                    });
                } catch (error) {
                    reject(error);
                }
            });
        },

        /**

         * Updates versioned items information.

         *

         * @param {*} input Method input.

         * @returns {*} Method result.

         */

        saveVersionedItems: function (input) {
            let _self = this;
            return new Promise((resolve, reject) => {
                try {
                    _self.validateModel(input.query, input.searchOptions, input.model, input.options).then(validation => {
                        let model = validation.model;
                        if (validation.idempotentReplay) {
                            resolve(model);
                            return;
                        }
                        _self.insertOne(model, {}).then(result => {
                            if (result.ops && result.ops.length > 0) {
                                resolve(result.ops[0]);
                            } else if (result && result.acknowledged === true && result.insertedId) {
                                resolve(Object.assign({}, model, { _id: model._id || result.insertedId }));
                            } else {
                                reject(new CLASSES.NodicsError('ERR_MDL_00002'));
                            }
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                } catch (error) {
                    reject(error);
                }
            });
        },

        /**

         * Retrieves previous items information.

         *

         * @param {*} matchedItems Method input.

         * @param {*} newItem Method input.

         * @param {*} finalizeData Method input.

         * @returns {*} Method result.

         */

        fetchPreviousItems: function (matchedItems, newItem, finalizeData) {
            let _self = this;
            return new Promise((resolve, reject) => {
                try {
                    if (matchedItems && matchedItems.length > 0) {
                        let currentMatchedItem = matchedItems.shift();
                        let customQuery = {};
                        customQuery[_self.primaryKey] = currentMatchedItem[_self.primaryKey];
                        this.getItems({
                            query: customQuery,
                            searchOptions: {
                                limit: 1,
                                sort: { versionId: -1 },
                                projection: { _id: 0 }
                        }
                    }).then(success => {
                            let previousItems = _self.getMatchedItems(success);
                            if (previousItems.length > 0) {
                                let data = _.merge(previousItems[0], newItem);
                                data.versionId = (data.versionId === undefined) ? 1 : data.versionId + 1;
                                finalizeData.push(data);
                            }
                            _self.fetchPreviousItems(matchedItems, newItem, finalizeData).then(success => {
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
                } catch (error) {
                    reject(error);
                }
            });

        },

        /**

         * Updates versioned items information.

         *

         * @param {*} input Method input.

         * @returns {*} Method result.

         */

        updateVersionedItems: function (input) {
            let _self = this;
            return new Promise((resolve, reject) => {
                try {
                    _self.getItems(input).then(items => {
                        let matchedItems = _self.getMatchedItems(items);
                        if (matchedItems.length > 0) {
                            let finalizeData = [];
                            _self.fetchPreviousItems(matchedItems, input.model, finalizeData).then(success => {
                                if (finalizeData.length > 0) {
                                    _self.insertMany(finalizeData, {}).then(success => {
                                        resolve(success);
                                    }).catch(error => {
                                        reject(error);
                                    });
                                } else {
                                    reject(new CLASSES.NodicsError('ERR_MDL_00000', 'None items found to be updated'));
                                }
                            }).catch(error => {
                                reject(error);
                            });
                        } else {
                            reject(new CLASSES.NodicsError('ERR_MDL_00000', 'None items found to be updated'));
                        }
                    }).catch(error => {
                        reject(error);
                    });
                } catch (error) {
                    reject(error);
                }
            });
        }
    }
};
