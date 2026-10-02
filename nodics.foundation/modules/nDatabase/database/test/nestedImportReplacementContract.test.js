/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module database/test/nestedImportReplacementContract @description Offline import-to-generated-nested-save-to-Mongo regression using real framework nodes and an in-memory driver; no runtime database or real credentials. @layer test @owner nDatabase */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const _ = require("lodash");
const fs = require("node:fs");
const vm = require("node:vm");
const importer = require("../../../nData/nImport/import/src/service/process/model/defaultModelImportProcessService");
const nested = require("../src/service/model/defaultModelService");
const bulk = require("../src/service/procs/save/defaultModelsSaveInitializerService");
const single = require("../src/service/procs/save/defaultModelSaveInitializerService");
const query = require("../src/service/procs/query/defaultModelQueryBuilderPipelineService");
const validator = require("../src/service/model/defaultModelValidatorService");
const adapter = require("../../mongodb/src/schemas/model").default;
const versionedAdapter =
  require("../../mongodb/vMongodb/src/schemas/model").default;
const versionedSave = require("../../../nService/vService/src/service/procs/save/defaultModelSaveInitializerService");
const preparation = require("../../mongodb/src/service/model/defaultMongodbDatabaseModelHandlerService");
const base = require("../src/schemas/schemas").default;
global.ENUMS = {
  ContactType: Object.fromEntries(
    ["EMAIL", "PHONE", "FAX", "PAGER"].map((key) => [key, { key }]),
  ),
};
const profile =
  require("../../../../../nodics.platform/modules/profile/src/schemas/schemas").profile;

const log = { debug() {}, error() {}, warn() {} };
for (const owner of [
  importer,
  nested,
  bulk,
  single,
  query,
  validator,
  versionedSave,
])
  owner.LOG = log;
global.UTILS = {
  isBlank: (value) =>
    value == null ||
    (typeof value === "object" && Object.keys(value).length === 0),
  isObject: _.isPlainObject,
  isArray: Array.isArray,
  isObjectId: (value) => Boolean(value && value._bsontype === "ObjectId"),
  isArrayOfObject: (value) =>
    Array.isArray(value) && value.length > 0 && value.every(_.isPlainObject),
};
global.CLASSES = {
  NodicsError: class extends Error {
    constructor(error, message, code) {
      super(message || "Offline fixture failure");
      this.code = code || error;
      if (error && typeof error === "object") this.cause = error;
    }
    add() {}
  },
};
global.CLASSES.DataImportError = global.CLASSES.NodicsError;
if (!String.prototype.toUpperCaseFirstChar)
  Object.defineProperty(String.prototype, "toUpperCaseFirstChar", {
    value() {
      return this.charAt(0).toUpperCase() + this.slice(1);
    },
    configurable: true,
  });

/** Driver-only stand-in; selection and write documents come from real framework nodes. */
function driver(rawSchema, seed = []) {
  const rows = _.cloneDeep(seed);
  const calls = { count: 0, updateMany: 0, insert: 0, upsert: 0 };
  const matches = (row, selector) =>
    Object.entries(selector || {}).every(([key, value]) =>
      _.isEqual(row[key], value),
    );
  return Object.assign({}, adapter, {
    rawSchema,
    tenant: "fixture",
    rows,
    calls,
    dataBase: { getOptions: () => ({}) },
    countDocuments: async (selector) => {
      calls.count++;
      return rows.filter((row) => matches(row, selector)).length;
    },
    updateMany: async (selector, update) => {
      calls.updateMany++;
      rows
        .filter((row) => matches(row, selector))
        .forEach((row) => Object.assign(row, _.cloneDeep(update.$set)));
      return { acknowledged: true };
    },
    find: (selector, options = {}) => {
      let sort = options.sort;
      return {
        sort(value) {
          sort = value;
          return this;
        },
        toArray: async () => {
          let result = _.cloneDeep(
            rows.filter((row) => matches(row, selector)),
          );
          if (sort)
            result = _.orderBy(
              result,
              Object.keys(sort),
              Object.values(sort).map((value) => (value < 0 ? "desc" : "asc")),
            );
          if (options.limit) result = result.slice(0, options.limit);
          if (options.projection?._id === 0)
            result.forEach((row) => delete row._id);
          return result;
        },
      };
    },
    findOneAndUpdate: async (selector, update) => {
      calls.upsert++;
      let row = rows.find((item) => matches(item, selector));
      if (!row) {
        row = { _id: "fixture-" + rows.length };
        rows.push(row);
      }
      Object.assign(row, _.cloneDeep(update.$set));
      return { ok: 1, value: _.cloneDeep(row) };
    },
    insertOne: async (model) => {
      calls.insert++;
      const insertedId = "fixture-" + rows.length;
      rows.push(Object.assign(_.cloneDeep(model), { _id: insertedId }));
      return { acknowledged: true, insertedId };
    },
  });
}

