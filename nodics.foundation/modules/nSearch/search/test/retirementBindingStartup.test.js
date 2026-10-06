/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module search/test/retirementBindingStartup
 * @description Proves historical retirement bindings remain inspectable without recreating erased indexes, modifying mappings or replacing active schema routing.
 * @layer test @owner nSearch
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const handler = require("../src/service/model/defaultSearchModelHandlerService");

for (const retirement of [
  { dedicated: true, immutablePhysicalName: true },
  null,
]) {
  test(
    "declared retirement binding never provisions provider state: " +
      JSON.stringify(retirement),
    async (t) => {
      const saved = {
        NODICS: global.NODICS,
        SERVICE: global.SERVICE,
        CLASSES: global.CLASSES,
      };
      const first = String.prototype.toUpperCaseFirstChar;
      String.prototype.toUpperCaseFirstChar = function () {
        return this[0].toUpperCase() + this.slice(1);
      };
      t.after(() => {
        Object.assign(global, saved);
        if (first) String.prototype.toUpperCaseFirstChar = first;
        else delete String.prototype.toUpperCaseFirstChar;
      });
      const schema = {
        searchModelName: "CurrentSearchModel",
        indexName: "current",
        typeName: "current",
      };
      const models = { searchModels: { fixture: {} } };
      let created = 0,
        mapped = 0;
      global.NODICS = {
        getModels: () => ({ ProjectionModel: schema }),
        getSearchModels: () => models.searchModels.fixture,
      };
      global.CLASSES = { SearchError: Error };
      global.SERVICE = {
        DefaultLoggerService: { createLogger: () => ({ debug() {} }) },
        SchemaOwner: { prepareTypeSchema: async () => ({ properties: {} }) },
      };
      const engine = {
        isActiveIndex: () => false,
        addIndex() {},
        getIndex: () => undefined,
        getOptions: () => ({ schemaHandler: "SchemaOwner" }),
      };
      await handler.prepareTypeSearchModels({
        moduleName: "owner",
        tntCode: "fixture",
        moduleObject: models,
        indexNames: ["legacy"],
        moduleTenantSearchRawSchema: {
          legacy: {
            indexName: "erased-physical",
            schemaName: "projection",
            retirement,
          },
        },
        rawSearchModelDef: {
          default: {
            defineDefaultOperations: (model) => {
              model.doCreateIndex = async () => {
                created++;
              };
              model.doUpdateSchema = async () => {
                mapped++;
              };
            },
          },
        },
        searchEngine: engine,
      });
      assert.ok(models.searchModels.fixture.LegacySearchModel);
      assert.equal(created, 0);
      assert.equal(schema.searchModelName, "CurrentSearchModel");
      await handler.updateIndexTypeSchema({
        moduleName: "owner",
        tntCode: "fixture",
        searchModelsName: ["LegacySearchModel"],
        searchEngine: engine,
      });
      assert.equal(mapped, 0);
    },
  );
}
