/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module store/test/storePlacementContract @description Runs signed placement admission through the actual generated Store get, pipeline, schema access and Mongo adapter with synthetic cursor I/O only. @layer test @owner store @override Extend boundary coverage without native records or deployment adoption. */
const test = require("node:test"),
  assert = require("node:assert/strict");
const fs = require("node:fs"),
  path = require("node:path"),
  Module = require("node:module");
const foundation = "../../../../../../nodics.foundation/modules/";
const owner = require("../src/service/defaultStorePlacementService");
const controller = require("../src/controller/defaultStorePlacementController");
const route = require("../src/router/routers").store.internal.placement;
const properties = require("../config/properties");
const logger = require(foundation + "nConfig/src/service/DefaultLoggerService");
const runtime = require(
  foundation + "nAuth/src/service/identity/defaultServiceTokenService",
);
const identity = require(
  foundation + "nAuth/src/service/identity/defaultIdentityGovernanceService",
);
const access = require(
  foundation +
    "nDatabase/database/src/service/schema/defaultSchemaAccessHandlerService",
);
const schemaOwner = require(
  foundation +
    "nDatabase/database/src/service/schema/defaultDatabaseSchemaHandlerService",
);
const readPolicy = require(
  foundation +
    "nDatabase/database/src/service/schema/defaultSchemaReadAccessPolicyService",
);
const initializer = require(
  foundation +
    "nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService",
);
const mongo = require(
  foundation + "nDatabase/mongodb/src/schemas/model",
).default;
const pipeline = require(
  foundation + "nPipeline/src/service/pipeline/defaultPipelineService",
);
const validator = require(
  foundation +
    "nRouter/src/service/tooling/defaultOpenapiContractGeneratorService",
);
const dispatcher = require(
  foundation +
    "nRouter/src/service/request/defaultRequestHandlerPipelineService",
);
const clone = (value) => structuredClone(value);

test("Store owns the semantic Online read role without enabling callers", (t) => {
  const descriptor = Object.getOwnPropertyDescriptor(global, "_");
  t.after(() => {
    if (descriptor) Object.defineProperty(global, "_", descriptor);
    else delete global._;
  });
  global._ = require("lodash");
  const loader = require(
    foundation + "nConfig/src/service/DefaultFrameworkInitializerService",
  );
  for (const role of ["COMMERCE", "COMMERCE_STAGED", "UNRELATED"]) {
    const effective = loader.deriveRuntimeRoleProfile(
      { ...clone(properties), runtimeRole: { code: role } },
      "store",
    );
    assert.equal(
      effective.store.placementRead.runtimeRole,
      role === "COMMERCE" ? "COMMERCE" : null,
    );
    assert.equal(effective.store.placementRead.enabled, false);
    assert.deepEqual(effective.store.placementRead.callers, []);
    assert.equal(effective.store.runtimeRoleProfiles, undefined);
  }
});

/** Compiles the real service generator template without changing generated source. */
function generatedStore() {
  const filename = path.resolve(
    __dirname,
    foundation,
    "nService/src/service/common.js",
  );
  let source = fs.readFileSync(filename, "utf8");
  for (const [key, value] of Object.entries({
    mdulnm: "store",
    mdlnm: "storeModel",
    schmanm: "store",
    srvcName: "DefaultStoreService",
  }))
    source = source.replaceAll(key, value);
  const compiled = new Module(filename, module);
  compiled.paths = module.paths;
  compiled._compile(source, filename);
  return compiled.exports;
}

