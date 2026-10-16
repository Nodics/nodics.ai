/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
/** @module database/test/platformAdministratorSchemaAccess
 * @description Exercises native Platform authority at real generated access gates while retaining ownership and field/lifecycle policies.
 * @owner nDatabase @layer test
 */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const router = require("../../../nRouter/src/service/request/defaultSecuredRequestPipelineService");
const access = require("../src/service/schema/defaultSchemaAccessHandlerService");
const utility = require("../src/service/schema/defaultSchemaUtilityService");
const ownership = require("../src/service/access/defaultRecordOwnershipPolicyService");
const writePolicy = require("../src/service/schema/defaultSchemaWriteAccessPolicyService");
const authoring = require("../src/service/schema/defaultSchemaAuthoringPolicyService");
const initializers = {
  read: require("../src/service/procs/get/defaultModelsGetInitializerService"),
  create: require("../src/service/procs/save/defaultModelSaveInitializerService"),
  update: require("../src/service/procs/update/defaultModelsUpdateInitializerService"),
  remove: require("../src/service/procs/remove/defaultModelsRemoveInitializerService"),
};
const groupCode = "platformAdministratorUserGroup";
const operations = ["read", "search", "create", "update", "delete"];

function fixture(t) {
  const globals = Object.fromEntries(
    ["CONFIG", "UTILS", "CLASSES", "SERVICE", "NODICS"].map((key) => [
      key,
      global[key],
    ]),
  );
  t.after(() => Object.assign(global, globals));
  global.CONFIG = {
    get: (key) =>
      ({
        defaultTenant: "authority",
        defaultEnterprise: "PLATFORM",
        identityGovernance: {
          principalPolicy: { serviceGroup: "serviceAccountUserGroup" },
        },
        authSecurity: {
          jwt: {},
          compatibility: {},
          bootstrapIdentity: { required: false },
        },
        bootstrapIdentity: {
          adminPassword: "isolated-fixture-only",
          servicePassword: "isolated-fixture-only",
          serviceApiKey: "isolated-fixture-only",
        },
        accessPoints: {
          fullAccessPoint: 10,
          readAccessPoint: 1,
          writeAccessPoint: 5,
          removeAccessPoint: 8,
        },
        routeActionAuthorization: { enabled: true, strict: true },
        runtimeRole: { publication: "ONLINE" },
      })[key],
  };
  global.UTILS = {
    isBlank: (value) => !value || Object.keys(value).length === 0,
    isObject: (value) => value !== null && typeof value === "object",
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message, wrappedCode) {
        super(message || code?.message || code);
        this.code = wrappedCode || code;
      }
    },
  };
  global.NODICS = { getServerState: () => "started" };
  global.SERVICE = {
    DefaultSecuredRequestPipelineService: router,
    DefaultSchemaAccessHandlerService: access,
    DefaultRecordOwnershipPolicyService: ownership,
    DefaultSchemaWriteAccessPolicyService: writePolicy,
    DefaultSchemaAuthoringPolicyService: authoring,
  };
  const employee = Object.values(
    require("../../../../../nodics.platform/modules/profile/data/init-v001/records/user/defaultEmployeeData"),
  ).find((row) => row.loginId === "admin");
  const group = Object.values(
    require("../../../../../nodics.platform/modules/profile/data/init-v001/records/identity/profileUserGroupData"),
  ).find((row) => row.code === groupCode);
  assert.ok(employee.userGroups.includes(groupCode));
  const auth = {
    tenant: "authority",
    entCode: "PLATFORM",
    loginId: "admin",
    principalType: employee.principalType,
    tokenType: "access",
    authenticationMethod: "PASSWORD",
    userGroups: [...employee.userGroups],
    permissions: [...group.permissions],
  };
  const schema = {
    accessGroups: { unrelatedDomainOperator: 10 },
    definition: { title: { type: "string" } },
    ownership: {
      enabled: true,
      principalTypes: ["human"],
      ownerProperty: "ownerId",
      bypassGroups: [],
    },
  };
  const request = (override = {}) => ({
    tenant: "authority",
    authData: structuredClone(auth),
    schemaModel: {
      moduleName: "domain",
      schemaName: "record",
      rawSchema: structuredClone(schema),
    },
    query: { code: "record", enterpriseCode: "BUSINESS_A" },
    model: { title: "Edited" },
    ...override,
  });
  return { auth, schema, request };
}

function step(service, method, request) {
  return new Promise((resolve, reject) =>
    service[method].call(
      { ...service, LOG: { debug() {} } },
      request,
      {},
      {
        nextSuccess: () => resolve(request),
        error: (_request, _response, error) => reject(error),
      },
    ),
  );
}

test("fresh seeded admin satisfies all generated schema group gates without unrelated operating memberships", async (t) => {
  const f = fixture(t);
  assert.equal(access.getAccessPoint(f.auth, f.schema.accessGroups), 10);
  for (const [operation, service] of Object.entries(initializers)) {
    const request = f.request();
    await step(service, "checkAccess", request);
    if (operation === "create") assert.equal(request.model.ownerId, "admin");
    else {
      assert.equal(
        request.query.ownerId,
        "admin",
        "ownership is still enforced",
      );
      assert.equal(
        request.query.enterpriseCode,
        "BUSINESS_A",
        "enterprise selector is retained",
      );
    }
  }
  assert.deepEqual(
    utility.getAllowedOperations(f.request(), f.schema, { operations }),
    operations,
  );
});

