/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module profile/test/IdentityGovernanceMigrationContract
 * @description Validates identity-governance migration contracts for ownership,
 * principal policy, persisted assignments, service credential rules, and
 * permission-based runtime decision behavior without binding the contract to backlog
 * priority labels.
 * @layer test
 * @owner profile
 * @override Project identity modules may extend migration controls while preserving
 * installed assignments and using owner catalogue records, never configuration grants.
 */
const assert = require("assert");
const path = require("path");
const repositoryRoot = path.resolve(__dirname, "../../../..");
const ownerPermissionCodes = Object.values(require("../../../../nodics.foundation/modules/nAuth/data/init-v001/records/identity/authPermissionData"))
  .filter(record => record.active === true).map(record => record.code);

global.CLASSES = {
  NodicsError: class NodicsError extends Error {
    constructor(code, message) {
      super(message || code);
      this.code = code;
    }
  },
};

const values = {
  defaultTenant: "default",
  profileModuleName: "profile",
  authSecurity: {
    apiKey: {
      defaultLifetimeSeconds: 3600,
      pepper: "test-api-key-pepper-with-more-than-thirty-two-characters",
    },
    securityStamp: {
      enabled: true,
      failClosed: true,
      allowMissingStamp: false,
    },
  },
  identityGovernance: {
    principalPolicy: {
      allowedTypes: ["human", "service", "customer"],
      serviceType: "service",
      serviceGroup: "serviceAccountUserGroup",
      minimumServiceApiKeyLength: 32,
    },
    migration: {
      version: 1,
    },
    separationOfDuties: {
      requireActor: true,
    },
  },
};
global.CONFIG = { get: (key) => values[key] };
global.UTILS = {
  isObject: (value) =>
    value !== null && typeof value === "object" && !Array.isArray(value),
};

const ownership = require(
  path.join(
    repositoryRoot,
    "nodics.foundation/modules/nDatabase/database/src/service/access/defaultRecordOwnershipPolicyService",
  ),
);
const ownedSchema = {
  rawSchema: {
    ownership: {
      enabled: true,
      ownerProperty: "ownerId",
      principalTypes: ["customer"],
      subjectGroups: ["customerUserGroup"],
      bypassGroups: ["adminGroup"],
    },
  },
};

async function validateOwnership() {
  let create = {
    schemaModel: ownedSchema,
    authData: {
      loginId: "customer-a",
      principalType: "customer",
      userGroups: ["customerUserGroup"],
    },
    model: { code: "record-a" },
  };
  await ownership.enforce(create, "create");
  assert.strictEqual(create.model.ownerId, "customer-a");
  assert.strictEqual(create.model.createdBy, "customer-a");
  let read = {
    schemaModel: ownedSchema,
    authData: create.authData,
    query: { active: true },
  };
  await ownership.enforce(read, "read");
  assert.strictEqual(read.query.ownerId, "customer-a");
  let legacyRead = {
    schemaModel: ownedSchema,
    authData: { loginId: "customer-a", userGroups: ["customerUserGroup"] },
    query: {},
  };
  await ownership.enforce(legacyRead, "read");
  assert.strictEqual(
    legacyRead.query.ownerId,
    "customer-a",
    "Missing principal type must not bypass ownership",
  );
  let remove = {
    schemaModel: ownedSchema,
    authData: create.authData,
    codes: ["record-a"],
  };
  await ownership.enforce(remove, "remove");
  assert.deepStrictEqual(
    remove.query,
    { code: { $in: ["record-a"] }, ownerId: "customer-a" },
    "Owned deletes must preserve the requested record selector",
  );
  let serviceSignup = {
    schemaModel: ownedSchema,
    authData: { serviceId: "signup-service", userGroups: ["userGroup"] },
    model: { ownerId: "customer-a" },
  };
  await ownership.enforce(serviceSignup, "create");
  assert.strictEqual(
    serviceSignup.model.ownerId,
    "customer-a",
    "Non-subject service flows must preserve explicit registration ownership",
  );
  await assert.rejects(
    ownership.enforce(
      {
        schemaModel: ownedSchema,
        authData: create.authData,
        model: { ownerId: "customer-b" },
      },
      "create",
    ),
  );
  let admin = {
    schemaModel: ownedSchema,
    authData: {
      loginId: "admin",
      principalType: "human",
      userGroups: ["adminGroup"],
    },
    query: {},
  };
  await ownership.enforce(admin, "read");
  assert.strictEqual(admin.query.ownerId, undefined);
}

