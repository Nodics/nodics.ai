/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module profile/test/employeeRecoveryContract @description Exercises actual recovery, verification RPC, password interceptor and principal-stamp owners with in-memory service fixtures; no real account or email operation. @owner profile @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const Enum = require("../../../../nodics.foundation/modules/nConfig/bin/enum");
global.ENUMS = Object.fromEntries(
  Object.entries(require("../src/utils/enums")).map(([name, definition]) => [
    name,
    new Enum(definition.definition, definition._options),
  ]),
);
const bcrypt = require("bcryptjs");
const recoverySource = require("../src/service/employee/defaultEmployeeRecoveryService");
const registrationSource = require("../src/service/enterprise/defaultEnterpriseRegistrationService");
const managementSource = require("../src/service/enterprise/defaultEnterpriseManagementService");
const verificationSource = require("../../../../nodics.communication/modules/commsVerification/src/service/defaultCommunicationVerificationService");
const verificationApi = require("../../../../nodics.communication/modules/commsApi/src/service/defaultCommunicationVerificationApiService");
const stampSource = require("../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultPrincipalSecurityStampService");
const authSecuritySource = require("../../../../nodics.foundation/modules/nAuth/src/service/security/defaultAuthSecurityService");
const stampGovernance = require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService");
const passwordInterceptor = require("../src/service/interceptors/defaultPasswordSaveInterceptorService");
const concurrencySource = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelConcurrencyService");
const copy = (value) => structuredClone(value);
const oldPassword = "Original-test-only-password-813!";
const nextPassword = "Replacement-test-only-password-925!";

