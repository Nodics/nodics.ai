/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/test/passwordOwnershipPipelineContract @description Isolates generated nested credential selector propagation using actual pipeline heads, generic wrappers, save/query steps and historical guards with in-memory persistence only. @layer test @owner profile */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const crypto = require("node:crypto");
const lodash = require("lodash");
const foundation = "../../../../nodics.foundation/modules/";
const writer = require("../src/service/interceptors/defaultPasswordSaveInterceptorService");
const authentication = require("../src/service/authentication/defaultAuthenticationProviderService");
const historical = require("../src/service/identity/defaultCanonicalHistoricalIdentityLinkService");
const membership = require("../src/service/enterprise/defaultEnterpriseMembershipService");
const inventory = require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService");
const bootstrap = require("../src/service/identity/defaultMandatoryIdentityBootstrapService");
const concurrency = require(
  foundation +
    "nDatabase/database/src/service/schema/defaultModelConcurrencyService",
);
const update = require(
  foundation +
    "nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService",
);
const hooks = require("../src/interceptors/interceptors");
const interceptorConfiguration = require(
  foundation +
    "nCommon/src/service/config/defaultInterceptorConfigurationService",
);
const modelService = require(
  foundation + "nDatabase/database/src/service/model/defaultModelService",
);
const single = require(
  foundation +
    "nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService",
);
const bulk = require(
  foundation +
    "nDatabase/database/src/service/procs/save/defaultModelsSaveInitializerService",
);
const query = require(
  foundation +
    "nDatabase/database/src/service/procs/query/defaultModelQueryBuilderPipelineService",
);
const pipeline = require(
  foundation + "nPipeline/src/service/pipeline/defaultPipelineService",
);
const releaseOwner = require(
  foundation +
    "nData/nImport/import/src/service/release/defaultDataReleaseService",
);
const importWriter = require(
  foundation +
    "nData/nImport/import/src/service/process/model/defaultModelImportProcessService",
);

/** Matches only fixture selectors; never opens a provider connection. */
function matches(row, selector) {
  return Object.entries(selector || {}).every(([key, value]) =>
    key === "$and"
      ? value.every((part) => matches(row, part))
      : key === "$or"
        ? value.some((part) => matches(row, part))
        : value && typeof value === "object" && "$in" in value
          ? value.$in.some((item) => String(item) === String(row[key]))
          : value && typeof value === "object" && "$exists" in value
            ? Object.hasOwn(row, key) === value.$exists
            : String(row[key]) === String(value),
  );
}

/** Materializes the actual framework wrapper template exactly as generation replaces its module/model placeholders. */
function wrapper(name) {
  const text = fs
    .readFileSync(
      require.resolve(foundation + "nService/src/service/common"),
      "utf8",
    )
    .replaceAll("mdulnm", "profile")
    .replaceAll("mdlnm", name + "Model")
    .replaceAll("schmanm", name.toLowerCase());
  const box = { exports: {} };
  vm.runInNewContext(text, {
    module: box,
    SERVICE,
    NODICS,
    CONFIG,
    CLASSES,
    UTILS,
  });
  return box.exports;
}

/** Real pipeline/generic save and nested traversal with only provider/infrastructure boundaries replaced by memory; qualification flags remain off. */
function fixture(guarded = true) {
  global._ = lodash;
  if (!String.prototype.toUpperCaseFirstChar)
    Object.defineProperty(String.prototype, "toUpperCaseFirstChar", {
      value: function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
      },
      configurable: true,
    });
  const logger = { debug() {}, info() {}, warn() {}, error() {} };
  class FixtureError extends Error {
    constructor(value, message, code) {
      super(message || value?.message || String(value));
      this.code = value?.code || code || value;
    }
    static enrich(error) {
      return error instanceof Error ? error : new FixtureError(error);
    }
    add(error) {
      this.cause = error;
      return this;
    }
    toJSON() {
      return { code: this.code };
    }
  }
  global.CLASSES = {
    NodicsError: FixtureError,
    PipelineHead: require(foundation + "nPipeline/src/lib/pipelineHead"),
    PipelineNode: require(foundation + "nPipeline/src/lib/pipelineNode"),
  };
  global.CONFIG = {
    get: (key) =>
      key === "defaultErrorCodes"
        ? { DataImportError: "ERR_IMP_00000" }
        : undefined,
  };
  CLASSES.DataImportError = require(
    foundation + "nData/nImport/import/src/lib/dataImportError",
  );
  global.UTILS = {
    sortObject: require(foundation + "nConfig/src/utils/utils").sortObject,
    isBlank: (value) => !value || !Object.keys(value).length,
    isObject: (value) =>
      !!value && typeof value === "object" && !Array.isArray(value),
    isObjectId: () => false,
    isArrayOfObject: (value) =>
      Array.isArray(value) &&
      value.length > 0 &&
      value.every((item) => item && typeof item === "object"),
    generateUniqueCode: () => crypto.randomUUID(),
    encryptPassword: async (value) => {
      state.hashes++;
      return "fixture-hash:" + value;
    },
  };
  const state = {
    hashes: 0,
    mutations: [],
    credentials: [
      {
        _id: "password-admin",
        code: "password_admin",
        loginId: "admin",
        password: "original-admin-hash",
        active: true,
      },
    ],
    employees: [
      {
        _id: "admin-record",
        code: "admin",
        loginId: "admin",
        password: "password-admin",
        principalType: "human",
      },
    ],
    customers: [],
  };
  const collection = (name) =>
    name === "Password"
      ? state.credentials
      : name === "Employee"
        ? state.employees
        : state.customers;
  const models = {};
  for (const name of ["Password", "Employee", "Customer"])
    models[name + "Model"] = {
      schemaName: name.toLowerCase(),
      moduleName: "profile",
      rawSchema: {
        refSchema:
          name === "Password"
            ? {}
            : {
                password: {
                  enabled: true,
                  schemaName: "password",
                  type: "one",
                  propertyName: "_id",
                },
              },
        schemaOptions: { original: {} },
      },
      saveItems: async (request) => {
        const rows = collection(name);
        const selected =
          request.query && Object.keys(request.query).length
            ? rows.filter((row) => matches(row, request.query))
            : [];
        state.mutations.push({
          name,
          query: lodash.cloneDeep(request.query),
          options: lodash.cloneDeep(request.options),
          matches: selected.length,
        });
        if (selected.length) {
          const updated = request.options?.replaceAllMatchesByQuery
            ? selected
            : selected.slice(0, 1);
          updated.forEach((row) => Object.assign(row, request.model));
          return updated[0];
        }
        const row = {
          ...request.model,
          _id: request.model._id || name + "-" + rows.length,
        };
        rows.push(row);
        return row;
      },
      updateItems: async (request) => {
        const selected = collection(name).filter((row) =>
          matches(row, request.query),
        );
        state.mutations.push({
          name,
          query: lodash.cloneDeep(request.query),
          options: lodash.cloneDeep(request.options),
          matches: selected.length,
        });
        for (const row of selected)
          Object.assign(row, request.model.$set || request.model);
        return {
          acknowledged: true,
          matchedCount: selected.length,
          modifiedCount: selected.length,
        };
      },
    };
  global.NODICS = { getModels: () => models, getModule: () => undefined };
  global.SERVICE = {
    DefaultLoggerService: {
      inheritRequestPrivacy() {},
      createLogger: () => logger,
      isSensitiveRequest: () => true,
    },
    DefaultPipelineService: { ...pipeline, LOG: logger },
    DefaultModelQueryBuilderPipelineService: { ...query, LOG: logger },
    DefaultModelService: modelService,
    DefaultModelsSaveInitializerService: { ...bulk, LOG: logger },
    DefaultModelConcurrencyService: concurrency,
    DefaultProfileService: { getProfileModuleName: () => "profile" },
    DefaultModelsUpdateInitializerService: { ...update, LOG: logger },
    DefaultModelSaveInitializerService: { ...single, LOG: logger },
    DefaultPrincipalSecurityStampGovernanceService: inventory,
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ system: true }),
    },
    DefaultEnterpriseMembershipService: membership,
    DefaultEnterpriseRegistrationService: require("../src/service/enterprise/defaultEnterpriseRegistrationService"),
    DefaultCanonicalHistoricalIdentityLinkService: historical,
    DefaultPasswordSaveInterceptorService: guarded
      ? writer
      : { ...writer, guardOwnership: async () => true },
    DefaultDatabaseConfigurationService: {
      getSchemaInterceptors: (schema) => ({
        preSave: interceptorConfiguration.sortInterceptors({
          preSave: Object.values(hooks).filter(
            (h) =>
              h.type === "schema" &&
              h.item === schema &&
              h.trigger === "preSave" &&
              (h.handler ===
                "DefaultCanonicalHistoricalIdentityLinkService.protectMutation" ||
                h.handler ===
                  "DefaultPasswordSaveInterceptorService.encryptPassword" ||
                (guarded &&
                  h.handler.startsWith(
                    "DefaultPasswordSaveInterceptorService.guard",
                  ))),
          ),
        }).preSave,
        preUpdate: interceptorConfiguration.sortInterceptors({
          preUpdate: Object.values(hooks).filter(
            (h) =>
              h.type === "schema" &&
              h.item === schema &&
              h.trigger === "preUpdate" &&
              (h.handler ===
                "DefaultCanonicalHistoricalIdentityLinkService.protectMutation" ||
                h.handler ===
                  "DefaultPasswordSaveInterceptorService.encryptPassword" ||
                (guarded &&
                  h.handler.startsWith(
                    "DefaultPasswordSaveInterceptorService.guard",
                  ))),
          ),
        }).preUpdate,
      }),
    },
    DefaultInterceptorService: {
      executeInterceptors: async (list, request, response) => {
        for (const hook of list) {
          const [name, method] = hook.handler.split(".");
          await SERVICE[name][method](request, response);
        }
      },
    },
  };
  for (const name of ["Password", "Employee", "Customer"]) {
    SERVICE["Default" + name + "Service"] = {
      ...wrapper(name),
      get: async (request) => {
        const rows = collection(name).filter((row) =>
          matches(row, request.query),
        );
        return {
          code: "SUC_GET_00000",
          count: rows.length,
          result: lodash.cloneDeep(rows),
        };
      },
    };
  }
  const next = (request, response, process) =>
    process.nextSuccess(request, response);
  // Irrelevant access/default/validator/cache/event boundaries are not qualified by this isolated test.
  for (const method of [
    "validateModel",
    "checkAccess",
    "enforceCreateAccessPolicies",
    "applyDefaultValues",
    "removeVirtualProperties",
    "applyPreValidators",
    "applyValidators",
    "populateSubModels",
    "populateVirtualProperties",
    "applyPostValidators",
    "applyPostInterceptors",
    "invalidateRouterCache",
    "invalidateItemCache",
    "triggerModelChangeEvent",
  ])
    SERVICE.DefaultModelSaveInitializerService[method] = next;
  for (const method of [
    "checkAccess",
    "enforceUpdateAccessPolicies",
    "applyPreValidators",
    "populateSubModels",
    "applyPostValidators",
    "applyPostInterceptors",
    "invalidateRouterCache",
    "invalidateItemCache",
    "triggerModelChangeEvent",
  ])
    SERVICE.DefaultModelsUpdateInitializerService[method] = next;
  global.PIPELINE = lodash.cloneDeep(
    require(foundation + "nDatabase/database/src/pipelines/pipelines"),
  );
  PIPELINE.defaultPipeline = {
    nodes: {
      successEnd: { handler: "DefaultPipelineService.handleSucessEnd" },
      handleError: { handler: "DefaultPipelineService.handleErrorEnd" },
    },
  };
  return { state, models };
}

