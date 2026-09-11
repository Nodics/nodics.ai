/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";

/** @module database/test/localResetManagedRemoveContract @description Verifies opaque Local reset authority with managed schemas while rejecting forged bulk-delete requests. @layer test @owner database */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const pipeline = require("../src/service/procs/remove/defaultModelsRemoveInitializerService");
const concurrency = require("../src/service/schema/defaultModelConcurrencyService");
const provider = Object.assign(
  {},
  require("../../../nSystem/src/service/operations/defaultLocalResetProviderService"),
);

test("only the Local reset provider can bulk-clear a managed schema", async () => {
  global._ = require("lodash");
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  const policy = {
    enabled: true,
    environmentAllowlist: ["testLocal"],
    confirmation: "RESET_TEST",
    serviceNames: ["DefaultManagedExampleService"],
  };
  global.CONFIG = { get: () => policy };
  global.NODICS = { getSelectedEnvironmentName: () => "testLocal" };
  let writes = 0;
  const model = {
    primaryKey: "code",
    rawSchema: {
      definition: { revision: { type: "int" } },
      backoffice: { concurrency: { managed: true } },
    },
    compareAndSetItem: async () => {
      throw new Error("Bulk request must not reach a single-record write");
    },
    removeItems: async (request) => {
      assert.equal(request.tenant, "testTenant");
      assert.deepEqual(request.query, { _id: { $ne: null } });
      writes++;
      return { deletedCount: 2 };
    },
  };
  pipeline.LOG = { debug() {} };
  const execute = (request) =>
    new Promise((resolve, reject) =>
      pipeline.executeQuery(
        { ...request, schemaModel: model },
        {},
        {
          nextSuccess: (_request, response) => resolve(response.success),
          error: (_request, _response, error) => reject(error),
        },
      ),
    );
  global.SERVICE = {
    DefaultLocalResetProviderService: provider,
    DefaultModelConcurrencyService: concurrency,
    DefaultManagedExampleService: { remove: execute },
  };
  await provider.init();
  const input = {
    tenant: "testTenant",
    authData: { tokenType: "service" },
    confirmation: "RESET_TEST",
    resetScope: "LOCAL_ACCEPTANCE",
  };
  const receipt = await provider.reset(input);
  assert.equal(receipt.acknowledged, true);
  assert.equal(writes, 1);
  for (const authority of [
    undefined,
    true,
    { capability: "LOCAL_RESET_PROVIDER" },
  ]) {
    await assert.rejects(
      execute({
        ...input,
        query: { _id: { $ne: null } },
        localResetAuthority: authority,
      }),
      { code: "ERR_CONCURRENCY_00003" },
    );
  }
  assert.equal(writes, 1);
});
