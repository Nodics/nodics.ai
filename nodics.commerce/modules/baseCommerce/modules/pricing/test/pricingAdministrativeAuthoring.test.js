/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/** @module pricing/test/pricingAdministrativeAuthoring @description Isolated native proof and real generated/versioned writer regressions; no live qualification. @layer test @owner pricing */
const test = require("node:test"), assert = require("node:assert/strict");
const fs = require("node:fs"), Module = require("node:module"), crypto = require("node:crypto");
const _ = require("lodash");
const driver = require("mongodb");
const { InsertOneOperation } = require("mongodb/lib/operations/insert");
const owner = require("../src/service/defaultPricingAdministrativeAuthoringService");
const controller = require("../src/controller/defaultPricingAdministrativeAuthoringController");
const properties = require("../config/properties");
const foundation = "../../../../../../nodics.foundation/modules/";
const db = foundation + "nDatabase/database/";
const rawSchemas = require("../src/schemas/schemas").pricing;
const baseSchemas = require(db + "src/schemas/schemas");
const mongodb = require(foundation + "nDatabase/mongodb/src/schemas/model").default;
const versioned = require(foundation + "nDatabase/mongodb/vMongodb/src/schemas/model").default;

function fixture(t) {
  const prior = Object.fromEntries(["CONFIG", "SERVICE", "NODICS", "CLASSES", "UTILS"].map(k => [k, global[k]]));
  t.after(() => Object.assign(global, prior));
  const config = { ...structuredClone(require(db + "config/properties")), pricing: structuredClone(properties.pricing),
    runtimeRole: { code: "COMMERCE_STAGED" }, identityGovernance: { systemAccessGroups: ["serviceAccountUserGroup"] },
    defaultPageSize: 25, defaultPageNumber: 1 };
  Object.assign(config.pricing.publication, { runtimeRole: "STAGED", sourceVersioningQualified: true });
  const history = { priceBook: [{ tenant: "tenant-a", enterpriseCode: "seller", code: "book", currency: "POINTS",
    status: "ACTIVE", versionId: 0, revision: 0 }], priceRow: [] }, calls = [], proofs = [], models = {};
  const hooks = { proof: () => {}, recipient: () => {}, afterRead: () => {}, afterSave: () => {}, beforeInsert: () => {} };
  // Construct the actual driver insert operation without executing it or connecting.
  const driverCollection = new driver.MongoClient("mongodb://127.0.0.1:1").db("isolated").collection("priceRow");
  const log = { debug() {}, error() {} };
  const writer = { ...require(db + "src/service/procs/save/defaultModelSaveInitializerService"),
    ...require(foundation + "nService/vService/src/service/procs/save/defaultModelSaveInitializerService"), LOG: log };
  const reader = { ...require(db + "src/service/procs/get/defaultModelsGetInitializerService"),
    ...require(foundation + "nService/vService/src/service/procs/get/defaultModelsGetInitializerService"), LOG: log };
  global.CONFIG = { get: key => config[key] };
  global.UTILS = { ...require(foundation + "nCommon/src/utils/utils"), isBlank: v => v == null || typeof v === "object" && !Object.keys(v).length,
    isArray: Array.isArray, isObject: v => v !== null && typeof v === "object" };
  global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || String(code)); this.code = code; } } };
  global.SERVICE = {
    DefaultPricingAdministrativeAuthoringService: owner, DefaultExactAmountService: require("../src/service/defaultExactAmountService"),
    DefaultIdentityGovernanceService: require(foundation + "nAuth/src/service/identity/defaultIdentityGovernanceService"),
    DefaultSchemaAccessHandlerService: require(db + "src/service/schema/defaultSchemaAccessHandlerService"),
    DefaultRecordOwnershipPolicyService: require(db + "src/service/access/defaultRecordOwnershipPolicyService"),
    DefaultModelSaveInitializerService: writer, DefaultModelsGetInitializerService: reader,
    DefaultLoggerService: { assertSensitiveRequest() {} },
  };
  const matches = (row, query) => Object.entries(query).every(([key, value]) => row[key] === value);
  for (const [schema, name] of [["priceBook", "PriceBook"], ["priceRow", "PriceRow"]]) {
    const raw = _.merge({}, baseSchemas.default.super, baseSchemas.default.base, rawSchemas[schema],
      { accessGroups: properties.schemaPolicies.pricing.tenantOwned.accessGroups, versionedReadMode: "CURRENT" });
    models[name + "Model"] = { ...mongodb, ...versioned, rawSchema: raw, schemaName: schema, primaryKey: "code", versioned: true,
      find(query, options = {}) {
        const rows = history[schema].filter(row => matches(row, query)).map(row => structuredClone(row));
        return { sort(sort) { const [key, direction] = Object.entries(sort)[0]; rows.sort((a, b) => direction * (a[key] - b[key])); return this; },
          count: async () => rows.length, toArray: async () => rows.slice(0, options.limit || rows.length) };
      },
      aggregate(pipeline) {
        const newest = new Map();
        history[schema].forEach(row => { if (!newest.has(row.code) || newest.get(row.code).versionId < row.versionId) newest.set(row.code, row); });
        const rows = [...newest.values()].filter(row => matches(row, pipeline.find(s => s.$match).$match));
        return { toArray: async () => [{ metadata: [{ count: rows.length }],
          result: rows.slice(0, 2).map(row => driver.BSON.deserialize(driver.BSON.serialize(row))) }] };
      },
      insertOne: async row => {
        const operation = new InsertOneOperation(driverCollection, row, {});
        assert.equal(operation.documents[0], row);
        assert(row._id instanceof driver.ObjectId);
        hooks.beforeInsert(row);
        if (history[schema].some(r => r.code === row.code && r.versionId === row.versionId)) throw new Error("duplicate immutable identity");
        history[schema].push(driver.BSON.deserialize(driver.BSON.serialize(row)));
        return { acknowledged: true, insertedId: row._id };
      },
    };
    const filename = require.resolve(foundation + "nService/src/service/common.js");
    let source = fs.readFileSync(filename, "utf8");
    for (const [key, value] of Object.entries({ schmanm: schema, mdulnm: "pricing", mdlnm: name + "Model",
      srvcName: "Default" + name + "Service", dsdName: "Default" + name + "Facade" })) source = source.replaceAll(key, value);
    const compiled = new Module(filename, module); compiled.paths = module.paths; compiled._compile(source, filename);
    SERVICE["Default" + name + "Service"] = compiled.exports;
  }
  global.NODICS = { getModels: () => models, getServerState: () => "started" };
  SERVICE.DefaultPipelineService = { start: async (pipeline, input) => {
    calls.push({ pipeline, query: structuredClone(input.query), model: structuredClone(input.model), auth: structuredClone(input.authData) });
    const reading = pipeline === "modelsGetInitializerPipeline", processor = reading ? reader : writer, response = {};
    for (const step of reading ? ["checkAccess", "buildOptions", "executeQuery"] :
      ["validateModel", "checkAccess", "applyDefaultValues", "removeVirtualProperties", "saveModel"]) {
      await new Promise((resolve, reject) => processor[step](input, response, { nextSuccess: resolve, error: (_i, _r, e) => reject(e) }));
    }
    if (reading) hooks.afterRead(input, response.success); else hooks.afterSave(input, response.success);
    return response.success;
  } };
  SERVICE.DefaultModuleService = { invokeModule: async request => {
    proofs.push(structuredClone(request));
    if (request.apiName === config.pricing.administrativeAuthoring.evidencePath) {
      const proof = { contractVersion: 1, nonce: request.requestBody.nonce, permission: request.requestBody.permission,
        tenant: "tenant-a", enterpriseCode: "platform", actorCode: "native-admin", authVersion: 3, principalType: "human", platformAdministrator: true };
      hooks.proof(proof); return { data: proof };
    }
    const target = { contractVersion: 1, tenant: "tenant-a", recipient: { ownerType: "ENTERPRISE", ownerCode: request.requestBody.ownerCode } };
    hooks.recipient(target); return { data: target };
  } };
  const command = { code: "new-price", priceBookCode: "book", bookVersionId: 0, productCode: "new-product", unitAmount: "80", currency: "POINTS", minQuantity: "1" };
  const request = { tenant: "tenant-a", authData: { tenant: "tenant-a", entCode: "platform", loginId: "native-admin",
    principalType: "human", tokenType: "access", authenticationMethod: "PASSWORD", authVersion: 3 },
    httpRequest: { headers: { authorization: "Bearer native-test", "x-enterprise-code": "platform" }, body: { targetEnterpriseCode: "seller", command } } };
  return { config, history, models, proofs, calls, hooks, request, command,
    create: () => controller.create(request).then(r => r.data),
    read: () => { request.httpRequest.body.command = { code: "new-price" }; return controller.read(request).then(r => r.data); } };
}

