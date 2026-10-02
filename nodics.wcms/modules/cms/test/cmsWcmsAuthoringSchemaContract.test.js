/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module cms/test/cmsWcmsAuthoringSchemaContract
 * @description Validates CMS-owned WCMS authoring schemas for configuration-first, component-based, customizable Axis BackOffice management.
 * @layer test
 * @owner cms
 * @override Extend when CMS adds new WCMS authoring entities or changes the component, navigation, restriction, and slot contracts.
 */
const assert = require("assert");
const schemas = require("../src/schemas/schemas").cms;
const cmsNavigation = [
  require("../src/service/defaultCmsBackofficeCapabilityService").getCapability(),
  require("../../../../nodics.foundation/modules/nCatalog/src/service/defaultCatalogBackofficeCapabilityService").getCapability(),
  require("../../../../nodics.foundation/modules/nPublish/src/service/defaultPublishBackofficeCapabilityService").getCapability(),
].flatMap((capability) => capability.navigation);
const validationService = require("../src/service/validation/defaultCmsContractValidationService");
const interceptors = require("../src/interceptors/interceptors");
const statusDefinitions = require("../src/utils/statusDefinitions");

[
  "cmsComponentTypeGroup",
  "cmsNavigationNode",
  "cmsRestrictionType",
  "cmsRestriction",
].forEach((schemaName) => {
  assert(
    schemas[schemaName],
    schemaName + " must be a first-class CMS authoring schema",
  );
  assert.strictEqual(
    schemas[schemaName].model,
    true,
    schemaName + " must generate a model",
  );
  assert.strictEqual(
    schemas[schemaName].service.enabled,
    true,
    schemaName + " must generate a service",
  );
  assert.strictEqual(
    schemas[schemaName].router.enabled,
    true,
    schemaName + " must be manageable through generated secured CRUD routes",
  );
  assert.strictEqual(
    schemas[schemaName].isVersionedEnabled,
    false,
    schemaName +
      " must stay non-versioned until a deployment layer opts into versioned CMS authoring",
  );
});

assert(
  schemas.cmsTypeCode.definition.kind,
  "cmsTypeCode remains the page/component type authority",
);
assert(
  !schemas.cmsComponentType,
  "CMS must not introduce a parallel component-type authority",
);
assert(
  !schemas.cmsPageType,
  "CMS must not introduce a parallel page-type authority",
);
assert(
  schemas.cmsComponentDetail,
  "cmsComponentDetail remains the generic CMS component placement relation",
);
assert(
  !schemas.cmsComponentPlacement,
  "CMS must not introduce a duplicate component placement relation until the canonical schema is renamed through migration",
);
assert(
  !schemas.cmsTemplateSlotRelation,
  "cmsSlotDefinition remains the template slot relation authority until a dedicated relation is explicitly designed",
);
assert.strictEqual(
  schemas.cmsComponentDetail.definition.source.description.includes(
    "page or component",
  ),
  true,
);
assert.strictEqual(
  schemas.cmsComponentDetail.definition.target.description.includes(
    "component",
  ),
  true,
);
assert.strictEqual(
  schemas.cmsComponentDetail.definition.slot.description.includes(
    "Logical template slot",
  ),
  true,
);