function fixture(managed = false) {
  const credentialSchema = copy(
    require("../src/schemas/schemas").profile.password,
  );
  credentialSchema.backoffice.concurrency.managed = managed;
  global.NODICS = {
    getModels: () => ({
      PasswordModel: { rawSchema: credentialSchema, dataBase: {} },
      EmployeeModel: { dataBase: {} },
    }),
  };
  const f = {
    now: Date.now(),
    faults: {},
    calls: [],
    outbox: [],
    challenges: new Map(),
    tokens: new Map(),
    stamps: new Map(),
  };
  const oldHash = bcrypt.hashSync(oldPassword, 4);
  f.people = [
    {
      tenant: "business",
      code: "alex",
      _id: "person-alex",
      loginId: "alex@example.test",
      active: true,
      principalType: "human",
      password: "password-alex",
      authVersion: 1,
      userGroups: ["operators"],
      name: { firstName: "Alex", lastName: "Example" },
    },
  ];
  f.customers = [];
  f.passwords = [
    {
      tenant: "business",
      code: "credential-alex",
      _id: "password-alex",
      loginId: "alex@example.test",
      password: oldHash,
      active: true,
    },
  ];
  if (managed) f.passwords[0].revision = 4;
  f.credentialWrites = [];
  f.policy = {
    enabled: true,
    method: "PASSWORD",
    inventoryQualified: true,
    credentialWriteQualified: true,
    requireDistributedRateLimit: true,
    continuationSeconds: 1800,
    maximumInventoryPages: 20,
    pageSize: 2,
    minimumPasswordLength: 12,
    maximumPasswordLength: 128,
    verificationPurpose: "EMPLOYEE_PASSWORD_RECOVERY",
    rates: {
      request: { limit: 20, windowSeconds: 60 },
      email: { limit: 3, windowSeconds: 600 },
    },
    mail: {
      connectionName: "commsApi",
      templateCode: "recovery-code",
      purpose: "RECOVERY_CODE",
      locale: "en",
      timeoutMilliseconds: 5000,
    },
    confirmation: {
      templateCode: "reset-confirmation",
      purpose: "RECOVERY_DONE",
    },
    endpoints: {},
    presentation: { title: "Recover account" },
  };
  f.transportPolicy = {
    enabled: true,
    mode: "REMOTE",
    connectionName: "commsApi",
    purpose: "EMPLOYEE_REGISTRATION",
    timeoutMilliseconds: 5000,
    maximumResponseBytes: 16384,
  };
  global.CONFIG = {
    get: (name) => {
      if (name === "profileEmployeeRecovery") return f.policy;
      if (name === "enterpriseManagement")
        return {
          registration: { enabled: false },
          accessAssignments: { registrationVerification: f.transportPolicy },
        };
      if (name === "defaultTenant" || name === "defaultEnterprise")
        return "authority";
      if (name === "communicationVerification")
        return {
          enabled: true,
          ttlSeconds: 600,
          maximumAttempts: 3,
          secretBytes: 6,
          stored: {
            enabled: true,
            trustedSourceModules: ["profile"],
            proofTtlSeconds: 300,
            resendCooldownSeconds: 30,
            maximumIssues: 3,
          },
        };
      if (name === "authSecurity")
        return {
          securityStamp: {
            enabled: true,
            failClosed: true,
            allowMissingStamp: false,
          },
        };
    },
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message) {
        super(message || code);
        this.code = code;
      }
    },
  };
  global.UTILS = {
    encryptPassword: async (value) => bcrypt.hashSync(value, 4),
    compareHash: async (value, hash) => bcrypt.compareSync(value, hash),
  };
  f.owner = { ...recoverySource, now: () => f.now };
  const success = (result) => ({ code: "SUC_FIXTURE", result });
  const matches = (row, query) =>
    Object.entries(query).every(([key, value]) => {
      const actual = key
        .split(".")
        .reduce((result, part) => result && result[part], row);
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        if ("$gt" in value)
          return new Date(actual).getTime() > new Date(value.$gt).getTime();
        if ("$ne" in value) return actual !== value.$ne;
        if ("$exists" in value) return (actual !== undefined) === value.$exists;
        if ("$in" in value) return value.$in.includes(actual);
      }
      return JSON.stringify(actual) === JSON.stringify(value);
    });
  const get = (rows) => async (request) => {
    if (f.faults.directory) throw Error("private storage failure");
    const found = rows().filter(
      (row) =>
        row.tenant === request.tenant && matches(row, request.query || {}),
    );
    const size = request.searchOptions?.pageSize || 100,
      page = request.searchOptions?.pageNumber || 1;
    return {
      ...success(copy(found.slice((page - 1) * size, page * size))),
      count: found.length,
    };
  };
  const privateEntries = new WeakSet();
  global.SERVICE = {
    DefaultCommunicationRuntimeService: require("../../../../nodics.communication/modules/commsCore/src/service/defaultCommunicationRuntimeService"),
    DefaultDatabaseConfigurationService: {
      toObjectId: (_model, value) => value,
    },
    DefaultProfileService: { getProfileModuleName: () => "profile" },
    DefaultPasswordSaveInterceptorService: { ...passwordInterceptor },
    DefaultPrincipalSecurityStampGovernanceService: { ...stampGovernance },
    DefaultModelConcurrencyService: { ...concurrencySource },
    DefaultEmployeeRecoveryService: f.owner,
    DefaultEnterpriseRegistrationService: {
      ...registrationSource,
      now: () => f.now,
    },
    DefaultEnterpriseManagementService: { ...managementSource },
    DefaultLoggerService: {
      runSensitiveOperation: async (request, operation) => {
        privateEntries.add(request);
        try {
          return await operation();
        } finally {
          privateEntries.delete(request);
        }
      },
      assertSensitiveRequest: (request) => assert(privateEntries.has(request)),
      hasPrivateCaptureProtection: (request) => privateEntries.has(request),
      inheritRequestPrivacy: (target, source) => {
        if (privateEntries.has(source)) privateEntries.add(target);
      },
    },
    DefaultCommunicationVerificationService: {
      ...verificationSource,
      now: () => new Date(f.now),
    },
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ isSystem: true }),
    },
    DefaultBrowserSessionService: {
      config: () => ({}),
      validateOrigin: (request) => {
        if (request.httpRequest.headers.origin !== "https://axis.example.test")
          throw Error("origin");
      },
    },
    DefaultRateLimitService: {
      enforce: async (request) => {
        f.calls.push("rate:" + request.capability);
        assert.equal(request.requireDistributed, true);
        if (f.faults.rate) throw Error("rate denied");
      },
    },
    DefaultEnterpriseService: {
      get: async (request) => {
        const records = [
          { code: "authority", tenant: "authority", active: true },
          { code: "business", tenant: "business", active: true },
        ];
        const size = request.searchOptions.pageSize,
          page = request.searchOptions.pageNumber;
        return {
          ...success(copy(records.slice((page - 1) * size, page * size))),
          count: records.length,
        };
      },
    },
    DefaultEmployeeService: {
      get: get(() => f.people),
      update: async (request) => {
        f.calls.push("employee.update");
        const row = f.people.find(
          (row) => row.tenant === request.tenant && matches(row, request.query),
        );
        if (!row) return success({ acknowledged: true, matchedCount: 0 });
        request.schemaModel = { schemaName: "employee" };
        await stampGovernance.preparePrincipalUpdate(request);
        Object.assign(row, copy(request.model.$set || request.model));
        await stampGovernance.registerPreparedPrincipalUpdate(request);
        return success({ acknowledged: true, matchedCount: 1 });
      },
    },
    DefaultCustomerService: { get: get(() => f.customers) },
    DefaultPasswordService: {
      get: get(() => f.passwords),
      update: async (request) => {
        request.schemaModel = {
          schemaName: "password",
          rawSchema: credentialSchema,
        };
        f.calls.push("password.update");
        f.credentialWrites.push(copy(request.query));
        if (f.faults.beforePassword) throw Error("before password write");
        if (f.faults.credentialRace) f.passwords[0].revision++;
        const row = f.passwords.find(
          (row) => row.tenant === request.tenant && matches(row, request.query),
        );
        if (!row) return success({ matchedCount: 0 });
        concurrencySource.credentialWriteConditions(
          { ...request, schemaModel: { rawSchema: credentialSchema } },
          row,
        );
        await passwordInterceptor.encryptPassword(request);
        Object.assign(row, copy(request.model));
        if (managed) row.revision++;
        if (f.faults.beforeStamp) {
          f.faults.beforeStamp = false;
          throw Error("after credential before stamp");
        }
        await stampGovernance.bumpLoginId(request);
        if (f.faults.afterPassword) {
          f.faults.afterPassword = false;
          throw Error("lost password response");
        }
        return success({ matchedCount: 1 });
      },
    },
    DefaultCacheService: {
      putVersioned: async (request) => {
        const previous = f.stamps.get(request.key),
          supplied = request.value.authVersion;
        const version = request.advance
          ? Math.max((previous?.authVersion || 0) + 1, supplied)
          : supplied;
        if (!request.advance && previous && previous.authVersion > version)
          throw Error("stale version");
        const result = { ...request.value, authVersion: version };
        f.stamps.set(request.key, result);
        return { result };
      },
    },
    DefaultPrincipalSecurityStampService: { ...stampSource },
    DefaultAuthSecurityService: { ...authSecuritySource },
    DefaultAuthenticationProviderService: {
      addToken: async (module, exp, key, value, ttl) => {
        assert.equal(module, "profile");
        assert(ttl > 0);
        f.tokens.set(key, copy(value));
      },
      consumeToken: async (module, key) => {
        const state = f.tokens.get(key);
        if (!state)
          throw Object.assign(Error("missing"), { code: "ERR_CACHE_00001" });
        f.tokens.delete(key);
        return copy(state);
      },
      findToken: async (module, key) => {
        if (f.faults.stampRead) throw Error("stamp unavailable");
        return f.stamps.get(key);
      },
    },
    DefaultCommsVerificationChallengeService: {
      get: async (request) =>
        success(
          copy(
            [...f.challenges.values()].filter(
              (row) =>
                row.tenant === request.tenant && matches(row, request.query),
            ),
          ),
        ),
      save: async (request) => {
        if (f.challenges.has(request.model.code)) throw Error("duplicate");
        const row = {
          ...copy(request.model),
          tenant: request.tenant,
          revision: 1,
        };
        f.challenges.set(row.code, row);
        return success(row);
      },
      update: async (request) => {
        const row = f.challenges.get(request.query.code);
        if (!row || !matches(row, request.query))
          return success({ matchedCount: 0 });
        Object.assign(row, copy(request.model), { revision: row.revision + 1 });
        return success({ matchedCount: 1 });
      },
    },
    DefaultModuleService: {
      invokeModule: async (options) => {
        assert.equal(options.requireInternalAuth, true);
        assert.equal(options.maxAttempts, 1);
        assert.equal(options.header.Authorization, undefined);
        if (options.apiName === "/internal/verification/commands") {
          assert.equal(
            options.requestBody.purpose,
            "EMPLOYEE_PASSWORD_RECOVERY",
          );
          const internalRequest = {
            tenant: options.tenant,
            payload: options.requestBody,
            authData: {
              tokenType: "service",
              principalType: "service",
              serviceId: "runtime-fixture",
              tenant: options.tenant,
              modules: ["profile", "commsApi"],
              permissions: ["communication.verification.execute"],
            },
          };
          privateEntries.add(internalRequest);
          const result = await verificationApi.execute(internalRequest);
          if (
            f.faults.consumeResponse &&
            options.requestBody.operation === "CONSUME"
          ) {
            f.faults.consumeResponse = false;
            throw Error("lost consume response");
          }
          return { data: result };
        }
        f.outbox.push(copy(options.requestBody));
        if (
          f.faults.mail ||
          (f.faults.confirmation &&
            options.requestBody.purpose === "RECOVERY_DONE")
        )
          throw Error("mail unavailable");
        return {
          data: { intentCode: "mail_" + f.outbox.length, status: "QUEUED" },
        };
      },
    },
  };
  const request = (body, origin = "https://axis.example.test") => ({
    body,
    httpRequest: { body, headers: { origin }, ip: "192.0.2.5" },
  });
  f.execute = (operation, body, origin) =>
    f.owner.execute(request(body, origin), operation);
  f.otp = () =>
    f.outbox.filter((item) => item.variables.verificationCode).at(-1).variables
      .verificationCode;
  f.verify = async () => {
    const start = await f.execute("START", { email: "alex@example.test" });
    f.token = start.continuation;
    return f.execute("VERIFY", { continuation: f.token, code: f.otp() });
  };
  f.reset = (password = nextPassword) =>
    f.execute("COMPLETE", { continuation: f.token, password });
  return f;
}