test("native create uses the real generated service, versioned pipeline and immutable provider without changing original actor", async t => {
  const f = fixture(t), original = structuredClone(f.request), result = await f.create();
  assert.deepEqual(f.request, original);
  assert.equal(result.result.unitAmount, "80"); assert.equal(result.result.versionId, 0);
  assert.equal(result.result.createdBy, "native-admin"); assert.equal(result.audit.actorEnterpriseCode, "platform");
  assert.equal(f.history.priceRow.length, 1); assert.equal(f.history.priceRow[0].enterpriseCode, "seller");
  assert.equal(f.calls.filter(c => c.pipeline === "modelSaveInitializerPipeline").length, 1);
  assert.equal(f.proofs.length, 6);
  for (const p of f.proofs) assert.deepEqual(p.header, { Authorization: "Bearer native-test", "X-Enterprise-Code": "platform" });
  assert.equal((await f.read()).result.code, "new-price");
});

test("actual MongoDB insert preparation mutates the writer model with ObjectId without contaminating expected fields", async t => {
  const f = fixture(t), original = structuredClone(f.request);
  let inserted;
  f.hooks.beforeInsert = row => { inserted = row; };
  const result = await f.create();
  assert(inserted._id instanceof driver.ObjectId);
  assert(f.history.priceRow[0]._id instanceof driver.ObjectId);
  assert.notEqual(inserted._id, f.history.priceRow[0]._id);
  assert.equal(inserted._id.toHexString(), f.history.priceRow[0]._id.toHexString());
  assert.deepEqual(f.request, original);
  assert.equal(Object.hasOwn(result.result, "_id"), false);
  assert.equal(result.result.unitAmount, "80");
  assert.equal(f.history.priceRow.length, 1);
  const reconciled = await f.read();
  assert.deepEqual(reconciled.result, result.result);
});

test("driver metadata does not excuse a changed authored field in the save acknowledgement", async t => {
  const f = fixture(t);
  f.hooks.afterSave = (_input, response) => { response.result.unitAmount = "81"; };
  await assert.rejects(f.create());
  assert.equal(f.history.priceRow.length, 1);
  assert.equal((await f.read()).result.unitAmount, "80");
});

