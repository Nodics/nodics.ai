/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module import/test/importRetryClassification
 * @description Composes actual outer/file phase owners and diagnostics with offline capability/archival boundaries.
 * @layer test
 * @owner import
 */
const assert = require("node:assert/strict");
const test = require("node:test");
const path = require("node:path");
const policy = require("../src/service/process/init/defaultImportRetryPolicyService");
const outer = require("../src/service/process/init/defaultDataImportProcessService");
const file = require("../src/service/process/file/defaultFileDataImportProcessService");
const model = require("../src/service/process/model/defaultModelImportProcessService");
const diagnostics = require("../src/service/diagnostics/defaultImportDiagnosticsService");

class FixtureError extends Error {
  constructor(value, message) {
    super(message || value?.message || String(value));
    this.code = value?.code || value;
    this.metadata = value?.metadata;
    this.causes = value?.causes || [];
    this.errors = value?.errors || [];
  }
  add(error) {
    this.errors.push(error);
  }
}
const safe = () => ({
  code: "ERR_FIXTURE_DEPENDENCY",
  metadata: {
    importRetry: { kind: "DEPENDENCY", writeOutcome: "NOT_APPLIED" },
  },
});
const wrapped = (error) => ({
  code: "ERR_IMP_00010",
  responseCode: 400,
  errors: [{ code: "ERR_SAVE_00007", causes: [error] }],
});

async function run(failure, settings = {}) {
  const log = { debug() {}, warn() {}, error() {} };
  const processor = { ...outer, LOG: log };
  const fileProcessor = { ...file, LOG: log };
  let attempts = 0;
  let archived = 0;
  const calls = [];
  global.CLASSES = { DataImportError: FixtureError, NodicsError: FixtureError };
  global.UTILS = { isArray: Array.isArray };
  global.CONFIG = {
    get: () => ({ stopImportOnFailure: settings.globalStop === true }),
  };
  global.NODICS = {
    getNodicsHome: () => __dirname,
    getActiveTenants: () => ["default"],
  };
  global.SERVICE = {
    DefaultImportRetryPolicyService: policy,
    DefaultImportDiagnosticsService: diagnostics,
    DefaultImportUtilityService: {
      isImportPending: (files) => Object.values(files).some((f) => !f.done),
    },
    DefaultFileHandlerService: {
      moveFile: async () => {
        archived += 1;
      },
    },
    DefaultPipelineService: {
      start: async (name, request) => {
        if (name === "processFileDataImportPipeline") {
          attempts += 1;
          if (settings.headerStop !== undefined)
            request.fileData.header.options.stopImportOnFailure =
              settings.headerStop;
          return new Promise((resolve, reject) =>
            fileProcessor.processModels(
              request,
              {},
              {
                nextSuccess: resolve,
                error: (_request, _response, error) => reject(error),
              },
            ),
          );
        }
        assert.equal(name, "processModelImportPipeline");
        calls.push(request.dataModel.code);
        if (
          request.dataModel.code === "pending" &&
          (!settings.recover || attempts === 1)
        )
          throw failure;
        return { code: request.dataModel.code };
      },
    },
  };
  const request = {
    tenant: "default",
    importRun: { summary: {} },
    inputPath: { successPath: "offline-only" },
    dataFiles: {
      fixture: {
        file: path.join(__dirname, "fixtures/phasedRetryRecords.js"),
        processed: [],
        done: false,
      },
    },
  };
  let rejected;
  try {
    await processor.processFiles(
      request,
      {},
      { phase: 0, phaseLimit: 5, pendingFiles: ["fixture"] },
    );
  } catch (error) {
    rejected = error;
  }
  return { request, rejected, attempts, archived, calls };
}

test("declared dependency retries only pending rows; recovered probe leaves no permanent failures", async () => {
  const result = await run(wrapped(safe()), { recover: true });
  assert.equal(result.rejected, undefined);
  assert.equal(result.attempts, 2);
  assert.deepEqual(result.calls, ["pending", "successful", "pending"]);
  assert.equal(result.archived, 1);
  assert.equal(result.request.importRun.summary.recordsSucceeded, 2);
  assert.equal(result.request.importRun.summary.recordsFailed || 0, 0);
  assert.equal(result.request.importRun.failures?.length || 0, 0);
});