async function validateSecurityStamp() {
  let cache = {};
  global.SERVICE = {
    DefaultIdentityCatalogueService: require("./helpers/identityCatalogueFixture").catalogue(undefined, ownerPermissionCodes),
    DefaultAuthSecurityService: require("../../../../nodics.foundation/modules/nAuth/src/service/security/defaultAuthSecurityService"),
    DefaultCacheService: {
      putVersioned: async (options) => {
        if (
          cache[options.key] &&
          cache[options.key].authVersion > options.value.authVersion
        )
          throw new Error("Stale cache write");
        cache[options.key] = options.value;
        return { result: options.value };
      },
    },
    DefaultAuthenticationProviderService: {
      addToken: (moduleName, expirable, key, value) => {
        cache[key] = value;
        return Promise.resolve(true);
      },
      findToken: (moduleName, key) =>
        cache[key]
          ? Promise.resolve(cache[key])
          : Promise.reject(new Error("missing")),
    },
  };
  const stamp = require(
    path.join(
      repositoryRoot,
      "nodics.foundation/modules/nAuth/src/service/identity/defaultPrincipalSecurityStampService",
    ),
  );
  await stamp.register("default", "user-a", 7);
  await stamp.validate({
    tenant: "default",
    loginId: "user-a",
    authVersion: 7,
    tokenType: "access",
  });
  await assert.rejects(
    stamp.validate({
      tenant: "default",
      loginId: "user-a",
      authVersion: 6,
      tokenType: "access",
    }),
  );
  await assert.rejects(
    stamp.validate({
      tenant: "default",
      loginId: "user-a",
      tokenType: "access",
    }),
  );
  await assert.rejects(stamp.validateConfiguration(), /distributed auth cache/);
  values.cache = {
    enabled: false,
    profile: { channels: { auth: { engine: "redis", fallback: false } } },
    default: {
      engines: {
        redis: {
          distributed: true,
          atomicConsume: true,
          atomicVersionWrite: true,
        },
      },
    },
  };
  await assert.rejects(
    stamp.validateConfiguration(),
    /enabled distributed auth cache/,
  );
  values.cache = {
    profile: {
      channels: { auth: { engine: "redis", fallback: false, enabled: false } },
    },
    default: {
      engines: {
        redis: {
          distributed: true,
          atomicConsume: true,
          atomicVersionWrite: true,
        },
      },
    },
  };
  await assert.rejects(
    stamp.validateConfiguration(),
    /enabled distributed auth cache/,
  );
  values.cache = {
    profile: { channels: { auth: { engine: "redis", fallback: false } } },
    default: {
      engines: {
        redis: {
          distributed: true,
          atomicConsume: true,
          atomicVersionWrite: true,
          enabled: false,
        },
      },
    },
  };
  await assert.rejects(
    stamp.validateConfiguration(),
    /enabled distributed auth cache/,
  );
  values.cache = {
    profile: { channels: { auth: { engine: "redis", fallback: false } } },
    default: {
      engines: {
        redis: {
          distributed: true,
          atomicConsume: true,
          atomicVersionWrite: true,
        },
      },
    },
  };
  await stamp.validateConfiguration();
  delete values.cache;
}

async function validatePasswordStampTargeting() {
  let updates = [];
  const read = (rows) => ({
    code: "SUC_READ",
    count: rows.length,
    result: rows,
  });
  global.SERVICE = {
    DefaultIdentityCatalogueService: require("./helpers/identityCatalogueFixture").catalogue(undefined, ownerPermissionCodes),
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ isSystem: true }),
    },
    DefaultPasswordService: {
      get: () =>
        Promise.resolve(read([{ _id: "password-a", loginId: "customer-a" }])),
    },
    DefaultEmployeeService: {
      get: () => Promise.resolve(read([])),
      update: (request) => {
        updates.push({ schema: "employee", request: request });
        return Promise.resolve(true);
      },
    },
    DefaultCustomerService: {
      get: () =>
        Promise.resolve(
          read([
            {
              _id: "customer-id",
              loginId: "customer-a",
              password: "password-a",
            },
          ]),
        ),
      update: (request) => {
        updates.push({ schema: "customer", request: request });
        return Promise.resolve({
          code: "SUC_UPDATE",
          result: { acknowledged: true, matchedCount: 1 },
        });
      },
    },
  };
  const governance = require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService");
  await governance.bumpLoginId({
    tenant: "default",
    query: { loginId: "customer-a" },
    model: { password: "hash" },
  });
  assert.deepStrictEqual(
    updates.map((update) => update.schema),
    ["customer"],
    "Password changes must stamp only the resolved principal collection",
  );
}