for (const [name, mutate] of Object.entries({
  "service identity": f => { f.request.authData.principalType = "service"; },
  "wrong tenant alias": f => { f.request.tenantCode = "foreign"; },
  "rewritten enterprise": f => { f.request.httpRequest.headers["x-enterprise-code"] = "seller"; },
  "stale evidence": f => { f.hooks.proof = p => { p.authVersion++; }; },
  "wrong permission": f => { f.hooks.proof = p => { p.permission = "other"; }; },
  "non administrator": f => { f.hooks.proof = p => { p.platformAdministrator = false; }; },
  "wrong nonce": f => { f.hooks.proof = p => { p.nonce = "old"; }; },
  "foreign participant": f => { f.hooks.recipient = p => { p.tenant = "foreign"; }; },
  "Online": f => { f.config.pricing.publication.runtimeRole = "ONLINE"; },
  "unqualified": f => { f.config.pricing.publication.sourceVersioningQualified = false; },
  "mutable storage": f => { f.models.PriceRowModel.versioned = false; },
  "wrong reader": f => { SERVICE.DefaultModelsGetInitializerService.resolveReadMethod = () => "getItems"; },
  "caller revision": f => { f.command.revision = 7; },
  "caller tenant": f => { f.command.tenant = "foreign"; },
  "caller publication": f => { f.command.publicationCode = "fake"; },
  "query operator": f => { f.command.code = { $ne: "x" }; },
  "negative amount": f => { f.command.unitAmount = "-1"; },
  "non decimal": f => { f.command.unitAmount = "1e3"; },
  "zero tier": f => { f.command.minQuantity = "0"; },
  "decimal bound": f => { f.command.unitAmount = "1".repeat(65); },
  "wrong book currency": f => { f.history.priceBook[0].currency = "USD"; },
  "stale book version": f => { f.command.bookVersionId = 1; },
  "foreign book": f => { f.history.priceBook[0].enterpriseCode = "foreign"; },
  "archived book": f => { f.history.priceBook[0].status = "ARCHIVED"; },
  "missing book": f => { f.history.priceBook.length = 0; },
})) test("rejects " + name + " before saving", async t => {
  const f = fixture(t); mutate(f);
  await assert.rejects(f.create()); assert.equal(f.history.priceRow.length, 0);
  assert.equal(f.calls.filter(c => c.pipeline === "modelSaveInitializerPipeline").length, 0);
});

test("fresh prewrite proof revocation refuses after successful initial proof", async t => {
  const f = fixture(t); let count = 0;
  f.hooks.proof = p => { if (++count === 2) p.platformAdministrator = false; };
  await assert.rejects(f.create()); assert.equal(count, 2); assert.equal(f.history.priceRow.length, 0);
});
for (const field of ["auth", "policy", "command", "storage", "book"]) test("rejects " + field + " drift during reads", async t => {
  const f = fixture(t); let once = false;
  f.hooks.afterRead = () => {
    if (once) return; once = true;
    if (field === "auth") f.request.authData.authVersion++;
    if (field === "policy") f.config.pricing.administrativeAuthoring.writePermission = "other";
    if (field === "command") f.command.unitAmount = "1";
    if (field === "storage") f.models.PriceRowModel.saveVersionedItems = () => {};
    if (field === "book") f.history.priceBook[0].revision++;
  };
  await assert.rejects(f.create()); assert.equal(f.history.priceRow.length, 0);
});
test("lost save response is reconciled through read; repeated create cannot duplicate or update", async t => {
  const f = fixture(t);
  f.hooks.afterSave = () => { throw new Error("lost response"); };
  await assert.rejects(f.create()); assert.equal(f.history.priceRow.length, 1);
  const command = structuredClone(f.command);
  assert.equal((await f.read()).result.unitAmount, "80");
  f.request.httpRequest.body.command = command; f.hooks.afterSave = () => {};
  await assert.rejects(f.create()); assert.equal(f.history.priceRow.length, 1);
});
test("customized Profile connection and decimal bound are effective owner properties", async t => {
  const f = fixture(t);
  Object.assign(f.config.pricing.administrativeAuthoring, { maximumDecimalLength: 3, timeoutMs: 1234 });
  f.config.pricing.administrativeAuthoring.identityTarget.connectionName = "custom-platform";
  await f.create();
  assert(f.proofs.every(p => p.connectionName === "custom-platform" && p.timeoutMs === 1234));
});
test("canonical auth factory cannot alter original actor before persistence", async t => {
  const f = fixture(t), identity = SERVICE.DefaultIdentityGovernanceService;
  SERVICE.DefaultIdentityGovernanceService = { ...identity, getSystemAuthData() {
    f.request.authData.authVersion++; return identity.getSystemAuthData();
  } };
  await assert.rejects(f.create()); assert.equal(f.calls.length, 0);
});
test("postwrite proof revocation returns no false success and exact read recovers original row", async t => {
  const f = fixture(t); let count = 0;
  f.hooks.proof = p => { if (++count === 3) p.platformAdministrator = false; };
  await assert.rejects(f.create()); assert.equal(f.history.priceRow.length, 1);
  f.hooks.proof = () => {};
  assert.equal((await f.read()).result.createdBy, "native-admin");
});
test("read of absent row is confirmed null and failed provider responses never look empty", async t => {
  const f = fixture(t); assert.equal((await f.read()).result, null);
  f.hooks.afterRead = (_i, r) => { r.success = false; };
  await assert.rejects(f.read()); assert.equal(f.history.priceRow.length, 0);
});
test("save failure markers refuse plausible persisted payload and do not retry", async t => {
  const f = fixture(t); f.hooks.afterSave = (_i, r) => { r.result.error = true; };
  await assert.rejects(f.create()); assert.equal(f.history.priceRow.length, 1);
});
test("concurrent immutable identity insertion never overwrites an existing different price", async t => {
  const f = fixture(t);
  f.hooks.beforeInsert = row => { f.history.priceRow.push({ ...structuredClone(row), unitAmount: "90" }); };
  await assert.rejects(f.create()); assert.equal(f.history.priceRow.length, 1);
  assert.equal((await f.read()).result.unitAmount, "90");
});
test("private continuation cannot be fabricated; routes and definitions confer no publication authority or grants", t => {
  fixture(t);
  assert.throws(() => owner.local({}), /SCOPE/);
  const routes = require("../src/router/routers").pricing.administrativeAuthoring;
  assert.deepEqual(Object.keys(routes), ["publication", "create", "read"]);
  for (const route of Object.values(routes)) {
    assert.deepEqual(route.authTokenTypes, ["access"]); assert.equal(route.requestPrivacy.sensitive, true);
    assert.match(route.permissionConfig, /^pricing.administrativeAuthoring\./);
  }
  const permissions = Object.values(require("../data/init-v001/records/identity/pricingPermissionData"));
  assert.deepEqual(permissions.map(p => p.code), ["commerce.pricing.read"]);
  const manifest = require("../data/manifest.json");
  const key = "init-v001/records/identity/pricingPermissionData.js";
  assert.equal(manifest.sections.permissionCatalogue.files[key], crypto.createHash("sha256").update(fs.readFileSync(require.resolve("../data/" + key))).digest("hex"));
});

