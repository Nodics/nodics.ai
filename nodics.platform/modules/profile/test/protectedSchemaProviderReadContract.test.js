/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/test/protectedSchemaProviderReadContract @description Isolated standard Mongo/cache privacy and independent evidence-owner admission fixtures; not live provider or installation qualification. @owner profile @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const foundation = "../../../../nodics.foundation/modules/";
const policy = require(
  foundation +
    "nDatabase/database/src/service/schema/defaultSchemaReadAccessPolicyService",
);
const mongo = require(
  foundation + "nDatabase/mongodb/src/schemas/model",
).default;
const get = require(
  foundation +
    "nDatabase/database/src/service/procs/get/defaultModelsGetInitializerService",
);
const cache = require(
  foundation + "nCache/cache/src/service/policy/defaultCachePolicyService",
);
const cacheService = require(
  foundation + "nCache/cache/src/service/cache/defaultCacheService",
);
const adapter = require("../src/service/interceptors/defaultProfileVerifiedContactInterceptorService");
const contacts = require("../src/service/contact/defaultProfileVerifiedContactService");
const decisions = require("../src/service/customer/defaultCustomerEligibilityDecisionGovernanceService");
global.ENUMS = {
  ContactType: Object.fromEntries(
    require("../src/utils/enums").ContactType.definition.map((key) => [
      key,
      { key },
    ]),
  ),
};
const schemas = require("../src/schemas/schemas");
const historical = require("../src/service/identity/defaultCanonicalHistoricalIdentityLinkService");
const team = require("../src/service/enterprise/defaultEnterpriseTeamAdministrationService");
const consent = require("../src/service/enterprise/defaultEnterpriseAdministrationConsentService");

function fixture() {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(typeof code === "string" ? code : code.message);
        this.code = typeof code === "string" ? code : code.code;
      }
    },
  };
  global.CONFIG = { get: () => ({ enabled: true }) };
  global.UTILS = { isBlank: (value) => !value || !Object.keys(value).length };
  const calls = [];
  global.SERVICE = {
    DefaultCanonicalHistoricalIdentityLinkService: { ...historical },
    DefaultEnterpriseTeamAdministrationService: {
      ...team,
      memberships: () => ({ digest: (value) => JSON.stringify(value) }),
    },
    DefaultEnterpriseAdministrationConsentService: { ...consent },
    DefaultSchemaReadAccessPolicyService: { ...policy },
    DefaultProfileVerifiedContactInterceptorService: { ...adapter },
    DefaultProfileVerifiedContactService: { ...contacts },
    DefaultCustomerEligibilityDecisionGovernanceService: { ...decisions },
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ system: true }),
    },
    DefaultCacheService: {
      get: async () => {
        calls.push("CACHE");
        throw Error("must not read protected shared cache");
      },
      put: () => {
        calls.push("PUT");
      },
    },
  };
  const row = {
    code: "person",
    profileVerifiedContact: { revision: 1 },
    customerEligibilityDecision: { revision: 1 },
  };
  const model = {
    ...mongo,
    schemaName: "customer",
    moduleName: "profile",
    rawSchema: {
      readProtection: {
        owner: "DefaultProfileVerifiedContactInterceptorService",
        qualified: false,
      },
    },
    cache: { enabled: true },
    transactionOptions: () => ({}),
    find: () => {
      calls.push("FIND");
      return { toArray: async () => [row] };
    },
    countDocuments: async () => {
      calls.push("COUNT");
      return 1;
    },
  };
  SERVICE.DefaultCustomerService = {
    get: async (request) => ({
      code: "SUC_FIND_00000",
      ...(await model.getItems(request)),
    }),
  };
  return { calls, model, row };
}

test("source policies name the exported owner with qualification false", () => {
  fixture();
  for (const name of [
    "contact",
    "employee",
    "customer",
    "enterprise",
    "password",
    "identityMigrationAudit",
  ]) {
    assert.equal(
      schemas.profile[name].readProtection.owner,
      name === "enterprise"
        ? "DefaultEnterpriseSetupContinuationService"
        : "DefaultProfileVerifiedContactInterceptorService",
    );
    assert.equal(schemas.profile[name].readProtection.qualified, false);
  }
});

test("supported direct durable reader composes retirement and Team privacy without native getItem/findOne claims", async () => {
  const { model, row } = fixture();
  row.identityLinkRetirement = { auditCode: "private" };
  row.teamOperation = { phase: "HELD" };
  row.teamRevision = 1;
  row.defaultAdminAssignmentCode = "private-admin";
  const result = await model.getDurableJournalItems(
    { query: {}, searchOptions: { limit: 2 } },
    {},
  );
  assert.deepEqual(result.result, [{ code: "person" }]);
  assert.ok(row.identityLinkRetirement);
  assert.ok(row.teamOperation);
  assert.equal(Object.hasOwn(mongo, "getItem"), false);
  assert.equal(Object.hasOwn(mongo, "findOne"), false);
});