/** Installs canonical owners; only Mongo cursor and count are artificial, with no native or write ports. */
function fixture(t) {
  const keys = [
    "_",
    "CONFIG",
    "UTILS",
    "CLASSES",
    "PIPELINE",
    "NODICS",
    "SERVICE",
    "CONTROLLER",
  ];
  const previous = Object.fromEntries(
    keys.map((key) => [key, Object.getOwnPropertyDescriptor(global, key)]),
  );
  const stringMethod = Object.getOwnPropertyDescriptor(
    String.prototype,
    "toUpperCaseFirstChar",
  );
  t.after(() => {
    for (const key of keys) {
      if (previous[key]) Object.defineProperty(global, key, previous[key]);
      else delete global[key];
    }
    if (stringMethod)
      Object.defineProperty(
        String.prototype,
        "toUpperCaseFirstChar",
        stringMethod,
      );
    else delete String.prototype.toUpperCaseFirstChar;
  });
  Object.defineProperty(String.prototype, "toUpperCaseFirstChar", {
    configurable: true,
    writable: true,
    value: function () {
      return this.charAt(0).toUpperCase() + this.slice(1);
    },
  });
  global._ = require("lodash");
  const log = { debug() {}, warn() {}, error() {}, info() {} };
  class NodicsError extends Error {
    constructor(value, message, code) {
      super(message || value?.message || String(value));
      this.code = code || value?.code || value;
    }
    static enrich(error) {
      return error;
    }
  }
  global.CLASSES = {
    NodicsError,
    PipelineHead: require(foundation + "nPipeline/src/lib/pipelineHead"),
    PipelineNode: require(foundation + "nPipeline/src/lib/pipelineNode"),
  };
  global.UTILS = {
    isBlank: (value) => value == null || _.isEmpty(value),
    isObject: _.isObject,
    generateUniqueCode: () => "fixture",
  };
  const caller = {
    tenant: "tenant",
    principalEnterpriseCode: "issuer",
    serviceId: "staged-runtime",
    projectCode: "project",
    environmentCode: "projectLocal",
    serverCode: "staged",
    instanceCode: "instance",
    assignmentCode: "assignment",
    placements: [{ storeCode: "store-a", enterpriseCode: "store-enterprise" }],
  };
  const config = {
    store: {
      placementRead: {
        enabled: true,
        runtimeRole: "COMMERCE",
        callers: [caller],
      },
    },
    runtimeRole: { code: "COMMERCE", publication: "OPERATIONAL" },
    schemaPolicies: properties.schemaPolicies,
    identityGovernance: { systemAccessGroups: ["serviceAccountUserGroup"] },
    log: { requestPrivacy: { qualified: true, captureMode: "disabled" } },
    accessPoints: {
      readAccessPoint: 1,
      writeAccessPoint: 2,
      removeAccessPoint: 3,
      fullAccessPoint: 10,
    },
    cache: { enabled: false },
  };
  global.CONFIG = { get: (key) => config[key] };
  global.PIPELINE = {
    ...require(foundation + "nPipeline/src/pipelines/pipelines"),
    ...require(foundation + "nDatabase/database/src/pipelines/pipelines"),
  };
  const effective = schemaOwner.applyNamedSchemaPolicies(
    "store",
    clone(require("../src/schemas/schemas").store),
  );
  const state = {
    config,
    caller,
    finds: 0,
    counts: 0,
    contexts: [],
    rows: [
      {
        tenant: "tenant",
        code: "store-a",
        revision: 3,
        active: true,
        status: "ACTIVE",
        enterpriseRef: {
          module: "profile",
          schema: "enterprise",
          code: "store-enterprise",
        },
        privateField: "must-not-escape",
      },
    ],
  };
  const model = {
    ...mongo,
    moduleName: "store",
    schemaName: "store",
    rawSchema: effective.store,
    cache: { enabled: false },
    find(query) {
      state.finds++;
      assert.deepEqual(query, {
        tenant: "tenant",
        code: "store-a",
        status: "ACTIVE",
      });
      return {
        toArray: async () => {
          await state.duringRead?.();
          return clone(state.rows);
        },
      };
    },
    countDocuments: async () => {
      state.counts++;
      return state.rows.length;
    },
  };
  global.NODICS = {
    getServerState: () => "started",
    getModels: (moduleName, tenant) => {
      assert.equal(moduleName, "store");
      assert.equal(tenant, "tenant");
      return { storeModel: model };
    },
  };
  const generated = generatedStore();
  global.SERVICE = {
    DefaultStorePlacementService: owner,
    DefaultStoreMerchantReadService: require("../src/service/defaultStoreMerchantReadService"),
    DefaultServiceTokenService: runtime,
    DefaultIdentityGovernanceService: identity,
    DefaultLoggerService: { ...logger, createLogger: () => log },
    DefaultPipelineService: { ...pipeline, LOG: log },
    DefaultModelsGetInitializerService: { ...initializer, LOG: log },
    DefaultSchemaAccessHandlerService: access,
    DefaultSchemaReadAccessPolicyService: readPolicy,
    DefaultRecordOwnershipPolicyService: require(
      foundation +
        "nDatabase/database/src/service/access/defaultRecordOwnershipPolicyService",
    ),
    DefaultDatabaseConfigurationService: {
      getSchemaInterceptors: () => ({}),
      getSchemaValidators: () => ({}),
    },
    DefaultStoreService: {
      get: async (context) => {
        state.contexts.push(context);
        await state.beforeGet?.(context);
        const result = await generated.get(
          state.copy ? { ...context } : context,
        );
        await state.afterGet?.(result);
        return result;
      },
    },
  };
  state.model = model;
  state.generated = generated;
  state.request = {
    tenant: "tenant",
    entCode: "issuer",
    router: route,
    payload: { contractVersion: 1, storeCode: "store-a" },
    httpRequest: { headers: { tenant: "tenant" } },
    authData: {
      principalType: "service",
      tokenType: "service",
      tenant: "tenant",
      entCode: "issuer",
      serviceId: "staged-runtime",
      runtimeInstanceId: "instance",
      runtimeScope: {
        projectCode: "project",
        environmentCode: "projectLocal",
        serverCode: "staged",
        instanceCode: "instance",
        assignmentCode: "assignment",
      },
      modules: ["store"],
      permissions: ["commerce.store.read"],
      userGroups: [],
    },
  };
  state.request.httpRequest.body = state.request.payload;
  state.admit = (request) =>
    logger.runRequestPrivacy(request, () => {
      logger.resolveRequestPrivacy(request, true);
      logger.admitPrivateRoute(request);
    });
  state.admit(state.request);
  return state;
}

