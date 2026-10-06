/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotConversation/test/copilotRetentionSchema
 * @description Verifies generated MongoDB validation accepts the lifecycle's explicit cleared title while retaining required ownership and state fields.
 * @layer test @owner copilotConversation
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const schema = require("../src/schemas/schemas").copilotConversation
  .copilotConversationRecord;
const compiler = require("../../../../nodics.foundation/modules/nDatabase/mongodb/src/service/model/defaultMongodbDatabaseModelHandlerService");
const defaults =
  require("../../../../nodics.foundation/modules/nDatabase/mongodb/config/properties")
    .database.default.mongodb.options.schemaProperties;

test("generated retention tombstones permit null titles without relaxing ownership", async (t) => {
  const previous = { UTILS: global.UTILS, CLASSES: global.CLASSES };
  t.after(() => Object.assign(global, previous));
  global.UTILS = {
    isBlank: (value) =>
      value == null ||
      (typeof value === "object" && !Object.keys(value).length),
  };
  global.CLASSES = { NodicsError: Error };
  const input = {
    tntCode: "default",
    schemaName: "copilotConversationRecord",
    dataBase: {
      master: { getOptions: () => ({ schemaProperties: defaults }) },
    },
    moduleObject: {
      rawSchema: { copilotConversationRecord: structuredClone(schema) },
    },
  };
  await compiler.prepareDatabaseOptions(input);
  const validator =
    input.moduleObject.rawSchema.copilotConversationRecord.schemaOptions.default
      .options.validator.$jsonSchema;
  assert.deepEqual(validator.properties.title.bsonType, ["string", "null"]);
  for (const field of ["tenantCode", "principalCode", "state"])
    assert.ok(validator.required.includes(field));
});