/** Executes the actual startup provenance owner and actual model-import/generated writer; only immutable plan/in-memory provider boundaries are isolated. */
async function importStartupGuest(f, execute, tenant = "default") {
  const releases = {
    ...releaseOwner,
    configuration: () => ({
      types: { init: { enabled: true, startupExecution: true } },
    }),
    discoverReleases: () => [
      { moduleName: "profile", releaseCode: "profile:init-v001" },
    ],
    isDestinationCompatible: () => true,
    preparePlan: async () => ({ tenant }),
    operationReleases: async () => [{ status: "AVAILABLE" }],
    executePreparedPlan: execute,
  };
  SERVICE.DefaultDataReleaseService = releases;
  return releases.installStartupReleases({ tenant, modules: ["profile"] });
}

/** Builds an actual import dispatch from the immutable forward Customer source; no generated password is printed or delivered. */
function guestImport(f, record) {
  const header = require("../data/init-v007/headers/user/defaultUsersHeader")
    .profile.defaultCustomer;
  return importWriter.insertLocalSchemaModel(
    {
      tenant: "default",
      header: {
        ...header,
        options: { ...header.options, moduleName: "profile" },
        rawSchema: f.models.CustomerModel.rawSchema,
      },
    },
    [record],
  );
}

/** Uses the actual Mongo adapter with memory-only driver acknowledgements and an optional race immediately before Customer persistence. */
function useGuestMongoAdapter(
  f,
  beforeCustomerWrite = () => {},
  beforeEmployeeWrite = () => {},
) {
  const adapter = require(
    foundation + "nDatabase/mongodb/src/schemas/model",
  ).default;
  SERVICE.DefaultModelValidatorService = {
    ...require(
      foundation +
        "nDatabase/database/src/service/model/defaultModelValidatorService",
    ),
    LOG: { debug() {} },
  };
  for (const [name, rows] of [
    ["Customer", f.state.customers],
    ["Employee", f.state.employees],
    ["Password", f.state.credentials],
  ]) {
    Object.assign(f.models[name + "Model"], adapter, {
      dataBase: {
        getOptions: () => ({
          modelSaveOptions: { upsert: true, returnDocument: "after" },
        }),
      },
      insertOne: async (row) => {
        const insertedId = name + "-" + rows.length;
        rows.push({ ...row, _id: insertedId });
        f.state.mutations.push({ name, insert: true });
        return { acknowledged: true, insertedId };
      },
      findOneAndUpdate: async (selector, document, options) => {
        if (name === "Customer") beforeCustomerWrite();
        if (name === "Employee") beforeEmployeeWrite();
        const row = rows.find((item) => matches(item, selector));
        f.state.mutations.push({
          name,
          query: lodash.cloneDeep(selector),
          options: lodash.cloneDeep(options),
          matches: row ? 1 : 0,
        });
        if (row) {
          Object.assign(row, document.$set);
          return { ok: 1, value: structuredClone(row) };
        }
        if (options.upsert === false)
          return {
            ok: 1,
            value: null,
            lastErrorObject: { updatedExisting: false },
          };
        const insertedId = name + "-" + rows.length;
        rows.push({ ...document.$set, _id: insertedId });
        return { ok: 1, value: structuredClone(rows.at(-1)) };
      },
    });
  }
}

/** Sends an Employee record through the actual forward header and generated import pipeline. */
function employeeImport(f, record, tenant = "default") {
  const headers =
    require("../data/init-v008/headers/user/defaultUsersHeader").profile;
  const header =
    record.principalType === "service"
      ? headers.defaultServiceEmployee
      : headers.defaultEmployee;
  return importWriter.insertLocalSchemaModel(
    {
      tenant,
      header: {
        ...header,
        options: { ...header.options, moduleName: "profile" },
        rawSchema: f.models.EmployeeModel.rawSchema,
      },
    },
    [record],
  );
}