/** Runs the actual generated single-save nodes, with only pipeline scheduling replaced. */
async function saveNodes(request) {
  let stopped = false;
  const response = {};
  const control = {
    nextSuccess() {},
    stop() {
      stopped = true;
    },
  };
  for (const name of [
    "buildFromOriginalQuery",
    "skipForCustomQuery",
    "buildIdQuery",
    "buildPrimeryQuery",
  ]) {
    query[name](request, response, control);
    if (stopped) break;
  }
  const effectiveSingle = request.schemaModel.versioned
    ? Object.assign({}, single, versionedSave)
    : single;
  const step = (name) =>
    new Promise((resolve, reject) =>
      effectiveSingle[name](request, response, {
        nextSuccess: resolve,
        error: (_request, _response, error) => reject(error),
      }),
    );
  await step("handleNestedModelsSave");
  await step("saveModel");
  return response.success;
}

function owners(modules) {
  global.NODICS = { getModule: (name) => modules[name] };
  global.CONFIG = { get: () => ({}) };
  global.SERVICE = {
    DefaultModelService: nested,
    DefaultModelValidatorService: validator,
    DefaultDatabaseConfigurationService: { toObjectId: (_schema, id) => id },
    DefaultPipelineService: {
      start: async (name, request) => {
        assert.equal(name, "modelSaveInitializerPipeline");
        return saveNodes(request);
      },
    },
  };
}

function generated(model, observed) {
  return {
    saveAll: async (request) => {
      observed.push(request);
      request.schemaModel = model;
      if (!UTILS.isBlank(request.query))
        request.originalQuery = _.cloneDeep(request.query);
      const response = {};
      await bulk.handleModelsSave(request, response, request.models);
      if (response.failed) {
        const codes = [];
        let failure = response.failed[0];
        while (failure) {
          if (typeof failure.code === "string") codes.push(failure.code);
          if (failure instanceof TypeError) codes.push(failure.message);
          if (failure.message?.startsWith("Generated save failure:"))
            codes.push(failure.message);
          failure = failure.cause;
        }
        throw new Error("Generated save failure: " + codes.join(","));
      }
      return { code: "SUC_SAVE_00000", result: response.success };
    },
  };
}