async function validateStableAndTransitiveStamping() {
  let registered = [];
  let principalUpdates = [];
  let employeeQueries = [];
  const read = (rows) => ({
    code: "SUC_READ",
    count: rows.length,
    result: rows,
  });
  global.SERVICE = {
    DefaultIdentityCatalogueService: require("./helpers/identityCatalogueFixture").catalogue(undefined, ownerPermissionCodes),
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ isSystem: true }),
    },
    DefaultPrincipalSecurityStampService: {
      reserveVersion: async (_tenant, minimum) => minimum,
      register: (tenant, principalId, version) => {
        registered.push({ tenant, principalId, version });
        return Promise.resolve(true);
      },
    },
    DefaultEmployeeService: {
      get: (request) => {
        employeeQueries.push(request.query);
        if (request.query.code === "employee-code")
          return Promise.resolve(
            read([
              {
                _id: "employee-id",
                code: "employee-code",
                loginId: "employee-login",
              },
            ]),
          );
        return Promise.resolve(
          read([{ _id: "inherited-id", loginId: "inherited-user" }]),
        );
      },
      update: (request) => {
        principalUpdates.push(request);
        return Promise.resolve({
          code: "SUC_UPDATE",
          result: { acknowledged: true, matchedCount: 1 },
        });
      },
    },
    DefaultCustomerService: {
      get: () => Promise.resolve(read([])),
      update: () => Promise.resolve(true),
    },
    DefaultUserGroupService: {
      get: (request) =>
        Promise.resolve(
          read(
            [
              { _id: "base", code: "baseGroup", parentGroups: [] },
              { _id: "child", code: "childGroup", parentGroups: ["baseGroup"] },
              {
                _id: "grandchild",
                code: "grandchildGroup",
                parentGroups: ["childGroup"],
              },
            ].filter(
              (group) =>
                !request.query.code || group.code === request.query.code,
            ),
          ),
        ),
    },
  };
  const governance = require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService");
  let request = {
    tenant: "default",
    schemaModel: { schemaName: "employee" },
    query: { code: "employee-code" },
    model: { $set: { active: false } },
  };
  await governance.preparePrincipalUpdate(request);
  await governance.registerPreparedPrincipalUpdate(request);
  assert.strictEqual(
    registered[0].principalId,
    "employee-login",
    "Stamp cache must use the token loginId rather than record code",
  );
  assert.strictEqual(request.model.$set.authVersion, registered[0].version);
  assert(
    Number.isInteger(request.model.$set.authVersion),
    "Security stamp version must remain BSON int compatible",
  );
  assert(
    request.model.$set.authVersion <= 2147483647,
    "Security stamp version must not exceed Mongo int validation",
  );

  await governance.bumpGroupMembers({
    tenant: "default",
    query: { code: "baseGroup" },
    model: { $set: { permissions: ["changed"] } },
  });
  let membershipQuery = employeeQueries.find((query) => query.userGroups);
  assert.deepStrictEqual(membershipQuery.userGroups.$in.sort(), [
    "baseGroup",
    "childGroup",
    "grandchildGroup",
  ]);
  assert(
    principalUpdates.some((update) => update.query._id === "inherited-id"),
  );
}