test("new explicit v001 write definition preserves installed catalogue bytes and all release seals", () => {
  const manifest = require("../data/manifest.json");
  const original = {
    "init-v001/headers/identity/pricingPermissionHeader.js": "0540d5f7ef7e086b72b57eed20f20a28a2b58334009e7040825515a9859add90",
    "init-v001/records/identity/pricingPermissionData.js": "2b0f36e6d05a013b1a31df8805b1cccf2b90895420e7b3a1e3067509a3d2875e",
  };
  assert.deepEqual(manifest.sections.permissionCatalogue.files, original);
  const section = manifest.sections.administrativeAuthoringPermission;
  assert.equal(section.sourceRoot, "init-v001"); assert.equal(section.selectionPolicy, "EXPLICIT");
  assert.equal(section.destinationRole, "PLATFORM"); assert.equal(section.version, "0.0.1");
  const header = require("../data/init-v001/headers/identity/pricingAdministrativeAuthoringPermissionHeader").profile.pricingAdministrativeAuthoringPermission;
  assert.equal(header.options.operation, "ensureReferenceAll"); assert.equal(header.options.schemaName, "permission");
  assert.deepEqual(header.query, { code: "$code" });
  assert.equal(header.options.dataFilePrefix, "pricingAdministrativeAuthoringPermissionData");
  assert.deepEqual(Object.values(require("../data/init-v001/records/identity/pricingAdministrativeAuthoringPermissionData")),
    [{ code: "commerce.pricing.write", name: "commerce.pricing.write", active: true, ownerModule: "pricing" }]);
  assert.equal(Object.keys(section.files).length, 2);
  for (const release of Object.values(manifest.sections)) for (const [file, digest] of Object.entries(release.files || {})) {
    assert.equal(crypto.createHash("sha256").update(fs.readFileSync(require.resolve("../data/" + file))).digest("hex"), digest, file);
  }
  assert(!Object.keys(section.files).some(file => Object.hasOwn(original, file)));
});

async function publicationFixture(t) {
  const f = fixture(t);
  f.request.requestId = "native-publication-test";
  const priorFirstChar = String.prototype.toUpperCaseFirstChar;
  String.prototype.toUpperCaseFirstChar = function () { return this[0].toUpperCase() + this.slice(1); };
  t.after(() => {
    if (priorFirstChar) String.prototype.toUpperCaseFirstChar = priorFirstChar;
    else delete String.prototype.toUpperCaseFirstChar;
  });
  Object.assign(UTILS, require(db + "src/utils/utils"));
  await f.create();
  f.proofs.length = 0;
  const publicationOwner = require("../src/service/defaultPricingPublicationService");
  const repository = require(foundation + "nPublish/src/service/defaultPublicationRepositoryService");
  const lifecycle = require(foundation + "nPublish/src/service/defaultPublicationLifecycleService");
  const writes = [], stores = {};
  for (const name of ["PricingPolicyRelease", "PricingPolicyPointer", "PricingPolicyReceipt", "PublicationRequest", "PublicationAudit"]) {
    const rows = new Map(); stores[name] = rows;
    SERVICE["Default" + name + "Service"] = {
      get: async input => {
        const result = [...rows.values()].filter(row => Object.entries(input.query).every(([k, v]) => row[k] === v)).map(row => structuredClone(row));
        return { code: "SUC_FIND_00000", result, count: result.length };
      },
      save: async input => {
        writes.push({ name, auth: structuredClone(input.authData), model: structuredClone(input.model) });
        if (rows.has(input.model.code)) throw new Error("duplicate");
        const model = structuredClone(input.model);
        if (["PricingPolicyPointer", "PricingPolicyReceipt"].includes(name)) model.revision = 1;
        rows.set(input.model.code, model);
        return { code: "SUC_SAVE_00000", result: structuredClone(model) };
      },
      update: async input => {
        writes.push({ name, auth: structuredClone(input.authData), model: structuredClone(input.model) });
        const row = rows.get(input.query.code);
        if (!row || Object.entries(input.query).some(([k, v]) => row[k] !== v)) return { result: { modifiedCount: 0 } };
        Object.assign(row, structuredClone(input.model.$set || input.model));
        if (["PricingPolicyPointer", "PricingPolicyReceipt"].includes(name)) row.revision++;
        for (const key of Object.keys(input.model.$unset || {})) delete row[key];
        return { result: { modifiedCount: 1 } };
      },
    };
  }
  SERVICE.DefaultPricingPublicationService = publicationOwner;
  SERVICE.DefaultPublicationRepositoryService = repository;
  SERVICE.DefaultPublicationLifecycleService = lifecycle;
  f.config.publish = { lifecycle: structuredClone(require(foundation + "nPublish/config/properties").publish.lifecycle), providers: {
    repositoryProvider: "DefaultPublicationRepositoryService", domainAdapters: { pricing: "DefaultPricingPublicationService" },
    versionProviders: { pricing: "DefaultPricingPublicationService" },
  } };
  f.request.httpRequest.body.command = { operation: "create", publicationCode: "native-book-release", rootType: "priceBook", rootCode: "book",
    references: [{ schema: "priceBook", code: "book", versionId: 0 }, { schema: "priceRow", code: "new-price", versionId: 0 }] };
  return { ...f, stores, writes, publicationOwner, publish: () => owner.execute({ ...f.request, authorization: f.request.httpRequest.headers.authorization }, "publication") };
}