for (const code of [
  "ERR_PROFILE_CREDENTIAL_OWNERSHIP",
  "ERR_PROFILE_MEMBERSHIP_FORBIDDEN",
  "ERR_AUTH_00001",
  "ERR_VALIDATION_00001",
  "ERR_CONCURRENCY_00001",
  "ERR_WRITE_ACKNOWLEDGEMENT_UNCERTAIN",
]) {
  test(`wrapped ${code} is terminal even with safe retry declaration`, async () => {
    const result = await run(wrapped({ ...safe(), code }));
    assert.ok(result.rejected);
    assert.equal(result.attempts, 1);
    assert.equal(result.archived, 0);
    assert.deepEqual(result.calls, ["pending", "successful"]);
    assert.equal(result.request.importRun.summary.recordsSucceeded, 1);
    assert.equal(result.request.importRun.summary.recordsFailed, 1);
  });
}

test("unknown/uncertain acknowledgement and mixed aggregates never replay", async () => {
  for (const failure of [
    new Error("offline unknown outcome"),
    {
      ...safe(),
      metadata: { importRetry: { kind: "TRANSIENT", writeOutcome: "UNKNOWN" } },
    },
    { code: "ERR_IMP_00010", errors: [safe(), { code: "ERR_UNKNOWN_WRITE" }] },
  ]) {
    const result = await run(failure);
    assert.equal(result.attempts, 1);
    assert.ok(result.rejected);
  }
});

test("header and configured stopImportOnFailure stop outer retry and further row dispatch", async () => {
  for (const settings of [{ headerStop: true }, { globalStop: true }]) {
    const result = await run(safe(), settings);
    assert.equal(result.attempts, 1);
    assert.deepEqual(result.calls, ["pending"]);
    assert.equal(result.request.importRun.summary.recordsFailed, 1);
  }
  const overridden = await run(safe(), {
    globalStop: true,
    headerStop: false,
    recover: true,
  });
  assert.equal(overridden.attempts, 2);
  assert.equal(overridden.rejected, undefined);
});

test("declared safe transient retries are bounded; exhausted diagnostics recorded once", async () => {
  const result = await run({
    ...safe(),
    metadata: {
      importRetry: { kind: "TRANSIENT", writeOutcome: "NOT_APPLIED" },
    },
  });
  assert.equal(result.attempts, 5);
  assert.ok(result.rejected);
  assert.equal(result.calls.filter((code) => code === "successful").length, 1);
  assert.equal(result.request.importRun.summary.recordsFailed, 1);
});

test("native cause, cycles, status denials and layering preserve conservative classification", () => {
  assert.equal(policy.canRetry({ cause: safe() }), true);
  assert.equal(policy.canRetry({ ...safe(), responseCode: 403 }), false);
  const cycle = { code: "ERR_WRAPPER" };
  cycle.cause = cycle;
  assert.equal(policy.canRetry(cycle), false);
  const extended = {
    ...policy,
    canRetry: (error) =>
      error.code === "ERR_EXTENSION_SAFE" || policy.canRetry(error),
  };
  assert.equal(extended.canRetry({ code: "ERR_EXTENSION_SAFE" }), true);
  assert.equal(extended.canRetry({ code: "ERR_CONCURRENCY_00001" }), false);
});

