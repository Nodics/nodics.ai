/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/test/bootstrapRecordPreservation @description Tests private Init admission, exact retained identities and generated insert-only persistence for forward Profile records. @owner profile @layer test */
const assert = require("node:assert/strict");
const { test, beforeEach, afterEach } = require("node:test");
const bootstrap = require("../src/service/identity/defaultMandatoryIdentityBootstrapService");
const executeBootstrapRelease = require("./helpers/bootstrapReleaseExecution");
const writer = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/procs/save/defaultModelSaveInitializerService");
const kinds = ["employee", "customer", "address", "contact", "enterprise", "tenant"];
const serviceBaselineScopes = ["auth.internal.token.read", "auth.internal.token.read.anyTenant",
  "location.location.read", "profile.address.reference.read", "profile.enterprise.reference.read"];

/** Evaluates the real record source with fixture-only bootstrap credentials, never deployment secrets. */
function serviceSeed(relative) {
  const source = require("node:fs").readFileSync(require.resolve(relative), "utf8");
  const context = { module: { exports: {} }, CONFIG: {}, require: name => {
    assert.equal(name, "nodics.foundation/modules/nAuth/src/service/security/defaultAuthSecurityService");
    return { validateBootstrapIdentity: config => {
      assert.equal(config, context.CONFIG);
      return { servicePassword: "fixture-service-password", serviceApiKey: "fixture-service-key" };
    } };
  } };
  require("node:vm").runInNewContext(source, context);
  return structuredClone(context.module.exports.record1);
}

test("forward service source restores exactly five fresh-install scopes without changing historical bytes or credential bindings", () => {
  const historicalPath = "../data/init-v001/records/user/defaultServiceEmployeeData";
  const original = serviceSeed(historicalPath);
  const forward = serviceSeed("../data/init-v001/records/identityBootstrap/preservedServiceEmployeeData");
  assert.deepEqual(original.apiKeyScopes, serviceBaselineScopes.slice(0, 2));
  assert.deepEqual(forward, { ...original, apiKeyScopes: serviceBaselineScopes });
  assert.equal(require("node:crypto").createHash("sha256").update(require("node:fs").readFileSync(require.resolve(historicalPath))).digest("hex"),
    "3b664f03fa305b2c96fd0e9e4a2ac5b08af82450cda7b6dffeed279e70fc4209");
  const header = require("../data/init-v001/headers/identityBootstrap/preservedUsersHeader").profile.defaultServiceEmployee;
  assert.equal(header.options.dataFilePrefix, "preservedServiceEmployeeData");
  const files = require("../data/manifest.json").sections["init-v001"].files;
  assert.equal(files["init-v001/records/user/defaultServiceEmployeeData.js"], undefined);
  assert(files["init-v001/records/identityBootstrap/preservedServiceEmployeeData.js"]);
});

test("fresh apiAdmin receives five scopes while existing rotated credentials and narrowed scopes survive successor execution", async () => {
  for (const tenant of ["default", "subject"]) {
    const f = fixture("employee");
    const model = serviceSeed("../data/init-v001/records/identityBootstrap/preservedServiceEmployeeData");
    f.request.models = [model]; f.request.tenant = tenant;
    await init(() => f.owner.ensureBootstrapAll(f.request), tenant);
    assert.deepEqual(f.rows[0].apiKeyScopes, serviceBaselineScopes);
    assert.equal(f.rows[0].password.password, "fixture-service-password");
    Object.assign(f.rows[0], { active: false, password: "rotated-password-reference", apiKey: "rotated-key-reference",
      apiKeyStatus: "revoked", apiKeyScopes: ["auth.internal.token.read"], userGroups: [], locked: true, attempts: 9 });
    const retained = structuredClone(f.rows);
    await init(() => f.owner.ensureBootstrapAll(f.request), tenant);
    assert.deepEqual(f.rows, retained);
    assert.equal(f.writes.length, 1);
  }
});

test("all nine successor Init sections resolve to fixed-schema create-preserve owners", () => {
  const sections = ["Addresses", "Contacts", "Enterprise", "Tenants", "Users"].flatMap(name =>
    Object.values(require("../data/init-v001/headers/identityBootstrap/preserved" + name + "Header").profile));
  assert.equal(sections.length, 9);
  assert.deepEqual([...new Set(sections.map(header => header.options.schemaName))].sort(), [...kinds].sort());
  for (const header of sections) {
    assert.equal(header.options.operation, "ensureBootstrapAll");
    const schema = header.options.schemaName;
    const owner = require("../src/service/" + schema + "/default" + schema[0].toUpperCase() + schema.slice(1) + "Service");
    assert.equal(typeof owner.ensureBootstrapAll, "function");
  }
});
let previous;
beforeEach(() => {
  previous = Object.fromEntries(["SERVICE", "CONFIG", "CLASSES", "_"].map(key => [key, global[key]]));
  global._ = require("lodash");
  global.CONFIG = { get: key => key === "defaultTenant" ? "default" : undefined };
  global.CLASSES = { NodicsError: class extends Error { constructor(code) { super(code); this.code = code; } } };
});
afterEach(() => {
  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete global[key]; else global[key] = value;
  }
});