test("actual forward Init retains human and tenant-local service Employee credentials without hashing", async () => {
  for (const [principalType, tenant] of [
    ["human", "default"],
    ["service", "default"],
    ["service", "dynamic"],
  ]) {
    const f = fixture();
    Object.assign(f.state.employees[0], { principalType, authVersion: 7 });
    useGuestMongoAdapter(f);
    const before = structuredClone(f.state.credentials);
    const record = {
      code: "admin",
      loginId: "admin",
      principalType,
      authVersion: 1,
      password: { loginId: "admin", password: "unused-startup-password" },
    };
    await importStartupGuest(
      f,
      () => employeeImport(f, record, tenant),
      tenant,
    );
    assert.deepEqual(f.state.credentials, before);
    assert.equal(f.state.employees.length, 1);
    assert.equal(f.state.employees[0].password, "password-admin");
    assert.equal(f.state.employees[0].authVersion, 7);
    assert.equal(f.state.hashes, 0);
    assert.equal(f.state.mutations.length, 1);
    assert.equal(f.state.mutations[0].options.upsert, false);
  }
});

test("actual forward Init Employee writer refuses concurrent ownership drift and removal", async () => {
  for (const variant of [
    "password",
    "authVersion",
    "removed",
    "principalType",
    "authenticationIdentity",
    "identityLinkRetirement",
  ]) {
    const f = fixture();
    f.state.employees[0].authVersion = 7;
    const before = structuredClone(f.state.credentials);
    let concurrent;
    useGuestMongoAdapter(f, undefined, () => {
      if (variant === "removed") f.state.employees.splice(0);
      else if (variant === "password")
        f.state.employees[0].password = "concurrent-password";
      else if (variant === "principalType")
        f.state.employees[0].principalType = "service";
      else if (
        ["authenticationIdentity", "identityLinkRetirement"].includes(variant)
      )
        f.state.employees[0][variant] = { recordId: "concurrent-identity" };
      else f.state.employees[0].authVersion = 8;
      concurrent = structuredClone(f.state.employees);
    });
    const record = {
      code: "admin",
      loginId: "admin",
      principalType: "human",
      password: { loginId: "admin", password: "unused-startup-password" },
    };
    await assert.rejects(
      importStartupGuest(f, () => employeeImport(f, record)),
    );
    assert.deepEqual(f.state.credentials, before);
    assert.deepEqual(f.state.employees, concurrent);
    assert.equal(f.state.hashes, 0);
    assert.equal(f.state.mutations[0].options.upsert, false);
  }
});

test("private startup Employee preservation refuses public flags, type changes and human copies outside authority", async () => {
  for (const variant of [
    "public",
    "type",
    "human-tenant",
    "linked",
    "shared",
    "override",
  ]) {
    const f = fixture();
    useGuestMongoAdapter(f);
    const tenant = variant === "human-tenant" ? "dynamic" : "default";
    const record = {
      code: "admin",
      loginId: "admin",
      principalType: variant === "type" ? "service" : "human",
      startup: true,
      password: { loginId: "admin", password: "unused-startup-password" },
    };
    if (variant === "linked")
      f.state.employees[0].authenticationIdentity = { recordId: "other" };
    if (variant === "shared")
      f.state.customers.push({
        _id: "shared",
        loginId: "admin",
        password: "password-admin",
      });
    if (variant === "override")
      SERVICE.DefaultPasswordSaveInterceptorService.preserveStartupEmployeeCredential =
        async () => false;
    await assert.rejects(
      variant === "public"
        ? employeeImport(f, record)
        : importStartupGuest(
            f,
            () => employeeImport(f, record, tenant),
            tenant,
          ),
    );
    assert.equal(f.state.hashes, 0);
    assert.deepEqual(f.state.mutations, []);
  }
});

test("actual forward Init still creates a new Employee with its own credential", async () => {
  const f = fixture();
  useGuestMongoAdapter(f);
  const record = {
    code: "new-admin",
    loginId: "new-admin",
    principalType: "human",
    password: { loginId: "new-admin", password: "new-fixture-password" },
  };
  await importStartupGuest(f, () => employeeImport(f, record));
  assert.equal(f.state.employees.length, 2);
  assert.equal(f.state.credentials.length, 2);
  assert.equal(f.state.hashes, 1);
  assert.equal(f.state.credentials[0].password, "original-admin-hash");
});

test("actual forward Init import preserves retained guest credential and authVersion without hashing or Password writes", async () => {
  const f = fixture();
  f.state.credentials.push({
    _id: "password-guest",
    loginId: "guest",
    password: "retained-guest-hash",
    active: true,
  });
  f.state.customers.push({
    _id: "customer-guest",
    code: "guest",
    loginId: "guest",
    password: "password-guest",
    authVersion: 7,
  });
  useGuestMongoAdapter(f);
  const before = structuredClone(f.state.credentials);
  const record = structuredClone(
    require("../data/init-v007/records/user/defaultCutomerData").record0,
  );
  record.authVersion = 1;
  await importStartupGuest(f, () => guestImport(f, record));
  assert.deepEqual(f.state.credentials, before);
  assert.equal(f.state.customers.length, 1);
  assert.equal(f.state.customers[0].password, "password-guest");
  assert.equal(f.state.customers[0].authVersion, 7);
  assert.deepEqual(f.state.customers[0].userGroups, record.userGroups);
  assert.equal(f.state.hashes, 0);
  assert.equal(
    f.state.mutations.filter((row) => row.name === "Password").length,
    0,
  );
  assert.equal(
    SERVICE.DefaultDataReleaseService.isStartupReleaseExecution("default"),
    false,
  );
});

test("actual forward Init import still initializes a new guest through nested credential ownership", async () => {
  const f = fixture();
  useGuestMongoAdapter(f);
  const record = structuredClone(
    require("../data/init-v007/records/user/defaultCutomerData").record0,
  );
  await importStartupGuest(f, () => guestImport(f, record));
  assert.equal(f.state.customers.length, 1);
  assert.equal(f.state.hashes, 1);
  const credential = f.state.credentials.find((row) => row.loginId === "guest");
  assert.ok(credential);
  assert.equal(f.state.customers[0].password, credential._id);
  assert.equal(f.state.credentials[0].password, "original-admin-hash");
});

test("actual forward Init writer refuses concurrent Customer credential/version drift or removal without upsert/resurrection", async () => {
  for (const variant of ["password", "authVersion", "removed"]) {
    const f = fixture();
    f.state.credentials.push({
      _id: "password-guest",
      loginId: "guest",
      password: "retained-guest-hash",
      active: true,
    });
    f.state.customers.push({
      _id: "customer-guest",
      code: "guest",
      loginId: "guest",
      password: "password-guest",
      authVersion: 7,
    });
    const before = structuredClone(f.state.credentials);
    let concurrentState;
    useGuestMongoAdapter(f, () => {
      if (variant === "removed") f.state.customers.splice(0);
      else if (variant === "password")
        f.state.customers[0].password = "concurrent-credential";
      else f.state.customers[0].authVersion = 8;
      concurrentState = structuredClone(f.state.customers);
    });
    const record = structuredClone(
      require("../data/init-v007/records/user/defaultCutomerData").record0,
    );
    await assert.rejects(importStartupGuest(f, () => guestImport(f, record)));
    assert.deepEqual(f.state.customers, concurrentState, variant);
    assert.deepEqual(f.state.credentials, before, variant);
    assert.equal(f.state.hashes, 0);
    assert.equal(f.state.mutations.length, 1);
    assert.equal(f.state.mutations[0].name, "Customer");
    assert.equal(f.state.mutations[0].matches, 0);
    assert.equal(f.state.mutations[0].options.upsert, false);
  }
});

