/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module wasteCore/test/helpers/nativePersistenceFixture
 * @description Isolated native Waste schema/index and generated-persistence acceptance. Never selects a business database, credentials, payment evidence or qualification flags.
 * @layer test @owner wasteCore
 * @sideEffects Creates and drops only this invocation's random loopback database. Not a booted-runtime or signed-service qualification.
 */
const path = require("node:path"), crypto = require("node:crypto"), _ = require("lodash");
const { MongoClient } = require("mongodb");
const root = path.resolve(__dirname, "../../../../..");
const foundation = relative => require(path.join(root, "nodics.foundation/modules", relative));
const provider = foundation("nDatabase/mongodb/src/service/model/defaultMongodbDatabaseModelHandlerService");
const modelOwner = foundation("nDatabase/mongodb/src/schemas/model").default;
const save = foundation("nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService");
const update = foundation("nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService");
const connectionOwner = foundation("nDatabase/mongodb/src/service/connection/defaultMongodbDatabaseConnectionHandlerService");
const base = foundation("nDatabase/database/src/schemas/schemas").default;
const quiet = { debug() {}, error() {} };

/** Rejects remote hosts, credentials, selected databases and unsupported URI options before connecting. */
function validateUri(uri) {
  if (typeof uri !== "string" || !/^mongodb:\/\/127\.0\.0\.1:\d+\/?(?:\?replicaSet=[A-Za-z0-9._-]+)?$/.test(uri))
    throw new Error("Explicit credential-free loopback MongoDB URI without a database required");
  const port = Number(uri.match(/:(\d+)/)[1]);
  if (port < 1 || port > 65535) throw new Error("Valid loopback MongoDB port required");
  return uri;
}

/** Redacts MongoDB validator diagnostics to schema field/rule names, never failing record values. */
function validationError(error) {
  if (error?.code !== 121) return error;
  const fields = new Set(), rules = new Set();
  function visit(value) {
    if (!value || typeof value !== "object") return;
    if (typeof value.propertyName === "string") fields.add(value.propertyName);
    if (typeof value.operatorName === "string") rules.add(value.operatorName);
    if (Array.isArray(value.missingProperties)) for (const field of value.missingProperties) if (typeof field === "string") fields.add(field);
    for (const key of ["details", "schemaRulesNotSatisfied", "propertiesNotSatisfied", "itemsNotSatisfied", "schemasNotSatisfied"])
      if (Array.isArray(value[key])) value[key].forEach(visit); else visit(value[key]);
  }
  visit(error.errInfo?.details);
  const sanitized = new Error("Native schema validation refused fields=" + [...fields].sort().join(",") + "; rules=" + [...rules].sort().join(","));
  sanitized.code = 121;
  return sanitized;
}

/** Preserves the canonical pipeline step's request and failure contract. */
async function step(owner, member, request) {
  return new Promise((resolve, reject) => ({ ...owner, LOG: quiet })[member](request, {}, {
    nextSuccess: resolve, error: (_request, _response, error) => reject(error),
  }));
}