function fixture(kind, rows = []) {
  const className = kind[0].toUpperCase() + kind.slice(1), writes = [], reads = [];
  const owner = {
    ...require("../src/service/" + kind + "/default" + className + "Service"),
    get: async request => {
      reads.push(request);
      assert.equal(request.options.skipItemCache, true);
      assert.equal(request.options.recursive, false);
      const query = request.query;
      const result = rows.filter(row => query.$or
        ? query.$or.some(selector => Object.entries(selector).every(([key, value]) => row[key] === value))
        : row.code === query.code);
      return { code: "SUC_READ", count: result.length, result: structuredClone(result) };
    },
    save: async request => {
      assert.equal(request.query, undefined);
      assert.deepEqual(request.options, {
        insertOnly: true,
        recursive: false,
        returnModified: false,
      });
      assert.equal(request.authData, authData);
      writes.push(structuredClone(request));
      const model = { versioned: false, rawSchema: {},
        compareAndSetItem: async operation => {
          assert.equal(operation.operation, "create");
          assert.equal(operation.insertOnly, true);
          if (rows.some(row => row.code === operation.model.code ||
              (operation.model.loginId && row.loginId === operation.model.loginId))) throw new Error("duplicate identity");
          const inserted = { ...structuredClone(operation.model), _id: "created-" + rows.length };
          rows.push(inserted);
          return inserted;
        },
        saveItems: async () => { throw new Error("Upserts are forbidden"); },
      };
      const inserted = await writer.persistModel({ ...request, schemaModel: model });
      return { code: "SUC_SAVE", result: inserted };
    },
  };
  const authData = { userGroups: ["adminGroup"] };
  global.SERVICE = { DefaultMandatoryIdentityBootstrapService: bootstrap,
    ["Default" + className + "Service"]: owner };
  const model = { code: "seed", active: true,
    ...(["employee", "customer"].includes(kind) ? {
      loginId: "seed-login", principalType: kind === "employee" ? "human" : "customer",
      userGroups: ["initialGroup"], password: { loginId: "seed-login", password: "fixture-only-password" },
    } : {}), ...(kind === "enterprise" ? { tenant: "default" } : {}) };
  const request = { tenant: "default", authData, models: [model] };
  return { owner, model, request, rows, reads, writes };
}

async function init(work, tenant = "default") {
  const schemaName = kinds.find(kind => SERVICE["Default" + kind[0].toUpperCase() + kind.slice(1) + "Service"]);
  return executeBootstrapRelease(schemaName, tenant, work);
}