test("historical exact generated admission retains only its own retirement marker", async () => {
  const { row } = fixture();
  row.identityLinkRetirement = { auditCode: "private" };
  const request = {
    query: {},
    options: { recursive: false, skipItemCache: true },
  };
  const result =
    await SERVICE.DefaultCanonicalHistoricalIdentityLinkService.generatedRead(
      "DefaultCustomerService",
      request,
    );
  assert.ok(result.result[0].identityLinkRetirement);
  assert.equal(result.result[0].profileVerifiedContact, undefined);
  assert.equal(result.result[0].customerEligibilityDecision, undefined);
});

test("Team reader preserves exact generated paging transformation, not modified selectors or cloned requests", async () => {
  const { model, row } = fixture();
  model.schemaName = "enterprise";
  row.defaultAdminAssignmentCode = "private-admin";
  row.teamOperation = { phase: "HELD" };
  SERVICE.DefaultEnterpriseService = {
    get: async (request) => {
      request.schemaModel = model;
      get.buildOptions.call(
        { ...get, LOG: { debug: () => {} } },
        request,
        {},
        { nextSuccess: () => {} },
      );
      assert.equal(
        SERVICE.DefaultEnterpriseTeamAdministrationService.ownsEnterpriseRead(
          request,
        ),
        true,
      );
      assert.equal(
        SERVICE.DefaultEnterpriseTeamAdministrationService.ownsEnterpriseRead({
          ...request,
        }),
        false,
      );
      const response = await model.getItems(request);
      request.query = { code: "different" };
      assert.equal(
        SERVICE.DefaultEnterpriseTeamAdministrationService.ownsEnterpriseRead(
          request,
        ),
        false,
      );
      return response;
    },
  };
  const request = {
    tenant: "demo",
    query: {},
    options: { recursive: false, skipItemCache: true },
    searchOptions: { pageSize: 2, pageNumber: 1 },
  };
  const result =
    await SERVICE.DefaultEnterpriseTeamAdministrationService.readEnterpriseEnvelope(
      SERVICE.DefaultEnterpriseService,
      request,
    );
  assert.equal(result.result[0].defaultAdminAssignmentCode, "private-admin");
  assert.ok(result.result[0].teamOperation);
  assert.equal(
    SERVICE.DefaultEnterpriseTeamAdministrationService.ownsEnterpriseRead(
      request,
    ),
    false,
  );
});

test("direct protected count uses owner-filtered query and refuses unqualified legacy cursor counts", async () => {
  const { model } = fixture();
  model.schemaName = "identityMigrationAudit";
  let observed;
  model.countDocuments = async (query) => {
    observed = query;
    return 0;
  };
  await model.countMatchingItems({});
  assert.deepEqual(observed, {
    $and: [{}, { "snapshot.canonicalHistoricalLink": { $exists: false } }],
  });
  delete model.countDocuments;
  await assert.rejects(
    model.countMatchingItems(
      {},
      {
        count: () => {
          throw Error("must not call unguarded cursor");
        },
      },
    ),
  );
});

test("real Mongo refuses Contact and decision selectors before opening cursor/count, regardless system role", async () => {
  const { model, calls } = fixture();
  for (const query of [
    { profileVerifiedContact: { $exists: true } },
    { customerEligibilityDecision: { $exists: true } },
  ]) {
    await assert.rejects(model.getItems({ query, authData: { system: true } }));
    await assert.rejects(model.countMatchingItems(query));
  }
  assert.deepEqual(calls, []);
});

test("raw actual provider projects both private owners without mutating original row", async () => {
  const { model, row, calls } = fixture();
  const result = await model.getItems({ query: {} });
  assert.deepEqual(result.result, [{ code: "person" }]);
  assert.deepEqual(calls, ["FIND", "COUNT"]);
  assert.ok(row.profileVerifiedContact);
  assert.ok(row.customerEligibilityDecision);
});