test("active employee recovers through real purpose-bound verification and existing credential/stamp owners", async () => {
  const f = fixture();
  const before = copy(f.people[0]);
  assert.equal((await f.verify()).stage, "RESET_PASSWORD");
  const result = await f.reset();
  assert.equal(result.stage, "COMPLETE");
  assert.equal(result.signInEnterpriseCode, "business");
  assert(bcrypt.compareSync(nextPassword, f.passwords[0].password));
  assert(!bcrypt.compareSync(oldPassword, f.passwords[0].password));
  assert(f.people[0].authVersion > before.authVersion);
  assert.deepEqual(f.people[0].userGroups, before.userGroups);
  assert.equal(f.people[0].active, before.active);
  assert.equal(
    f.calls.filter((value) => value === "password.update").length,
    1,
  );
  assert.equal(result.authToken, undefined);
  assert.equal(result.refreshToken, undefined);
  assert.equal(f.outbox.at(-1).purpose, "RECOVERY_DONE");
  assert.deepEqual(Object.keys(f.outbox.at(-1).variables), ["completedAt"]);
});

test("normal recovery does not require enterprise registration or approval to be enabled", async () => {
  const f = fixture();
  assert.equal(CONFIG.get("enterpriseManagement").registration.enabled, false);
  assert.equal((await f.verify()).stage, "RESET_PASSWORD");
  assert.equal((await f.reset()).stage, "COMPLETE");
});