test("private signed placement executes real generated access and Mongo pipeline, returns only minimal readback", async (t) => {
  const f = fixture(t),
    before = clone(f.request);
  assert.equal(validator.isValidRoute("placement", route), true);
  const response = await controller.placement(f.request);
  assert.deepEqual(response, {
    data: {
      contractVersion: 1,
      tenant: "tenant",
      store: {
        code: "store-a",
        enterpriseCode: "store-enterprise",
        revision: 3,
        active: true,
        status: "ACTIVE",
      },
    },
  });
  assert.deepEqual(f.request, before);
  assert.equal(f.finds, 2);
  assert.equal(f.counts, 2);
  assert.equal(f.contexts[0].authData.isSystem, true);
  assert.equal(f.request.authData.isSystem, undefined);
  for (const context of f.contexts) {
    assert.throws(() => owner.checkPersistenceRead(context), /admission/);
    await assert.rejects(f.generated.get(context), /admission/);
  }
  await assert.rejects(
    f.generated.get({
      tenant: "tenant",
      authData: f.request.authData,
      query: { code: "store-a" },
    }),
  );
  assert.equal(
    f.finds,
    2,
    "Route permission never grants generic generated access",
  );
});

test(
  "actual HTTP dispatcher completes once on Store success without caching private evidence",
  { timeout: 1000 },
  async (t) => {
    const f = fixture(t),
      response = {},
      originalAuth = f.request.authData;
    global.CONTROLLER = { DefaultStorePlacementController: controller };
    let successes = 0,
      errors = 0;
    await new Promise((resolve, reject) =>
      dispatcher.handleRequest.call(
        { LOG: { debug() {} } },
        f.request,
        response,
        {
          nextSuccess(request, result) {
            successes++;
            assert.equal(request, f.request);
            assert.equal(result, response);
            resolve();
          },
          error(request, result, error) {
            errors++;
            reject(error);
          },
        },
      ),
    );
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(successes, 1);
    assert.equal(errors, 0);
    assert.equal(f.request.authData, originalAuth);
    assert.deepEqual(response.success, {
      data: {
        contractVersion: 1,
        tenant: "tenant",
        store: {
          code: "store-a",
          enterpriseCode: "store-enterprise",
          revision: 3,
          active: true,
          status: "ACTIVE",
        },
      },
    });
    assert.equal(f.request.cachePolicyDecision.cacheable, false);
    assert.equal(f.finds, 2);
  },
);