test("native book capture retains selected enterprise, original actor and real nPublish STAGED journal without approval", async t => {
  const f = await publicationFixture(t), original = structuredClone(f.request);
  const result = await f.publish();
  assert.deepEqual(f.request, original);
  assert.equal(result.result.state, "STAGED"); assert.equal(result.result.revision, 0);
  assert.equal(result.result.enterpriseCode, "seller"); assert.equal(result.result.requestedBy, "native-admin");
  assert.equal(result.audit.actorEnterpriseCode, "platform"); assert.equal(result.audit.permission, "commerce.pricing.publish");
  assert.equal(f.stores.PricingPolicyRelease.size, 1); assert.equal(f.stores.PublicationRequest.size, 1);
  assert.equal(f.stores.PricingPolicyPointer.size, 0); assert.equal(f.stores.PricingPolicyReceipt.size, 0);
  assert(f.writes.filter(w => w.name.startsWith("Publication")).every(w => w.auth.entCode === "platform" && !w.auth.isSystem));
  assert(f.proofs.every(p => p.header["X-Enterprise-Code"] === "platform"));
  const replay = await f.publish();
  assert.equal(replay.result.sourceVersion, result.result.sourceVersion); assert.equal(f.stores.PublicationRequest.size, 1);
});

for (const kind of ["permission", "tenant", "auth", "book", "input"]) test("native publication refuses " + kind + " drift before retention", async t => {
  const f = await publicationFixture(t);
  if (kind === "permission") f.hooks.proof = p => { p.permission = "commerce.pricing.write"; };
  if (kind === "tenant") f.hooks.recipient = p => { p.tenant = "foreign"; };
  if (kind === "auth") f.hooks.afterRead = () => { f.request.authData.authVersion++; };
  if (kind === "book") f.history.priceBook[0].enterpriseCode = "foreign";
  if (kind === "input") f.request.httpRequest.body.command.enterpriseCode = "foreign";
  await assert.rejects(f.publish()); assert.equal(f.writes.length, 0);
});

test("native publication refreshes evidence before retention and before journal creation", async t => {
  for (const deniedCall of [2, 3]) {
    const f = await publicationFixture(t); let proofs = 0;
    f.hooks.proof = p => { if (++proofs === deniedCall) p.platformAdministrator = false; };
    await assert.rejects(f.publish());
    assert.equal(f.stores.PublicationRequest.size, 0);
    assert.equal(f.stores.PricingPolicyRelease.size, deniedCall === 2 ? 0 : 1);
  }
});

test("native context cannot be copied or reused after capture", async t => {
  const f = await publicationFixture(t), original = f.publicationOwner.capture;
  let context;
  SERVICE.DefaultPricingPublicationService = { ...f.publicationOwner, capture: async function (r, input) {
    context = r;
    assert.throws(() => this.sourcePersistenceAuth({ ...r }), /Copied or retired/);
    return original.call(this, r, input);
  } };
  await f.publish();
  assert.throws(() => f.publicationOwner.sourcePersistenceAuth(context), /Copied or retired/);
});

test("native STAGED capture does not bypass the shared approval enterprise gate", async t => {
  const f = await publicationFixture(t), publication = (await f.publish()).result;
  const workflow = { ...require(foundation + "nPublish/src/service/defaultPublicationApprovalWorkflowService"),
    policy: () => ({ ownerModule: "pricing", definitionCode: "pricingPublicationApproval", actionKey: "pricing.applyPublicationDecision" }) };
  assert.throws(() => workflow.context(publication, f.request), /scope does not match/);
  assert.equal(f.stores.PublicationRequest.get(publication.code).state, "STAGED");
});