test("public markers and another tenant startup cannot authorize guest credential substitution", async () => {
  const f = fixture();
  f.state.credentials.push({
    _id: "password-guest",
    loginId: "guest",
    password: "retained-guest-hash",
    active: true,
  });
  f.state.customers.push({
    _id: "customer-guest",
    code: "guest",
    loginId: "guest",
    password: "password-guest",
    authVersion: 7,
  });
  const record = structuredClone(
    require("../data/init-v007/records/user/defaultCutomerData").record0,
  );
  record.startup = true;
  await assert.rejects(guestImport(f, record));
  await assert.rejects(
    importStartupGuest(f, () => guestImport(f, record), "other"),
  );
  assert.equal(f.state.hashes, 0);
  assert.deepEqual(f.state.mutations, []);
});

test("startup retains lifecycle refusal for linked or shared guest credentials", async () => {
  for (const variant of ["linked", "shared"]) {
    const f = fixture();
    f.state.credentials.push({
      _id: "password-guest",
      loginId: "guest",
      password: "retained-guest-hash",
      active: true,
    });
    f.state.customers.push({
      _id: "customer-guest",
      code: "guest",
      loginId: "guest",
      password: "password-guest",
      authVersion: 7,
      ...(variant === "linked"
        ? { authenticationIdentity: { recordId: "other" } }
        : {}),
    });
    if (variant === "shared")
      f.state.employees.push({
        _id: "other-owner",
        loginId: "guest",
        password: "password-guest",
      });
    const record = structuredClone(
      require("../data/init-v007/records/user/defaultCutomerData").record0,
    );
    await assert.rejects(importStartupGuest(f, () => guestImport(f, record)));
    assert.deepEqual(f.state.mutations, []);
    assert.equal(f.state.hashes, 0);
  }
});

test("selected later-layer Profile preservation helper can refuse the actual import writer", async () => {
  const f = fixture();
  f.state.credentials.push({
    _id: "password-guest",
    loginId: "guest",
    password: "retained-guest-hash",
    active: true,
  });
  f.state.customers.push({
    _id: "customer-guest",
    code: "guest",
    loginId: "guest",
    password: "password-guest",
    authVersion: 7,
  });
  let calls = 0;
  SERVICE.DefaultPasswordSaveInterceptorService = {
    ...writer,
    preserveStartupCustomerCredential: async () => {
      calls++;
      return false;
    },
  };
  const record = structuredClone(
    require("../data/init-v007/records/user/defaultCutomerData").record0,
  );
  await assert.rejects(importStartupGuest(f, () => guestImport(f, record)));
  assert.equal(calls, 1);
  assert.deepEqual(f.state.mutations, []);
});

/** Composes generated pre/post update dispatch with the existing stamp owner. @returns {Object} In-memory version/stamp observations, not installed evidence. */
function enableStampPipeline() {
  const original =
    SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors;
  SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors = (
    schema,
  ) => {
    const selected = original(schema);
    const stampHooks = Object.values(hooks).filter(
      (hook) =>
        hook.type === "schema" &&
        hook.item === schema &&
        [
          "preparePrincipalUpdate",
          "registerPreparedPrincipalUpdate",
          "bumpLoginId",
        ].some(
          (method) =>
            hook.handler ===
            "DefaultPrincipalSecurityStampGovernanceService." + method,
        ),
    );
    return interceptorConfiguration.sortInterceptors({
      ...selected,
      preUpdate: [
        ...(selected.preUpdate || []),
        ...stampHooks.filter((hook) => hook.trigger === "preUpdate"),
      ],
      postUpdate: stampHooks.filter((hook) => hook.trigger === "postUpdate"),
    });
  };
  SERVICE.DefaultModelsUpdateInitializerService.applyPostInterceptors =
    update.applyPostInterceptors;
  const evidence = { reserved: [], registered: [] };
  let sequence = 1;
  SERVICE.DefaultPrincipalSecurityStampService = {
    reserveVersion: async (tenant, minimum) => {
      const version = (sequence = Math.max(sequence + 1, minimum));
      evidence.reserved.push({ tenant, version });
      return version;
    },
    register: async (tenant, principal, version) => {
      evidence.registered.push({ tenant, principal, version });
    },
  };
  return evidence;
}

/** Uses the Mongo CAS wrapper with a synchronous in-memory collection boundary. @param {Object} model Prepared fixture model. @param {Array} rows Isolated fixture rows. @param {Array} [indexes] Source-planned index descriptors. @returns {Object} Fixture write/selector observations; no driver connection. */
function bindMemoryCas(model, rows, indexes = []) {
  Object.assign(
    model,
    require(foundation + "nDatabase/mongodb/src/schemas/model").default,
  );
  model.getItems = async (input) =>
    rows
      .filter((row) => matches(row, input.query))
      .map((row) => structuredClone(row));
  const receipt = { writes: 0, selectors: [] };
  model.findOneAndUpdate = async (selector, document, options) => {
    assert.equal(options.upsert, false);
    assert.equal(options.returnDocument, "after");
    receipt.selectors.push(structuredClone(selector));
    const row = rows.find((item) => matches(item, selector));
    if (!row) return { ok: 1, value: null };
    const next = { ...row, ...document.$set };
    for (const index of indexes) {
      if (
        index.options.unique &&
        matches(next, index.options.partialFilterExpression || {}) &&
        rows.some(
          (other) =>
            other._id !== row._id &&
            matches(other, index.options.partialFilterExpression || {}) &&
            Object.keys(index.fields).every((key) => other[key] === next[key]),
        )
      ) {
        throw Object.assign(Error("fixture duplicate claim"), { code: 11000 });
      }
    }
    Object.assign(row, next);
    receipt.writes++;
    return { ok: 1, value: structuredClone(row) };
  };
  return receipt;
}

test("generated legacy Password update awaits actual Employee stamp hooks and preserves original owner", async () => {
  const f = fixture(),
    stamps = enableStampPipeline();
  f.state.employees[0].authVersion = 4;
  const result = await SERVICE.DefaultPasswordService.update({
    tenant: "original",
    authData: {},
    query: { _id: "password-admin", loginId: "admin" },
    model: { loginId: "admin", password: "disposable-in-memory-proof" },
    options: { recursive: false },
  });
  assert.equal(result.code, "SUC_UPD_00000");
  assert.equal(result.result.acknowledged, true);
  assert.equal(result.result.matchedCount, 1);
  assert.equal(
    f.state.credentials[0].password,
    "fixture-hash:disposable-in-memory-proof",
  );
  assert.equal(f.state.credentials[0]._id, "password-admin");
  assert.equal(f.state.credentials[0].loginId, "admin");
  assert.equal(f.state.employees[0].password, "password-admin");
  assert.equal(f.state.employees[0].authVersion, 5);
  assert.deepEqual(stamps.registered, [
    { tenant: "original", principal: "admin", version: 5 },
    {
      tenant: "original",
      principal: "identity:EMPLOYEE:admin-record",
      version: 5,
    },
  ]);
  assert.equal(f.state.hashes, 1);
});

test("generated managed Password CAS rejects stale revision before stamp propagation", async () => {
  const f = fixture(),
    stamps = enableStampPipeline(),
    model = f.models.PasswordModel;
  model.primaryKey = "code";
  model.rawSchema.definition = { revision: { type: "long" } };
  model.rawSchema.backoffice = {
    concurrency: { managed: true, field: "revision" },
  };
  model.rawSchema.credentialRetirement = {
    enabled: false,
    writerCoverageQualified: false,
    revisionField: "revision",
    credentialField: "password",
    activeField: "active",
    evidenceField: "identityLinkRetirement",
  };
  f.state.credentials[0].revision = 4;
  model.getItems = async (input) =>
    f.state.credentials
      .filter((row) => matches(row, input.query))
      .map((row) => structuredClone(row));
  const persistence = bindMemoryCas(model, f.state.credentials);
  const command = () => ({
    tenant: "original",
    authData: {},
    query: {
      _id: "password-admin",
      code: "password_admin",
      loginId: "admin",
      revision: 4,
      active: true,
    },
    model: { loginId: "admin", password: "disposable-managed-proof" },
    options: { recursive: false },
  });
  const result = await SERVICE.DefaultPasswordService.update(command());
  assert.equal(result.code, "SUC_UPD_00000");
  assert.equal(result.result.matchedCount, 1);
  assert.equal(f.state.credentials[0].revision, 5);
  assert.equal(persistence.writes, 1);
  assert.equal(stamps.registered.length, 2);
  await assert.rejects(SERVICE.DefaultPasswordService.update(command()));
  assert.equal(persistence.writes, 1);
  assert.equal(stamps.registered.length, 2);
});