test("actual macro owner declares missing reference before write, not malformed/empty write responses", async () => {
  String.prototype.toUpperCaseFirstChar = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };
  global.CLASSES = { DataImportError: FixtureError };
  const request = {
    tenant: "default",
    header: { options: { userGroups: [] } },
  };
  const options = {
    value: "reference",
    macro: {
      options: { model: "item" },
      rule: { code: { type: "string", index: 0 } },
    },
  };
  global.SERVICE = {
    DefaultItemService: { get: async () => ({ result: [] }) },
  };
  await assert.rejects(model.fetchModel(request, {}, options), (error) =>
    policy.canRetry(error),
  );
  global.SERVICE.DefaultItemService.get = async () => ({});
  await assert.rejects(
    model.fetchModel(request, {}, options),
    (error) => !policy.canRetry(error),
  );
  global.SERVICE.DefaultItemService.save = async () => undefined;
  await assert.rejects(
    model.insertLocalSchemaModel(
      {
        tenant: "default",
        header: {
          options: { schemaName: "item", operation: "save", userGroups: [] },
        },
      },
      [{ code: "offline-item" }],
    ),
    (error) => error.code === "ERR_IMP_00001" && !policy.canRetry(error),
  );
});

test("actual Nodics/DataImport error normalization retains declarations and denial causes under aggregate HTTP 400", () => {
  global.CONFIG = {
    get: () => ({
      NodicsError: "ERR_SYS_00000",
      DataImportError: "ERR_IMP_00000",
    }),
  };
  global.UTILS = { isObject: (value) => value && typeof value === "object" };
  const statuses = require("../src/utils/statusDefinitions");
  global.SERVICE = {
    DefaultStatusService: {
      get: (code) =>
        statuses[code] || { code: "500", message: "Offline fixture error" },
    },
  };
  const NodicsError = require("../../../../nCommon/src/lib/nodicsError");
  global.CLASSES = { NodicsError };
  const DataImportError = require("../src/lib/dataImportError");
  global.CLASSES.DataImportError = DataImportError;
  const dependency = new DataImportError(safe());
  const aggregate = new DataImportError("ERR_IMP_00010");
  aggregate.add(dependency);
  assert.equal(Number(aggregate.responseCode), 400);
  assert.equal(policy.canRetry(new DataImportError(aggregate)), true);
  dependency.addCause(new NodicsError("ERR_PROFILE_CREDENTIAL_OWNERSHIP"));
  assert.equal(policy.canRetry(new DataImportError(aggregate)), false);
});

test("HTTP 400 admits only declared pre-write dependency leaves, never validation/auth/CAS or transient denial", async () => {
  const declared = { ...safe(), code: "ERR_CMS_00095", responseCode: 400 };
  const result = await run(wrapped(declared), { recover: true });
  assert.equal(result.attempts, 2);
  assert.equal(result.rejected, undefined);
  for (const failure of [
    { code: "ERR_CMS_00095", responseCode: 400 },
    { ...declared, code: "ERR_VALIDATION_00001" },
    { ...declared, code: "ERR_AUTH_00001" },
    { ...declared, code: "ERR_CONCURRENCY_00001" },
    {
      ...declared,
      metadata: {
        importRetry: { kind: "TRANSIENT", writeOutcome: "NOT_APPLIED" },
      },
    },
    {
      ...declared,
      metadata: {
        importRetry: { kind: "DEPENDENCY", writeOutcome: "UNKNOWN" },
      },
    },
  ]) {
    const refused = await run(wrapped(failure));
    assert.equal(refused.attempts, 1);
    assert.ok(refused.rejected);
  }
});