test("old sessions fail the actual stamp validator after a successful reset", async () => {
  const f = fixture();
  await SERVICE.DefaultPrincipalSecurityStampService.register(
    "business",
    "alex@example.test",
    1,
  );
  await f.verify();
  await f.reset();
  await assert.rejects(
    SERVICE.DefaultPrincipalSecurityStampService.validate({
      tenant: "business",
      loginId: "alex@example.test",
      authVersion: 1,
    }),
  );
});

test("a submitted string resembling a bcrypt hash is treated as a password, not a credential injection", async () => {
  const f = fixture();
  const submitted = bcrypt.hashSync("not-the-real-password", 4);
  await f.verify();
  await f.reset(submitted);
  assert(bcrypt.compareSync(submitted, f.passwords[0].password));
  assert(!bcrypt.compareSync("not-the-real-password", f.passwords[0].password));
});

test("wrong and exhausted codes cannot reset a credential", async () => {
  const f = fixture();
  const start = await f.execute("START", { email: "alex@example.test" });
  f.token = start.continuation;
  for (let i = 0; i < 3; i++)
    await f.execute("VERIFY", { continuation: f.token, code: "000000000000" });
  await assert.rejects(f.reset());
  assert.equal(f.calls.includes("password.update"), false);
});

test("resend invalidates the old code and respects the verifier cooldown", async () => {
  const f = fixture();
  const start = await f.execute("START", { email: "alex@example.test" });
  f.token = start.continuation;
  const old = f.otp();
  await assert.rejects(f.execute("RESEND", { continuation: f.token }));
  f.now += 31000;
  await f.execute("RESEND", { continuation: f.token });
  assert.equal(
    (await f.execute("VERIFY", { continuation: f.token, code: old })).stage,
    "VERIFY_EMAIL",
  );
  assert.equal(
    (await f.execute("VERIFY", { continuation: f.token, code: f.otp() })).stage,
    "RESET_PASSWORD",
  );
});