async function validateEffectivePartialUpdates() {
  const principalGovernance = require("../src/service/identity/defaultPrincipalGovernanceService");
  const groupGovernance = require("../src/service/group/defaultUserGroupGovernanceService");
  let groupLookupRequest;
  global.SERVICE = {
    DefaultIdentityCatalogueGovernanceService: { authorizeGroupMutation: async () => true },
    DefaultIdentityCatalogueService: require("./helpers/identityCatalogueFixture").catalogue(undefined, ownerPermissionCodes),
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ isSystem: true }),
    },
    DefaultEmployeeService: {
      get: () =>
        Promise.resolve({
          result: [
            {
              code: "service-a",
              principalType: "service",
              userGroups: ["serviceAccountUserGroup"],
            },
          ],
        }),
    },
    DefaultUserGroupService: {
      get: (request) => {
        groupLookupRequest = request;
        return Promise.resolve({
          code: "SUC_DBS_00000", count: 3,
          result: [
            { code: "parent", active: true, parentGroups: [] },
            {
              code: "child",
              active: true,
              parentGroups: ["parent"],
              permissions: [],
            },
            { code: "serviceAccountUserGroup", active: true, parentGroups: [] },
          ],
        });
      },
    },
  };
  await assert.rejects(
    principalGovernance.validate({
      tenant: "default",
      schemaModel: { schemaName: "employee" },
      query: { code: "service-a" },
      model: { $set: { principalType: "human" } },
    }),
    /Only service principals/,
  );
  await groupGovernance.validate({
    tenant: "default",
    query: { code: "child" },
    model: { $set: { permissions: [] } },
  });
  assert.deepStrictEqual(
    groupLookupRequest.searchOptions,
    { pageSize: 10000, pageNumber: 1 },
    "Group graph validation must not rely on default CRUD pagination",
  );
}

function validateMigrationAssignmentPreservation() {
  const migration = require("../src/service/identity/defaultIdentityGovernanceMigrationService");
  // Deliberately hostile retired configuration: never the fixture catalogue or desired authority.
  const owner = { ...migration, getPolicy: () => ({ version: 1,
    administratorCodes: ["admin"], administratorGroups: ["platformAdministratorUserGroup"],
    servicePrincipalCodes: ["apiAdmin"], serviceGroup: "adminGroup",
    humanDefaultGroup: "adminGroup", customerGroup: "adminGroup",
    groupTargets: { customGroup: { permissions: ["*"] } },
  }) };
  for (const userGroups of [[], ["customGroup"], ["platformAdministratorUserGroup", "customGroup"]]) {
    const principal = { code: "admin", loginId: "admin", principalType: "human", userGroups };
    const target = owner.targetPrincipal(principal, "employee");
    assert.deepStrictEqual(target.userGroups, userGroups);
    assert.notStrictEqual(target.userGroups, userGroups);
  }
  const namedService = owner.targetPrincipal({ code: "apiAdmin", userGroups: [], apiKey: "legacy" }, "employee");
  assert.strictEqual(namedService.principalType, "human");
  assert.strictEqual(namedService.revokeAPIKey, true);
  assert.strictEqual(namedService.rotationRequired, false);
  assert.deepStrictEqual(owner.targetPrincipal({ code: "customer", userGroups: ["customGroup"] }, "customer").userGroups, ["customGroup"]);
  for (const principal of [
    { principalType: "service", userGroups: [] },
    { userGroups: ["serviceAccountUserGroup"] },
    { principalType: "human", userGroups: ["serviceAccountUserGroup"] },
    { principalType: "customer", userGroups: [] },
    { principalType: "human", userGroups: [{ code: "adminGroup" }] },
  ]) assert.throws(() => owner.targetPrincipal(principal, "employee"), /separate reviewed correction/);
}