test("Contact and decision exact admissions do not clobber or grant each other", async () => {
  fixture();
  const contactRows =
    await SERVICE.DefaultProfileVerifiedContactService.records(
      "DefaultCustomerService",
      "demo",
      {},
    );
  assert.ok(contactRows[0].profileVerifiedContact);
  assert.equal(contactRows[0].customerEligibilityDecision, undefined);
  const request = {
    tenant: "demo",
    query: {},
    options: { recursive: false, skipItemCache: true },
  };
  const decisionRows =
    await SERVICE.DefaultCustomerEligibilityDecisionGovernanceService.generatedRead(
      request,
    );
  assert.ok(decisionRows.result[0].customerEligibilityDecision);
  assert.equal(decisionRows.result[0].profileVerifiedContact, undefined);
  const publicRows = await SERVICE.DefaultCustomerService.get({ ...request });
  assert.deepEqual(publicRows.result, [{ code: "person" }]);
});

test("generated guard runs before any cache lookup and protected rows never cache", async () => {
  const { model, calls } = fixture();
  const request = {
    schemaModel: model,
    query: { customerEligibilityDecision: { $exists: true } },
  };
  await assert.rejects(
    new Promise((resolve, reject) =>
      get.lookupCache.call(
        get,
        request,
        {},
        { nextSuccess: resolve, error: (_r, _s, error) => reject(error) },
      ),
    ),
  );
  request.query = {};
  await new Promise((resolve, reject) =>
    get.lookupCache.call(
      get,
      request,
      {},
      { nextSuccess: resolve, error: (_r, _s, error) => reject(error) },
    ),
  );
  assert.deepEqual(calls, []);
  assert.equal(cache.isItemCacheable(request, { result: [] }).cacheable, false);
  get.updateCache.call(
    { ...get, LOG: { debug: () => {} } },
    request,
    { success: { result: [] } },
    { nextSuccess: () => {} },
  );
  assert.deepEqual(calls, []);
});

test("malformed/missing configured owners fail closed, ordinary schemas remain compatible", async () => {
  const { model, calls } = fixture();
  model.rawSchema.readProtection.owner = "MissingService";
  await assert.rejects(model.getItems({ query: {} }));
  assert.deepEqual(calls, []);
  model.rawSchema.readProtection = null;
  await assert.rejects(model.getItems({ query: {} }));
  delete model.rawSchema.readProtection;
  const result = await model.getItems({ query: {} });
  assert.ok(result.result[0].profileVerifiedContact);
});

test("count adapter rejects replacing the admitted exact query and never counts", async () => {
  const { model, calls } = fixture();
  await assert.rejects(model.countMatchingItems({}, undefined, { query: {} }));
  assert.deepEqual(calls, []);
});

test("cached response policy projection also composes privacy before stop", async () => {
  const { model } = fixture();
  const request = { schemaModel: model, query: {} };
  const response = {
    success: {
      result: [
        {
          profileVerifiedContact: {},
          customerEligibilityDecision: {},
          code: "cached",
        },
      ],
    },
  };
  await policy.applyReadPolicies(request, response);
  assert.deepEqual(response.success.result, [{ code: "cached" }]);
});

test("standard cache suppresses old router/schema/search entries and writes before selecting an engine", async () => {
  const { model } = fixture();
  CLASSES.CacheError = class extends Error {
    constructor(value) {
      super(value.message);
      this.code = value.code;
    }
  };
  SERVICE.DefaultDatabaseConfigurationService = {
    getRawSchema: () => ({ profile: { customer: model.rawSchema } }),
  };
  SERVICE.DefaultCacheEngineService = {
    getCacheEngine: () => {
      throw Error("protected channels must not open");
    },
  };
  for (const channelName of ["schema", "router", "search"]) {
    const options = {
      moduleName: "profile",
      tenant: "demo",
      channelName,
      key: "old-entry",
    };
    await assert.rejects(
      cacheService.get(options),
      (error) => error.code === "ERR_CACHE_00001",
    );
    await assert.rejects(
      cacheService.consume(options),
      (error) => error.code === "ERR_CACHE_00001",
    );
    await assert.rejects(
      cacheService.putVersioned({ ...options, value: { revision: 1 } }),
      (error) => error.code === "ERR_CACHE_00006",
    );
    assert.equal(
      (await cacheService.put({ ...options, value: { private: true } }))
        .cacheable,
      false,
    );
  }
  assert.equal(
    cacheService.hasProtectedReadCacheScope({
      moduleName: "profile",
      channelName: "auth",
    }),
    false,
  );
  assert.equal(
    cacheService.hasProtectedReadCacheScope({
      moduleName: "other",
      channelName: "schema",
    }),
    false,
  );
  CONFIG.get = () => ({
    routerCacheChannelNameMapping: { customerRead: "customPublic" },
  });
  assert.equal(
    cacheService.hasProtectedReadCacheScope({
      moduleName: "profile",
      channelName: "customPublic",
    }),
    true,
  );
});