test(
  "actual HTTP dispatcher completes rejected and synchronous failing Store reads exactly once",
  { timeout: 1000 },
  async (t) => {
    const f = fixture(t);
    global.CONTROLLER = { DefaultStorePlacementController: controller };
    f.config.store.placementRead.enabled = false;
    for (const synchronous of [false, true]) {
      if (synchronous)
        SERVICE.DefaultStorePlacementService = {
          placement() {
            throw new Error("Artificial owner failure");
          },
        };
      let successes = 0,
        errors = 0;
      const response = {};
      const failure = await new Promise((resolve) =>
        dispatcher.handleRequest.call(
          { LOG: { debug() {} } },
          f.request,
          response,
          {
            nextSuccess() {
              successes++;
              resolve(null);
            },
            error(request, result, error) {
              errors++;
              resolve(error);
            },
          },
        ),
      );
      await new Promise((resolve) => setImmediate(resolve));
      assert(failure instanceof Error);
      assert.equal(successes, 0);
      assert.equal(errors, 1);
      assert.equal(response.success, undefined);
      assert.equal(f.finds, 0);
    }
  },
);

for (const [name, mutate] of [
  [
    "disabled",
    (f) => {
      f.config.store.placementRead.enabled = false;
    },
  ],
  [
    "missing policy",
    (f) => {
      delete f.config.store.placementRead;
    },
  ],
  [
    "wrong receiver",
    (f) => {
      f.config.runtimeRole.code = "OTHER";
    },
  ],
  [
    "Staged receiver",
    (f) => {
      f.config.runtimeRole.publication = "STAGED";
    },
  ],
  [
    "publication-only receiver",
    (f) => {
      f.config.runtimeRole.publication = "ONLINE";
    },
  ],
  [
    "missing read permission",
    (f) => {
      f.request.authData.permissions = [];
    },
  ],
  [
    "wildcard permission",
    (f) => {
      f.request.authData.permissions = ["commerce.*"];
    },
  ],
  [
    "missing module",
    (f) => {
      f.request.authData.modules = [];
    },
  ],
  [
    "human",
    (f) => {
      f.request.authData.principalType = "human";
      f.request.authData.tokenType = "access";
    },
  ],
  [
    "system",
    (f) => {
      f.request.authData.isSystem = true;
    },
  ],
  [
    "body tenant",
    (f) => {
      f.request.payload.tenant = "foreign";
    },
  ],
  [
    "foreign tenant alias",
    (f) => {
      f.request.tenantCode = "foreign";
    },
  ],
  [
    "foreign namespace header",
    (f) => {
      f.request.httpRequest.headers["X-Enterprise-Code"] = "store-enterprise";
    },
  ],
  [
    "duplicate caller",
    (f) => {
      f.config.store.placementRead.callers.push(clone(f.caller));
    },
  ],
  [
    "duplicate pair",
    (f) => {
      f.caller.placements.push(clone(f.caller.placements[0]));
    },
  ],
  [
    "unbounded callers",
    (f) => {
      f.config.store.placementRead.callers = Array(101).fill(f.caller);
    },
  ],
  [
    "unbounded placements",
    (f) => {
      f.caller.placements = Array(101).fill(f.caller.placements[0]);
    },
  ],
  [
    "wildcard pair",
    (f) => {
      f.caller.placements[0].storeCode = "*";
    },
  ],
  [
    "extra caller field",
    (f) => {
      f.caller.any = true;
    },
  ],
  [
    "wrong requested Store",
    (f) => {
      f.request.payload.storeCode = "other";
    },
  ],
  ...[
    "tenant",
    "principalEnterpriseCode",
    "serviceId",
    "projectCode",
    "environmentCode",
    "serverCode",
    "instanceCode",
    "assignmentCode",
  ].map((key) => [
    "wrong " + key,
    (f) => {
      f.caller[key] = "other";
    },
  ]),
])
  test("placement denies " + name + " before generated I/O", async (t) => {
    const f = fixture(t);
    mutate(f);
    await assert.rejects(owner.placement(f.request));
    assert.equal(f.contexts.length, 0);
  });

test("private capture, copied original, copied persistence context and cleanup cannot mint admission", async (t) => {
  const f = fixture(t);
  await assert.rejects(owner.placement({ ...f.request }));
  f.copy = true;
  await assert.rejects(owner.placement(f.request), /admission/);
  assert.equal(f.finds, 0);
  f.copy = false;
  f.config.log.requestPrivacy.qualified = false;
  await assert.rejects(owner.placement(f.request));
  assert.equal(f.finds, 0);
  f.config.log.requestPrivacy.qualified = true;
  assert.equal((await owner.placement(f.request)).store.code, "store-a");
});

