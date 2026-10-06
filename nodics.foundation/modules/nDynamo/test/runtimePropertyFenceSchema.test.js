/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module dynamo/test/runtimePropertyFenceSchema
 * @description Verifies the real generated MongoDB validator admits the owner-defined held and released fence states.
 * @layer test @owner dynamo
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const compiler = require("../../nDatabase/mongodb/src/service/model/defaultMongodbDatabaseModelHandlerService");
const defaults = require("../../nDatabase/mongodb/config/properties").database
  .default.mongodb.options.schemaProperties;

test("generated runtime property fences permit explicit null release", async (t) => {
  const previous = {
    UTILS: global.UTILS,
    CLASSES: global.CLASSES,
    ENUMS: global.ENUMS,
  };
  t.after(() => Object.assign(global, previous));
  global.UTILS = {
    isBlank: (value) =>
      value == null ||
      (typeof value === "object" && !Object.keys(value).length),
  };
  global.CLASSES = { NodicsError: Error };
  global.ENUMS = {
    ClassType: Object.fromEntries(
      require("../src/utils/enums").ClassType.definition.map((key) => [
        key,
        { key },
      ]),
    ),
  };
  const schemas = require("../src/schemas/schemas").dynamo;
  const input = {
    tntCode: "default",
    schemaName: "runtimeConfigurationValue",
    dataBase: {
      master: { getOptions: () => ({ schemaProperties: defaults }) },
    },
    moduleObject: {
      rawSchema: {
        runtimeConfigurationValue: structuredClone(
          schemas.runtimeConfigurationValue,
        ),
      },
    },
  };
  await compiler.prepareDatabaseOptions(input);
  const validator =
    input.moduleObject.rawSchema.runtimeConfigurationValue.schemaOptions.default
      .options.validator.$jsonSchema;
  assert.deepEqual(validator.properties.propertyReadFence.bsonType, [
    "object",
    "null",
  ]);
  for (const field of ["ownerModule", "schemaCode"])
    assert.ok(validator.required.includes(field));
});