for (const kind of kinds) {
  test(kind + " forward Init preserves active and inactive records byte-for-byte without any writes", async () => {
    for (const active of [true, false]) {
      const f = fixture(kind);
      f.rows.push({ ...structuredClone(f.model), _id: "retained", active,
        password: "rotated-password-reference", apiKeyHash: "rotated-key-hash", apiKeyScopes: [],
        userGroups: [], attempts: 7, locked: true, authVersion: 12, name: "Axis override" });
      const retained = structuredClone(f.rows);
      const result = await init(() => f.owner.ensureBootstrapAll(f.request));
      assert.deepEqual(result, { result: [{ code: "seed" }] });
      assert.deepEqual(f.rows, retained);
      assert.equal(f.writes.length, 0);
    }
  });

  test(kind + " first install uses the generated insert-only primitive, and repeat Init is read-only", async () => {
    const f = fixture(kind), source = structuredClone(f.request);
    await init(() => f.owner.ensureBootstrapAll(f.request));
    assert.equal(f.writes.length, 1);
    assert.equal(f.rows.length, 1);
    assert.deepEqual(f.request, source);
    await init(() => f.owner.ensureBootstrapAll(f.request));
    assert.equal(f.writes.length, 1);
    assert.equal(SERVICE.DefaultDataReleaseService.isStartupReleaseExecution("default"), false);
    await assert.rejects(f.owner.ensureBootstrapAll({ ...f.request, startup: true,
      isSystem: true, options: { startup: true, insertOnly: true } }), { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" });
  });
}

test("tenant-local service identity is preserved without reclassification or credential inspection", async () => {
  const f = fixture("employee");
  f.model.principalType = "service";
  f.request.tenant = "subject";
  f.rows.push({ ...structuredClone(f.model), _id: "service-id", active: false,
    apiKeyStatus: "revoked", apiKeyScopes: [], userGroups: [], password: "retained" });
  const before = structuredClone(f.rows);
  await init(() => f.owner.ensureBootstrapAll(f.request), "subject");
  assert.deepEqual(f.rows, before);
  assert.equal(f.writes.length, 0);
});

test("conflicting code/login/type, linked identities and enterprise tenant changes refuse before writes", async () => {
  for (const mutation of [
    row => { row.code = "different"; }, row => { row.loginId = "different"; },
    row => { row.principalType = "service"; }, row => { row.authenticationIdentity = {}; },
    row => { row.identityLinkRetirement = {}; },
  ]) {
    const f = fixture("employee"), existing = { ...structuredClone(f.model), _id: "existing" };
    mutation(existing); f.rows.push(existing);
    await assert.rejects(init(() => f.owner.ensureBootstrapAll(f.request)), { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" });
    assert.equal(f.writes.length, 0);
  }
  const f = fixture("enterprise");
  f.rows.push({ ...f.model, _id: "existing", tenant: "foreign" });
  await assert.rejects(init(() => f.owner.ensureBootstrapAll(f.request)), { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" });
});

test("collisions and failed inventory are detected for the whole batch before first creation", async () => {
  const f = fixture("employee");
  f.request.models.push({ ...f.model, code: "second", loginId: "second-login" });
  f.rows.push({ _id: "collision", code: "second", loginId: "different", principalType: "human" });
  await assert.rejects(init(() => f.owner.ensureBootstrapAll(f.request)), { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" });
  assert.equal(f.writes.length, 0);
  f.owner.get = async () => ({ code: "SUC_READ", count: 2, result: [] });
  await assert.rejects(init(() => f.owner.ensureBootstrapAll(f.request)), { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" });
  assert.equal(f.writes.length, 0);
});

test("concurrent insert winner cannot be upserted or repaired", async () => {
  const f = fixture("employee"), save = f.owner.save;
  f.owner.save = async request => {
    f.rows.push({ ...structuredClone(f.model), _id: "other-writer", userGroups: [], active: false });
    return save(request);
  };
  await assert.rejects(init(() => f.owner.ensureBootstrapAll(f.request)), /duplicate identity/);
  assert.equal(f.rows.length, 1);
  assert.deepEqual(f.rows[0].userGroups, []);
  assert.equal(f.rows[0].active, false);
});

test("failed or malformed bootstrap acknowledgements cannot become empty inventories or successful receipts", async () => {
  for (const flag of [false, "false", "true", 0, null]) {
    for (const field of ["acknowledged", "success"]) {
      const f = fixture("employee");
      f.owner.get = async () => ({ code: "SUC_READ", count: 0, result: [], [field]: flag });
      await assert.rejects(init(() => f.owner.ensureBootstrapAll(f.request)), { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" });
      assert.equal(f.writes.length, 0);
    }
    for (const outcome of [{ acknowledged: flag }, { success: flag }, { result: { acknowledged: flag } }]) {
      const f = fixture("employee"), save = f.owner.save;
      f.owner.save = async request => ({ ...await save(request), ...outcome });
      await assert.rejects(init(() => f.owner.ensureBootstrapAll(f.request)), { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" });
      assert.equal(f.writes.length, 1, "uncertain writes are not retried or reported successful despite readback");
    }
  }
});

test("wrong-tenant execution, duplicate models and forged public flags grant no creation authority", async () => {
  const f = fixture("employee");
  await assert.rejects(init(() => f.owner.ensureBootstrapAll({ ...f.request, tenant: "foreign" })), { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" });
  f.request.models.push(structuredClone(f.model));
  await assert.rejects(init(() => f.owner.ensureBootstrapAll(f.request)), { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" });
  assert.equal(f.writes.length, 0);
});

test("bootstrap requires the exact schema operation capability, not broad startup context", async () => {
  const f = fixture("employee");
  SERVICE.DefaultDataReleaseService = { isStartupReleaseExecution: () => true };
  await assert.rejects(f.owner.ensureBootstrapAll(f.request), { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" });
  for (const startup of [false, true]) {
    await executeBootstrapRelease("employee", "default", async () => {
      bootstrap.assertBootstrapImport(f.request, "employee");
      for (const schemaName of [undefined, "customer", "tenant", "principalScopeAssignment"])
        assert.throws(() => bootstrap.assertBootstrapImport(f.request, schemaName), { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" });
      assert.throws(() => bootstrap.assertBootstrapImport({ ...f.request, tenant: "other" }, "employee"), { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" });
      await f.owner.ensureBootstrapAll(f.request);
    }, { startup });
    assert.throws(() => bootstrap.assertBootstrapImport(f.request, "employee"), { code: "ERR_PROFILE_CREDENTIAL_OWNERSHIP" });
  }
  assert.equal(f.writes.length, 1);
});