test("registration checkpoint uses generated assignment CAS and source partial index; duplicate/stale claims cannot overwrite evidence", async () => {
  const f = fixture();
  global.ENUMS = {
    ContactType: Object.fromEntries(
      ["EMAIL", "PHONE", "FAX", "PAGER"].map((key) => [key, { key }]),
    ),
    ProfileEmployeeApplicationStatus: {
      APPROVED: { key: "APPROVED" },
      REGISTERED: { key: "REGISTERED" },
    },
  };
  const source = require("../src/schemas/schemas").profile
    .enterpriseAccessAssignment;
  const rows = ["first", "second", "pending-third"].map((code) => ({
    _id: "fixture-assignment-" + code,
    code,
    revision: 1,
    active: true,
    status: "PENDING",
    normalizedEmail: "isolated-claim@example.invalid",
    enterpriseCode: "fixture-enterprise",
    tenantCode: "fixture-business",
    scopeType: "ENTERPRISE",
    scopeCode: "fixture-enterprise",
    roleCode: "OPERATOR",
    groupCodes: ["operators"],
  }));
  const installed = [];
  const claim = source.indexes.individual.normalizedEmail;
  const model = (f.models.EnterpriseAccessAssignmentModel = {
    moduleName: "profile",
    schemaName: "enterpriseAccessAssignment",
    primaryKey: "code",
    modelName: "InMemoryAssignment",
    tenant: "fixture-authority",
    rawSchema: {
      ...structuredClone(source),
      schemaOptions: {
        "fixture-authority": {
          indexedFields: [
            {
              fields: { [claim.name]: 1 },
              options: structuredClone(claim.options),
            },
          ],
        },
      },
    },
    indexes: (callback) => callback(null, [{ name: "_id_", key: { _id: 1 } }]),
    dataBase: {
      getOptions: () => ({ defaultIndexes: ["_id"] }),
      getConnection: () => ({
        createIndex: async (name, fields, options) => {
          assert.equal(name, "InMemoryAssignment");
          installed.push({
            fields: structuredClone(fields),
            options: structuredClone(options),
          });
        },
      }),
    },
  });
  SERVICE.DefaultNodicsPromiseService = {
    all: (values) => Promise.all(values),
  };
  await require(
    foundation +
      "nDatabase/mongodb/src/service/model/defaultMongodbDatabaseModelHandlerService",
  ).createIndexes(model, false);
  assert.equal(installed.length, 1);
  assert.deepEqual(installed[0].options.partialFilterExpression, {
    identityClaimed: true,
  });
  assert.equal(installed[0].options.unique, true);
  const persistence = bindMemoryCas(model, rows, installed);
  SERVICE.DefaultEnterpriseAccessAssignmentService = {
    ...wrapper("EnterpriseAccessAssignment"),
    get: async (request) => {
      assert.equal(request.tenant, "fixture-authority");
      assert.equal(request.options.skipItemCache, true);
      const found = rows.filter((row) => matches(row, request.query));
      return {
        code: "SUC_GET_00000",
        count: found.length,
        result: structuredClone(found),
      };
    },
  };
  SERVICE.DefaultEnterpriseManagementService = {
    ...require("../src/service/enterprise/defaultEnterpriseManagementService"),
    rolePolicy: () => ({ groupCodes: ["operators"] }),
  };
  const prior =
    SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors;
  SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors = (
    schema,
  ) =>
    schema === "enterpriseAccessAssignment"
      ? interceptorConfiguration.sortInterceptors({
          preUpdate: Object.values(hooks).filter(
            (hook) =>
              hook.item === schema &&
              hook.trigger === "preUpdate" &&
              hook.handler ===
                "DefaultEnterpriseMembershipService.protectAssignment",
          ),
        })
      : prior(schema);
  const owner = SERVICE.DefaultEnterpriseRegistrationService;
  const first = structuredClone(rows[0]),
    second = structuredClone(rows[1]);
  const registration = (assignment) => ({
    commandId: "fixture-command-" + assignment.code,
    assignmentDigest: owner.assignmentDigest(assignment),
    phase: "PREPARED",
  });
  const context = { tenant: "fixture-authority", authData: {} };
  const claimed = await owner.checkpoint(context, first, registration(first), {
    identityClaimed: true,
  });
  assert.equal(claimed.revision, 2);
  assert.equal(claimed.identityClaimed, true);
  const retained = structuredClone(rows);
  await assert.rejects(
    owner.checkpoint(context, first, registration(first), {
      identityClaimed: true,
    }),
  );
  await assert.rejects(
    owner.checkpoint(context, second, registration(second), {
      identityClaimed: true,
    }),
  );
  assert.deepEqual(rows, retained);
  assert.equal(persistence.writes, 1);
  assert.equal(rows.filter((row) => row.identityClaimed).length, 1);
  assert.equal(rows.filter((row) => !row.identityClaimed).length, 2);
  assert.equal(persistence.selectors[0].revision, 1);
  assert.equal(persistence.selectors[0].normalizedEmail, first.normalizedEmail);
  assert.equal(f.state.hashes, 0);
  rows[2].normalizedEmail = "isolated-second-claim@example.invalid";
  const competing = structuredClone(rows[2]);
  const outcomes = await Promise.allSettled([
    owner.checkpoint(
      context,
      competing,
      { ...registration(competing), commandId: "competing-one" },
      { identityClaimed: true },
    ),
    owner.checkpoint(
      context,
      competing,
      { ...registration(competing), commandId: "competing-two" },
      { identityClaimed: true },
    ),
  ]);
  assert.equal(
    outcomes.filter((outcome) => outcome.status === "fulfilled").length,
    1,
  );
  assert.equal(
    outcomes.filter((outcome) => outcome.status === "rejected").length,
    1,
  );
  assert.equal(rows[2].revision, 2);
  assert.equal(persistence.writes, 2);
  assert.equal(f.state.hashes, 0);
});

test("committed generated Password update reports stamp failure without replaying its credential write", async () => {
  const f = fixture(),
    stamps = enableStampPipeline();
  SERVICE.DefaultPrincipalSecurityStampService.register = async () => {
    throw Error("fixture stamp unavailable");
  };
  await assert.rejects(
    SERVICE.DefaultPasswordService.update({
      tenant: "original",
      authData: {},
      query: { _id: "password-admin", loginId: "admin" },
      model: { loginId: "admin", password: "disposable-committed-proof" },
      options: { recursive: false },
    }),
  );
  assert.equal(
    f.state.credentials[0].password,
    "fixture-hash:disposable-committed-proof",
  );
  assert.equal(f.state.hashes, 1);
  assert.equal(stamps.reserved.length, 1);
  assert.equal(stamps.registered.length, 0);
  assert.equal(
    f.state.mutations.filter((entry) => entry.name === "Password").length,
    1,
  );
});

