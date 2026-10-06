/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module mongodb/test/disposableJournal
 * @description Owns a unique disposable database and exposes real generated journal initializers over the MongoDB model. No existing database or business collection is selectable.
 * @layer test @owner mongodb
 */
const { MongoClient } = require("mongodb");
const crypto = require("node:crypto");
const modelDefinition = require("../../src/schemas/model").default;
const save = require("../../../database/src/service/procs/save/defaultModelSaveInitializerService");
const update = require("../../../database/src/service/procs/update/defaultModelsUpdateInitializerService");
const get = require("../../../database/src/service/procs/get/defaultModelsGetInitializerService");
const connectionOwner = require("../../src/service/connection/defaultMongodbDatabaseConnectionHandlerService");

/** Creates a generated-persistence fixture on an explicitly supplied loopback replica set. @param {Object} rawSchema Owner's actual private receipt definition. @param {string} [readOnlyName] Parent-created disposable database for independent-process inspection only. @returns {Promise<Object>} Journal, reconnect and owned cleanup. */
async function create(rawSchema, readOnlyName) {
  const uri = process.env.NODICS_ERASURE_MONGO_URI;
  if (
    !uri ||
    !/^mongodb:\/\/(127\.0\.0\.1|localhost):\d+\/?(?:\?[^#]*)?$/.test(uri)
  )
    throw new Error(
      "Explicit loopback MongoDB URI without a database is required",
    );
  if (
    readOnlyName !== undefined &&
    !/^nodics_erasure_test_[a-f0-9]{32}$/.test(readOnlyName)
  )
    throw new Error(
      "Only a parent-created disposable journal may be inspected",
    );
  const databaseName =
    readOnlyName ||
    "nodics_erasure_test_" + crypto.randomUUID().replaceAll("-", "");
  let client, database, model;
  const derivedNames = new Set();
  /** Reopens the real provider connection with no process-local receipt state. */
  async function connect() {
    client = await MongoClient.connect(uri, {
      retryWrites: false,
      serverSelectionTimeoutMS: 5000,
    });
    database = client.db(databaseName);
    const hello = await database.command({ hello: 1 });
    if (!hello.setName || !hello.isWritablePrimary)
      throw new Error("Writable replica set required");
    const collection = database.collection("receipt");
    model = {
      ...modelDefinition,
      rawSchema,
      dataBase: {
        getCapabilities: () => ({
          persistence: {
            contractVersion: 1,
            durableJournal: true,
            primaryMajorityReadback: true,
          },
        }),
      },
      insertOne: collection.insertOne.bind(collection),
      findOneAndUpdate: collection.findOneAndUpdate.bind(collection),
      find: collection.find.bind(collection),
      countDocuments: collection.countDocuments.bind(collection),
      cursorToArray: (cursor) => cursor.toArray(),
    };
  }
  try {
    await connect();
    if (!readOnlyName)
      await database.collection("receipt").createIndex(
        { code: 1 },
        {
          unique: true,
          name: "retirementIdentity",
          writeConcern: { w: "majority", j: true },
        },
      );
  } catch (error) {
    await client?.close();
    throw error;
  }
  return {
    databaseName,
    /** Reserves only an absent provider-derived namespace beneath this invocation's random base, for synthetic enterprise acceptance. */
    reserveTenantNamespace: async function (tenantCode) {
      if (readOnlyName || !/^acceptance_[a-z0-9_]{1,48}$/.test(tenantCode))
        throw new Error("Owned synthetic tenant required");
      const name = connectionOwner.deriveTenantDatabaseName(
        databaseName,
        tenantCode,
      );
      if (derivedNames.has(name)) return name;
      const existing = await client
        .db("admin")
        .admin()
        .listDatabases({ filter: { name }, nameOnly: true });
      if (existing.databases.length)
        throw new Error("Derived test namespace already exists");
      derivedNames.add(name);
      return name;
    },
    service: {
      /** Executes the real private generated read path, including bounded primary-majority options. */
      get: async function (input) {
        const request = { ...input, schemaModel: model };
        const owner = { ...get, LOG: { debug() {} } };
        await new Promise((resolve, reject) =>
          owner.buildOptions(
            request,
            {},
            { nextSuccess: resolve, error: (req, res, error) => reject(error) },
          ),
        );
        const result = await owner.readItems(request);
        return { code: "SUC_FIND_TEST", result: result.result };
      },
      /** Executes the real create-only journal initializer and native provider acknowledgement checks. */
      save: async function (input) {
        if (readOnlyName) throw new Error("Inspection only");
        return {
          code: "SUC_SAVE_TEST",
          result: await save.insertModel({ ...input, schemaModel: model }),
        };
      },
      /** Executes the real scalar-predicate conditional-update initializer and provider. */
      update: async function (input) {
        if (readOnlyName) throw new Error("Inspection only");
        return {
          code: "SUC_UPD_TEST",
          result: await update.updateDurableJournal({
            ...input,
            schemaModel: model,
          }),
        };
      },
    },
    /** Discards the client/model and reloads receipts only from persisted provider state. */
    reconnect: async function () {
      await client.close();
      await connect();
    },
    /** Removes only this invocation's freshly created test database. */
    close: async function () {
      try {
        for (const name of derivedNames)
          await client
            .db(name)
            .dropDatabase({ writeConcern: { w: "majority", j: true } });
        if (!readOnlyName)
          await database.dropDatabase({
            writeConcern: { w: "majority", j: true },
          });
      } finally {
        await client.close();
      }
    },
  };
}
module.exports = { create };
