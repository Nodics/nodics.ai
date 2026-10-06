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
         * Builds a bounded current-record view before applying business/ownership filters and pagination.
         * @param {Object} input Trusted generated-model request with normalized search options.
         * @returns {Object[]} MongoDB aggregation stages; never a publication activation selector.
         */
        buildCurrentVersionPipeline: function (input) {
            const options = input.searchOptions || {};
            if (
                typeof this.primaryKey !== 'string' ||
                !/^[A-Za-z_][A-Za-z0-9_]*$/.test(this.primaryKey) ||
                !Number.isSafeInteger(options.limit) ||
                options.limit <= 0 ||
                (options.collation !== undefined &&
                    !_.isEqual(options.collation, { locale: 'simple' })) ||
                (options.skip !== undefined &&
                    (!Number.isSafeInteger(options.skip) ||
                        options.skip < 0)) ||
                (options.sort !== undefined &&
                    (!_.isPlainObject(options.sort) ||
                        !Object.values(options.sort).every(
                            (value) => value === 1 || value === -1,
                        ))) ||
                (options.projection !== undefined &&
                    (!_.isPlainObject(options.projection) ||
                        !Object.values(options.projection).every((value) =>
                            [0, 1, false, true].includes(value),
                        )))
            ) {
                throw new CLASSES.NodicsError(
                    'ERR_MDL_00000',
                    'Current-version reads require a logical identity, bounded paging, simple collation and simple sort/projection options',
                );
            }
            const sort = Object.assign({}, options.sort || {});
            if (!Object.prototype.hasOwnProperty.call(sort, this.primaryKey))
                sort[this.primaryKey] = 1;
            const page = [{ $sort: sort }];
            if (options.skip) page.push({ $skip: options.skip });
            page.push({ $limit: options.limit });
            if (!_.isEmpty(options.projection))
                page.push({ $project: _.cloneDeep(options.projection) });
            return [
                { $sort: { [this.primaryKey]: 1, versionId: -1 } },
                {
                    $group: {
                        _id: '$' + this.primaryKey,
                        record: { $first: '$$ROOT' },
                    },
                },
                { $replaceRoot: { newRoot: '$record' } },
                { $match: _.cloneDeep(input.query || {}) },
                { $facet: { metadata: [{ $count: 'count' }], result: page } },
            ];
        },

        /**
         * Reads one latest authoring record per logical identity through the existing MongoDB model.
         * @param {Object} input Trusted generated-model request; authorization and tenant selection precede this call.
         * @returns {Promise<Object>} Standard query/options/count/result envelope.
         */
        getCurrentVersionItems: async function (input) {
            await this.guardProtectedRead(input);
            if (input.internalPersistence !== undefined) {
                throw new CLASSES.NodicsError(
                    'ERR_MDL_00000',
                    'Private journals cannot use current-version aggregation',
                );
            }
            const pipeline = this.buildCurrentVersionPipeline(input);
            const options = Object.assign(
                {},
                _.pick(input.searchOptions || {}, [
                    'maxTimeMS',
                    'hint',
                    'readConcern',
                    'readPreference',
                    'comment',
                    'allowDiskUse',
                ]),
                { collation: { locale: 'simple' } },
                this.transactionOptions(input, this),
            );
            const result = await this.cursorToArray(
                this.aggregate(pipeline, options),
            );
            if (
                !Array.isArray(result) ||
                result.length !== 1 ||
                !result[0] ||
                !Array.isArray(result[0].metadata) ||
                result[0].metadata.length > 1 ||
                (result[0].metadata.length === 1 &&
                    !_.isPlainObject(result[0].metadata[0])) ||
                !Array.isArray(result[0].result)
            ) {
                throw new CLASSES.NodicsError(
                    'ERR_MDL_00000',
                    'Current-version read returned an invalid response',
                );
            }
            const count = result[0].metadata.length
                ? result[0].metadata[0].count
                : 0;
            if (
                !Number.isSafeInteger(count) ||
                count < 0 ||
                result[0].result.length !==
                    Math.min(
                        input.searchOptions.limit,
                        Math.max(0, count - (input.searchOptions.skip || 0)),
                    ) ||
                !result[0].result.every((item) => _.isPlainObject(item))
            ) {
                throw new CLASSES.NodicsError(
                    'ERR_MDL_00000',
                    'Current-version read returned inconsistent evidence',
                );
            }
            return this.projectReadResult(input, {
                query: input.query,
                options: input.searchOptions,
                count,
                result: result[0].result,
            });
        },

        /**
         * Normalizes MongoDB getItems responses for versioned model operations.
         *
         * @param {*} response getItems response or direct item array.
         * @returns {Object[]} Matched items.
         * @throws {CLASSES.NodicsError} When a failed or malformed read cannot establish history.
         */
        getMatchedItems: function (response) {
            const items = Array.isArray(response)
                ? response
                : response && response.success !== false && !response.error
                  ? response.result
                  : undefined;
            if (
                Array.isArray(items) &&
                items.every((item) => _.isPlainObject(item))
            ) {
                return items;
            }
            throw new CLASSES.NodicsError(
                'ERR_MDL_00000',
                'Version history read returned an invalid response',
            );
        },

        /** Validates persisted version identity; ordinary records require an explicit owning migration before versioned writes. */
        getStoredVersionId: function (model) {
            if (
                !model ||
                !Number.isSafeInteger(model.versionId) ||
                model.versionId < 0
            ) {
                throw new CLASSES.NodicsError(
                    'ERR_MDL_00004',
                    'Stored version identity is invalid; installed-data qualification is required',
                );
            }
            return model.versionId;
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
            return _.isEqual(
                _.omit(previous, runtimeFields),
                _.omit(candidate, runtimeFields),
            );
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
                return _.mergeWith(
                    previous,
                    candidate,
                    function (targetValue, sourceValue) {
                        if (Array.isArray(sourceValue)) {
                            return sourceValue;
                        }
                        return undefined;
                    },
                );
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
                    return;
                } else if (
                    !Number.isSafeInteger(model.versionId) ||
                    model.versionId < 0
                ) {
                    reject(new CLASSES.NodicsError('ERR_MDL_00004'));
                    return;
                }
                try {
                    let customQuery = _.merge({}, query);
                    delete customQuery.versionId;
                    let customOptions = _.merge(_.merge({}, searchOptions), {
                        limit: 1,
                        sort: { versionId: -1 },
                        projection: { _id: 0 },
                    });
                    this.getItems({
                        query: customQuery,
                        searchOptions: customOptions,
                    })
                        .then((success) => {
                            let matchedItems = this.getMatchedItems(success);
                            if (matchedItems.length > 0) {
                                let preMoidel = matchedItems[0];
                                this.getStoredVersionId(preMoidel);
                                if (
                                    model.versionId === preMoidel.versionId &&
                                    this.isIdempotentVersionReplay(
                                        preMoidel,
                                        model,
                                    )
                                ) {
                                    resolve({
                                        model: preMoidel,
                                        idempotentReplay: true,
                                    });
                                } else if (
                                    model.versionId <= preMoidel.versionId
                                ) {
                                    reject(
                                        new CLASSES.NodicsError(
                                            'ERR_MDL_00004',
                                            model.versionId +
                                                ', it should be: ' +
                                                (preMoidel.versionId + 1),
                                        ),
                                    );
                                } else {
                                    model.versionId = preMoidel.versionId + 1;
                                    resolve({
                                        model: this.mergeNextVersion(
                                            _.cloneDeep(preMoidel),
                                            model,
                                            options,
                                        ),
                                        idempotentReplay: false,
                                    });
                                }
                            } else {
                                if (model.versionId > 0) {
                                    reject(
                                        new CLASSES.NodicsError(
                                            'ERR_MDL_00004',
                                            model.versionId +
                                                ', it should be: 0',
                                        ),
                                    );
                                } else {
                                    resolve({
                                        model: model,
                                        idempotentReplay: false,
                                    });
                                }
                            }
                        })
                        .catch((error) => {
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
                    _self
                        .validateModel(
                            input.query,
                            input.searchOptions,
                            input.model,
                            input.options,
                        )
                        .then((validation) => {
                            let model = validation.model;
                            if (validation.idempotentReplay) {
                                resolve(model);
                                return;
                            }
                            _self
                                .insertOne(model, {})
                                .then((result) => {
                                    if (result.ops && result.ops.length > 0) {
                                        resolve(result.ops[0]);
                                    } else if (
                                        result &&
                                        result.acknowledged === true &&
                                        result.insertedId
                                    ) {
                                        resolve(
                                            Object.assign({}, model, {
                                                _id:
                                                    model._id ||
                                                    result.insertedId,
                                            }),
                                        );
                                    } else {
                                        reject(
                                            new CLASSES.NodicsError(
                                                'ERR_MDL_00002',
                                            ),
                                        );
                                    }
                                })
                                .catch((error) => {
                                    reject(error);
                                });
                        })
                        .catch((error) => {
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

         * @param {Object} input Original request carrying the trusted transaction context.

         * @returns {*} Method result.

         */

        fetchPreviousItems: function (
            matchedItems,
            newItem,
            finalizeData,
            input,
        ) {
            let _self = this;
            return new Promise((resolve, reject) => {
                try {
                    if (matchedItems && matchedItems.length > 0) {
                        let currentMatchedItem = matchedItems.shift();
                        let customQuery = {};
                        customQuery[_self.primaryKey] =
                            currentMatchedItem[_self.primaryKey];
                        this.getItems({
                            query: customQuery,
                            transactionContext:
                                input && input.transactionContext,
                            searchOptions: {
                                limit: 1,
                                sort: { versionId: -1 },
                                collation: { locale: 'simple' },
                                projection: { _id: 0 },
                            },
                        })
                            .then((success) => {
                                let previousItems =
                                    _self.getMatchedItems(success);
                                if (
                                    previousItems.length !== 1 ||
                                    previousItems[0][_self.primaryKey] !==
                                        currentMatchedItem[_self.primaryKey] ||
                                    _self.getStoredVersionId(
                                        previousItems[0],
                                    ) !==
                                        _self.getStoredVersionId(
                                            currentMatchedItem,
                                        )
                                ) {
                                    throw new CLASSES.NodicsError(
                                        'ERR_MDL_00004',
                                        'Selected version changed or disappeared; reselect before updating',
                                    );
                                }
                                if (
                                    Object.prototype.hasOwnProperty.call(
                                        newItem,
                                        '_id',
                                    ) ||
                                    (Object.prototype.hasOwnProperty.call(
                                        newItem,
                                        _self.primaryKey,
                                    ) &&
                                        newItem[_self.primaryKey] !==
                                            currentMatchedItem[
                                                _self.primaryKey
                                            ])
                                ) {
                                    throw new CLASSES.NodicsError(
                                        'ERR_MDL_00004',
                                        'Versioned updates cannot replace logical or storage identity',
                                    );
                                }
                                const previousVersionId =
                                    _self.getStoredVersionId(previousItems[0]);
                                if (
                                    previousVersionId ===
                                    Number.MAX_SAFE_INTEGER
                                ) {
                                    throw new CLASSES.NodicsError(
                                        'ERR_MDL_00004',
                                        'Stored version identity is exhausted',
                                    );
                                }
                                let data = _self.mergeNextVersion(
                                    _.cloneDeep(previousItems[0]),
                                    _.cloneDeep(newItem),
                                    {
                                        replaceArraysOnVersionMerge: true,
                                    },
                                );
                                delete data._id;
                                data.versionId = previousVersionId + 1;
                                finalizeData.push(data);
                                _self
                                    .fetchPreviousItems(
                                        matchedItems,
                                        newItem,
                                        finalizeData,
                                        input,
                                    )
                                    .then((success) => {
                                        resolve(true);
                                    })
                                    .catch((error) => {
                                        reject(error);
                                    });
                            })
                            .catch((error) => {
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

        /** Selects one newest matched version per logical identity without consuming provider-owned arrays. */
        selectVersionedUpdateItems: function (response) {
            const selected = new Map();
            this.getMatchedItems(response).forEach((item) => {
                const identity = item[this.primaryKey];
                if (
                    !(
                        (typeof identity === 'string' && identity.length > 0) ||
                        (typeof identity === 'number' &&
                            Number.isFinite(identity))
                    )
                ) {
                    throw new CLASSES.NodicsError(
                        'ERR_MDL_00004',
                        'Versioned updates require a scalar logical identity',
                    );
                }
                const version = this.getStoredVersionId(item);
                const previous = selected.get(identity);
                if (!previous || version > previous.versionId)
                    selected.set(identity, item);
            });
            return Array.from(selected.values());
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
                    _self
                        .getItems(input)
                        .then((items) => {
                            let matchedItems =
                                _self.selectVersionedUpdateItems(items);
                            if (matchedItems.length > 0) {
                                let finalizeData = [];
                                _self
                                    .fetchPreviousItems(
                                        matchedItems,
                                        input.model,
                                        finalizeData,
                                        input,
                                    )
                                    .then((success) => {
                                        if (finalizeData.length > 0) {
                                            _self
                                                .insertMany(
                                                    finalizeData,
                                                    _self.transactionOptions(
                                                        input,
                                                        _self,
                                                    ),
                                                )
                                                .then((success) => {
                                                    resolve(success);
                                                })
                                                .catch((error) => {
                                                    reject(error);
                                                });
                                        } else {
                                            reject(
                                                new CLASSES.NodicsError(
                                                    'ERR_MDL_00000',
                                                    'None items found to be updated',
                                                ),
                                            );
                                        }
                                    })
                                    .catch((error) => {
                                        reject(error);
                                    });
                            } else {
                                reject(
                                    new CLASSES.NodicsError(
                                        'ERR_MDL_00000',
                                        'None items found to be updated',
                                    ),
                                );
                            }
                        })
                        .catch((error) => {
                            reject(error);
                        });
                } catch (error) {
                    reject(error);
                }
            });
        },
    },
};