test("bootstrap uses fresh original legacy ownership through actual generated update hooks, never cached aliases or relinks", async () => {
  for (const matching of [true, false]) {
    const f = fixture();
    f.state.employees[0].active = true;
    delete f.state.credentials[0].code;
    f.state.credentials[0].password = matching
      ? "fixture-hash:approved-local-proof"
      : "original-admin-hash";
    UTILS.compareHash = async (proof, hash) => hash === "fixture-hash:" + proof;
    const reads = [];
    for (const name of ["Employee", "Customer", "Password"]) {
      const service = SERVICE["Default" + name + "Service"],
        get = service.get;
      service.get = async (request) => {
        reads.push(request);
        if (
          !request.options?.skipItemCache ||
          request.options.recursive !== false
        )
          return {
            code: "SUC_GET",
            count: 1,
            result: [
              {
                _id: "stale-cache-id",
                loginId: "admin",
                password: { _id: "wrong-old-id", password: "old-cache-hash" },
              },
            ],
          };
        return get(request);
      };
    }
    const owner = {
      ...bootstrap,
      getLocalBootstrapAdminPassword: () => "approved-local-proof",
    };
    assert.deepEqual(
      await owner.reconcileLocalAdministratorCredential(
        { tenant: "original" },
        { administratorCodes: ["admin"] },
      ),
      matching ? [] : ["admin"],
    );
    assert(reads.length >= 4);
    assert(
      reads.every(
        (request) =>
          request.options.skipItemCache && request.options.recursive === false,
      ),
    );
    assert.equal(f.state.credentials.length, 1);
    assert.equal(f.state.employees[0].password, "password-admin");
    assert.equal(f.state.credentials[0].code, undefined);
    assert.equal(f.state.hashes, matching ? 0 : 1);
    assert.equal(f.state.mutations.length, matching ? 0 : 1);
    if (!matching) {
      const write = f.state.mutations[0];
      assert.equal(write.name, "Password");
      assert.equal(write.query._id, "password-admin");
      assert.equal(write.query.password, "original-admin-hash");
      assert.equal(write.options.upsert, false);
      assert.equal(write.matches, 1);
    }
  }
});

test("bootstrap rejects missing, shared, wrong-owner, retired and unacknowledged originals without a natural-code replacement", async () => {
  for (const variant of [
    "missing",
    "shared",
    "wrong-owner",
    "retired",
    "unacknowledged",
  ]) {
    const f = fixture();
    f.state.employees[0].active = true;
    UTILS.compareHash = async () => false;
    if (variant === "missing") f.state.credentials.length = 0;
    if (variant === "shared")
      f.state.customers.push({
        _id: "other",
        loginId: "admin",
        password: "password-admin",
      });
    if (variant === "wrong-owner") f.state.credentials[0].loginId = "different";
    if (variant === "retired")
      f.state.credentials[0].identityLinkRetirement = {};
    if (variant === "unacknowledged")
      f.models.PasswordModel.updateItems = async () => ({
        acknowledged: true,
        matchedCount: 0,
        modifiedCount: 0,
      });
    const owner = {
      ...bootstrap,
      getLocalBootstrapAdminPassword: () => "approved-local-proof",
    };
    await assert.rejects(
      owner.reconcileLocalAdministratorCredential(
        { tenant: "original" },
        { administratorCodes: ["admin"] },
      ),
      /ERR_PROFILE_CREDENTIAL_OWNERSHIP/,
    );
    assert.equal(f.state.mutations.length, 0);
    assert.equal(f.state.employees[0].password, "password-admin");
  }
});

test("actual native principal finders bypass stale cached principals and resolve current groups; linked projections retain canonical anchor ownership", async () => {
  for (const kind of ["Employee", "Customer"]) {
    const f = fixture();
    const principal = {
      _id: "fresh-principal",
      loginId: "admin",
      password: "password-admin",
      active: true,
      userGroups: ["currentGroup"],
    };
    const finder = require(
      "../src/service/" + kind.toLowerCase() + "/default" + kind + "Service",
    );
    const reads = [];
    UTILS.getUserGroupCodes = (groups) => groups.map((group) => group.code);
    UTILS.getUserGroupPermissions = (groups) =>
      groups.flatMap((group) => group.permissions || []);
    SERVICE.DefaultUserGroupService = {
      get: async (request) => {
        assert.equal(request.options.skipItemCache, true);
        assert.equal(request.options.recursive, true);
        assert.deepEqual(request.query, { code: { $in: ["currentGroup"] } });
        return {
          code: "SUC_GET",
          count: 1,
          result: [
            {
              code: "currentGroup",
              active: true,
              permissions: ["current.read"],
            },
          ],
        };
      },
    };
    const owner = {
      ...finder,
      get: async (request) => {
        reads.push(request);
        return {
          code: "SUC_GET",
          count: 1,
          result: [
            request.options.skipItemCache
              ? { ...principal }
              : {
                  _id: "stale-principal",
                  loginId: "admin",
                  password: {
                    _id: "stale-password",
                    password: "cache-only-hash",
                  },
                },
          ],
        };
      },
    };
    const result = await owner.findByLoginId({
      tenant: "original",
      loginId: "admin",
      options: { recursive: false, skipItemCache: true },
    });
    assert.deepEqual(reads[0].options, {
      recursive: false,
      skipItemCache: true,
    });
    assert.equal(result._id, "fresh-principal");
    assert.equal(result.password, "password-admin");
    assert.deepEqual(result.userGroupPermissions, ["current.read"]);
    principal.authenticationIdentity = { code: "canonical-private-anchor" };
    principal.userGroups = [];
    SERVICE.DefaultUserGroupService.get = async () => {
      throw Error("projection groups are not native authority");
    };
    assert(
      (
        await owner.findByLoginId({
          tenant: "original",
          loginId: "admin",
          options: { recursive: false, skipItemCache: true },
        })
      ).authenticationIdentity,
    );
    delete principal.authenticationIdentity;
    principal.loginId = "unexpected-owner";
    await assert.rejects(
      owner.findByLoginId({
        tenant: "original",
        loginId: "admin",
        options: { recursive: false, skipItemCache: true },
      }),
      /ERR_AUTH_00001/,
    );
    assert.equal(f.state.mutations.length, 0);
  }
});

test("generated get cache lookup honors explicit fresh reads without fetching stale Redis data", async () => {
  fixture();
  const get = require(
    foundation +
      "nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService",
  );
  let continued = 0;
  SERVICE.DefaultCacheService = {
    get: () => {
      throw Error("cache must not be read");
    },
  };
  const request = {
    schemaModel: { rawSchema: {}, cache: { enabled: true } },
    options: { recursive: false, skipItemCache: true },
  };
  const response = {};
  get.lookupGuardedCache.call(
    { ...get, LOG: { debug() {} } },
    request,
    response,
    {
      nextSuccess() {
        continued++;
      },
    },
  );
  assert.equal(continued, 1);
  assert.equal(response.success, undefined);
});

test("unprotected real generated nested pipeline isolates empty-query retirement wrapper despite CMS option stripping", async () => {
  const f = fixture(false);
  const result = await SERVICE.DefaultEmployeeService.saveAll({
    tenant: "original",
    query: { code: "$code" },
    options: {
      allowCmsAssociationReplacement: true,
      replaceAllMatchesByQuery: true,
    },
    models: [
      {
        code: "staff",
        loginId: "staff@example.invalid",
        password: {
          loginId: "staff@example.invalid",
          password: "fixture-only",
        },
      },
    ],
  });
  assert.equal(result.success, true, JSON.stringify(result.errors));
  const mutation = f.state.mutations.find((row) => row.name === "Password");
  assert.deepEqual(mutation.query, {
    $and: [{}, { identityLinkRetirement: { $exists: false } }],
  });
  assert.equal(mutation.options.replaceAllMatchesByQuery, undefined);
  assert.equal(mutation.matches, 1);
  assert.equal(f.state.credentials[0].loginId, "staff@example.invalid");
});