test("actual Axis nested CMS associations have canonical codes before generated child query admission", async () => {
  const cms =
    require("../../../../../nodics.wcms/modules/cms/src/schemas/schemas").cms;
  const detailOwner = require("../../../../../nodics.wcms/modules/cms/src/service/interceptors/defaultCmsComponentDetailInterceptorService");
  const records = require("../../../../../nodics.platform/modules/axis/data/init-v001/records/axis/axisCmsComponentData");
  const detail = _.merge({}, base.super, base.base, cms.cmsComponentDetail);
  const component = _.merge(
    {},
    base.super,
    base.base,
    cms.cmsBase,
    cms.cmsComponent,
  );
  owners({
    cms: { rawSchema: { cmsComponent: component, cmsComponentDetail: detail } },
  });
  const detailWrapper = Object.assign(driver(detail), {
    moduleName: "cms",
    schemaName: "cmsComponentDetail",
  });
  const parentWrapper = Object.assign(driver(component), {
    moduleName: "cms",
    schemaName: "cmsComponent",
  });
  const childRequests = [];
  SERVICE.DefaultCmsComponentDetailInterceptorService = detailOwner;
  SERVICE.DefaultCmsComponentDetailService = generated(
    detailWrapper,
    childRequests,
  );
  const originalStart = SERVICE.DefaultPipelineService.start;
  SERVICE.DefaultPipelineService.start = async (name, request) => {
    if (request.schemaModel.schemaName === "cmsComponent") {
      await detailOwner.setCompDetailSourceForComp(request, {});
    }
    return originalStart(name, request);
  };
  const selected = Object.values(records).filter(
    (record) => record.subComponents,
  );
  assert.equal(selected.length, 4);
  const importerService = Object.assign({}, importer, {
    ensureLocalSchemaService: async () => generated(parentWrapper, []),
  });
  await importerService.insertLocalSchemaModel(
    {
      tenant: "fixture",
      importRun: { dataReleases: [{}] },
      options: {},
      header: {
        rawSchema: component,
        options: {
          moduleName: "cms",
          schemaName: "cmsComponent",
          operation: "saveAll",
        },
        query: { code: "$code" },
      },
    },
    _.cloneDeep(selected),
  );
  assert.equal(parentWrapper.rows.length, 4);
  assert.equal(detailWrapper.rows.length, 26);
  assert.equal(new Set(detailWrapper.rows.map((row) => row.code)).size, 26);
  assert(childRequests.every((request) => request.query?.code === "$code"));
  assert(
    detailWrapper.rows.every(
      (row) =>
        row.code === row.source + "2" + row.target.toUpperCaseFirstChar(),
    ),
  );
  assert.equal(parentWrapper.calls.updateMany, 0);
  assert.equal(detailWrapper.calls.updateMany, 0);
});

test("real import / nested generated writer / Mongo preserves admin and seven distinct credential references", async () => {
  const passwordSchema = _.merge({}, base.super, profile.password);
  // Exercise the provider's real prepared-index pollution, not a lookalike query builder.
  passwordSchema.indexes = {
    individual: { active: { enabled: true, name: "active" } },
  };
  await preparation.prepareDatabaseOptions({
    tntCode: "fixture",
    schemaName: "password",
    moduleObject: { rawSchema: { password: passwordSchema } },
    dataBase: { master: { getOptions: () => ({ schemaProperties: {} }) } },
  });
  assert.deepEqual(passwordSchema.schemaOptions.fixture.primaryKeys, [
    "active",
  ]);
  const employeeSchema = _.merge({}, base.super, base.base, {
    refSchema: {
      password: {
        enabled: true,
        type: "one",
        moduleName: "profile",
        schemaName: "password",
      },
    },
  });
  owners({
    profile: {
      rawSchema: { employee: employeeSchema, password: passwordSchema },
    },
  });
  const original = {
    _id: "fixture-admin",
    loginId: "fixture-admin",
    password: "not-a-real-credential",
    active: true,
  };
  const passwords = Object.assign(driver(passwordSchema, [original]), {
    moduleName: "profile",
    schemaName: "password",
  });
  const employees = Object.assign(driver(employeeSchema), {
    moduleName: "profile",
    schemaName: "employee",
  });
  const passwordRequests = [],
    employeeRequests = [];
  SERVICE.DefaultPasswordService = generated(passwords, passwordRequests);
  const employeeService = generated(employees, employeeRequests);
  const context = Object.assign({}, importer, {
    ensureLocalSchemaService: async () => employeeService,
  });
  const flags = {
    allowCmsAssociationReplacement: true,
    replaceAllMatchesByQuery: true,
    replaceArraysOnVersionMerge: true,
    versionedImport: true,
    recursive: false,
  };
  const models = Array.from({ length: 7 }, (_, index) => ({
    code: "fixture-staff-" + index,
    password: {
      loginId: "fixture-staff-" + index,
      password: "not-a-real-credential-" + index,
      active: true,
    },
  }));
  await context.insertLocalSchemaModel(
    {
      tenant: "fixture",
      options: flags,
      importRun: { dataReleases: [{ releaseCode: "fixture:operations" }] },
      header: {
        rawSchema: employeeSchema,
        options: {
          moduleName: "profile",
          schemaName: "employee",
          operation: "saveAll",
          userGroups: ["fixture"],
        },
        query: { code: "$code" },
      },
    },
    models,
  );
  assert.deepEqual(passwords.rows[0], original);
  assert.equal(passwords.rows.length, 8);
  assert.equal(passwords.calls.insert, 7);
  assert.equal(passwords.calls.updateMany, 0);
  assert.equal(passwords.calls.count, 0);
  assert.equal(employees.rows.length, 7);
  assert.equal(new Set(employees.rows.map((row) => row.password)).size, 7);
  for (const row of employees.rows)
    assert.equal(
      passwords.rows.find((item) => item._id === row.password).loginId,
      row.code,
    );
  for (const request of [...employeeRequests, ...passwordRequests]) {
    for (const key of [
      "allowCmsAssociationReplacement",
      "replaceAllMatchesByQuery",
      "replaceArraysOnVersionMerge",
    ])
      assert.equal(request.options[key], undefined);
  }
  assert.deepEqual(flags, {
    allowCmsAssociationReplacement: true,
    replaceAllMatchesByQuery: true,
    replaceArraysOnVersionMerge: true,
    versionedImport: true,
    recursive: false,
  });
});