test("registration-purpose proof and client-supplied authority are not accepted", async () => {
  const f = fixture();
  await f.verify();
  await assert.rejects(
    f.execute("COMPLETE", {
      continuation: f.token,
      password: nextPassword,
      verified: true,
      roleCode: "ADMIN",
    }),
  );
  assert.equal(f.calls.includes("password.update"), false);
  f.policy.verificationPurpose = f.transportPolicy.purpose;
  await assert.rejects(f.reset(), { code: "ERR_PROFILE_RECOVERY_UNAVAILABLE" });
});

for (const mutation of [
  { active: false },
  { disabled: true },
  { registrationSuspended: true },
  { principalType: "service" },
]) {
  test(
    "restricted identities are not activated by recovery " +
      JSON.stringify(mutation),
    async () => {
      const f = fixture();
      Object.assign(f.people[0], mutation);
      const before = copy(f.people);
      assert.equal((await f.verify()).stage, "ACCOUNT_UNAVAILABLE");
      await assert.rejects(f.reset());
      assert.deepEqual(f.people, before);
      assert.equal(f.calls.includes("password.update"), false);
    },
  );
}

test("unknown and existing emails have the same pre-proof response shape", async () => {
  const f = fixture();
  const one = await f.execute("START", { email: "alex@example.test" });
  const two = await f.execute("START", { email: "unknown@example.test" });
  assert.deepEqual(Object.keys(one), Object.keys(two));
  assert.equal(one.stage, two.stage);
  assert(!JSON.stringify(one).includes("business"));
});

test("customer-only and ambiguous identities do not receive a replacement employee credential", async () => {
  const f = fixture();
  f.customers.push({
    ...f.people[0],
    code: "customer",
    principalType: "customer",
  });
  assert.equal((await f.verify()).stage, "ACCOUNT_UNAVAILABLE");
  assert.equal(f.calls.includes("password.update"), false);
  f.people = [];
  assert.equal((await f.verify()).stage, "ACCOUNT_UNAVAILABLE");
});

test("account changes after proof reject stale recovery", async () => {
  const f = fixture();
  await f.verify();
  f.people[0].authVersion = 2;
  await assert.rejects(f.reset(), { code: "ERR_PROFILE_RECOVERY_CONFLICT" });
  assert.equal(f.calls.includes("password.update"), false);
});

test("a replaced credential cannot be overwritten with an old proof", async () => {
  const f = fixture();
  await f.verify();
  f.people[0].password = "another-credential";
  await assert.rejects(f.reset());
  assert.equal(f.calls.includes("password.update"), false);
});

test("lost consumed-proof response is reconciled without another consumption grant", async () => {
  const f = fixture();
  await f.verify();
  f.faults.consumeResponse = true;
  assert.equal((await f.reset()).stage, "COMPLETE");
  assert.equal(
    f.calls.filter((value) => value === "password.update").length,
    1,
  );
});

test("lost password-save response is read back, not written again", async () => {
  const f = fixture();
  await f.verify();
  f.faults.afterPassword = true;
  assert.equal((await f.reset()).stage, "COMPLETE");
  assert.equal((await f.reset()).stage, "COMPLETE");
  assert.equal(
    f.calls.filter((value) => value === "password.update").length,
    1,
  );
});

test("an interrupted password stamp hook is completed through the existing principal update owner", async () => {
  const f = fixture();
  await f.verify();
  f.faults.beforeStamp = true;
  assert.equal((await f.reset()).stage, "COMPLETE");
  assert.equal(
    f.calls.filter((value) => value === "password.update").length,
    1,
  );
  assert(f.people[0].authVersion > 1);
});

