/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module nSystem/test/LocalResetProviderService */
const assert = require("assert");
const service = Object.assign(
  {},
  require("../src/service/operations/defaultLocalResetProviderService"),
);
class NodicsError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
  }
}

(async function () {
  let policy = {
    enabled: true,
    environmentAllowlist: ["kickoffLocal"],
    confirmation: "RESET_LOCAL_NODICS_DATA",
    allowMissingModelServices: true,
    serviceNames: ["DefaultCatalogService"],
  };
  global.CLASSES = { NodicsError };
  global.CONFIG = {
    get: (key) => (key === "localResetProvider" ? policy : undefined),
  };
  global.NODICS = { getSelectedEnvironmentName: () => "kickoffLocal" };
  global.SERVICE = {
    DefaultCatalogService: {
      remove: async () => {
        let error = new TypeError(
          "Cannot read properties of undefined (reading 'models')",
        );
        error.stack =
          "TypeError: Cannot read properties of undefined (reading 'models')\n    at module.exports.getModels";
        throw error;
      },
    },
  };
  await service.init();
  let result = await service.reset({
    tenant: "default",
    authData: { tokenType: "service" },
    confirmation: policy.confirmation,
    resetScope: "LOCAL_ACCEPTANCE",
  });
  assert.strictEqual(result.acknowledged, true);
  assert.strictEqual(result.serviceCount, 0);
  assert.strictEqual(result.skippedServiceCount, 1);
  assert.deepStrictEqual(result.skippedServices, ["DefaultCatalogService"]);

  SERVICE.DefaultCatalogService.remove = async () => {
    let error = new TypeError(
      "Cannot read properties of undefined (reading 'schemaName')",
    );
    error.stack =
      "TypeError: Cannot read properties of undefined (reading 'schemaName')\n" +
      "    at Object.applyPreInterceptors (defaultModelsRemoveInitializerService.js:219:46)";
    throw error;
  };
  result = await service.reset({
    tenant: "default",
    authData: { tokenType: "service" },
    confirmation: policy.confirmation,
    resetScope: "LOCAL_ACCEPTANCE",
  });
  assert.strictEqual(result.acknowledged, true);
  assert.strictEqual(result.serviceCount, 0);
  assert.strictEqual(result.skippedServiceCount, 1);

  delete SERVICE.DefaultCatalogService;
  result = await service.reset({
    tenant: "default",
    authData: { tokenType: "service" },
    confirmation: policy.confirmation,
    resetScope: "LOCAL_ACCEPTANCE",
  });
  assert.strictEqual(result.acknowledged, true);
  assert.strictEqual(result.serviceCount, 0);
  assert.strictEqual(result.skippedServiceCount, 1);
  assert.deepStrictEqual(result.skippedServices, ["DefaultCatalogService"]);

  SERVICE.DefaultCatalogService = {
    remove: async () => {
      let error = new TypeError(
        "Cannot read properties of undefined (reading 'schemaName')",
      );
      error.stack =
        "TypeError: Cannot read properties of undefined (reading 'schemaName')\n" +
        "    at Object.applyPreInterceptors (defaultModelsRemoveInitializerService.js:219:46)";
      throw error;
    },
  };
  policy.requiredServiceNames = ["DefaultCatalogService"];
  await assert.rejects(
    service.reset({
      tenant: "default",
      authData: { tokenType: "service" },
      confirmation: policy.confirmation,
      resetScope: "LOCAL_ACCEPTANCE",
    }),
    /Local reset did not clear every configured service/,
  );

  delete SERVICE.DefaultCatalogService;
  await assert.rejects(
    service.reset({
      tenant: "default",
      authData: { tokenType: "service" },
      confirmation: policy.confirmation,
      resetScope: "LOCAL_ACCEPTANCE",
    }),
    /Configured Local reset service is unavailable/,
  );

  SERVICE.DefaultCatalogService = {
    remove: async () => {
      let error = new TypeError(
        "Cannot read properties of undefined (reading 'schemaName')",
      );
      error.stack =
        "TypeError: Cannot read properties of undefined (reading 'schemaName')\n" +
        "    at Object.applyPreInterceptors (defaultModelsRemoveInitializerService.js:219:46)";
      throw error;
    },
  };
  policy.requiredServiceNames = [];
  policy.allowMissingModelServices = false;
  await assert.rejects(
    service.reset({
      tenant: "default",
      authData: { tokenType: "service" },
      confirmation: policy.confirmation,
      resetScope: "LOCAL_ACCEPTANCE",
    }),
    /Local reset did not clear every configured service/,
  );

  SERVICE.DefaultCatalogService.remove = async () => {
    throw new Error("database write denied");
  };
  await assert.rejects(
    service.reset({
      tenant: "default",
      authData: { tokenType: "service" },
      confirmation: policy.confirmation,
      resetScope: "LOCAL_ACCEPTANCE",
    }),
    /database write denied/,
  );

  const resetRequest = {
    tenant: "tenant-a",
    authData: { tokenType: "service" },
    confirmation: policy.confirmation,
    resetScope: "LOCAL_ACCEPTANCE",
    searchIndexes: [{ moduleName: "foreign", indexName: "foreign" }],
  };
  let databaseMutations = 0,
    calls = [],
    invalidations = [];
  SERVICE.DefaultCatalogService.remove = async () => {
    databaseMutations++;
    return true;
  };
  policy.searchIndexes = [
    { moduleName: "product", indexName: "productLocalized" },
  ];
  const searchModel = { doRemoveByQuery() {}, doRefresh() {} };
  NODICS.getSearchModel = (moduleName, tenant, indexName) => {
    assert.equal(moduleName, "product");
    assert.equal(tenant, "tenant-a");
    assert.equal(indexName, "productLocalized");
    return searchModel;
  };
  SERVICE.DefaultPipelineService = {
    start: async (name, input) => {
      calls.push({ name, input });
      return { success: { result: { deleted: 3 } } };
    },
  };
  SERVICE.DefaultCacheService = {
    invalidateResource: async (input) => invalidations.push(input),
  };
  const searchReceipt = await service.reset(resetRequest);
  assert.deepEqual(searchReceipt.searchIndexes, policy.searchIndexes);
  assert.deepEqual(
    calls.map((call) => call.name),
    [
      "doRemoveModelsByQueryInitializerPipeline",
      "doRefreshIndexInitializerPipeline",
    ],
  );
  assert.deepEqual(calls[0].input.query, { tenant: "tenant-a" });
  assert.equal(calls[0].input.searchModel, searchModel);
  assert.equal(invalidations[0].tenant, "tenant-a");
  assert.equal(invalidations[0].resourceName, "productLocalized");
  assert.equal(databaseMutations, 1);
  NODICS.getSearchModel = () => undefined;
  await assert.rejects(
    service.reset(resetRequest),
    /search target is unavailable/,
  );
  assert.equal(
    databaseMutations,
    1,
    "Missing search configuration must fail before database deletion",
  );
  NODICS.getSearchModel = () => searchModel;
  policy.searchIndexes = [{ moduleName: "*", indexName: "productLocalized" }];
  await assert.rejects(service.reset(resetRequest), /search target is invalid/);
  policy.searchIndexes = Array.from({ length: 33 }, () => ({
    moduleName: "product",
    indexName: "productLocalized",
  }));
  await assert.rejects(
    service.reset(resetRequest),
    /search boundary is invalid/,
  );
  policy.searchIndexes = [
    { moduleName: "product", indexName: "productLocalized" },
  ];
  SERVICE.DefaultPipelineService.start = async () => ({
    success: { result: { failures: ["denied"] } },
  });
  await assert.rejects(service.reset(resetRequest), /requires reconciliation/);
  SERVICE.DefaultPipelineService.start = async () => {
    throw new Error("search unavailable");
  };
  await assert.rejects(service.reset(resetRequest), /search unavailable/);
  await assert.rejects(
    service.reset({ ...resetRequest, authData: { tokenType: "access" } }),
    /requires a service token/,
  );
  console.log("Local reset provider service contract validated");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