test("mandatory legacy guard rejects leaked options before hashing or provider writes through the generated Password wrapper", async () => {
  const f = fixture();
  const result = await SERVICE.DefaultPasswordService.saveAll({
    tenant: "original",
    options: {
      allowCmsAssociationReplacement: true,
      replaceAllMatchesByQuery: true,
    },
    models: [{ loginId: "staff@example.invalid", password: "fixture-only" }],
  });
  assert.equal(result.success, false);
  assert.equal(f.state.hashes, 0);
  assert.equal(f.state.mutations.length, 0);
  assert.equal(f.state.credentials[0].password, "original-admin-hash");
});

test("legacy new nested credential retains insert intent after empty query normalization and preserves admin digest", async () => {
  const f = fixture();
  const before = crypto
    .createHash("sha256")
    .update(JSON.stringify(f.state.credentials[0]))
    .digest("hex");
  const result = await SERVICE.DefaultEmployeeService.saveAll({
    tenant: "original",
    query: { code: "$code" },
    options: {},
    models: [
      {
        code: "staff",
        loginId: "staff@example.invalid",
        password: {
          loginId: "staff@example.invalid",
          password: "fixture-only",
        },
      },
    ],
  });
  assert.equal(result.success, true, JSON.stringify(result.errors));
  const mutation = f.state.mutations.find((row) => row.name === "Password");
  assert.equal(mutation.query, undefined);
  assert.equal(mutation.matches, 0);
  assert.equal(f.state.credentials.length, 2);
  assert.equal(
    crypto
      .createHash("sha256")
      .update(JSON.stringify(f.state.credentials[0]))
      .digest("hex"),
    before,
  );
});

test("fresh framework Init Employee and Customer records save distinct credentials through actual defaults, interceptor ordering/dispatch and Mongo write wrapper", async () => {
  const f = fixture();
  f.state.credentials.length = 0;
  f.state.employees.length = 0;
  const originalGet = CONFIG.get;
  CONFIG.get = (name) =>
    name === "bootstrapIdentity"
      ? {
          source: "test",
          adminPassword: "fixture-admin-password-not-for-runtime-12345",
          servicePassword: "fixture-service-password-not-for-runtime-12345",
          serviceApiKey: "fixture-service-key-not-for-runtime-1234567890",
        }
      : name === "authSecurity"
        ? lodash.merge(
            {},
            require(foundation + "nAuth/config/properties").authSecurity,
            { compatibility: { allowLocalBootstrapIdentity: true } },
          )
        : originalGet(name);
  global.ENUMS = {
    ContactType: Object.fromEntries(
      ["EMAIL", "PHONE", "FAX", "PAGER"].map((key) => [key, { key }]),
    ),
  };
  const profileSchemas = require("../src/schemas/schemas").profile;
  const databaseSuper = require(
    foundation + "nDatabase/database/src/schemas/schemas",
  ).default.super;
  const adapter = require(
    foundation + "nDatabase/mongodb/src/schemas/model",
  ).default;
  const dispatcher = require(
    foundation + "nCommon/src/service/interceptor/defaultInterceptorService",
  );
  SERVICE.DefaultInterceptorService = {
    ...dispatcher,
    ...require(
      foundation +
        "nDatabase/database/src/service/interceptors/defaultInterceptorService",
    ),
  };
  NODICS.isNTestRunning = () => false;
  SERVICE.DefaultEnterpriseAdministrationConsentService = require("../src/service/enterprise/defaultEnterpriseAdministrationConsentService");
  SERVICE.DefaultInterceptorConfigurationService = {
    ...interceptorConfiguration,
    rawInterceptors: {
      schema: {
        default: require(
          foundation + "nDatabase/database/src/interceptors/interceptors",
        ),
        password: Object.fromEntries(
          Object.entries(hooks).filter(
            ([, hook]) => hook.type === "schema" && hook.item === "password",
          ),
        ),
      },
    },
  };
  const otherSchemaInterceptors =
    SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors;
  SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors = (
    schema,
  ) =>
    schema === "password"
      ? SERVICE.DefaultInterceptorConfigurationService.prepareItemInterceptors(
          schema,
          "schema",
        )
      : otherSchemaInterceptors(schema);
  const completePasswordHooks =
    SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors(
      "password",
    ).preSave;
  assert.deepEqual(
    completePasswordHooks.map((hook) => hook.index),
    [-60, -50, 0, 5, 10, 50],
  );
  SERVICE.DefaultModelConcurrencyService = require(
    foundation +
      "nDatabase/database/src/service/schema/defaultModelConcurrencyService",
  );
  SERVICE.DefaultModelSaveInitializerService.applyDefaultValues =
    single.applyDefaultValues;
  SERVICE.DefaultPropertyInitialValueProviderService = require(
    foundation +
      "nDatabase/database/src/service/init/defaultPropertyInitialValueProviderService",
  );
  SERVICE.DefaultModelValidatorService = {
    ...require(
      foundation +
        "nDatabase/database/src/service/model/defaultModelValidatorService",
    ),
    LOG: { debug() {} },
  };
  const collections = {
    Password: f.state.credentials,
    Employee: f.state.employees,
    Customer: f.state.customers,
  };
  for (const name of Object.keys(collections)) {
    const model = f.models[name + "Model"];
    model.rawSchema.definition = lodash.cloneDeep({
      ...databaseSuper.definition,
      ...(name === "Password" ? profileSchemas.password.definition : {}),
    });
    model.rawSchema.backoffice = {
      concurrency: { managed: false, field: "revision" },
    };
    model.rawSchema.credentialRetirement =
      name === "Password"
        ? lodash.cloneDeep(profileSchemas.password.credentialRetirement)
        : undefined;
    Object.assign(model, adapter, {
      saveItems: function (input) {
        if (name === "Password")
          assert.equal(
            input.query,
            undefined,
            "fresh Password insert intent must survive complete effective preSave hooks",
          );
        return adapter.saveItems.call(this, input);
      },
      dataBase: {
        getOptions: () => ({
          modelSaveOptions: { upsert: true, returnDocument: "after" },
        }),
      },
      insertOne: async (row) => {
        const id = name + "-" + collections[name].length;
        collections[name].push({ ...row, _id: id });
        return { acknowledged: true, insertedId: id };
      },
      findOneAndUpdate: async (query, document, options) => {
        const rows = collections[name].filter((row) => matches(row, query));
        if (rows.length) {
          Object.assign(rows[0], document.$set);
          return { ok: 1, value: { ...rows[0] } };
        }
        assert.equal(options.upsert, true);
        const id = name + "-" + collections[name].length;
        collections[name].push({ ...document.$set, _id: id });
        return { ok: 1, value: { ...collections[name].at(-1) } };
      },
    });
  }
  const sourceEmployees =
    require.resolve("../data/init-v001/records/user/defaultEmployeeData");
  delete require.cache[sourceEmployees];
  const employees = lodash.cloneDeep(Object.values(require(sourceEmployees)));
  delete require.cache[sourceEmployees];
  const customers = lodash.cloneDeep(
    Object.values(require("../data/init-v001/records/user/defaultCutomerData")),
  );
  for (const [name, records] of [
    ["Employee", employees],
    ["Customer", customers],
  ]) {
    const result = await SERVICE["Default" + name + "Service"].saveAll({
      tenant: "default",
      authData: { userGroups: ["adminGroup"] },
      query: { code: "$code", loginId: "$loginId" },
      options: {},
      models: records,
    });
    assert.equal(result.success, true, name + " Init failed");
    assert.equal(result.result.length, records.length);
  }
  assert.equal(f.state.employees.length, 6);
  assert.equal(f.state.customers.length, 1);
  assert.equal(f.state.credentials.length, 7);
  assert.equal(new Set(f.state.credentials.map((row) => row._id)).size, 7);
  assert.equal(new Set(f.state.credentials.map((row) => row.loginId)).size, 7);
  assert.equal(f.state.hashes, 7);
  for (const person of [...f.state.employees, ...f.state.customers]) {
    const credential = f.state.credentials.find(
      (row) => row._id === person.password,
    );
    assert.equal(credential.loginId, person.loginId);
    assert.equal(credential.active, true);
    assert(credential.created instanceof Date);
  }
});