async function validateMigration() {
  global.SERVICE = {
    DefaultIdentityCatalogueService: require("./helpers/identityCatalogueFixture").catalogue(undefined, ownerPermissionCodes),
    DefaultPrincipalSecurityStampGovernanceService: require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService"),
    DefaultEnterpriseRegistrationService: require("../src/service/enterprise/defaultEnterpriseRegistrationService"),
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ isSystem: true }),
    },
    DefaultAPIKeyCredentialService: require(
      path.join(
        repositoryRoot,
        "nodics.foundation/modules/nAuth/src/service/identity/defaultAPIKeyCredentialService",
      ),
    ),
  };
  const migration = require("../src/service/identity/defaultIdentityGovernanceMigrationService");
  let governedRequest = migration.systemRequest(
    { tenant: "default" },
    { options: { recursive: true } },
  );
  assert.strictEqual(
    governedRequest.options.skipItemCache,
    true,
    "Identity migration must bypass item cache for durable governance reads",
  );
  assert.strictEqual(
    governedRequest.options.recursive,
    true,
    "Call-specific options should still override base migration request options",
  );
  let generatedGroupServiceUsed = false;
  global.SERVICE.DefaultUserGroupService = {
    get: (request) => {
      generatedGroupServiceUsed = true;
      assert.strictEqual(request.options.skipItemCache, true);
      assert.strictEqual(request.options.recursive, false);
      assert.deepStrictEqual(request.searchOptions, {
        pageSize: 100,
        pageNumber: 1,
        sort: { _id: 1 },
      });
      return Promise.resolve({
        code: "SUC_READ",
        count: 1,
        result: [
          {
            _id: "group-runtime",
            code: "runtimeConfigAdminUserGroup",
            permissions: [],
          },
        ],
      });
    },
  };
  global.NODICS = {
    getModels: () => ({
      UserGroupModel: {
        getItems: (request) => {
          assert.strictEqual(
            request.options.skipItemCache,
            true,
            "Durable group migration read must explicitly bypass item cache",
          );
          return Promise.resolve({
            result: [{ code: "runtimeConfigAdminUserGroup", permissions: [] }],
          });
        },
      },
    }),
  };
  let durableGroups = await migration.loadGroups({ tenant: "default" });
  assert.strictEqual(durableGroups[0].code, "runtimeConfigAdminUserGroup");
  assert.strictEqual(
    generatedGroupServiceUsed,
    true,
    "Group migration reconciliation must use the bounded uncached generated owner inventory",
  );
  delete global.NODICS;
  let state = {
    groups: [
      { code: "userGroup", parentGroups: ["adminGroup"] },
      { code: "adminGroup", parentGroups: [] },
      {
        code: "serviceAccountUserGroup",
        parentGroups: ["adminGroup"],
        permissions: [],
      },
    ],
    employees: [
      {
        code: "admin",
        loginId: "admin",
        principalType: undefined,
        userGroups: ["adminGroup"],
        apiKey: "legacy-human-key",
      },
      {
        code: "apiAdmin",
        loginId: "apiAdmin",
        principalType: "service",
        userGroups: ["serviceAccountUserGroup"],
        apiKey: "legacy-service-key",
      },
      {
        code: "customService",
        loginId: "customService",
        principalType: "service",
        userGroups: ["customServiceGroup", "serviceAccountUserGroup"],
        apiKey: "custom-service-key",
      },
      {
        code: "migratedService",
        loginId: "migratedService",
        principalType: "service",
        userGroups: ["serviceAccountUserGroup"],
        apiKey: "migrated-service-key",
        identityMigrationVersion: 1,
      },
    ],
    customers: [
      {
        code: "customer-a",
        loginId: "customer-a",
        principalType: undefined,
        userGroups: ["userGroup"],
        apiKey: "legacy-customer-key",
        addresses: ["address-a"],
        contacts: ["contact-a"],
      },
    ],
    addresses: [{ code: "address-a" }],
    contacts: [{ code: "contact-a" }],
  };
  let preview = migration.buildPreview(state);
  assert.strictEqual(preview.changeCount, 7);
  assert(!preview.changes.some(change => change.schema === "userGroup"), "Migration must not replace persisted group authority from configuration");
  assert.strictEqual(
    preview.changes.find((change) => change.code === "admin").to.revokeAPIKey,
    true,
  );
  assert.strictEqual(
    preview.changes.find((change) => change.code === "apiAdmin").to
      .rotationRequired,
    true,
  );
  let customServiceChange = preview.changes.find(
    (change) => change.code === "customService",
  );
  assert.strictEqual(customServiceChange.to.principalType, "service");
  assert(customServiceChange.to.userGroups.includes("customServiceGroup"));
  assert.strictEqual(customServiceChange.to.revokeAPIKey, false);
  assert.strictEqual(customServiceChange.to.revokeLegacyAPIKey, true);
  assert.strictEqual(
    preview.changes.find((change) => change.code === "migratedService").to
      .revokeLegacyAPIKey,
    true,
    "Migration version alone must not preserve plaintext credentials",
  );
  let snapshot = migration.snapshot(preview);
  assert.strictEqual(
    JSON.stringify(snapshot).includes("legacy-human-key"),
    false,
  );
  assert.strictEqual(
    JSON.stringify(snapshot).includes("legacy-service-key"),
    false,
  );
  let writes = [];
  let savedAudit;
  let auditUpdates = [];
  const acknowledged = () =>
    Promise.resolve({
      code: "SUC_UPDATE",
      result: { acknowledged: true, matchedCount: 1 },
    });
  global.SERVICE.DefaultUserGroupService = {
    update: (request) => {
      writes.push({ schema: "userGroup", request: request });
      return acknowledged();
    },
  };
  global.SERVICE.DefaultEmployeeService = {
    update: (request) => {
      writes.push({ schema: "employee", request: request });
      return acknowledged();
    },
    get: (request) =>
      Promise.resolve({
        result: [
          {
            code: request.query.code,
            loginId: request.query.code,
            principalType: "service",
            userGroups: ["serviceAccountUserGroup"],
          },
        ],
      }),
  };
  global.SERVICE.DefaultCustomerService = {
    update: (request) => {
      writes.push({ schema: "customer", request: request });
      return acknowledged();
    },
  };
  global.SERVICE.DefaultAddressService = {
    update: (request) => {
      writes.push({ schema: "address", request: request });
      return acknowledged();
    },
  };
  global.SERVICE.DefaultContactService = {
    update: (request) => {
      writes.push({ schema: "contact", request: request });
      return acknowledged();
    },
  };
  global.SERVICE.DefaultIdentityMigrationAuditService = {
    save: (request) => {
      savedAudit = JSON.parse(
        JSON.stringify({ ...request.model, _id: "audit-1" }),
      );
      return Promise.resolve({
        code: "SUC_SAVE",
        result: { acknowledged: true, insertedCount: 1 },
      });
    },
    update: (request) => {
      auditUpdates.push(request);
      assert.strictEqual(savedAudit.status, request.query.status);
      Object.assign(savedAudit, JSON.parse(JSON.stringify(request.model.$set)));
      return acknowledged();
    },
    get: () =>
      Promise.resolve({
        code: "SUC_READ",
        count: 1,
        result: [JSON.parse(JSON.stringify(savedAudit))],
      }),
  };
  migration.loadState = () => Promise.resolve(state);
  let applied = await migration.applyMigration({
    tenant: "default",
    authData: { loginId: "admin" },
    correlationId: "migration-test",
  });
  assert.deepStrictEqual(
    applied.data.result.serviceKeyRotationsRequired.sort(),
    ["apiAdmin", "customService", "migratedService"],
  );
  assert.strictEqual(
    applied.rotatedSecrets,
    undefined,
    "Migration must never generate or return credential material",
  );
  assert.strictEqual(
    JSON.stringify(savedAudit).includes("legacy-human-key"),
    false,
  );
  let revokedHumanWrite = writes.find(
    (write) =>
      write.schema === "employee" && write.request.query.code === "admin",
  );
  assert.strictEqual(revokedHumanWrite.request.model.$unset.apiKey, 1);
  let rollback = await migration.rollbackMigration({
    tenant: "default",
    authData: { loginId: "admin" },
    identityMigration: { auditCode: savedAudit.code },
  });
  assert.strictEqual(rollback.data.credentialsRestored, false);
  assert(
    auditUpdates.some((update) => update.model.$set.status === "ROLLED_BACK"),
  );
  assert(
    writes.some(
      (write) =>
        write.request.query && write.request.query.code === "migratedService",
    ),
    "Plaintext credentials must be migrated even when the structural migration version is current",
  );
  let customServiceWrites = writes.filter(
    (write) =>
      write.schema === "employee" &&
      write.request.query.code === "customService",
  );
  assert.strictEqual(
    customServiceWrites[customServiceWrites.length - 1].request.model.$unset
      .apiKey,
    1,
    "Rollback must never restore a legacy plaintext service credential",
  );
  let clientKey = "client-generated-service-key-value-1234567890";
  const originalServiceRead = global.SERVICE.DefaultEmployeeService.get;
  for (const principal of [{ principalType: "human", userGroups: ["serviceAccountUserGroup"] },
    { userGroups: ["serviceAccountUserGroup"] }, { principalType: "service", userGroups: [] }]) {
    const before = writes.length;
    global.SERVICE.DefaultEmployeeService.get = async () => ({ result: [{ code: "apiAdmin", loginId: "apiAdmin", ...principal }] });
    await assert.rejects(migration.rotateServiceKey({ tenant: "default", authData: { loginId: "admin" },
      identityMigration: { principalCode: "apiAdmin", newApiKey: clientKey } }), /service principals/);
    assert.strictEqual(writes.length, before);
  }
  global.SERVICE.DefaultEmployeeService.get = originalServiceRead;
  values.identityGovernance.migration.version = 7;
  let rotation = await migration.rotateServiceKey({
    tenant: "default",
    authData: { loginId: "admin" },
    identityMigration: { principalCode: "apiAdmin", newApiKey: clientKey },
  });
  assert.strictEqual(rotation.data.status, "CREDENTIAL_ROTATED");
  assert.strictEqual(savedAudit.migrationVersion, 7,
    "Credential rotation must record the effective migration policy version");
  values.identityGovernance.migration.version = 1;
  assert.strictEqual(rotation.data.newApiKey, undefined);
  assert(
    writes.some(
      (write) =>
        write.schema === "employee" &&
        write.request.model.$set.apiKeyHash ===
          global.SERVICE.DefaultAPIKeyCredentialService.digest(clientKey),
    ),
  );
  assert.strictEqual(
    writes.some(
      (write) =>
        write.schema === "employee" &&
        write.request.model.$set.apiKey === clientKey,
    ),
    false,
  );
  assert.strictEqual(
    JSON.stringify(savedAudit).includes(clientKey),
    false,
    "Credential audit must never contain the supplied key",
  );
  state.employees = state.employees.map((principal) => {
    let target = migration.targetPrincipal(principal, "employee");
    return Object.assign({}, principal, target, {
      apiKey: undefined,
      apiKeyHash:
        target.principalType === "service" ? "migrated-key-digest" : undefined,
      identityMigrationVersion: values.identityGovernance.migration.version,
    });
  });
  state.customers = state.customers.map((principal) =>
    Object.assign(
      {},
      principal,
      migration.targetPrincipal(principal, "customer"),
      { apiKey: undefined },
    ),
  );
  state.addresses = state.addresses.map((record) =>
    Object.assign({}, record, {
      ownerId: "customer-a",
      ownerType: "customer",
      createdBy: "customer-a",
      updatedBy: "customer-a",
    }),
  );
  state.contacts = state.contacts.map((record) =>
    Object.assign({}, record, {
      ownerId: "customer-a",
      ownerType: "customer",
      createdBy: "customer-a",
      updatedBy: "customer-a",
    }),
  );
  assert.strictEqual(
    migration.buildPreview(state).idempotent,
    true,
    "A completed migration must be safe to rerun",
  );
}