test("later native row validation cannot inherit a completed capture admission", async t => {
  const f = await publicationFixture(t);
  await f.publish();
  const reference = { publicationCode: "approved-product", productCode: "product", storeCode: "store",
    sourceVersion: "0", targetVersion: "a".repeat(64) };
  const retained = { rootType: "priceRow", fingerprint: "retained", payload: { rootType: "priceRow", rootCode: "new-price",
    records: [{ schema: "priceBook", policy: { code: "book", currency: "POINTS" } },
      { schema: "priceRow", policy: { code: "new-price", priceBookCode: "book", productCode: "product", currency: "POINTS" } }],
    productReference: reference, productEvidence: { operationKey: "activation", revision: 1 } } };
  // Isolate retained storage only; execute the actual row validator and its human authority gate.
  const validator = { ...f.publicationOwner, getVersion: async () => retained };
  await assert.rejects(validator.validate({ rootType: "priceRow" }, retained,
    { ...f.request, enterpriseCode: "seller" }), /Signed book-owner publisher/);
  assert.equal(f.stores.PublicationRequest.size, 1);
  assert.equal(f.stores.PricingPolicyPointer.size, 0);
});

test("runtime-config group is not a native full-access restriction; bounded route still requires the Pricing permission", () => {
  const security = require(foundation + "nRouter/src/service/request/defaultSecuredRequestPipelineService");
  assert.equal(security.hasAccessGroup.call({ hasPlatformFullAccess: () => true }, { router: { accessGroups: ["runtimeConfigAdminUserGroup"] } }), true);
  const route = require("../src/router/routers").pricing.administrativeAuthoring.publication;
  assert.equal(route.permissionConfig, "pricing.administrativeAuthoring.publishPermission");
  assert.equal(properties.pricing.administrativeAuthoring.publishPermission, "commerce.pricing.publish");
});

async function nativeRowLifecycleFixture(t) {
  const f = await publicationFixture(t);
  const graph = require("../../product/src/service/defaultProductPublicationGraphService");
  const provider = require("../../product/src/service/defaultProductPublicationVersionProviderService");
  const base = { tenant: "tenant-a", enterpriseCode: "seller", versionId: 0 };
  const localized = { ...base, code: "new-product-en", productCode: "new-product", locale: "en", status: "READY", name: "Coupon" };
  const reference = { schema: "productLocalization", code: localized.code, versionId: 0, hash: graph.hash(localized) };
  const root = { ...base, code: "new-product", status: "ACTIVE", publicationReferences: { storeCode: "store", records: [reference] } };
  const scope = { tenant: "tenant-a", productCode: root.code, storeCode: "store" };
  const targetVersion = graph.hash({ scope, references: [{ schema: "product", code: root.code, versionId: 0, hash: graph.hash(root) }, reference].sort(graph.compareReferences) });
  f.config.product = { publication: { maximumDependencies: 20 }, localization: { supportedLocales: ["en"], requiredLocales: ["en"] } };
  f.config.runtimeRole.publication = "STAGED";
  const getModels = NODICS.getModels;
  NODICS.getModels = (module, tenant) => module === "product" ? {
    ProductModel: { versioned: true, rawSchema: { versionedReadMode: "CURRENT" } },
    ProductLocalizationModel: { versioned: true, rawSchema: { versionedReadMode: "CURRENT" } },
  } : getModels(module, tenant);
  SERVICE.DefaultProductPublicationGraphService = graph;
  SERVICE.DefaultProductPublicationVersionProviderService = provider;
  SERVICE.DefaultProductLocalizationPolicyService = require("../../product/src/service/defaultProductLocalizationPolicyService");
  const productReads = [];
  const hooks = { product: () => {} };
  for (const [name, row] of [["DefaultProductService", root], ["DefaultProductLocalizationService", localized]]) SERVICE[name] = {
    get: async input => {
      productReads.push(input); assert.equal(input.authData.isSystem, true);
      assert.equal(input.query.tenant, "tenant-a"); assert.equal(input.query.code, row.code); assert.equal(input.query.versionId, 0);
      hooks.product(input, row);
      return { code: "SUC_FIND_00000", result: [structuredClone(row)], count: 1 };
    },
  };
  const productPublication = { code: "approved-product", domain: "product", rootType: "product", rootCode: root.code,
    tenantCode: "tenant-a", enterpriseCode: "seller", sourceVersion: "0", targetVersion, state: "ONLINE",
    activationOperation: { key: "product-activation" }, auditTrail: [{ toState: "APPROVED" }] };
  f.stores.PublicationRequest.set(productPublication.code, productPublication);
  const productStatus = { scope, version: targetVersion, revision: 1, receipt: { committed: true, scope,
    operationKey: "product-activation", publicationCode: "approved-product", sourceVersion: "0", targetVersion } };
  SERVICE.DefaultProductPublicationTargetService = { getStatus: async () => structuredClone(productStatus) };
  f.config.product.publication.targetTransportProvider = "DefaultProductPublicationTargetService";
  f.request.httpRequest.body.command = { ...f.request.httpRequest.body.command, publicationCode: "native-row-release",
    rootType: "priceRow", rootCode: "new-price", productReference: { publicationCode: "approved-product", productCode: root.code,
      storeCode: "store", sourceVersion: "0", targetVersion } };
  const workflow = require(foundation + "nPublish/src/service/defaultPublicationApprovalWorkflowService");
  SERVICE.DefaultPublicationApprovalWorkflowService = workflow;
  f.config.publish.approvalWorkflow = { domains: structuredClone(properties.publish.approvalWorkflow.domains),
    target: { connectionName: "process", connectionType: "abstract", runtimeRole: "PROCESS", timeoutMs: 1000 } };
  f.config.publish.providers.workflowProviders = { pricing: "DefaultPublicationApprovalWorkflowService" };
  const invoke = SERVICE.DefaultModuleService.invokeModule, starts = [];
  SERVICE.DefaultModuleService.invokeModule = async input => {
    if (input.moduleName !== "workflow") return invoke(input);
    const { responseSelector, ...transport } = input;
    starts.push(structuredClone(transport));
    return { instance: { code: input.requestBody.instanceCode, definitionCode: input.requestBody.definitionCode,
      version: 1, context: structuredClone(input.requestBody.context) } };
  };
  const command = async (operation, publication) => {
    f.request.httpRequest.body.command = { operation, publicationCode: publication.code, sourceVersion: publication.sourceVersion,
      expectedRevision: publication.revision };
    return controller.publication(f.request).then(r => r.data.result);
  };
  return { ...f, root, localized, productReads, productStatus, productPublication, starts, command, nativeHooks: hooks };
}