test("canonical CMS associations retain replacement but non-CMS children never inherit it", async () => {
  const definition = { code: { type: "string", primary: true } };
  const root = {
    definition,
    refSchema: {
      details: { enabled: true, type: "many", schemaName: "componentDetail" },
      external: {
        enabled: true,
        type: "one",
        moduleName: "profile",
        schemaName: "password",
      },
    },
  };
  const child = { definition };
  owners({ cms: { rawSchema: { page: root, componentDetail: child } } });
  const observed = [];
  SERVICE.DefaultComponentDetailService = {
    saveAll: async (request) => {
      observed.push(request);
      return {
        result: request.models.map((model, index) => ({
          ...model,
          _id: "detail-" + index,
        })),
      };
    },
  };
  SERVICE.DefaultPasswordService = {
    saveAll: async (request) => {
      observed.push(request);
      return { result: [{ _id: "external" }] };
    },
  };
  const request = {
    tenant: "fixture",
    schemaModel: { moduleName: "cms", schemaName: "page", rawSchema: root },
    options: {
      allowCmsAssociationReplacement: true,
      replaceAllMatchesByQuery: true,
      replaceArraysOnVersionMerge: true,
      versionedImport: true,
      recursive: false,
    },
  };
  const model = {
    details: [{ code: "detail-one", source: "fixture-component" }],
    external: { loginId: "fixture-only" },
  };
  await nested.saveNestedModels({
    request,
    model,
    propertiesList: ["details", "external"],
  });
  assert.equal(observed[0].options.replaceAllMatchesByQuery, true);
  assert.deepEqual(observed[0].query, { code: "$code" });
  assert.deepEqual(observed[1].options, { recursive: false });
  assert.equal(observed[1].query, undefined);
  assert.equal(observed[1].models[0].accessGroups, undefined);
  assert.equal(request.options.versionedImport, true);
  request.schemaModel.rawSchema = _.cloneDeep(root);
  await nested.saveNestedModels({
    request,
    model: { details: [{ code: "unproved", source: "fixture-component" }] },
    propertiesList: ["details"],
  });
  assert.equal(observed[2].options.replaceAllMatchesByQuery, undefined);
});

test("Mongo refuses empty, broad, operator and mismatched replacements before driver operations", async () => {
  owners({});
  const model = driver({ definition: { code: { primary: true } } }, [
    { code: "other", active: true },
  ]);
  for (const selector of [
    undefined,
    {},
    { active: true },
    { code: undefined },
    { code: "" },
    { code: "$code" },
    { code: { $ne: null } },
    { $or: [{ code: "one" }] },
    { code: "one", active: { $ne: false } },
    { code: "other" },
    { _id: null },
  ]) {
    await assert.rejects(
      model.saveItems({
        query: selector,
        model: { code: "one" },
        options: { replaceAllMatchesByQuery: true },
      }),
    );
  }
  assert.deepEqual(model.calls, {
    count: 0,
    updateMany: 0,
    insert: 0,
    upsert: 0,
  });
  assert.equal(model.rows.length, 1);
  const indexedOnly = driver({
    definition: { active: { type: "bool" } },
    schemaOptions: { fixture: { primaryKeys: ["active"] } },
  });
  await assert.rejects(
    indexedOnly.saveItems({
      query: { active: true },
      model: { active: true },
      options: { replaceAllMatchesByQuery: true },
    }),
  );
  assert.equal(indexedOnly.calls.count, 0);
});