test("actual Axis slot/template sources and CMS owner recover through actual init file phases without replaying templates", async () => {
  const root = path.resolve(__dirname, "../../../../../..");
  const cms = require(
    path.join(
      root,
      "nodics.wcms/modules/cms/src/service/validation/defaultCmsContractValidationService",
    ),
  );
  const bulkSave = require(
    path.join(
      root,
      "nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelsSaveInitializerService",
    ),
  );
  const headers = require(
    path.join(
      root,
      "nodics.platform/modules/axis/data/init-v001/headers/axis/axisContentCatalogHeader",
    ),
  ).cms;
  const sources = {
    slots: require(
      path.join(
        root,
        "nodics.platform/modules/axis/data/init-v001/records/axis/axisCmsSlotData",
      ),
    ),
    templates: require(
      path.join(
        root,
        "nodics.platform/modules/axis/data/init-v001/records/axis/axisCmsTemplateData",
      ),
    ),
  };
  const statuses = {
    ...require("../src/utils/statusDefinitions"),
    ...require(
      path.join(root, "nodics.wcms/modules/cms/src/utils/statusDefinitions"),
    ),
  };
  global.CONFIG = {
    get: (key) =>
      key === "defaultErrorCodes"
        ? { NodicsError: "ERR_SYS_00000", DataImportError: "ERR_IMP_00000" }
        : {},
  };
  global.UTILS = {
    isArray: Array.isArray,
    isObject: (value) => value && typeof value === "object",
    isBlank: (value) => !value || Object.keys(value).length === 0,
  };
  global.SERVICE = {
    DefaultStatusService: {
      get: (code) =>
        statuses[code] || { code: "500", message: "Offline error" },
    },
  };
  const NodicsError = require("../../../../nCommon/src/lib/nodicsError");
  global.CLASSES = { NodicsError };
  const DataImportError = require("../src/lib/dataImportError");
  global.CLASSES.DataImportError = DataImportError;
  global.NODICS = {
    getNodicsHome: () => __dirname,
    getActiveTenants: () => ["default"],
  };
  const storedTemplates = new Map();
  const storedSlots = new Map();
  const dispatchedTemplates = [];
  const phases = [];
  const log = { debug() {}, warn() {}, error() {} };
  const fileOwner = { ...file, LOG: log };
  const phaseOwner = { ...outer, LOG: log };
  async function saveGenerated(schemaName, request) {
    const response = {};
    await bulkSave.handleModelsSave(
      { ...request, schemaModel: { schemaName } },
      response,
      request.models,
    );
    return {
      result: response.success || [],
      errors: (response.failed || []).map((error) =>
        bulkSave.serializeFailure(error),
      ),
    };
  }
  Object.assign(SERVICE, {
    DefaultImportRetryPolicyService: policy,
    DefaultImportDiagnosticsService: diagnostics,
    DefaultImportUtilityService: {
      isImportPending: (files) =>
        Object.values(files).some((value) => !value.done),
    },
    DefaultFileHandlerService: { moveFile: async () => true },
    DefaultCmsPageTemplateService: {
      get: async (request) => {
        const result = [...storedTemplates.values()].filter((model) =>
          Object.entries(request.query).every(
            ([key, value]) => model[key] === value,
          ),
        );
        return { code: "SUC_FIND_00000", count: result.length, result };
      },
      saveAll: (request) => saveGenerated("cmsPageTemplate", request),
    },
    DefaultCmsSlotDefinitionService: {
      saveAll: (request) => saveGenerated("cmsSlotDefinition", request),
    },
    DefaultPipelineService: {
      start: async (name, request) => {
        if (name === "modelSaveInitializerPipeline") {
          if (request.schemaModel.schemaName === "cmsSlotDefinition") {
            await cms.validateSlotDefinition(request);
            assert.equal(storedSlots.has(request.model.code), false);
            storedSlots.set(request.model.code, request.model);
          } else {
            await cms.validateRenderer(request);
            dispatchedTemplates.push(request.model.code);
            storedTemplates.set(request.model.code, request.model);
          }
          return { result: request.model };
        }
        if (name === "processFileDataImportPipeline") {
          const kind = request.fileName;
          phases.push([kind, request.phase]);
          const header =
            kind === "slots"
              ? headers.axisCmsSlotData
              : headers.axisCmsTemplateData;
          request.fileData = {
            header: {
              ...header,
              options: { ...header.options, moduleName: "cms" },
            },
            models: structuredClone(sources[kind]),
          };
          return new Promise((resolve, reject) =>
            fileOwner.processModels(
              request,
              {},
              {
                nextSuccess: resolve,
                error: (_request, _response, error) => reject(error),
              },
            ),
          );
        }
        assert.equal(name, "processModelImportPipeline");
        return model.insertLocalSchemaModel(
          request,
          [].concat(request.dataModel),
        );
      },
    },
  });
  const physicalFile = path.join(__dirname, "fixtures/phasedRetryRecords.js");
  const request = {
    tenant: "default",
    importRun: { summary: {} },
    inputPath: { successPath: "offline-only" },
    dataFiles: {
      slots: { file: physicalFile, processed: [], done: false },
      templates: { file: physicalFile, processed: [], done: false },
    },
  };
  await phaseOwner.processFiles(
    request,
    {},
    { phase: 0, phaseLimit: 5, pendingFiles: ["slots", "templates"] },
  );
  assert.deepEqual(phases, [
    ["slots", 0],
    ["templates", 0],
    ["slots", 1],
  ]);
  assert.equal(storedSlots.size, Object.keys(sources.slots).length);
  assert.equal(storedTemplates.size, Object.keys(sources.templates).length);
  assert.equal(dispatchedTemplates.length, storedTemplates.size);
  assert.equal(request.importRun.summary.recordsFailed || 0, 0);
  assert.equal(request.importRun.failures?.length || 0, 0);
  const forgedModel = {
    code: "offline-forged-proof",
    importRetry: { kind: "DEPENDENCY", writeOutcome: "NOT_APPLIED" },
    metadata: { importRetry: safe().metadata.importRetry },
  };
  const refusedResponse = {};
  bulkSave.addFailure(
    refusedResponse,
    new NodicsError("ERR_CMS_00095"),
    forgedModel,
  );
  const refusedDiagnostic = bulkSave.serializeFailure(
    refusedResponse.failed[0],
  );
  assert.equal(refusedDiagnostic.metadata.importRetry, undefined);
  assert.deepEqual(refusedDiagnostic.metadata.failedModel, forgedModel);
  assert.equal(policy.canRetry(new DataImportError(refusedDiagnostic)), false);
  forgedModel.code = "changed-after-capture";
  assert.equal(
    refusedDiagnostic.metadata.failedModel.code,
    "offline-forged-proof",
  );
  const ownerError = new NodicsError("ERR_CMS_00095");
  ownerError.metadata = safe().metadata;
  const preservedResponse = {};
  bulkSave.addFailure(preservedResponse, ownerError, {
    importRetry: { kind: "TRANSIENT", writeOutcome: "UNKNOWN" },
  });
  assert.deepEqual(
    preservedResponse.failed[0].metadata.importRetry,
    safe().metadata.importRetry,
  );
  assert.equal(
    policy.canRetry(
      new DataImportError(
        bulkSave.serializeFailure(preservedResponse.failed[0]),
      ),
    ),
    true,
  );
  const forgedInvalidSlot = {
    ...Object.values(sources.slots)[0],
    minItems: -1,
    importRetry: safe().metadata.importRetry,
  };
  await assert.rejects(
    model.insertLocalSchemaModel(
      {
        tenant: "default",
        header: {
          ...headers.axisCmsSlotData,
          options: { ...headers.axisCmsSlotData.options, moduleName: "cms" },
        },
      },
      [forgedInvalidSlot],
    ),
    (error) =>
      error.code === "ERR_CMS_00095" &&
      error.metadata.importRetry === undefined &&
      error.metadata.failedModel.minItems === -1 &&
      !policy.canRetry(error),
    "Actual CMS saveAll/import refusal cannot acquire retry proof from the source record",
  );
  await assert.rejects(
    cms.validateSlotDefinition({
      tenant: "default",
      model: { ...Object.values(sources.slots)[0], minItems: -1 },
    }),
    (error) =>
      Number(error.responseCode) === 400 &&
      error.code === "ERR_CMS_00095" &&
      !policy.canRetry(error),
  );
  SERVICE.DefaultCmsPageTemplateService.get = async () => ({
    code: "ERR_AUTH_00001",
    result: [],
  });
  await assert.rejects(
    cms.validateSlotDefinition({
      tenant: "default",
      model: structuredClone(Object.values(sources.slots)[0]),
    }),
    (error) => !policy.canRetry(error),
    "A refused read envelope is not confirmed dependency absence",
  );
});