test("managed recovery uses hash-free original revision and verifies the one-step committed write", async () => {
  const f = fixture(true);
  await f.verify();
  assert.equal((await f.reset()).stage, "COMPLETE");
  assert.equal(f.passwords[0].revision, 5);
  assert.equal(f.credentialWrites.length, 1);
  assert.deepEqual(f.credentialWrites[0], {
    _id: "password-alex",
    code: "credential-alex",
    loginId: "alex@example.test",
    revision: 4,
    active: true,
    identityLinkRetirement: { $exists: false },
  });
  assert.equal(Object.hasOwn(f.credentialWrites[0], "password"), false);
  assert(f.people[0].authVersion > 1);
});

test("managed recovery reconciles a committed credential with interrupted stamp without another password write", async () => {
  const f = fixture(true);
  await f.verify();
  f.faults.beforeStamp = true;
  assert.equal((await f.reset()).stage, "COMPLETE");
  assert.equal((await f.reset()).stage, "COMPLETE");
  assert.equal(f.passwords[0].revision, 5);
  assert.equal(f.credentialWrites.length, 1);
  assert(f.people[0].authVersion > 1);
});

test("a concurrent managed credential revision refuses consumed-command replay without replacing the password", async () => {
  const f = fixture(true);
  await f.verify();
  f.faults.credentialRace = true;
  await assert.rejects(f.reset(), { code: "ERR_PROFILE_RECOVERY_STORAGE" });
  f.faults.credentialRace = false;
  await assert.rejects(f.reset());
  assert.equal(f.credentialWrites.length, 1);
  assert(bcrypt.compareSync(oldPassword, f.passwords[0].password));
});

test("password stamp owner requires acknowledged exact-one principal writer results", async () => {
  for (const result of [
    { matchedCount: 1 },
    { acknowledged: false, matchedCount: 1 },
    { acknowledged: true, matchedCount: 0 },
    { acknowledged: true, matchedCount: 2 },
  ]) {
    const f = fixture();
    SERVICE.DefaultEmployeeService.update = async () => ({
      code: "SUC_FIXTURE",
      result,
    });
    await assert.rejects(
      stampGovernance.bumpLoginId({
        tenant: "business",
        query: { _id: "password-alex" },
        model: {},
      }),
      { code: "ERR_AUTH_00003" },
    );
    assert.equal(f.people[0].authVersion, 1);
  }
});

test("a failed pre-write cannot replay the consumed reset command as a new password write", async () => {
  const f = fixture();
  await f.verify();
  f.faults.beforePassword = true;
  await assert.rejects(f.reset());
  f.faults.beforePassword = false;
  await assert.rejects(f.reset());
  assert.equal(
    f.calls.filter((value) => value === "password.update").length,
    1,
  );
  assert(bcrypt.compareSync(oldPassword, f.passwords[0].password));
});

test("confirmation delivery failure does not undo reset or reset again", async () => {
  const f = fixture();
  await f.verify();
  f.faults.confirmation = true;
  const result = await f.reset();
  assert.equal(result.stage, "COMPLETE");
  assert.equal(result.notificationStatus, "UNAVAILABLE");
  await f.reset();
  assert.equal(
    f.calls.filter((value) => value === "password.update").length,
    1,
  );
});

test("current source performs no automatic sign-in and caches no password or OTP", async () => {
  const f = fixture();
  await f.verify();
  const code = f.otp();
  await f.reset();
  const state = JSON.stringify([...f.tokens.values()]);
  for (const secret of [oldPassword, nextPassword, code])
    assert(!state.includes(secret));
  const record = [...f.tokens.keys()][0];
  assert(record.startsWith("employee-recovery:"));
});

test("origin, expiry, failed directory and missing qualification fail without credential mutation", async () => {
  const f = fixture();
  await assert.rejects(
    f.execute(
      "START",
      { email: "alex@example.test" },
      "https://other.example.test",
    ),
  );
  f.policy.credentialWriteQualified = false;
  await assert.rejects(f.execute("START", { email: "alex@example.test" }));
  f.policy.credentialWriteQualified = true;
  await f.verify();
  f.now += 1801000;
  await assert.rejects(f.reset());
  assert.equal(f.calls.includes("password.update"), false);
});