const navigationWorkbenchTarget = function (route) {
  return cmsNavigation.find((item) => item.route === route).workbenchTarget;
};
const navigationWorkbenchPresentation = function (route) {
  return cmsNavigation.find((item) => item.route === route)
    .workbenchPresentation;
};
assert.deepStrictEqual(navigationWorkbenchTarget("/content/pages"), {
  moduleName: "cms",
  schemaName: "cmsPage",
});
assert.deepStrictEqual(navigationWorkbenchTarget("/content/navigation"), {
  moduleName: "cms",
  schemaName: "cmsNavigationNode",
});
assert.deepStrictEqual(
  navigationWorkbenchTarget("/content/component-type-groups"),
  { moduleName: "cms", schemaName: "cmsComponentTypeGroup" },
);
assert.deepStrictEqual(navigationWorkbenchTarget("/content/catalogs"), {
  moduleName: "catalog",
  schemaName: "catalog",
});
assert.deepStrictEqual(
  navigationWorkbenchPresentation("/content/catalogs").fixedFilters,
  [
    {
      id: "content-catalog-type",
      label: "Content catalogs",
      field: "catalogType",
      value: "CONTENT",
      order: 10,
    },
  ],
  "Content Catalogs navigation must stay scoped to CONTENT catalog records",
);
assert.deepStrictEqual(navigationWorkbenchTarget("/publishing/requests"), {
  moduleName: "publish",
  schemaName: "publicationRequest",
});

assert.deepStrictEqual(
  schemas.cmsComponentTypeGroup.refSchema.componentTypeCodes,
  {
    enabled: true,
    schemaName: "cmsTypeCode",
    type: "many",
    propertyName: "code",
    searchEnabled: true,
  },
);
assert.strictEqual(
  schemas.cmsComponentTypeGroup.definition.componentTypeCodes.type,
  "array",
);
assert.strictEqual(
  schemas.cmsComponentTypeGroup.definition.status.default,
  "ACTIVE",
);
assert.deepStrictEqual(schemas.cmsComponentTypeGroup.definition.status.enum, [
  "ACTIVE",
  "INACTIVE",
]);

assert.strictEqual(
  schemas.cmsSlotDefinition.definition.allowedComponentTypes.type,
  "array",
);
assert.strictEqual(
  schemas.cmsSlotDefinition.definition.allowedComponentTypeGroups.type,
  "array",
  "template slots must support component type groups without replacing type codes",
);

assert.deepStrictEqual(schemas.cmsNavigationNode.definition.nodeType.enum, [
  "PAGE",
  "ROUTE",
  "EXTERNAL",
  "CONTAINER",
]);
assert.strictEqual(
  schemas.cmsNavigationNode.definition.site.searchOptions.enabled,
  true,
);
assert.strictEqual(
  schemas.cmsNavigationNode.refSchema.parent.schemaName,
  "cmsNavigationNode",
);
assert.strictEqual(
  schemas.cmsNavigationNode.refSchema.targetPage.schemaName,
  "cmsPage",
);
assert.strictEqual(
  schemas.cmsNavigationNode.refSchema.targetRoute.schemaName,
  "cmsPageRoute",
);
assert.strictEqual(
  schemas.cmsNavigationNode.refSchema.restrictions.schemaName,
  "cmsRestriction",
);
assert.strictEqual(
  schemas.cmsNavigationNode.definition.externalUrl.description.includes(
    "validation remains service-owned",
  ),
  true,
  "navigation URL safety must remain a backend service contract",
);

assert.deepStrictEqual(
  schemas.cmsRestrictionType.definition.targetTypes.default,
  ["PAGE", "COMPONENT", "SLOT", "NAVIGATION", "ROUTE"],
);
assert.strictEqual(
  schemas.cmsRestrictionType.definition.propertySchema.type,
  "object",
);
assert.strictEqual(
  schemas.cmsRestrictionType.definition.propertySchema.description.includes(
    "executable code is prohibited",
  ),
  true,
);
assert.strictEqual(
  schemas.cmsRestrictionType.definition.evaluator.description.includes(
    "Logical backend evaluator key",
  ),
  true,
);
assert.strictEqual(
  schemas.cmsRestrictionType.definition.evaluator.description.includes(
    "never executable code",
  ),
  true,
);