test("import grants replacement only to exact effective CMS schema, never a copied schema or Profile target", async () => {
  const rawSchema = { definition: { code: { primary: true } } };
  owners({
    cms: { rawSchema: { page: rawSchema } },
    profile: { rawSchema: { employee: rawSchema } },
  });
  const observed = [];
  const context = Object.assign({}, importer, {
    ensureLocalSchemaService: async () => ({
      saveAll: async (request) => {
        observed.push(request);
        return { result: request.models };
      },
    }),
  });
  for (const [moduleName, schemaName, schema] of [
    ["cms", "page", rawSchema],
    ["cms", "page", _.cloneDeep(rawSchema)],
    ["profile", "employee", rawSchema],
  ]) {
    await context.insertLocalSchemaModel(
      {
        tenant: "fixture",
        importRun: { dataReleases: [{}] },
        options: {
          allowCmsAssociationReplacement: true,
          replaceAllMatchesByQuery: true,
          replaceArraysOnVersionMerge: true,
        },
        header: {
          rawSchema: schema,
          options: { moduleName, schemaName, operation: "saveAll" },
          query: { code: "$code" },
        },
      },
      [{ code: "fixture-one" }],
    );
  }
  for (const flag of [
    "allowCmsAssociationReplacement",
    "replaceAllMatchesByQuery",
    "replaceArraysOnVersionMerge",
  ]) {
    assert.equal(observed[0].options[flag], true);
    assert.equal(observed[1].options[flag], undefined);
    assert.equal(observed[2].options[flag], undefined);
  }
});

test("incomplete implicit identity retains insert intent; replacement still requires all keys and preserves zero", () => {
  owners({});
  const schemaModel = {
    rawSchema: {
      definition: { code: { primary: true }, active: { type: "bool" } },
      schemaOptions: { fixture: { primaryKeys: ["code", "active"] } },
    },
  };
  const process = { stop() {}, nextSuccess() {} };
  for (const code of [undefined, null, ""]) {
    const insert = {
      tenant: "fixture",
      schemaModel,
      model: { code, active: true },
    };
    query.buildPrimeryQuery(insert, {}, process);
    assert.equal(insert.query, undefined);
    assert.throws(() =>
      query.buildPrimeryQuery(
        {
          tenant: "fixture",
          schemaModel,
          model: { code, active: true },
          options: { replaceAllMatchesByQuery: true },
        },
        {},
        process,
      ),
    );
  }
  const request = {
    tenant: "fixture",
    schemaModel,
    model: { code: 0, active: true },
  };
  query.buildPrimeryQuery(request, {}, process);
  assert.deepEqual(request.query, { code: 0 });
});