test("broad/code-only existing replacement and owner changes reject; exact original ID with same owner is fenced", async () => {
  const f = fixture();
  for (const selector of [
    { active: true },
    { $and: [{}, { identityLinkRetirement: { $exists: false } }] },
    { code: "password_admin" },
    { _id: "password-admin", loginId: { $ne: "other" } },
  ]) {
    await assert.rejects(
      writer.guardSaveOwnership({
        tenant: "original",
        schemaModel: f.models.PasswordModel,
        query: selector,
        model: {
          code: "password_admin",
          loginId: "admin",
          password: "replacement",
        },
      }),
      { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" },
    );
  }
  await assert.rejects(
    writer.guardUpdateOwnership({
      tenant: "original",
      schemaModel: f.models.PasswordModel,
      query: { _id: "password-admin" },
      model: { loginId: "other", password: "replacement" },
    }),
    { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" },
  );
  const request = {
    tenant: "original",
    schemaModel: f.models.PasswordModel,
    query: { _id: "password-admin" },
    model: { loginId: "admin", password: "replacement" },
  };
  assert.equal(await writer.guardUpdateOwnership(request), true);
  assert.equal(request.query._id, "password-admin");
  assert.equal(request.query.loginId, "admin");
  assert.equal(request.options.upsert, false);
});

test("principal relation mismatch and shared references reject; authVersion-only writes preserve credentials without reads", async () => {
  const f = fixture();
  await assert.rejects(
    writer.guardPrincipalCredential({
      tenant: "original",
      schemaModel: f.models.EmployeeModel,
      model: { loginId: "staff", password: "password-admin" },
    }),
    { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" },
  );
  await assert.rejects(
    writer.guardPrincipalCredential({
      tenant: "original",
      schemaModel: f.models.EmployeeModel,
      model: {
        loginId: "staff",
        password: { loginId: "admin", password: "fixture-only" },
      },
    }),
    { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" },
  );
  const original = JSON.stringify(f.state.credentials);
  SERVICE.DefaultPasswordService.get = async () => {
    throw Error("scope updates must not read credentials");
  };
  assert.equal(
    await writer.guardPrincipalCredential({
      tenant: "original",
      schemaModel: f.models.EmployeeModel,
      query: { _id: "admin-record" },
      model: { $set: { authVersion: 2 } },
    }),
    true,
  );
  assert.equal(JSON.stringify(f.state.credentials), original);
});

test("actual scope pre/post propagation advances native principal stamps while credential digest remains unchanged", async () => {
  const f = fixture();
  const scope = require("../src/service/identity/defaultPrincipalScopeGovernanceService");
  const before = crypto
    .createHash("sha256")
    .update(JSON.stringify(f.state.credentials))
    .digest("hex");
  let sequence = 1;
  const stamps = [];
  SERVICE.DefaultPrincipalSecurityStampService = {
    reserveVersion: async (tenant, minimum) =>
      (sequence = Math.max(sequence + 1, minimum)),
    register: async (tenant, principal, version) =>
      stamps.push({ principal, version }),
  };
  SERVICE.DefaultEmployeeService.update = async (request) => {
    request.schemaModel = f.models.EmployeeModel;
    await writer.guardPrincipalCredential(request);
    await inventory.preparePrincipalUpdate(request);
    const row = f.state.employees.find((item) => matches(item, request.query));
    Object.assign(row, request.model.$set);
    await inventory.registerPreparedPrincipalUpdate(request);
    return {
      code: "SUC_UPD_00000",
      result: { acknowledged: true, matchedCount: 1 },
    };
  };
  SERVICE.DefaultPasswordService.get = async () => {
    throw Error("scope invalidation must not read Password");
  };
  const request = { tenant: "original" };
  await scope.prepareScopeInvalidation(request, [
    { principalType: "human", principalCode: "admin", scopeType: "GLOBAL" },
  ]);
  await scope.invalidateScopeCredentials(request);
  assert.equal(f.state.employees[0].authVersion, 3);
  assert.equal(stamps.length, 4);
  assert.equal(
    crypto
      .createHash("sha256")
      .update(JSON.stringify(f.state.credentials))
      .digest("hex"),
    before,
  );
  assert.equal(f.state.hashes, 0);
});

test("native authentication ignores cached hashes and fails closed on wrong/shared/missing original credential ownership", async () => {
  const f = fixture();
  const options = {
    type: "Employee",
    enterprise: { tenant: { code: "original" } },
    person: {
      ...f.state.employees[0],
      password: { _id: "password-admin", password: "cached-wrong-hash" },
    },
  };
  assert.equal(
    (await authentication.resolvePasswordCredential(options)).password,
    "original-admin-hash",
  );
  f.state.credentials[0].loginId = "staff@example.invalid";
  await assert.rejects(authentication.resolvePasswordCredential(options), {
    code: "ERR_AUTH_00001",
  });
  f.state.credentials[0].loginId = "admin";
  f.state.customers.push({
    _id: "customer-other",
    loginId: "admin",
    password: "password-admin",
  });
  await assert.rejects(authentication.resolvePasswordCredential(options), {
    code: "ERR_AUTH_00001",
  });
  f.state.customers.length = 0;
  f.state.credentials.length = 0;
  await assert.rejects(authentication.resolvePasswordCredential(options), {
    code: "ERR_AUTH_00001",
  });
});

test("mandatory ownership composes with actual managed CAS without inventing tokens or weakening competing-revision rejection", async () => {
  for (const variant of ["positive", "missing-token", "competing"]) {
    const f = fixture();
    const concurrency = require(
      foundation +
        "nDatabase/database/src/service/schema/defaultModelConcurrencyService",
    );
    SERVICE.DefaultModelConcurrencyService = concurrency;
    const row = f.state.credentials[0],
      model = f.models.PasswordModel;
    row.revision = 4;
    model.primaryKey = "code";
    model.rawSchema.definition = { revision: { type: "long" } };
    model.rawSchema.backoffice = {
      concurrency: { managed: true, field: "revision" },
    };
    model.rawSchema.credentialRetirement = {
      enabled: false,
      writerCoverageQualified: false,
      revisionField: "revision",
      credentialField: "password",
      activeField: "active",
      evidenceField: "identityLinkRetirement",
    };
    model.getItems = async (input) =>
      matches(row, input.query) ? [structuredClone(row)] : [];
    let writes = 0;
    model.compareAndSetItem = async (input) => {
      if (variant === "competing") row.revision++;
      if (!matches(row, input.query)) return null;
      writes++;
      Object.assign(row, input.model);
      return structuredClone(row);
    };
    const request = {
      tenant: "original",
      schemaModel: model,
      query: {
        _id: row._id,
        code: row.code,
        loginId: row.loginId,
        active: true,
        ...(variant === "missing-token" ? {} : { revision: 4 }),
      },
      model: { loginId: row.loginId, password: "fixture-only-replacement" },
    };
    await writer.guardUpdateOwnership(request);
    await historical.protectMutation(request);
    await writer.encryptPassword(request);
    if (variant === "positive") {
      assert.equal(request.query.revision, 4);
      assert.equal(request.model.revision, 4);
      await concurrency.execute(request, "update");
      assert.equal(row.revision, 5);
      assert.equal(writes, 1);
    } else {
      await assert.rejects(concurrency.execute(request, "update"), {
        code:
          variant === "missing-token"
            ? "ERR_CONCURRENCY_00002"
            : "ERR_CONCURRENCY_00001",
      });
      assert.equal(writes, 0);
      assert.equal(row.password, "original-admin-hash");
    }
  }
});