/** Builds only the Waste persistence slice; runtime authorization owners remain absent. */
async function create(t, { listing = false } = {}) {
  const uri = validateUri(process.env.NODICS_WASTE_NATIVE_MONGO_URI);
  const previous = Object.fromEntries(["CONFIG", "nConfig", "SERVICE", "CLASSES", "NODICS", "UTILS"].map(key => [key, global[key]]));
  const upper = Object.getOwnPropertyDescriptor(String.prototype, "toUpperCaseFirstChar");
  Object.defineProperty(String.prototype, "toUpperCaseFirstChar", { configurable: true,
    /**
     * Supplies the fixture's string capitalization helper without changing the receiver.
     * @this {String} Nonempty string to capitalize.
     * @returns {string} Uppercased first character followed by the original remainder.
     * @throws {TypeError} If the receiver is empty.
     */
    value: function () { return this[0].toUpperCase() + this.slice(1); } });
  const databaseName = "nodics_waste_test_" + crypto.randomUUID().replaceAll("-", "");
  const tenant = "waste_native_acceptance", models = {}, commands = [];
  const database = new (foundation("nDatabase/database/src/lib/database"))();
  database.setURI(uri);
  database.setOptions(_.cloneDeep(foundation("nDatabase/mongodb/config/properties").database.default.mongodb.options));
  const settings = { databaseTransactions: { enabled: true, failClosed: true, maximumCommitTimeMs: 5000 },
    eWaste: require("../../../../../nodics.accelerators/modules/waste/modules/eWaste/config/properties").eWaste };
  let client, db, created = false;
  global.CONFIG = global.nConfig = { get: key => settings[key] };
  global.CLASSES = { NodicsError: class extends Error {
    constructor(error, message, fallback) {
      super(message || (error instanceof Error ? error.message : error));
      this.code = error instanceof Error ? error.code || fallback : error;
    }
    static enrich(error) { return error; }
  } };
  global.UTILS = { isBlank: value => value == null || Object.keys(value).length === 0,
    createModelName: value => value, isObject: _.isPlainObject };
  global.SERVICE = {
    DefaultDatabaseTransactionService: foundation("nDatabase/database/src/service/transaction/defaultDatabaseTransactionService"),
    DefaultMongodbDatabaseConnectionHandlerService: connectionOwner,
    DefaultMongodbDatabaseModelHandlerService: { ...provider, LOG: quiet },
    DefaultDatabaseModelHandlerService: foundation("nDatabase/database/src/service/model/defaultDatabaseModelHandlerService"),
    DefaultModelConcurrencyService: foundation("nDatabase/database/src/service/schema/defaultModelConcurrencyService"),
    DefaultModelValidatorService: { ...foundation("nDatabase/database/src/service/model/defaultModelValidatorService"), LOG: quiet },
    DefaultPropertyInitialValueProviderService: foundation("nDatabase/database/src/service/init/defaultPropertyInitialValueProviderService"),
    DefaultSchemaReadAccessPolicyService: foundation("nDatabase/database/src/service/schema/defaultSchemaReadAccessPolicyService"),
    DefaultInterceptorService: foundation("nCommon/src/service/interceptor/defaultInterceptorService"),
    DefaultWastePersistenceService: require("../../src/service/defaultWastePersistenceService"),
    DefaultWasteAssetTransferOperationService: require("../../src/service/defaultWasteAssetTransferOperationService"),
    DefaultWasteAssetReversalOperationService: require("../../src/service/defaultWasteAssetReversalOperationService"),
    DefaultDatabaseConfigurationService: {
      getTenantDatabase: (owner, partition) => owner === "wasteCore" && partition === tenant ? { master: database } : undefined,
      getSchemaInterceptors: () => ({}),
    },
  };
  global.NODICS = { getModels: (owner, partition) => owner === "wasteCore" && partition === tenant ? models : {} };

  async function connect() {
    client = await MongoClient.connect(uri, { ignoreUndefined: true, retryWrites: false,
      serverSelectionTimeoutMS: 5000, monitorCommands: true });
    client.on("commandStarted", event => {
      if (["insert", "update", "findAndModify", "find", "commitTransaction", "abortTransaction"].includes(event.commandName))
        commands.push({ name: event.commandName, transaction: event.command.autocommit === false,
          readConcern: event.command.readConcern, writeConcern: event.command.writeConcern });
    });
    db = client.db(databaseName);
    const hello = await db.command({ hello: 1 });
    if (!hello.setName || !hello.isWritablePrimary || !Array.isArray(hello.hosts) ||
        hello.hosts.some(host => !/^127\.0\.0\.1:\d+$/.test(host)) || hello.passives?.length || hello.arbiters?.length)
      throw new Error("Writable exclusively loopback replica set required");
    database.setClient(client); database.setConnection(db);
    database.setCapabilities(await connectionOwner.discoverCapabilities(db));
  }
  function bind(name, rawSchema) {
    const collection = db.collection(name);
    const model = { ...modelOwner, rawSchema, moduleName: "wasteCore", schemaName: name, modelName: name,
      tenant, versioned: false, primaryKey: "code", dataBase: database };
    for (const member of ["insertOne", "findOneAndUpdate", "findOneAndDelete", "updateMany", "deleteMany", "find", "countDocuments", "listIndexes", "indexes"])
      model[member] = collection[member].bind(collection);
    models[name] = model;
  }
  t.after(async () => {
    try { if (created) await db.dropDatabase({ writeConcern: { w: "majority", j: true } }); }
    finally {
      await client?.close();
      for (const [key, value] of Object.entries(previous)) if (value === undefined) delete global[key]; else global[key] = value;
      if (upper) Object.defineProperty(String.prototype, "toUpperCaseFirstChar", upper);
      else delete String.prototype.toUpperCaseFirstChar;
    }
  });
  await connect();
  const schemas = require("../../src/schemas/schemas").wasteCore;
  for (const name of ["wasteAsset", "wasteAssetOwnershipEvent", ...(listing ? ["wasteAssetMarketplaceProjection"] : [])]) {
    const rawSchema = _.merge({}, base.super, base.base, schemas[name]);
    await provider.prepareDatabaseOptions({ moduleObject: { rawSchema: { [name]: rawSchema } }, schemaName: name,
      tntCode: tenant, dataBase: { master: database } });
    const options = rawSchema.schemaOptions[tenant];
    await db.createCollection(name, options.options); created = true;
    for (const index of options.indexedFields)
      await db.collection(name).createIndex(index.fields, { ...index.options, writeConcern: { w: "majority", j: true } });
    bind(name, rawSchema);
    function check(input) {
      if (input.tenant !== tenant || (input.authData?.tenant && input.authData.tenant !== tenant))
        throw new Error("Acceptance tenant mismatch");
    }
    SERVICE["Default" + name[0].toUpperCase() + name.slice(1) + "Service"] = {
      get: async input => {
        check(input);
        return { code: "SUC_FIND_00000", result: (await models[name].getItems({ ...input,
          searchOptions: { limit: input.searchOptions?.pageSize || 101 } })).result };
      },
      save: async input => {
        check(input);
        const request = { ...input, schemaModel: models[name], query: input.query || { code: input.model.code } };
        await step(save, "validateModel", request);
        await step(save, "applyDefaultValues", request);
        await step(save, "applyPreInterceptors", request);
        try { return { code: "SUC_SAVE_00000", result: await save.persistModel(request) }; }
        catch (error) { throw validationError(error); }
      },
      update: async input => {
        check(input);
        const request = { ...input, schemaModel: models[name] };
        await step(update, "validateRequest", request);
        await step(update, "applyPreInterceptors", request);
        try { return { code: "SUC_UPDATE_00000", result: await update.persistUpdates(request) }; }
        catch (error) { throw validationError(error); }
      },
    };
  }
  return { tenant, models, commands, settings,
    request: { tenant, authData: { tenant, principalType: "service" } },
    /** Reconnects without retaining records in an in-memory persistence substitute. */
    reconnect: async () => {
      const definitions = Object.fromEntries(Object.entries(models).map(([name, model]) => [name, model.rawSchema]));
      await client.close(); await connect();
      for (const [name, rawSchema] of Object.entries(definitions)) bind(name, rawSchema);
    },
  };
}
module.exports = { create, validateUri, validationError };
