/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

const _ = require("lodash");

/**
 * @module nodics.foundation/modules/nDatabase/mongodb/src/schemas/model
 * @description Defines nDatabase schema metadata, model contracts, and generated capability settings.
 * @layer schemas
 * @owner nDatabase
 * @override Project modules may override this behavior through later active modules while preserving the published capability contract.
 */
module.exports = {
  default: {
    /** Advertises only this adapter's unversioned revision CAS with private metadata-only retirement return projection. @returns {Object} Source capability, not installed writer qualification. */
    credentialRetirementCapabilities: function () {
      return {
        contractVersion: 1,
        revisionCas: this.versioned !== true,
        metadataOnlyReadback: this.versioned !== true,
      };
    },
    /** Advertises the internal durable protocol only for a discovered writable provider and unversioned model. */
    persistenceCapabilities: function () {
      const capabilities =
        this.dataBase && typeof this.dataBase.getCapabilities === "function"
          ? this.dataBase.getCapabilities()
          : {};
      const persistence = (capabilities && capabilities.persistence) || {};
      const supported =
        this.versioned !== true &&
        persistence.contractVersion === 1 &&
        persistence.durableJournal === true &&
        persistence.primaryMajorityReadback === true;
      return {
        durableJournal: supported,
        primaryMajorityReadback: supported,
        contractVersion: 1,
      };
    },

    /** Resolves one allowlisted internal policy; never merges request-supplied driver durability options. */
    internalPersistenceOptions: function (input, read) {
      if (input.internalPersistence === undefined) return {};
      if (
        input.internalPersistence !== "DURABLE_JOURNAL" ||
        input.transactionContext ||
        this.persistenceCapabilities().durableJournal !== true
      ) {
        throw new CLASSES.NodicsError(
          "ERR_MDL_00005",
          "Qualified internal durable journal persistence required",
        );
      }
      return read
        ? {
            readPreference: "primary",
            readConcern: { level: "majority" },
            collation: { locale: "simple" },
          }
        : Object.assign(
            { writeConcern: { w: "majority", j: true } },
            input.operation === "create"
              ? {}
              : { collation: { locale: "simple" } },
          );
    },

    /** Rejects failed, ambiguous or write-concern-error command responses before journal acknowledgement. */
    validateDurableAcknowledgement: function (result, create) {
      if (
        !result ||
        result.writeConcernError ||
        (result.writeConcernErrors && result.writeConcernErrors.length) ||
        (result.writeErrors && result.writeErrors.length) ||
        result.acknowledged === false ||
        (create
          ? result.acknowledged !== true
          : result.ok !== 1 ||
            !Object.prototype.hasOwnProperty.call(result, "value"))
      ) {
        throw new CLASSES.NodicsError(
          "ERR_MDL_00005",
          "Durable journal write was not acknowledged",
        );
      }
    },

    /**
     * Performs a single managed record mutation atomically and returns the
     * persisted document, never a reconstructed pre-write snapshot.
     * The generated pipeline owns authorization and concurrency policy.
     */
    compareAndSetItem: async function (input) {
      const durable = input.internalPersistence !== undefined;
      const options = Object.assign(
        {},
        this.transactionOptions(input, this),
        this.internalPersistenceOptions(input, false),
      );
      const retirementProjection =
        SERVICE.DefaultModelConcurrencyService?.credentialRetirementProjection(
          input,
        );
      if (retirementProjection) options.projection = retirementProjection;
      try {
        if (durable && !["create", "update"].includes(input.operation)) {
          throw new CLASSES.NodicsError(
            "ERR_MDL_00005",
            "Durable journal permits only insert or conditional update",
          );
        }
        if (input.operation === "create") {
          const model = this.normalizeModelForWrite(input.model);
          await SERVICE.DefaultModelValidatorService.validateMandate(
            model,
            this.rawSchema,
          );
          await SERVICE.DefaultModelValidatorService.validateDataType(
            model,
            this.rawSchema,
          );
          const result = await this.insertOne(model, options);
          if (durable || input.insertOnly === true)
            this.validateDurableAcknowledgement(result, true);
          if (!result.acknowledged && !(result.ops && result.ops.length))
            throw new CLASSES.NodicsError("ERR_MDL_00005");
          return Object.assign({}, model, {
            _id: result.insertedId || result.ops[0]._id,
          });
        }
        const result =
          input.operation === "remove"
            ? await this.findOneAndDelete(
                input.query,
                Object.assign({}, options, {
                  includeResultMetadata: true,
                }),
              )
            : await this.findOneAndUpdate(
                input.query,
                {
                  $set: this.normalizeModelForWrite(input.model),
                },
                Object.assign({}, options, {
                  upsert: false,
                  returnDocument: "after",
                  includeResultMetadata: true,
                }),
              );
        if (durable) this.validateDurableAcknowledgement(result, false);
        if (
          retirementProjection &&
          (!result ||
            result.ok !== 1 ||
            !Object.prototype.hasOwnProperty.call(result, "value") ||
            result.acknowledged === false ||
            result.writeConcernError ||
            result.writeConcernErrors?.length ||
            result.writeErrors?.length)
        ) {
          throw new CLASSES.NodicsError("ERR_MDL_00005");
        }
        return result && Object.prototype.hasOwnProperty.call(result, "value")
          ? result.value
          : result;
      } catch (error) {
        if (error && error.code === 11000)
          throw new CLASSES.NodicsError("ERR_CONCURRENCY_00001");
        throw error;
      }
    },
    /**
     * Builds transaction-aware MongoDB operation options.
     */
    transactionOptions: function (input, schemaModel) {
      if (
        typeof SERVICE === "undefined" ||
        !SERVICE.DefaultDatabaseTransactionService
      ) {
        return {};
      }
      return SERVICE.DefaultDatabaseTransactionService.operationOptions(
        input.transactionContext,
        schemaModel.dataBase,
        schemaModel,
      );
    },

    /**
     * Determines whether a model contains MongoDB update operators.
     */
    isMongoUpdateOperatorPayload: function (model) {
      return model && Object.keys(model).some((key) => key.indexOf("$") === 0);
    },

    /**
     * Resolves schema-declared date fields for generated MongoDB writes.
     */
    dateFieldNames: function () {
      let definition =
        this.rawSchema && this.rawSchema.definition
          ? this.rawSchema.definition
          : {};
      return Object.keys(definition).filter((key) => {
        let descriptor = definition[key] || {};
        return String(descriptor.type || "").toLowerCase() === "date";
      });
    },

    /**
     * Coerces JSON date strings into BSON Date values for schema date fields.
     */
    normalizeDateValue: function (value) {
      if (value instanceof Date) return value;
      if (typeof value !== "string") return value;
      let trimmed = value.trim();
      if (!trimmed) return value;
      let parsed = Date.parse(trimmed);
      return Number.isFinite(parsed) ? new Date(parsed) : value;
    },

    /**
     * Coerces schema-declared date properties in a plain object.
     */
    normalizeDateFields: function (model) {
      if (!model || typeof model !== "object" || Array.isArray(model))
        return model;
      let dateFields = this.dateFieldNames();
      if (dateFields.length === 0) return model;
      let normalized = Object.assign({}, model);
      dateFields.forEach((field) => {
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
      if (!this.isMongoUpdateOperatorPayload(model))
        return this.normalizeDateFields(model);
      let normalized = Object.assign({}, model);
      if (
        normalized.$set &&
        typeof normalized.$set === "object" &&
        !Array.isArray(normalized.$set)
      ) {
        normalized.$set = this.normalizeDateFields(normalized.$set);
      }
      let dateFields = this.dateFieldNames();
      Object.keys(normalized).forEach((key) => {
        if (key.indexOf("$") !== 0 && dateFields.indexOf(key) >= 0)
          normalized[key] = this.normalizeDateValue(normalized[key]);
      });
      return normalized;
    },

    /**
     * Builds the MongoDB update document for a model payload.
     */
    buildUpdateDocument: function (model) {
      let normalizedModel = this.normalizeModelForWrite(model);
      if (!this.isMongoUpdateOperatorPayload(normalizedModel))
        return { $set: normalizedModel };
      return Object.keys(normalizedModel).reduce((updateDocument, key) => {
        if (key.indexOf("$") === 0) {
          updateDocument[key] =
            key === "$set"
              ? Object.assign(
                  {},
                  updateDocument[key] || {},
                  normalizedModel[key] || {},
                )
              : normalizedModel[key];
        } else {
          updateDocument.$set = Object.assign({}, updateDocument.$set || {}, {
            [key]: normalizedModel[key],
          });
        }
        return updateDocument;
      }, {});
    },

    /**
     * Counts models through the active MongoDB adapter contract.
     */
    countMatchingItems: async function (query, cursor, input) {
      const request = input || { query };
      if (request.query !== query)
        throw new CLASSES.NodicsError("ERR_AUTH_00003");
      await this.guardProtectedRead(request);
      if (typeof this.countDocuments === "function") {
        return this.countDocuments(request.query);
      }
      if (cursor && typeof cursor.count === "function") {
        if (this.rawSchema?.readProtection !== undefined)
          throw new CLASSES.NodicsError("ERR_AUTH_00003");
        return cursor.count();
      }
      if (this.rawSchema?.readProtection !== undefined)
        throw new CLASSES.NodicsError("ERR_AUTH_00003");
      return Promise.resolve(0);
    },

    /**
     * Reads a MongoDB cursor through callback or promise style adapters.
     */
    cursorToArray: function (cursor) {
      if (cursor && cursor.toArray && cursor.toArray.length > 0) {
        return new Promise((resolve, reject) => {
          cursor.toArray((error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          });
        });
      }
      return cursor.toArray();
    },

    /**
     * Applies an update payload to a returned model snapshot.
     */
    mergeUpdatedSnapshot: function (snapshot, model) {
      if (!this.isMongoUpdateOperatorPayload(model))
        return _.merge(snapshot, model);
      if (model.$set) _.merge(snapshot, model.$set);
      if (model.$unset)
        Object.keys(model.$unset).forEach((key) => _.unset(snapshot, key));
      return snapshot;
    },

    /** Enforces prepared-schema privacy before invoking this adapter's find/count paths. @param {Object} input Exact provider request. @returns {Promise<boolean>} Read permission. */
    guardProtectedRead: async function (input) {
      const owner = SERVICE.DefaultSchemaReadAccessPolicyService;
      if (typeof owner?.providerRead === "function")
        return owner.providerRead(input, this);
      if (this.rawSchema?.readProtection !== undefined)
        throw new CLASSES.NodicsError("ERR_AUTH_00003");
      return true;
    },

    /** Executes and projects a Mongo cursor without exposing an unredacted helper result. @param {Object} input Exact provider request. @returns {Promise<Object>} Projected provider envelope. */
    getItems: async function (input) {
      await this.guardProtectedRead(input);
      let success;
      try {
        const durableOptions = this.internalPersistenceOptions(input, true);
        if (input.internalPersistence !== undefined) {
          success = await this.getDurableJournalItems(input, durableOptions);
        } else {
          const operationOptions = this.transactionOptions(input, this);
          let cursor = this.find(
            input.query,
            Object.assign({}, input.searchOptions || {}, operationOptions),
          );
          if (
            input.searchOptions?.sort &&
            !UTILS.isBlank(input.searchOptions.sort)
          )
            cursor = cursor.sort(input.searchOptions.sort);
          const count = input.transactionContext
            ? null
            : await this.countMatchingItems(input.query, cursor, input);
          const result = await this.cursorToArray(cursor);
          success = {
            options: input.searchOptions,
            query: input.query,
            count: count === null ? result.length : count,
            result,
          };
        }
      } catch (error) {
        if (input.internalPersistence !== undefined) throw error;
        throw new CLASSES.NodicsError(
          error,
          "While executing find operation",
          error.code || "ERR_MDL_00000",
        );
      }
      return this.projectReadResult(input, success);
    },

    /** Applies current prepared-schema result privacy to ordinary and variant read envelopes. @param {Object} input Original scoped request. @param {Object} success Native query envelope. @returns {Promise<Object>} Owner-projected envelope. */
    projectReadResult: async function (input, success) {
      const response = { success };
      const owner = SERVICE.DefaultSchemaReadAccessPolicyService;
      if (typeof owner?.providerResult === "function")
        await owner.providerResult(input, response, this);
      else if (this.rawSchema?.readProtection !== undefined)
        throw new CLASSES.NodicsError("ERR_AUTH_00003");
      return response.success;
    },

    /** Reads bounded full journal records and count from primary majority state, ignoring caller driver overrides. */
    getDurableJournalItems: async function (input, options) {
      await this.guardProtectedRead(input);
      const search = input.searchOptions || {};
      if (
        !Number.isSafeInteger(search.limit) ||
        search.limit < 1 ||
        Object.keys(search).some((key) => !["limit"].includes(key))
      ) {
        throw new CLASSES.NodicsError(
          "ERR_MDL_00000",
          "Durable journal read requires only a bounded limit",
        );
      }
      const cursor = this.find(
        input.query,
        Object.assign({ limit: search.limit }, options),
      );
      const result = await this.cursorToArray(cursor);
      await this.guardProtectedRead(input);
      const count = await this.countDocuments(input.query, options);
      if (
        !Array.isArray(result) ||
        !Number.isSafeInteger(count) ||
        count < 0 ||
        result.length !== Math.min(count, search.limit)
      ) {
        throw new CLASSES.NodicsError(
          "ERR_MDL_00000",
          "Inconsistent durable journal readback",
        );
      }
      return this.projectReadResult(input, {
        query: input.query,
        options: input.searchOptions,
        count,
        result,
      });
    },

    /** Requires a concrete declared identity matching the model before multi-match replacement. @param {Object} input Generated save request. @returns {undefined} @throws {CLASSES.NodicsError} For empty, operator or nonidentity selectors. */
    assertReplacementIdentity: function (input) {
      if (input.options?.replaceAllMatchesByQuery !== true) return;
      const query = input.query;
      const scalar = (value) =>
        (typeof value === "string" &&
          value.trim().length > 0 &&
          !value.startsWith("$")) ||
        (typeof value === "number" && Number.isFinite(value)) ||
        Boolean(
          value &&
          typeof value.toHexString === "function" &&
          value._bsontype === "ObjectId",
        );
      const keys = Object.keys(query || {});
      const definition = this.rawSchema?.definition || {};
      const identities = Object.keys(definition).filter(
        (key) => definition[key].primary === true,
      );
      const exact = (key) =>
        scalar(query[key]) &&
        (input.model[key] === undefined
          ? key === "_id"
          : _.isEqual(query[key], input.model[key]));
      if (
        !_.isPlainObject(query) ||
        keys.length === 0 ||
        keys.some(
          (key) =>
            key.startsWith("$") ||
            key.includes(".") ||
            !(scalar(query[key]) || typeof query[key] === "boolean"),
        ) ||
        !(exact("_id") || (identities.length > 0 && identities.every(exact)))
      ) {
        throw new CLASSES.NodicsError(
          "ERR_MDL_00005",
          "Replacement requires an explicit canonical identity",
        );
      }
    },

    /** Creates or upserts models in MongoDB. */
    saveItems: function (input) {
      return new Promise((resolve, reject) => {
        this.assertReplacementIdentity(input);
        let operationOptions = this.transactionOptions(input, this);
        if (!input.model) {
          reject(new CLASSES.NodicsError("ERR_MDL_00001"));
        } else if (input.query && !UTILS.isBlank(input.query)) {
          try {
            input.model = this.normalizeModelForWrite(input.model);
            let updateDocument = { $set: input.model };
            let saveOne = () =>
              this.findOneAndUpdate(
                input.query,
                updateDocument,
                Object.assign(
                  {},
                  this.dataBase.getOptions().modelSaveOptions || {
                    upsert: true,
                    returnDocument: "after",
                  },
                  operationOptions,
                  input.options && input.options.upsert === false
                    ? { upsert: false }
                    : {},
                ),
              );
            let resolveSaved = (result) => {
              if (result && result.ok > 0 && result.value) {
                resolve(result.value);
              } else if (
                result &&
                result.ok > 0 &&
                !(input.options && input.options.upsert === false)
              ) {
                resolve(
                  _.merge(
                    {
                      _id: result.lastErrorObject.upserted,
                    },
                    input.model,
                  ),
                );
              } else {
                reject(new CLASSES.NodicsError("ERR_MDL_00005"));
              }
            };
            if (
              input.options &&
              input.options.replaceAllMatchesByQuery === true
            ) {
              this.countDocuments(input.query)
                .then((count) => {
                  if (count > 0) {
                    return this.updateMany(
                      input.query,
                      updateDocument,
                      Object.assign({ upsert: false }, operationOptions),
                    )
                      .then(() => {
                        return this.find(
                          input.query,
                          Object.assign({ limit: 1 }, operationOptions),
                        ).toArray();
                      })
                      .then((result) => {
                        if (result && result.length > 0) {
                          resolve(result[0]);
                        } else {
                          reject(new CLASSES.NodicsError("ERR_MDL_00005"));
                        }
                      });
                  }
                  return saveOne().then(resolveSaved);
                })
                .catch((error) => {
                  reject(error);
                });
            } else {
              saveOne()
                .then(resolveSaved)
                .catch((error) => {
                  reject(error);
                });
            }
          } catch (error) {
            reject(
              new CLASSES.NodicsError(
                error,
                "While saving items",
                "ERR_MDL_00000",
              ),
            );
          }
        } else {
          try {
            input.model = this.normalizeModelForWrite(input.model);
            SERVICE.DefaultModelValidatorService.validateMandate(
              input.model,
              this.rawSchema,
            )
              .then((success) => {
                return SERVICE.DefaultModelValidatorService.validateDataType(
                  input.model,
                  this.rawSchema,
                );
              })
              .then((success) => {
                return new Promise((resolve, reject) => {
                  this.insertOne(input.model, operationOptions)
                    .then((result) => {
                      if (
                        result.acknowledged ||
                        (result.ops && result.ops.length > 0)
                      ) {
                        input.model._id = result.insertedId;
                        resolve(input.model);
                      } else {
                        reject(new CLASSES.NodicsError("ERR_MDL_00005"));
                      }
                    })
                    .catch((error) => {
                      reject(error);
                    });
                });
              })
              .then((success) => {
                resolve(success);
              })
              .catch((error) => {
                reject(error);
              });
          } catch (error) {
            reject(
              new CLASSES.NodicsError(
                error,
                "While saving new items",
                "ERR_MDL_00000",
              ),
            );
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
          reject(new CLASSES.NodicsError("ERR_MDL_00003"));
        } else if (!input.query || UTILS.isBlank(input.query)) {
          reject(new CLASSES.NodicsError("ERR_MDL_00003"));
        } else {
          if (input.options && input.options.returnModified) {
            this.find(
              input.query,
              Object.assign({}, input.searchOptions || {}, operationOptions),
            ).toArray((error, response) => {
              if (error) {
                reject(new CLASSES.NodicsError(error, null, "ERR_MDL_00000"));
              } else {
                this.updateMany(
                  input.query,
                  this.buildUpdateDocument(input.model),
                  Object.assign(
                    {},
                    this.dataBase.getOptions().modelUpdateOptions || {
                      upsert: false,
                      returnNewDocument: true,
                    },
                    operationOptions,
                  ),
                )
                  .then((success) => {
                    response.forEach((element) => {
                      this.mergeUpdatedSnapshot(element, input.model);
                    });
                    success.models = response;
                    resolve(success);
                  })
                  .catch((error) => {
                    const modelError = new CLASSES.NodicsError(
                      error,
                      null,
                      "ERR_MDL_00000",
                    );
                    modelError.errInfo = error && error.errInfo;
                    reject(modelError);
                  });
              }
            });
          } else {
            this.updateMany(
              input.query,
              this.buildUpdateDocument(input.model),
              Object.assign(
                {},
                this.dataBase.getOptions().modelUpdateOptions || {
                  upsert: false,
                  returnNewDocument: true,
                },
                operationOptions,
              ),
            )
              .then((success) => {
                resolve(success);
              })
              .catch((error) => {
                const modelError = new CLASSES.NodicsError(
                  error,
                  null,
                  "ERR_MDL_00000",
                );
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
            this.find(
              input.query,
              Object.assign({}, input.searchOptions || {}, operationOptions),
            ).toArray((error, response) => {
              if (error) {
                reject(new CLASSES.NodicsError(error, null, "ERR_MDL_00000"));
              } else {
                this.deleteMany(
                  input.query,
                  Object.assign(
                    {},
                    this.dataBase.getOptions().modelRemoveOptions || {
                      j: false,
                    },
                    operationOptions,
                  ),
                )
                  .then((success) => {
                    let result = success.result || success || {};
                    result.models = response;
                    resolve(result);
                  })
                  .catch((error) => {
                    reject(
                      new CLASSES.NodicsError(error, null, "ERR_MDL_00000"),
                    );
                  });
              }
            });
          } else {
            this.deleteMany(
              input.query,
              Object.assign(
                {},
                this.dataBase.getOptions().modelRemoveOptions || {
                  j: false,
                },
                operationOptions,
              ),
            )
              .then((success) => {
                resolve(success.result || success || { deletedCount: 0 });
              })
              .catch((error) => {
                reject(new CLASSES.NodicsError(error, null, "ERR_MDL_00000"));
              });
          }
        } else {
          reject(new CLASSES.NodicsError("ERR_MDL_00003"));
        }
      });
    },
  },
};
