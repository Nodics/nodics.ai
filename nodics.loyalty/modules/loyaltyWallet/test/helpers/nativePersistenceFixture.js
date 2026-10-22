/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module loyaltyWallet/test/helpers/nativePersistenceFixture
 * @description Installs real Loyalty owner schemas and generated persistence pipelines on a fresh loopback MongoDB database.
 * @layer test @owner loyaltyWallet
 * @sideEffects Creates and drops one random test database. Profile identity remains an explicit fixture; all reward persistence is native.
 */
const path = require("node:path");
const crypto = require("node:crypto");
const _ = require("lodash");
const { MongoClient } = require("mongodb");
const root = path.resolve(__dirname, "../../../../..");
const foundation = relative => require(path.join(root, "nodics.foundation/modules", relative));
const transactions = foundation("nDatabase/database/src/service/transaction/defaultDatabaseTransactionService");
const connectionOwner = foundation("nDatabase/mongodb/src/service/connection/defaultMongodbDatabaseConnectionHandlerService");
const modelOwner = foundation("nDatabase/mongodb/src/schemas/model").default;
const provider = foundation("nDatabase/mongodb/src/service/model/defaultMongodbDatabaseModelHandlerService");
const save = foundation("nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService");
const update = foundation("nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService");
const base = foundation("nDatabase/database/src/schemas/schemas").default;
const quiet = { debug() {}, error() {} };

async function step(owner, member, request) {
  return new Promise((resolve, reject) => ({ ...owner, LOG: quiet })[member](request, {}, {
    nextSuccess: resolve,
    error: (_request, _response, error) => reject(error),
  }));
}

function definitions() {
  const wallet = require("../../src/schemas/schemas").loyaltyWallet;
  return [
    ["loyaltyWallet", "loyaltyWallet", wallet.loyaltyWallet],
    ["loyaltyWalletRewardBalance", "loyaltyWallet", wallet.loyaltyWalletRewardBalance],
    ["rewardTransferOperation", "loyaltyWallet", wallet.rewardTransferOperation],
    ["rewardTransferUsage", "loyaltyWallet", wallet.rewardTransferUsage],
    ["rewardTransferPolicy", "loyaltyWallet", wallet.rewardTransferPolicy],
    ["rewardLedgerEntry", "loyaltyLedger", require("../../../loyaltyLedger/src/schemas/schemas").loyaltyLedger.rewardLedgerEntry],
    ["rewardReservation", "loyaltyReservation", require("../../../loyaltyReservation/src/schemas/schemas").loyaltyReservation.rewardReservation],
    ["rewardRedemption", "loyaltyRedemption", require("../../../loyaltyRedemption/src/schemas/schemas").loyaltyRedemption.rewardRedemption],
    ["loyaltyProgram", "loyaltyProgram", require("../../../loyaltyProgram/src/schemas/schemas").loyaltyProgram.loyaltyProgram],
    ["loyaltyRewardType", "loyaltyRewardType", require("../../../loyaltyRewardType/src/schemas/schemas").loyaltyRewardType.loyaltyRewardType],
  ];
}

function serviceName(schemaName) {
  return "Default" + schemaName[0].toUpperCase() + schemaName.slice(1) + "Service";
}