for (const [name, mutate] of [
  [
    "empty",
    (f) => {
      f.rows = [];
    },
  ],
  [
    "ambiguous",
    (f) => {
      f.rows.push(clone(f.rows[0]));
    },
  ],
  [
    "foreign tenant",
    (f) => {
      f.rows[0].tenant = "other";
    },
  ],
  [
    "foreign Store",
    (f) => {
      f.rows[0].code = "other";
    },
  ],
  [
    "foreign enterprise",
    (f) => {
      f.rows[0].enterpriseRef.code = "other";
    },
  ],
  [
    "inactive",
    (f) => {
      f.rows[0].active = false;
    },
  ],
  [
    "status",
    (f) => {
      f.rows[0].status = "INACTIVE";
    },
  ],
  [
    "revision",
    (f) => {
      f.rows[0].revision = 0;
    },
  ],
  [
    "contradictory module",
    (f) => {
      f.rows[0].enterpriseRef.moduleName = "other";
    },
  ],
  [
    "contradictory schema",
    (f) => {
      f.rows[0].enterpriseRef.schemaName = "customer";
    },
  ],
  [
    "failed final response",
    (f) => {
      f.afterGet = (response) => {
        response.code = "ERR_READ";
      };
    },
  ],
  [
    "missing final count",
    (f) => {
      f.afterGet = (response) => {
        delete response.count;
      };
    },
  ],
  [
    "count mismatch",
    (f) => {
      f.afterGet = (response) => {
        response.count = 2;
      };
    },
  ],
  [
    "malformed errors",
    (f) => {
      f.afterGet = (response) => {
        response.errors = {};
      };
    },
  ],
])
  test("real pipeline refuses " + name + " placement evidence", async (t) => {
    const f = fixture(t);
    mutate(f);
    await assert.rejects(owner.placement(f.request), /placement/);
  });

test("schema-bound enterprise strings, code-only and both alias forms are normalized only by Store", async (t) => {
  const f = fixture(t);
  for (const ref of [
    "store-enterprise",
    { code: "store-enterprise" },
    {
      code: "store-enterprise",
      moduleName: "profile",
      schemaName: "enterprise",
    },
    { code: "store-enterprise", module: "profile", schema: "enterprise" },
  ]) {
    f.rows[0].enterpriseRef = ref;
    assert.equal(
      (await owner.placement(f.request)).store.enterpriseCode,
      "store-enterprise",
    );
  }
});

test("original caller/config drift during generated I/O fails readback and recovery is request-local", async (t) => {
  const f = fixture(t);
  f.duringRead = () => {
    f.request.authData.runtimeScope.assignmentCode = "changed";
  };
  await assert.rejects(owner.placement(f.request));
  f.request.authData.runtimeScope.assignmentCode = "assignment";
  f.duringRead = () => {
    f.caller.placements[0].enterpriseCode = "changed";
  };
  await assert.rejects(owner.placement(f.request));
  f.caller.placements[0].enterpriseCode = "store-enterprise";
  f.duringRead = undefined;
  f.afterGet = () => {
    f.rows[0].revision++;
  };
  await assert.rejects(owner.placement(f.request), /changed during readback/);
  f.afterGet = undefined;
  assert.equal(
    (await owner.placement(f.request)).store.revision,
    f.rows[0].revision,
  );
});

test("copied/mutated fixed query is denied before driver I/O, simultaneous originals remain isolated", async (t) => {
  const f = fixture(t);
  f.beforeGet = (context) => {
    context.query.code = "other";
  };
  await assert.rejects(owner.placement(f.request));
  assert.equal(f.finds, 0);
  f.beforeGet = undefined;
  const second = clone(f.request);
  f.admit(second);
  const results = await Promise.all([
    owner.placement(f.request),
    owner.placement(second),
  ]);
  assert.deepEqual(results[0], results[1]);
  assert.notEqual(f.contexts.at(-1).authData, f.contexts.at(-2).authData);
});

test("inert owner defaults and route do not expose generic schema or write authority", () => {
  assert.equal(properties.store.placementRead.enabled, false);
  assert.equal(properties.store.placementRead.runtimeRole, null);
  assert.deepEqual(properties.store.placementRead.callers, []);
  assert.equal(
    properties.apiExposure.categories.storePlacementRead.enabled,
    false,
  );
  assert.equal(route.permission, "commerce.store.read");
  assert.deepEqual(route.authTokenTypes, ["service"]);
  assert.equal(route.requestPrivacy.sensitive, true);
  assert.equal(route.cache.enabled, false);
});