test("real default-value and preSave generation after query building remain insert-only without ordinary-index lookups", async () => {
  for (const mechanism of ["default", "preSave", "primaryFree"]) {
    const rawSchema = {
      definition:
        mechanism === "primaryFree"
          ? { title: { type: "string" } }
          : {
              code: {
                type: "string",
                primary: true,
                ...(mechanism === "default"
                  ? { default: "DefaultFixtureIdentityService.generate" }
                  : {}),
              },
              title: { type: "string" },
            },
      schemaOptions: { fixture: { primaryKeys: ["title"], defaultValues: {} } },
    };
    owners({});
    const wrapper = Object.assign(driver(rawSchema), {
      moduleName: "fixture",
      schemaName: "fixtureItem",
    });
    SERVICE.DefaultFixtureIdentityService = {
      generate: () => "owner-generated",
    };
    SERVICE.DefaultDatabaseConfigurationService.getSchemaInterceptors = () =>
      mechanism === "preSave" ? { preSave: ["owner.generate"] } : {};
    SERVICE.DefaultInterceptorService = {
      executeInterceptors: async (_hooks, request) => {
        request.model.code = SERVICE.DefaultFixtureIdentityService.generate(
          request.model,
        );
      },
    };
    const request = {
      tenant: "fixture",
      schemaModel: wrapper,
      model: { title: "new" },
      options: {},
    };
    const response = {};
    const step = (owner, name) =>
      new Promise((resolve, reject) =>
        owner[name](request, response, {
          nextSuccess: resolve,
          stop: resolve,
          error: (_request, _response, error) => reject(error),
        }),
      );
    await step(query, "buildPrimeryQuery");
    assert.equal(request.query, undefined);
    await step(single, "applyDefaultValues");
    await step(single, "applyPreInterceptors");
    if (mechanism !== "primaryFree")
      assert.equal(request.model.code, "owner-generated");
    await step(single, "saveModel");
    assert.equal(wrapper.rows.length, 1);
    assert.equal(wrapper.calls.insert, 1);
    assert.equal(wrapper.calls.count, 0);
    assert.equal(wrapper.calls.updateMany, 0);
    assert.equal(wrapper.calls.upsert, 0);
  }
});

test("partial composite primary identity never becomes a partial update selector", () => {
  owners({});
  const request = {
    model: { tenantCode: "fixture", active: true },
    schemaModel: {
      rawSchema: {
        definition: {
          tenantCode: { primary: true },
          code: { primary: true },
          active: { type: "bool" },
        },
      },
    },
  };
  query.buildPrimeryQuery(request, {}, { stop() {} });
  assert.equal(request.query, undefined);
  request.options = { replaceAllMatchesByQuery: true };
  assert.throws(() => query.buildPrimeryQuery(request, {}, { stop() {} }), {
    code: "ERR_SAVE_00003",
  });
});

test("CMS canonical identity replacement updates its versions only; explicit id and ordinary insert remain valid", async () => {
  owners({});
  const model = driver({ definition: { code: { primary: true } } }, [
    { _id: "one-v1", code: "one", versionId: 1 },
    { _id: "one-v2", code: "one", versionId: 2 },
    { _id: "other", code: "other" },
  ]);
  await model.saveItems({
    query: { code: "one" },
    model: { code: "one", title: "replacement" },
    options: { replaceAllMatchesByQuery: true },
  });
  assert.equal(model.calls.updateMany, 1);
  assert.equal(
    model.rows.filter((row) => row.title === "replacement").length,
    2,
  );
  assert.deepEqual(model.rows[2], { _id: "other", code: "other" });
  await model.saveItems({
    query: { _id: "other" },
    model: { title: "exact" },
    options: { replaceAllMatchesByQuery: true },
  });
  assert.equal(model.rows[2].title, "exact");
  await model.saveItems({ model: { code: "new" }, options: {} });
  assert.equal(model.rows.length, 4);
});