test("native row create then separately re-admitted validate and approval preserve original actor and exact Product proof", async t => {
  const f = await nativeRowLifecycleFixture(t), originalAuth = structuredClone(f.request.authData);
  const created = (await controller.publication(f.request)).data.result;
  assert.equal(created.state, "STAGED");
  const proofCount = f.proofs.length;
  const validated = await f.command("validate", created);
  assert.equal(validated.state, "VALIDATED"); assert(f.proofs.length > proofCount);
  assert(f.productReads.length >= 4);
  const pending = await f.command("requestApproval", validated);
  assert.equal(pending.state, "PENDING_APPROVAL"); assert.equal(f.starts.length, 1);
  assert.equal(f.starts[0].header["x-enterprise-code"], "platform");
  assert.equal(f.starts[0].header.Authorization, f.request.httpRequest.headers.authorization);
  assert.equal(f.starts[0].requestBody.context.enterpriseCode, "seller");
  assert.equal(f.starts[0].requestBody.context.publicationCode, created.code);
  assert.equal(pending.requestedBy, "native-admin");
  assert(pending.auditTrail.every(entry => entry.actor === "native-admin"));
  assert.deepEqual(f.request.authData, originalAuth);
  await f.command("requestApproval", pending);
  assert.equal(f.starts[1].requestBody.instanceCode, f.starts[0].requestBody.instanceCode);
  await assert.rejects(f.command("activate", pending));
  assert.equal(f.stores.PublicationRequest.get(created.code).state, "PENDING_APPROVAL");
  assert.equal(f.stores.PricingPolicyPointer.size, 0);
});

for (const kind of ["permission", "target", "source", "revision", "actor", "Product"]) test("later native lifecycle refuses fresh " + kind + " drift", async t => {
  const f = await nativeRowLifecycleFixture(t), created = (await f.publish()).result;
  const before = f.writes.length;
  if (kind === "permission") f.hooks.proof = p => { p.platformAdministrator = false; };
  if (kind === "target") f.request.httpRequest.body.targetEnterpriseCode = "foreign";
  if (kind === "source") created.sourceVersion = "f".repeat(64);
  if (kind === "revision") created.revision++;
  if (kind === "actor") f.stores.PublicationRequest.get(created.code).requestedBy = "other";
  if (kind === "Product") f.localized.name = "Changed immutable dependency";
  await assert.rejects(f.command("validate", created));
  if (kind !== "Product") assert.equal(f.writes.length, before);
  assert.equal(f.stores.PricingPolicyPointer.size, 0); assert.equal(f.starts.length, 0);
});

for (const completion of ["callback", "native"]) test("claimed Process decision completes through " + completion + " activation and actual Pricing CAS with idempotent replay", async t => {
  const f = await nativeRowLifecycleFixture(t), created = (await f.publish()).result;
  const validated = await f.command("validate", created), pending = await f.command("requestApproval", validated);
  const invoke = SERVICE.DefaultModuleService.invokeModule;
  const executionCode = "00000000-0000-4000-8000-000000000001";
  const callbackRequest = { tenant: "tenant-a", authData: { tenant: "tenant-a", entCode: "runtime",
    principalId: "process-runtime", tokenType: "service", principalType: "service", runtimeScope: {}, runtimeInstanceId: "process-instance" },
    httpRequest: { body: { instanceCode: pending.workflowRef, executionCode } } };
  f.config.publish.approvalWorkflow.runtimeEnterpriseScope = { enabled: true, enterpriseCodes: ["seller"] };
  SERVICE.DefaultServiceTokenService = { requireRuntimePrincipal: (request, module) => {
    assert.equal(request, callbackRequest); assert.equal(module, "workflow"); return request.authData;
  } };
  SERVICE.DefaultModuleService.invokeModule = async input => {
    if (!input.apiName.endsWith("/actions/claim")) return invoke(input);
    return { instance: { code: pending.workflowRef, definitionCode: "pricingPublicationApproval", version: 1,
      context: structuredClone(f.starts[0].requestBody.context) }, executionCode, nodeCode: "applyDecision",
      taskCode: "review-task", actor: "reviewer", body: { decision: { approved: true } } };
  };
  // Isolate runtime transport/storage only; run the actual Pricing target prepare, CAS and receipt owner.
  const local = { tenant: "tenant-a", enterpriseCode: "seller", authData: { isSystem: true } };
  const target = async operation => {
    const role = f.config.pricing.publication.runtimeRole;
    f.config.pricing.publication.runtimeRole = "ONLINE";
    try { return await operation(); } finally { f.config.pricing.publication.runtimeRole = role; }
  };
  SERVICE.TestPricingTargetTransport = {
    getTargetStatus: publication => target(() => f.publicationOwner.getTargetStatus(publication, local)),
    prepareTarget: release => target(() => f.publicationOwner.prepareTarget(release, local)),
    switchTarget: command => target(() => f.publicationOwner.switchTarget(command, local)),
  };
  f.config.pricing.publication.targetTransportProvider = "TestPricingTargetTransport";
  const callback = require(foundation + "nPublish/src/service/defaultPublicationApprovalCallbackService");
  if (completion === "native") {
    const status = SERVICE.TestPricingTargetTransport.getTargetStatus;
    SERVICE.TestPricingTargetTransport.getTargetStatus = async () => { throw new Error("isolated unavailable target"); };
    await assert.rejects(callback.applyDecision(callbackRequest, { domain: "pricing", actionKey: "pricing.applyPublicationDecision" }), /unavailable target/);
    const approved = structuredClone(f.stores.PublicationRequest.get(created.code));
    assert.equal(approved.state, "APPROVED");
    assert(approved.auditTrail.some(entry => entry.toState === "APPROVED" && entry.details.workflow.actor === "reviewer"));
    SERVICE.TestPricingTargetTransport.getTargetStatus = status;
    const online = await f.command("activate", approved);
    assert.equal(online.state, "ONLINE");
    assert.equal(online.auditTrail.at(-1).actor, "native-admin");
  }
  const result = await callback.applyDecision(callbackRequest, { domain: "pricing", actionKey: "pricing.applyPublicationDecision" });
  assert.equal(result.output.state, "ONLINE");
  assert.equal(f.stores.PricingPolicyPointer.size, 1); assert.equal(f.stores.PricingPolicyReceipt.size, 1);
  const pointer = structuredClone([...f.stores.PricingPolicyPointer.values()][0]);
  const replay = await callback.applyDecision(callbackRequest, { domain: "pricing", actionKey: "pricing.applyPublicationDecision" });
  assert.deepEqual(replay, result); assert.deepEqual([...f.stores.PricingPolicyPointer.values()][0], pointer);
  assert.equal(f.stores.PricingPolicyReceipt.size, 1);
  assert.equal(f.stores.PublicationRequest.get(created.code).requestedBy, "native-admin");
});