async function create(t) {
  const uri = process.env.NODICS_LOYALTY_NATIVE_MONGO_URI;
  if (typeof uri !== "string" || !/^mongodb:\/\/127\.0\.0\.1:\d+\/?(?:\?replicaSet=[A-Za-z0-9._-]+)?$/.test(uri))
    throw new Error("Explicit credential-free loopback MongoDB URI without a database required");
  const previous = Object.fromEntries(["CONFIG", "nConfig", "SERVICE", "CLASSES", "NODICS", "UTILS"].map(key => [key, global[key]]));
  const previousUpper = Object.getOwnPropertyDescriptor(String.prototype, "toUpperCaseFirstChar");
  Object.defineProperty(String.prototype, "toUpperCaseFirstChar", { configurable: true,
    /** Returns this fixture's generated-service name segment with its first character capitalized. */
    value: function () { return this[0].toUpperCase() + this.slice(1); } });
  require("./runtimeEnums.js")();
  const databaseName = "nodics_loyalty_test_" + crypto.randomUUID().replaceAll("-", "");
  const tenant = "acceptance", commands = [], models = {}, owners = new Set();
  let client, db, created = false;
  const database = new (foundation("nDatabase/database/src/lib/database"))();
  database.setURI(uri);
  database.setOptions({ ...foundation("nDatabase/mongodb/config/properties").database.default.mongodb.options });
  const settings = {
    databaseTransactions: { enabled: true, failClosed: true, maximumCommitTimeMs: 5000 },
    loyalty: _.merge({}, require("../../../loyaltyCore/config/properties").loyalty,
      require("../../../loyaltyReservation/config/properties").loyalty,
      require("../../config/properties").loyalty,
      { transactions: { enabled: true, moduleName: "loyaltyWallet" }, transfers: {
        enabled: true, incomingEnabled: true, outgoingEnabled: true, feeAmount: "1.00",
        maximumAmount: "5.00", maximumDailyAmount: "5.00", maximumDailyCount: 1, timeZone: "UTC",
      } }),
  };
  global.CONFIG = global.nConfig = { get: key => settings[key] };
  global.CLASSES = { NodicsError: class extends Error {
    constructor(error, message, fallback) { super(message || (error instanceof Error ? error.message : error));
      this.code = error instanceof Error ? error.code || fallback : error; }
    static enrich(error) { return error; }
  } };
  global.UTILS = { isBlank: value => value == null || Object.keys(value).length === 0,
    createModelName: value => value, isObject: _.isPlainObject };
  global.NODICS = { getModels: (owner, partition) => owners.has(owner) && partition === tenant ? models : {} };
  global.SERVICE = {
    DefaultDatabaseTransactionService: transactions,
    DefaultMongodbDatabaseConnectionHandlerService: connectionOwner,
    DefaultMongodbDatabaseModelHandlerService: { ...provider, LOG: quiet },
    DefaultDatabaseModelHandlerService: foundation("nDatabase/database/src/service/model/defaultDatabaseModelHandlerService"),
    DefaultModelConcurrencyService: foundation("nDatabase/database/src/service/schema/defaultModelConcurrencyService"),
    DefaultModelValidatorService: { ...foundation("nDatabase/database/src/service/model/defaultModelValidatorService"), LOG: quiet },
    DefaultSchemaReadAccessPolicyService: foundation("nDatabase/database/src/service/schema/defaultSchemaReadAccessPolicyService"),
    DefaultInterceptorService: foundation("nCommon/src/service/interceptor/defaultInterceptorService"),
    DefaultPropertyInitialValueProviderService: foundation("nDatabase/database/src/service/init/defaultPropertyInitialValueProviderService"),
    DefaultLoyaltyAmountService: require("../../../loyaltyCore/src/service/defaultLoyaltyAmountService"),
    DefaultLoyaltyRewardOperationService: require("../../src/service/defaultLoyaltyRewardOperationService"),
    DefaultLoyaltyRewardTransferService: require("../../src/service/defaultLoyaltyRewardTransferService"),
    DefaultLoyaltyTransactionService: require("../../src/service/defaultLoyaltyTransactionService"),
    DefaultLoyaltyParticipantTransferService: require("../../src/service/defaultLoyaltyParticipantTransferService"),
    DefaultLoyaltyTransferNotificationService: { notify: async () => undefined },
    DefaultDatabaseConfigurationService: {
      getTenantDatabase: (owner, partition) => owners.has(owner) && partition === tenant ? { master: database } : undefined,
      getSchemaInterceptors: () => ({ preSave: [], preUpdate: [], preRemove: [] }),
    },
  };

  async function connect() {
    client = await MongoClient.connect(uri, { ignoreUndefined: true, directConnection: true, retryWrites: false,
      serverSelectionTimeoutMS: 5000, monitorCommands: true });
    client.on("commandStarted", event => {
      if (!["insert", "update", "findAndModify", "find", "commitTransaction", "abortTransaction"].includes(event.commandName)) return;
      commands.push({ name: event.commandName, session: !!event.command.lsid,
        transaction: event.command.autocommit === false, readConcern: event.command.readConcern, writeConcern: event.command.writeConcern });
    });
    db = client.db(databaseName);
    const hello = await db.command({ hello: 1 });
    if (!hello.setName || !hello.isWritablePrimary || !Array.isArray(hello.hosts) ||
      hello.hosts.some(host => !/^127\.0\.0\.1:\d+$/.test(host)) || hello.passives?.length || hello.arbiters?.length)
      throw new Error("Writable exclusively loopback replica set required");
    database.setClient(client); database.setConnection(db);
    database.setCapabilities(await connectionOwner.discoverCapabilities(db));
  }

  function bind(name, owner, rawSchema) {
    const collection = db.collection(name);
    const model = { ...modelOwner, rawSchema, moduleName: owner, schemaName: name, modelName: name,
      tenant, versioned: false, primaryKey: "code", dataBase: database };
    for (const member of ["insertOne", "findOneAndUpdate", "findOneAndDelete", "updateMany", "deleteMany", "find", "countDocuments", "listIndexes", "indexes"])
      model[member] = collection[member].bind(collection);
    models[name] = model;
    SERVICE[serviceName(name)] = {
      get: async input => {
        const result = (await models[name].getItems({ ...input,
          searchOptions: { limit: input.searchOptions?.limit || input.searchOptions?.pageSize || input.pageSize || 101 } })).result;
        return { code: "SUC_FIND_00000", result, count: result.length };
      },
      save: async input => {
        const request = { ...input, schemaModel: models[name], query: input.query || { code: input.model.code } };
        await step(save, "applyPreInterceptors", request);
        return { code: "SUC_SAVE_00000", result: await save.persistModel(request) };
      },
      update: async input => {
        const request = { ...input, schemaModel: models[name] };
        await step(update, "applyPreInterceptors", request);
        return { code: "SUC_UPDATE_00000", result: await update.persistUpdates(request) };
      },
    };
  }

  async function cleanup() {
    try { if (created) await db.dropDatabase({ writeConcern: { w: "majority", j: true } }); }
    finally {
      await client?.close();
      for (const [key, value] of Object.entries(previous)) if (value === undefined) delete global[key]; else global[key] = value;
      if (previousUpper) Object.defineProperty(String.prototype, "toUpperCaseFirstChar", previousUpper);
      else delete String.prototype.toUpperCaseFirstChar;
    }
  }
  t.after(cleanup);
  await connect();
  for (const [name, owner, schema] of definitions()) {
    owners.add(owner);
    const rawSchema = _.merge({}, base.super, base.base, schema);
    await provider.prepareDatabaseOptions({ moduleObject: { rawSchema: { [name]: rawSchema } }, schemaName: name,
      tntCode: tenant, dataBase: { master: database } });
    const options = rawSchema.schemaOptions[tenant];
    await db.createCollection(name, options.options); created = true;
    for (const index of options.indexedFields)
      await db.collection(name).createIndex(index.fields, { ...index.options, writeConcern: { w: "majority", j: true } });
    bind(name, owner, rawSchema);
  }
  return {
    tenant, models, database, databaseName, commands,
    save: (name, model) => SERVICE[serviceName(name)].save({ tenant, authData: { tenant }, model }),
    read: async (name, query) => (await SERVICE[serviceName(name)].get({ tenant, authData: { tenant }, query })).result,
    /** Reconnects the native client and rebinds generated models to prove durable replay behavior. */
    reconnect: async function () {
      const retained = definitions().map(([name, owner]) => [name, owner, models[name].rawSchema]);
      await client.close(); await connect();
      for (const [name, owner, schema] of retained) bind(name, owner, schema);
    },
  };
}

module.exports = { create };