assert.deepStrictEqual(schemas.cmsRestriction.definition.targetType.enum, [
  "PAGE",
  "COMPONENT",
  "SLOT",
  "NAVIGATION",
  "ROUTE",
]);
assert.deepStrictEqual(schemas.cmsRestriction.definition.mode.enum, [
  "INCLUDE",
  "EXCLUDE",
]);
assert.strictEqual(
  schemas.cmsRestriction.refSchema.restrictionType.schemaName,
  "cmsRestrictionType",
);
assert.strictEqual(
  schemas.cmsRestriction.definition.properties.description.includes(
    "propertySchema",
  ),
  true,
);

assert.strictEqual(
  schemas.cmsComponentMedia.definition.mediaCode.description.includes(
    "media-owned",
  ),
  true,
);
assert.strictEqual(
  schemas.cmsComponentMedia.definition.mediaSetCode.description.includes(
    "media-owned",
  ),
  true,
);
assert.strictEqual(
  schemas.cmsComponentMedia.definition.storageKey,
  undefined,
  "CMS authoring schemas must not duplicate media storage keys",
);

[
  ["ERR_CMS_00095", "CMS slot definition is invalid"],
  ["ERR_CMS_00096", "CMS navigation node is invalid"],
  ["ERR_CMS_00097", "CMS restriction type is invalid"],
  ["ERR_CMS_00098", "CMS restriction is invalid"],
].forEach(([code, message]) => {
  assert.strictEqual(statusDefinitions[code].code, "400");
  assert.strictEqual(statusDefinitions[code].message, message);
});

assert.strictEqual(
  interceptors.validateCmsSlotDefinition.handler,
  "DefaultCmsContractValidationService.validateSlotDefinition",
);
assert.strictEqual(
  interceptors.validateCmsNavigationNode.handler,
  "DefaultCmsContractValidationService.validateNavigationNode",
);
assert.strictEqual(
  interceptors.validateCmsRestrictionType.handler,
  "DefaultCmsContractValidationService.validateRestrictionType",
);
assert.strictEqual(
  interceptors.validateCmsRestriction.handler,
  "DefaultCmsContractValidationService.validateRestriction",
);
[
  interceptors.invalidateCmsNavigationDeliveryAfterSave,
  interceptors.invalidateCmsNavigationDeliveryAfterUpdate,
  interceptors.invalidateCmsNavigationDeliveryAfterRemove,
  interceptors.invalidateCmsRestrictionDeliveryAfterSave,
  interceptors.invalidateCmsRestrictionDeliveryAfterUpdate,
  interceptors.invalidateCmsRestrictionDeliveryAfterRemove,
].forEach((interceptor) => {
  assert.strictEqual(
    interceptor.handler,
    "DefaultCmsDeliveryCacheInvalidationService.invalidate",
  );
});

const matchingService = function (property, validCode) {
  return {
    get: function (request) {
      return Promise.resolve({
        result:
          request.query && request.query[property] === validCode
            ? [{ code: validCode, active: true }]
            : [],
      });
    },
  };
};

const navigationService = function (parentsByCode) {
  return {
    get: function (request) {
      let code = request.query && request.query.code;
      return Promise.resolve({
        result: parentsByCode[code]
          ? [{ code: code, parent: parentsByCode[code], active: true }]
          : [],
      });
    },
  };
};

global.CONFIG = {
  get: function () {
    return undefined;
  },
};

