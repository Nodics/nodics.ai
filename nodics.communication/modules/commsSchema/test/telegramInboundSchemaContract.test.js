/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module commsSchema/test/telegramInboundSchemaContract @description Proves private receipt schema policy and actual generated MongoDB validator/unique indexes without installation. @owner commsSchema @layer test @override Preserve private transport isolation and non-managed insert-only generation. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../../commsCore/test/helpers/telegramInboundFixture");
const schemaOwner = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultDatabaseSchemaHandlerService");
const modelOwner = require("../../../../nodics.foundation/modules/nDatabase/mongodb/src/service/model/defaultMongodbDatabaseModelHandlerService");
const access = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService");

test("source receipt generates private service-only policy and two independent uniqueness constraints", async (t) => {
  fixture(t);
  const baseGet = CONFIG.get;
  const policies = require("../config/properties").schemaPolicies;
  CONFIG.get = (key) => key === "schemaPolicies" ? policies : baseGet(key);
  const source = require("../src/schemas/schemas").commsSchema.commsTelegramUpdate;
  const schemas = schemaOwner.applyNamedSchemaPolicies("commsSchema", { commsTelegramUpdate: structuredClone(source) });
  const schema = schemas.commsTelegramUpdate;
  assert.deepEqual(schema.accessGroups, { serviceAccountUserGroup: 10 });
  assert.equal(access.getAccessPoint({ userGroups: ["customerUserGroup", "employeeUserGroup"] }, schema.accessGroups), 0);
  assert.equal(access.getAccessPoint({ userGroups: ["serviceAccountUserGroup"] }, schema.accessGroups), 10);
  for (const boundary of ["router", "cache", "event", "search", "backoffice"]) assert.equal(schema[boundary].enabled, false);
  assert.equal(schema.backoffice.concurrency, undefined);
  assert.equal(schema.versioned, undefined);
  await modelOwner.prepareDatabaseOptions({
    moduleObject: { rawSchema: schemas }, schemaName: "commsTelegramUpdate", tntCode: "tenant-a",
    dataBase: { master: { getOptions: () => ({}) } },
  });
  const options = schema.schemaOptions["tenant-a"];
  assert(options.indexedFields.some((index) => index.options.unique === true && JSON.stringify(index.fields) === JSON.stringify({ code: 1 })));
  assert(options.indexedFields.some((index) => index.options.unique === true && JSON.stringify(index.fields) === JSON.stringify({ tenant: 1, applicationSubject: 1, updateId: 1 })));
  assert(options.options.validator.$jsonSchema.properties.updateId.bsonType.includes("int"));
  assert.equal(Object.hasOwn(source.definition, "rawPayload"), false);
  assert.equal(Object.hasOwn(source.definition, "secret"), false);
  assert.equal(Object.hasOwn(source.definition, "recipientId"), false);
});