test("native versioned CMS import uses effective registry and scalar identity/version queries without replacement of history", async () => {
  const rawSchema = {
    isVersionedEnabled: true,
    definition: {
      code: { type: "string", primary: true },
      versionId: { type: "long" },
      active: { type: "bool" },
    },
  };
  // A later-layer customization is represented by the registry's effective object,
  // not an alias or a second schema registry.
  const effective = _.merge({}, rawSchema, {
    definition: { title: { type: "string" } },
  });
  owners({ cms: { rawSchema: { cmsPage: effective } } });
  const wrapper = Object.assign(
    driver(effective, [
      {
        _id: "fixture-cms-v0",
        code: "fixture-page",
        versionId: 0,
        active: true,
        title: "old",
      },
    ]),
    versionedAdapter,
    {
      moduleName: "cms",
      schemaName: "cmsPage",
      primaryKey: "code",
      versioned: true,
    },
  );
  const observed = [];
  const service = Object.assign(generated(wrapper, observed), {
    get: (request) => wrapper.getItems(request),
  });
  const context = Object.assign({}, importer, {
    ensureLocalSchemaService: async () => service,
  });
  const request = {
    tenant: "fixture",
    importRun: { dataReleases: [{}] },
    options: {},
    header: {
      options: {
        moduleName: "cms",
        schemaName: "cmsPage",
        operation: "saveAll",
      },
      query: { code: "$code", active: true },
    },
  };
  context.loadRawSchema(request, {}, { nextSuccess() {} });
  assert.equal(
    request.header.rawSchema,
    NODICS.getModule("cms").rawSchema.cmsPage,
  );
  const start = SERVICE.DefaultPipelineService.start;
  const saveQueries = [];
  SERVICE.DefaultPipelineService.start = async (name, input) => {
    saveQueries.push(_.cloneDeep(input.query));
    wrapper.assertReplacementIdentity(input);
    return start(name, input);
  };
  const result = await context.insertLocalSchemaModel(request, [
    { code: "fixture-page", active: true, title: "new" },
  ]);
  assert.deepEqual(saveQueries, [
    { code: "fixture-page", active: true, versionId: 1 },
  ]);
  assert.equal(observed[0].options.allowCmsAssociationReplacement, true);
  assert.equal(observed[0].options.versionedImport, true);
  assert.equal(result[0].versionId, 1);
  assert.equal(wrapper.rows.length, 2);
  assert.equal(wrapper.rows[0].title, "old");
  assert.equal(wrapper.rows[0].versionId, 0);
  assert.equal(wrapper.rows[1].title, "new");
  assert.equal(wrapper.calls.updateMany, 0);
  assert.equal(wrapper.calls.insert, 1);
});

test("actual inactive bootstrap Customer data and header retain nested insert semantics through Mongo nodes", async () => {
  const recordPath =
    require.resolve("../../../../../nodics.platform/modules/profile/data/init-v001/records/user/defaultCutomerData");
  const box = { exports: {} };
  vm.runInNewContext(fs.readFileSync(recordPath, "utf8"), {
    module: box,
    require: (name) => {
      assert.equal(name, "crypto");
      return { randomBytes: () => Buffer.from("offline-fixture-only") };
    },
  });
  // VM objects are normalized exactly as portable data objects entering generated nodes.
  const models = JSON.parse(JSON.stringify(Object.values(box.exports)));
  assert.equal(models.length, 1);
  assert.equal(models[0].active, false);
  const headers = require("../../../../../nodics.platform/modules/profile/data/init-v001/headers/user/defaultUsersHeader");
  const header = Object.values(headers)
    .map((group) => group.defaultCustomer)
    .find(Boolean);
  assert.ok(header);
  const passwordSchema = _.merge({}, base.super, profile.password);
  const customerSchema = _.merge(
    {},
    base.super,
    base.base,
    profile.user,
    profile.customer,
  );
  owners({
    profile: {
      rawSchema: { customer: customerSchema, password: passwordSchema },
    },
  });
  const passwords = Object.assign(driver(passwordSchema), {
    moduleName: "profile",
    schemaName: "password",
  });
  const customers = Object.assign(driver(customerSchema), {
    moduleName: "profile",
    schemaName: "customer",
  });
  const observed = [];
  SERVICE.DefaultPasswordService = generated(passwords, observed);
  const context = Object.assign({}, importer, {
    ensureLocalSchemaService: async () => generated(customers, []),
  });
  const result = await context.insertLocalSchemaModel(
    {
      tenant: "fixture",
      options: {},
      header: {
        ..._.cloneDeep(header),
        rawSchema: customerSchema,
        options: { ...header.options, moduleName: "profile" },
      },
    },
    models,
  );
  assert.equal(result.length, 1);
  assert.equal(result[0].active, false);
  assert.equal(passwords.rows.length, 1);
  assert.equal(passwords.rows[0].loginId, result[0].loginId);
  assert.equal(result[0].password, passwords.rows[0]._id);
  assert.equal(passwords.calls.insert, 1);
  assert.equal(passwords.calls.updateMany, 0);
  assert.equal(passwords.calls.upsert, 0);
  assert.equal(observed[0].options.replaceAllMatchesByQuery, undefined);
});