/** Composes real import phases with CMS pre-write validation and existing Axis dependency records. */
async function verifySlotTemplateImportPhases() {
  const path = require("node:path");
  const root = "../../../../nodics.foundation/modules/nData/nImport/import";
  const outer = require(
    root + "/src/service/process/init/defaultDataImportProcessService",
  );
  const file = require(
    root + "/src/service/process/file/defaultFileDataImportProcessService",
  );
  const retry = require(
    root + "/src/service/process/init/defaultImportRetryPolicyService",
  );
  const diagnostics = require(
    root + "/src/service/diagnostics/defaultImportDiagnosticsService",
  );
  const modelImport = require(
    root + "/src/service/process/model/defaultModelImportProcessService",
  );
  const generatedTemplateRead = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService");
  const generatedBulkSave = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelsSaveInitializerService");
  const axisRoot = "../../../../nodics.platform/modules/axis/data/init-v001";
  const headers = require(
    axisRoot + "/headers/axis/axisContentCatalogHeader",
  ).cms;
  const slots = require(axisRoot + "/records/axis/axisCmsSlotData");
  const templates = require(axisRoot + "/records/axis/axisCmsTemplateData");
  const saved = Object.fromEntries(
    ["SERVICE", "CONFIG", "NODICS", "UTILS", "CLASSES"].map((key) => [
      key,
      { exists: Object.hasOwn(global, key), value: global[key] },
    ]),
  );
  const upperCaseDescriptor = Object.getOwnPropertyDescriptor(
    String.prototype,
    "toUpperCaseFirstChar",
  );
  if (!upperCaseDescriptor)
    Object.defineProperty(String.prototype, "toUpperCaseFirstChar", {
      configurable: true,
      value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
      },
    });
  class ImportError extends Error {
    constructor(value, message) {
      super(message || value?.message || String(value));
      Object.assign(this, typeof value === "object" ? value : { code: value });
      if (this.code === "ERR_CMS_00095") this.responseCode = 400;
      this.errors = this.errors || [];
      this.causes = this.causes || [];
    }
    add(error) {
      this.errors.push(error);
    }
  }
  try {
    for (const scenario of [
      "recover",
      "missing",
      "layout",
      "identity",
      "denied",
      "refused",
      "malformed",
      "missingCode",
      "unknownCode",
      "missingCount",
      "unknownStatus",
      "refusedStatus",
      "mismatch",
    ]) {
      const persistedTemplates = new Map();
      const persistedSlots = [];
      const attempts = { slots: 0, templates: 0 };
      const archived = [];
      const lookups = [];
      const log = { debug() {}, warn() {}, error() {} };
      const owner = { ...outer, LOG: log };
      const fileOwner = { ...file, LOG: log };
      global.CLASSES = {
        DataImportError: ImportError,
        NodicsError: ImportError,
      };
      global.CONFIG = { get: () => undefined };
      global.UTILS = { isArray: Array.isArray };
      global.NODICS = {
        getNodicsHome: () => __dirname,
        getActiveTenants: () => ["default"],
      };
      global.SERVICE = {
        DefaultImportRetryPolicyService: retry,
        DefaultImportDiagnosticsService: diagnostics,
        DefaultImportUtilityService: {
          isImportPending: (files) =>
            Object.values(files).some((item) => !item.done),
        },
        DefaultFileHandlerService: {
          moveFile: async (paths) => archived.push(paths[0]),
        },
        DefaultCmsPageTemplateService: {
          get: async (request) => {
            lookups.push(request);
            assert.strictEqual(request.tenant, "default");
            assert.strictEqual(request.options.skipItemCache, true);
            if (scenario === "denied")
              throw Object.assign(new Error("denied"), {
                code: "ERR_AUTH_00001",
                responseCode: 403,
              });
            if (scenario === "refused")
              return { code: "ERR_AUTH_00001", result: [] };
            if (scenario === "malformed") return {};
            if (scenario === "missingCode") return { count: 0, result: [] };
            if (scenario === "unknownCode")
              return { code: "SUC_UNKNOWN_00000", count: 0, result: [] };
            if (scenario === "missingCount")
              return { code: "SUC_FIND_00000", result: [] };
            if (scenario === "unknownStatus")
              return {
                code: "SUC_FIND_00000",
                count: 0,
                result: [],
                statusCode: "UNKNOWN",
              };
            if (scenario === "refusedStatus")
              return {
                code: "SUC_FIND_00000",
                count: 0,
                result: [],
                responseCode: 403,
              };
            if (scenario === "mismatch")
              return { result: [{ code: "other", active: true }] };
            const item = persistedTemplates.get(request.query.code);
            const sourceRequest = {
              ...request,
              schemaModel: {
                rawSchema: {},
                cache: { enabled: true },
                getItems: async (exactRequest) => {
                  assert.strictEqual(exactRequest, sourceRequest);
                  assert.strictEqual(exactRequest.options, request.options);
                  const result = item ? [item] : [];
                  return {
                    query: exactRequest.query,
                    options: exactRequest.searchOptions,
                    count: result.length,
                    result,
                  };
                },
              },
            };
            const response = {};
            const reader = { ...generatedTemplateRead, LOG: log };
            // Exercise the actual cache gates, not just the forwarded option.
            // Stale shared-cache absence must not stop the live provider read.
            const previousCache = SERVICE.DefaultCacheService;
            SERVICE.DefaultCacheService = {
              get: async () =>
                assert.fail(
                  "Owner dependency reads must bypass item-cache hits",
                ),
              put: async () =>
                assert.fail(
                  "Owner dependency reads must not populate shared item cache",
                ),
            };
            try {
              await new Promise((resolve, reject) =>
                reader.lookupCache(sourceRequest, response, {
                  nextSuccess: resolve,
                  stop: () =>
                    reject(
                      new Error(
                        "Dependency lookup stopped on a stale cache hit",
                      ),
                    ),
                  error: (_request, _response, error) => reject(error),
                }),
              );
              const success = await new Promise((resolve, reject) =>
                reader.executeQuery(sourceRequest, response, {
                  nextSuccess: () => {
                    assert.strictEqual(response.success.code, "SUC_FIND_00000");
                    assert.strictEqual(
                      response.success.responseCode,
                      undefined,
                      "Native generated reads prove success by canonical code, not HTTP transport status",
                    );
                    resolve(response.success);
                  },
                  error: (_request, _response, error) => reject(error),
                }),
              );
              await new Promise((resolve, reject) =>
                reader.updateCache(sourceRequest, response, {
                  nextSuccess: resolve,
                  error: (_request, _response, error) => reject(error),
                }),
              );
              return success;
            } finally {
              if (previousCache === undefined)
                delete SERVICE.DefaultCacheService;
              else SERVICE.DefaultCacheService = previousCache;
            }
          },
        },
        DefaultPipelineService: {
          start: async (name, request) => {
            if (name === "processFileDataImportPipeline") {
              attempts[request.fileName] += 1;
              request.fileData = {
                header:
                  headers[
                    request.fileName === "slots"
                      ? "axisCmsSlotData"
                      : "axisCmsTemplateData"
                  ],
                models: request.fileName === "slots" ? slots : templates,
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
            assert.strictEqual(name, "processModelImportPipeline");
            const model = { ...request.dataModel };
            if (request.header.options.schemaName === "cmsSlotDefinition") {
              if (scenario === "layout")
                Object.assign(model, { minItems: 4, maxItems: 2 });
              if (scenario === "identity")
                model.template = { code: model.template };
              try {
                await validationService.validateSlotDefinition({
                  tenant: request.tenant,
                  model,
                });
              } catch (error) {
                const expectedDeclaration = error.metadata?.importRetry;
                const bulkResponse = {};
                generatedBulkSave.addFailure(bulkResponse, error, model);
                const failure = generatedBulkSave.serializeFailure(
                  bulkResponse.failed[0],
                );
                assert.deepStrictEqual(
                  failure.metadata?.importRetry,
                  expectedDeclaration,
                  "Actual generated saveAll serialization must preserve the CMS owner declaration, never replace it with submitted model metadata",
                );
                const bulkOutput = await new Promise((resolve) =>
                  generatedBulkSave.handleSucessEnd(request, bulkResponse, {
                    resolve,
                  }),
                );
                assert.deepStrictEqual(
                  bulkOutput.errors[0].metadata?.importRetry,
                  expectedDeclaration,
                );
                const priorSlotService =
                  SERVICE.DefaultCmsSlotDefinitionService;
                SERVICE.DefaultCmsSlotDefinitionService = {
                  saveAll: async (operation) => {
                    assert.strictEqual(operation.tenant, request.tenant);
                    assert.strictEqual(operation.models[0].code, model.code);
                    return bulkOutput;
                  },
                };
                try {
                  await modelImport.insertLocalSchemaModel(request, [model]);
                  assert.fail(
                    "A generated saveAll failure must reach the actual import wrapper",
                  );
                } finally {
                  if (priorSlotService === undefined)
                    delete SERVICE.DefaultCmsSlotDefinitionService;
                  else
                    SERVICE.DefaultCmsSlotDefinitionService = priorSlotService;
                }
              }
              persistedSlots.push(model.code);
            } else {
              await validationService.validateRenderer({ model });
              persistedTemplates.set(model.code, model);
            }
            return { code: model.code };
          },
        },
      };
      const fixture = path.resolve(
        __dirname,
        root,
        "test/fixtures/phasedRetryRecords.js",
      );
      const request = {
        tenant: "default",
        importRun: { summary: {} },
        inputPath: { successPath: "offline-only" },
        dataFiles: { slots: { file: fixture, processed: [], done: false } },
      };
      if (scenario !== "missing")
        request.dataFiles.templates = {
          file: fixture,
          processed: [],
          done: false,
        };
      let failure;
      try {
        await owner.processFiles(
          request,
          {},
          {
            phase: 0,
            phaseLimit: 3,
            pendingFiles: Object.keys(request.dataFiles),
          },
        );
      } catch (error) {
        failure = error;
      }
      if (scenario === "recover") {
        assert.strictEqual(failure, undefined);
        assert.deepStrictEqual(attempts, { slots: 2, templates: 1 });
        assert.strictEqual(
          persistedTemplates.size,
          Object.keys(templates).length,
        );
        assert.strictEqual(persistedSlots.length, Object.keys(slots).length);
        assert.strictEqual(new Set(persistedSlots).size, persistedSlots.length);
        assert.strictEqual(request.importRun.summary.recordsFailed || 0, 0);
        assert.strictEqual(archived.length, 2);
      } else {
        assert(failure, scenario + " must fail closed");
        assert.strictEqual(persistedSlots.length, 0);
        assert.strictEqual(attempts.slots, scenario === "missing" ? 3 : 1);
        assert.strictEqual(attempts.templates, 0);
        assert.strictEqual(archived.length, 0);
        assert(request.importRun.summary.recordsFailed > 0);
        if (["layout", "identity"].includes(scenario))
          assert.strictEqual(lookups.length, 0);
      }
    }
    console.log(
      "CMS slot dependency validated through real import phases: recovery, bounded exhaustion and terminal layout/access/provider failures",
    );
  } finally {
    if (upperCaseDescriptor)
      Object.defineProperty(
        String.prototype,
        "toUpperCaseFirstChar",
        upperCaseDescriptor,
      );
    else delete String.prototype.toUpperCaseFirstChar;
    Object.entries(saved).forEach(([key, entry]) => {
      if (entry.exists) global[key] = entry.value;
      else delete global[key];
    });
  }
}

(async function validateWcmsAuthoringServices() {
  await verifySlotTemplateImportPhases();
  global.SERVICE = {};
  await validationService.validateSlotDefinition({
    model: {
      code: "homepage-main",
      minItems: 0,
      maxItems: 4,
      allowedComponentTypes: ["cms.hero.banner"],
      allowedComponentTypeGroups: ["contentComponents"],
    },
  });
  await assert.rejects(
    () =>
      validationService.validateSlotDefinition({
        model: { code: "homepage-main", minItems: 4, maxItems: 2 },
      }),
    (error) => error.code === "ERR_CMS_00095",
  );

  let templateLookup;
  global.SERVICE = {
    DefaultCmsPageTemplateService: {
      get: function (request) {
        templateLookup = request;
        return Promise.resolve({
          result: [
            { code: "documentation-template", active: true, versionId: 2 },
            { code: "documentation-template", active: true, versionId: 1 },
          ],
        });
      },
    },
  };
  await validationService.validateSlotDefinition({
    tenant: "default",
    model: { code: "documentation-slot", template: "documentation-template" },
  });
  assert.deepStrictEqual(
    templateLookup.searchOptions,
    { limit: 2, sort: { versionId: -1 } },
    "Staged reference validation must resolve the latest immutable revision deterministically",
  );

  global.SERVICE = {
    DefaultCmsPageService: matchingService("code", "home"),
    DefaultCmsPageRouteService: matchingService("code", "home-route"),
    DefaultCmsNavigationNodeService: navigationService({
      parent: "root",
      root: null,
    }),
    DefaultCmsRestrictionTypeService: matchingService("code", "user-group"),
    DefaultCmsComponentService: matchingService("code", "hero"),
    DefaultCmsSlotDefinitionService: matchingService("code", "homepage-main"),
  };

  await validationService.validateNavigationNode({
    model: {
      code: "child",
      site: "storefront",
      parent: "parent",
      nodeType: "PAGE",
      targetPage: "home",
    },
  });
  await validationService.validateNavigationNode({
    model: {
      code: "route-link",
      site: "storefront",
      nodeType: "ROUTE",
      targetRoute: "home-route",
    },
  });
  await validationService.validateNavigationNode({
    model: {
      code: "external-link",
      site: "storefront",
      nodeType: "EXTERNAL",
      externalUrl: "https://example.com/help",
    },
  });
  await assert.rejects(
    () =>
      validationService.validateNavigationNode({
        model: {
          code: "unsafe-link",
          site: "storefront",
          nodeType: "EXTERNAL",
          externalUrl: "javascript:alert(1)",
        },
      }),
    (error) => error.code === "ERR_CMS_00096",
  );

  global.SERVICE.DefaultCmsNavigationNodeService = navigationService({
    parent: "child",
  });
  await assert.rejects(
    () =>
      validationService.validateNavigationNode({
        model: {
          code: "child",
          site: "storefront",
          parent: "parent",
          nodeType: "CONTAINER",
        },
      }),
    (error) => error.code === "ERR_CMS_00096",
  );

  await validationService.validateRestrictionType({
    model: {
      code: "user-group",
      targetTypes: ["PAGE", "COMPONENT"],
      propertySchema: { userGroups: { type: "array" } },
      evaluator: "cms.user-group",
    },
  });
  assert.strictEqual(validationService.safeLogicalKey("cms.user-group"), true);
  assert.strictEqual(
    validationService.safeLogicalKey("https://example.com/evaluator"),
    false,
  );
  assert.throws(
    () =>
      validationService.validateRestrictionType({
        model: { code: "bad-target", targetTypes: ["PRODUCT"] },
      }),
    (error) => error.code === "ERR_CMS_00097",
  );
  assert.throws(
    () =>
      validationService.validateRestrictionType({
        model: {
          code: "bad-evaluator",
          evaluator: "https://example.com/evaluator",
        },
      }),
    (error) => error.code === "ERR_CMS_00097",
  );

  global.SERVICE.DefaultCmsNavigationNodeService = navigationService({
    parent: "root",
    root: null,
  });
  await validationService.validateRestriction({
    model: {
      code: "home-user-group",
      restrictionType: "user-group",
      targetType: "PAGE",
      targetCode: "home",
      mode: "INCLUDE",
      properties: { userGroups: ["contentApprover"] },
    },
  });
  await assert.rejects(
    () =>
      validationService.validateRestriction({
        model: {
          code: "missing-type",
          restrictionType: "missing",
          targetType: "PAGE",
          targetCode: "home",
        },
      }),
    (error) => error.code === "ERR_CMS_00098",
  );

  console.log("CMS WCMS authoring schema contract validated");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