test("generated schema gates reject enterprise, service, API-key, linked, ungranted and cross-tenant wildcard carriers", async (t) => {
  const f = fixture(t);
  const invalid = [
    { entCode: "BUSINESS_A" },
    { entCode: "BUSINESS_B" },
    { tenant: "business" },
    { userGroups: ["adminGroup", "runtimeConfigAdminUserGroup"] },
    { principalType: "service" },
    { principalType: "customer" },
    { tokenType: "service" },
    { authenticationMethod: "API_KEY" },
    { sessionContext: { owner: "profile.enterpriseMembership" } },
    { externalIdentityLinkCode: "external" },
    { isSystem: true },
    { runtimeScope: {} },
    { userGroups: [groupCode, "serviceAccountUserGroup"] },
    { permissions: [] },
    { userGroups: [], platformAdministrator: true },
  ];
  for (const override of invalid) {
    const authData = { ...f.auth, ...override };
    assert.equal(
      access.getAccessPoint(authData, f.schema.accessGroups),
      0,
      JSON.stringify(override),
    );
    for (const service of Object.values(initializers))
      await assert.rejects(
        step(service, "checkAccess", f.request({ authData })),
        { code: "ERR_AUTH_00003" },
      );
    assert.deepEqual(
      utility.getAllowedOperations(f.request({ authData }), f.schema, {
        operations,
      }),
      [],
    );
  }
  for (const service of Object.values(initializers))
    await assert.rejects(
      step(service, "checkAccess", f.request({ tenant: "business" })),
      { code: "ERR_AUTH_00003" },
    );
  assert.deepEqual(
    utility.getAllowedOperations(f.request({ tenant: "business" }), f.schema, {
      operations,
    }),
    [],
  );
  delete SERVICE.DefaultSecuredRequestPipelineService;
  assert.equal(
    access.getAccessPoint(f.auth, f.schema.accessGroups),
    0,
    "missing predicate does not invent privilege",
  );
  assert.equal(
    access.getAccessPoint(
      { userGroups: ["unrelatedDomainOperator"] },
      f.schema.accessGroups,
    ),
    10,
    "ordinary explicit schema group grants are unchanged",
  );
});

test("full schema group access preserves ownership rejection, field policies and read-only publication authority", async (t) => {
  const f = fixture(t);
  await assert.rejects(
    step(
      initializers.create,
      "checkAccess",
      f.request({ model: { title: "New", ownerId: "other" } }),
    ),
    /ownership cannot be assigned/,
  );
  const schema = { ...f.schema, backoffice: { mutationMode: "PUBLISHABLE" } };
  assert.deepEqual(
    utility.getAllowedOperations(f.request(), schema, { operations }),
    ["read", "search"],
  );
  assert.deepEqual(
    utility.getAllowedOperations(f.request(), f.schema, {
      operations: ["read"],
    }),
    ["read"],
  );
  SERVICE.DefaultSchemaAccessPolicyResolverService = {
    resolveAccess: async (request, context) => {
      assert.equal(request.authData.loginId, "admin");
      assert.equal(context.tenant, "authority");
      return {
        effect: "DENY",
        allowed: false,
        policyCode: "retainedOwnerPolicy",
      };
    },
  };
  for (const [operation, method] of [
    ["create", "enforceCreateAccessPolicies"],
    ["update", "enforceUpdateAccessPolicies"],
    ["remove", "enforceDeleteAccessPolicies"],
  ]) {
    const request = f.request();
    await step(initializers[operation], "checkAccess", request);
    await assert.rejects(step(initializers[operation], method, request), {
      code: "ERR_AUTH_00003",
    });
  }
  await assert.rejects(
    step(
      initializers.read,
      "validateRequest",
      f.request({ schemaModel: undefined }),
    ),
    /Model not available within tenant/,
  );
});

test("actual Rules definitions route and generated schema boundary share the same native authority", async (t) => {
  const f = fixture(t);
  const collect = (object) =>
    Object.values(object).flatMap((value) =>
      value && typeof value === "object"
        ? value.key
          ? [value]
          : collect(value)
        : [],
    );
  const definition = collect(
    require("../../../../../nodics.rulesEngine/modules/rulesApi/src/router/routers"),
  ).find(
    (route) =>
      route.key === "/definitions" &&
      route.permission === "rules.definition.read",
  );
  assert.ok(definition);
  const request = f.request({ moduleName: "rulesApi", router: definition });
  await step(router, "checkAccess", request);
  await step(initializers.read, "checkAccess", request);
  for (const override of [
    { entCode: "BUSINESS" },
    { principalType: "service" },
    { authenticationMethod: "API_KEY" },
    { permissions: [] },
  ])
    await assert.rejects(
      step(router, "checkAccess", {
        ...request,
        authData: { ...f.auth, ...override },
      }),
      { code: "ERR_AUTH_00003" },
    );
  await assert.rejects(
    step(router, "checkAccess", { ...request, tenant: "business" }),
    { code: "ERR_AUTH_00003" },
  );
  await assert.rejects(
    step(router, "checkAccess", {
      ...request,
      router: { ...definition, authTokenTypes: ["service"] },
    }),
    { code: "ERR_AUTH_00003" },
  );
});
