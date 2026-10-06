/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module discoveryPublication/test/discoveryGenerationSchema
 * @description Verifies the generated MongoDB validator permits explicit empty generation slots while retaining identity constraints.
 * @layer test @owner discoveryPublication
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const schemas = require("../src/schemas/schemas").discoveryPublication;
const compiler = require("../../../../nodics.foundation/modules/nDatabase/mongodb/src/service/model/defaultMongodbDatabaseModelHandlerService");
const defaults =
  require("../../../../nodics.foundation/modules/nDatabase/mongodb/config/properties")
    .database.default.mongodb.options.schemaProperties;

test("generation slots accept object or null through the generated validator", async () => {
  const previous = { UTILS: global.UTILS, CLASSES: global.CLASSES };
  global.UTILS = {
    isBlank: (value) =>
      value == null ||
      (typeof value === "object" && Object.keys(value).length === 0),
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(error, message) {
        super(message, { cause: error });
      }
    },
  };
  try {
    const input = {
      tntCode: "default",
      schemaName: "discoveryGeneration",
      dataBase: {
        master: { getOptions: () => ({ schemaProperties: defaults }) },
      },
      moduleObject: {
        rawSchema: {
          discoveryGeneration: structuredClone(schemas.discoveryGeneration),
        },
      },
    };
    await compiler.prepareDatabaseOptions(input);
    const validator =
      input.moduleObject.rawSchema.discoveryGeneration.schemaOptions.default
        .options.validator.$jsonSchema;
    for (const field of ["currentGeneration", "pendingGeneration"]) {
      assert.deepEqual(validator.properties[field].bsonType, [
        "object",
        "null",
      ]);
    }
    assert.equal(validator.properties.code.bsonType, "string");
    assert.ok(validator.required.includes("code"));
    assert.ok(validator.required.includes("revision"));
  } finally {
    global.UTILS = previous.UTILS;
    global.CLASSES = previous.CLASSES;
  }
});