function validatePermissionBasedRuntimeDecision() {
  const service = require(
    path.join(
      repositoryRoot,
      "nodics.foundation/modules/nDynamo/src/service/audit/defaultRuntimeConfigurationActivationRequestService",
    ),
  );
  assert.throws(
    () =>
      service.createRequestModel(
        {},
        { configurationType: "routerConfiguration" },
        {},
      ),
    /authenticated actor/,
  );
  assert.doesNotThrow(() =>
    service.assertDecisionSeparation({ requestedBy: "same-user" }, "same-user"),
  );
  assert.doesNotThrow(() =>
    service.assertActivationSeparation(
      { requestedBy: "requester", approvedBy: "approver" },
      "requester",
    ),
  );
  assert.doesNotThrow(() =>
    service.assertActivationSeparation(
      { requestedBy: "requester", approvedBy: "approver" },
      "approver",
    ),
  );
  assert.doesNotThrow(() =>
    service.assertActivationSeparation(
      { requestedBy: "requester", approvedBy: "approver" },
      "operator",
    ),
  );
}

Promise.resolve()
  .then(validateOwnership)
  .then(validateSecurityStamp)
  .then(validatePasswordStampTargeting)
  .then(validateStableAndTransitiveStamping)
  .then(validateEffectivePartialUpdates)
  .then(validateMigrationAssignmentPreservation)
  .then(validateMigration)
  .then(validatePermissionBasedRuntimeDecision)
  .then(() =>
    console.log("Profile identity governance migration contract validated"),
  )
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