for (const state of ["VALIDATING", "VALIDATED"]) test("native proof revocation after " + state + " write returns no false success and fresh read reconciles", async t => {
  const f = await nativeRowLifecycleFixture(t), created = (await f.publish()).result;
  f.hooks.proof = proof => {
    if (f.stores.PublicationRequest.get(created.code).state === state) proof.platformAdministrator = false;
  };
  await assert.rejects(f.command("validate", created));
  const stored = structuredClone(f.stores.PublicationRequest.get(created.code));
  assert.equal(stored.state, state);
  assert.equal(f.starts.length, 0); assert.equal(f.stores.PricingPolicyPointer.size, 0);
  f.hooks.proof = () => {};
  assert.deepEqual(await f.command("read", stored), stored);
  const validated = await f.command("validate", stored);
  assert.equal(validated.state, "VALIDATED");
});

test("native immutable Product proof rejects original actor drift during graph reads before retention", async t => {
  const f = await nativeRowLifecycleFixture(t), before = f.writes.length;
  f.nativeHooks.product = () => { f.request.authData.authVersion++; };
  await assert.rejects(f.publish()); assert.equal(f.writes.length, before);
});

test("native lifecycle pins canonical journal root across independent repository reads", async t => {
  const f = await nativeRowLifecycleFixture(t), created = (await f.publish()).result;
  const service = SERVICE.DefaultPublicationRequestService, get = service.get, before = f.writes.length;
  let reads = 0;
  service.get = async input => {
    if (input.query.code === created.code && ++reads === 2) f.stores.PublicationRequest.get(created.code).rootCode = "foreign-root";
    return get(input);
  };
  await assert.rejects(f.command("validate", created));
  assert.equal(f.writes.length, before);
  assert.equal(f.stores.PublicationRequest.get(created.code).state, "STAGED");
});

test("fixed Product proof rejects copied and retired native contexts", async t => {
  const f = await nativeRowLifecycleFixture(t), graph = SERVICE.DefaultProductPublicationGraphService;
  let context;
  SERVICE.DefaultProductPublicationGraphService = { ...graph, resolve: async function (publication, request) {
    context = request;
    await assert.rejects(graph.resolvePricingAdministrativeProof(publication, { ...request }), /Copied or retired/);
    return graph.resolve.call(this, publication, request);
  } };
  await f.publish();
  await assert.rejects(graph.resolvePricingAdministrativeProof(f.productPublication, context), /Copied or retired/);
});

test("publication permission is a separate explicit v001 definition, never an installed catalogue rewrite or grant", () => {
  const manifest = require("../data/manifest.json"), section = manifest.sections.administrativePublicationPermission;
  assert.equal(section.version, "0.0.1"); assert.equal(section.sourceRoot, "init-v001");
  assert.equal(section.selectionPolicy, "EXPLICIT"); assert.equal(section.destinationRole, "PLATFORM");
  assert.deepEqual(Object.values(require("../data/init-v001/records/identity/pricingAdministrativePublicationPermissionData")),
    [{ code: "commerce.pricing.publish", name: "commerce.pricing.publish", active: true, ownerModule: "pricing" }]);
  const header = require("../data/init-v001/headers/identity/pricingAdministrativePublicationPermissionHeader").profile.pricingAdministrativePublicationPermission;
  assert.equal(header.options.schemaName, "permission"); assert.equal(header.options.operation, "ensureReferenceAll");
  assert.equal(Object.keys(section.files).length, 2);
});
