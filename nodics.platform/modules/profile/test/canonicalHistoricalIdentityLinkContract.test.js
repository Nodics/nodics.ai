/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module profile/test/canonicalHistoricalIdentityLinkContract @description Authored private-admission, dual-proof and inactive historical-link fixtures; not installed migration qualification. @layer test @owner profile */
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const source = require("../src/service/identity/defaultCanonicalHistoricalIdentityLinkService");
const concurrencySource = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelConcurrencyService");
const providerSource =
  require("../../../../nodics.foundation/modules/nDatabase/mongodb/src/schemas/model").default;
const privateEntries = new WeakSet();
const privacyDouble = {
  hasPrivateCaptureProtection: (request) => privateEntries.has(request),
  assertSensitiveRequest: (request) => {
    if (!privateEntries.has(request)) throw Error("unprotected");
  },
  runSensitiveOperation: async (request, callback) => {
    privateEntries.add(request);
    try {
      return await callback();
    } finally {
      privateEntries.delete(request);
    }
  },
};
function sensitive(owner, method, request) {
  global.SERVICE = { ...global.SERVICE, DefaultLoggerService: privacyDouble };
  return privacyDouble.runSensitiveOperation(request, () =>
    owner[method](request),
  );
}

test("historical Customer eligibility dependency waits for the exact owner response; only actual false admits (authored NOT RUN)", async () => {
  const previousService = global.SERVICE;
  const identity = Object.freeze({
    tenantCode: "fixture",
    recordKind: "CUSTOMER",
    recordId: "historical-customer",
  });
  const owner = {
    ...source,
    fail: () => {
      throw Error("eligibility dependency refused");
    },
  };
  try {
    for (const result of [false, true, undefined, null, 0, "false"]) {
      let release,
        entered,
        finished = false,
        calls = 0;
      const ready = new Promise((resolve) => {
        entered = resolve;
      });
      const deferred = new Promise((resolve) => {
        release = resolve;
      });
      global.SERVICE = {
        DefaultCustomerEligibilityDecisionGovernanceService: {
          hasRetainedDecision: async (selected) => {
            calls++;
            assert.equal(selected, identity);
            entered();
            return deferred;
          },
        },
      };
      const command = owner.assertEligibilityDependency(identity);
      const settlement = command.then(
        () => {
          finished = true;
        },
        () => {
          finished = true;
        },
      );
      await ready;
      assert.equal(finished, false);
      assert.equal(calls, 1);
      release(result);
      if (result === false) assert.equal(await command, undefined);
      else await assert.rejects(command, /eligibility dependency refused/);
      await settlement;
      assert.equal(finished, true);
    }
  } finally {
    global.SERVICE = previousService;
  }
});

test("historical Customer eligibility dependency refuses missing/non-callable owners and deferred read errors (authored NOT RUN)", async () => {
  const previousService = global.SERVICE;
  const identity = Object.freeze({
    tenantCode: "fixture",
    recordKind: "CUSTOMER",
    recordId: "historical-customer",
  });
  const owner = {
    ...source,
    fail: () => {
      throw Error("eligibility dependency refused");
    },
  };
  try {
    for (const eligibility of [
      undefined,
      null,
      {},
      { hasRetainedDecision: false },
    ]) {
      global.SERVICE = {
        DefaultCustomerEligibilityDecisionGovernanceService: eligibility,
      };
      await assert.rejects(
        owner.assertEligibilityDependency(identity),
        /eligibility dependency refused/,
      );
    }
    let rejectRead;
    const deferred = new Promise((resolve, reject) => {
      rejectRead = reject;
    });
    global.SERVICE = {
      DefaultCustomerEligibilityDecisionGovernanceService: {
        hasRetainedDecision: (selected) => {
          assert.equal(selected, identity);
          return deferred;
        },
      },
    };
    const command = owner.assertEligibilityDependency(identity);
    const rejected = assert.rejects(command, /fixture owner read failed/);
    rejectRead(Error("fixture owner read failed"));
    await rejected;
  } finally {
    global.SERVICE = previousService;
  }
});

test("historical Employee eligibility dependency skips the Customer owner even when absent or refusing (authored NOT RUN)", async () => {
  const previousService = global.SERVICE;
  const identity = Object.freeze({
    tenantCode: "fixture",
    recordKind: "EMPLOYEE",
    recordId: "historical-employee",
  });
  const owner = {
    ...source,
    fail: () => {
      throw Error("unexpected Employee refusal");
    },
  };
  let calls = 0;
  try {
    for (const eligibility of [
      undefined,
      {
        hasRetainedDecision: async () => {
          calls++;
          throw Error("must not read Customer evidence");
        },
      },
    ]) {
      global.SERVICE = {
        DefaultCustomerEligibilityDecisionGovernanceService: eligibility,
      };
      assert.equal(
        await owner.assertEligibilityDependency(identity),
        undefined,
      );
    }
    assert.equal(calls, 0);
  } finally {
    global.SERVICE = previousService;
  }
});

test("all public entries reject unprotected exact requests before input copying and scrub proof aliases", async () => {
  for (const method of ["prepare", "commit", "inspect"]) {
    for (const logger of [undefined, privacyDouble]) {
      global.SERVICE = { DefaultLoggerService: logger };
      let copied = false;
      const owner = {
        ...source,
        fail: () => {
          throw Error("closed");
        },
        takeInput: () => {
          copied = true;
        },
      };
      const body = {
        canonicalPassword: "canonical-secret",
        historicalPassword: "historical-secret",
        auditCode: "safe",
      };
      const request = {
        body,
        model: { password: "secret" },
        query: { confirmPassword: "secret" },
        httpRequest: { body, query: { password: "secret" } },
        requestPrivacy: { sensitive: true },
      };
      await assert.rejects(owner[method](request), /closed/);
      assert.equal(copied, false);
      for (const alias of [
        request.body,
        request.model,
        request.query,
        request.httpRequest.body,
        request.httpRequest.query,
      ]) {
        for (const key of [
          "canonicalPassword",
          "historicalPassword",
          "password",
          "confirmPassword",
        ])
          assert.equal(Object.hasOwn(alias, key), false);
      }
    }
  }
});

test("private capture admission is exact and rejection scrub does not evaluate proof accessors", async () => {
  global.SERVICE = { DefaultLoggerService: privacyDouble };
  const owner = {
    ...source,
    fail: () => {
      throw Error("closed");
    },
  };
  const request = {
    body: Object.freeze({ canonicalPassword: "secret", auditCode: "safe" }),
  };
  await privacyDouble.runSensitiveOperation(request, async () => {
    owner.assertPrivateEntry(request);
    await assert.rejects(owner.inspect({ ...request }), /closed/);
  });
  assert.equal(privacyDouble.hasPrivateCaptureProtection(request), false);
  let reads = 0;
  const body = {};
  Object.defineProperty(body, "historicalPassword", {
    configurable: true,
    enumerable: true,
    get: () => {
      reads++;
      throw Error("must not read");
    },
  });
  await assert.rejects(owner.prepare({ body }), /closed/);
  assert.equal(reads, 0);
  assert.equal(Object.hasOwn(body, "historicalPassword"), false);
});

test("linking defaults closed independently of qualified membership", () => {
  global.CONFIG = { get: () => ({}) };
  global.SERVICE = {
    DefaultEnterpriseMembershipService: { policy: () => ({}) },
  };
  const owner = {
    ...source,
    fail: () => {
      throw Error("closed");
    },
  };
  assert.throws(() => owner.policy(), /closed/);
});

test("fresh original Password reads require actual prepared primitive and positive frozen tokens", async () => {
  for (const variant of [
    "qualified",
    "missing-model",
    "wrong-owner",
    "missing-token",
    "zero-token",
    "different-id",
  ]) {
    const requestModel = { marker: "prepared-original-model" };
    const row = { _id: "credential-id", code: "credential-code", revision: 4 };
    if (variant === "missing-token") delete row.revision;
    if (variant === "zero-token") row.revision = 0;
    if (variant === "different-id") row._id = "other-credential";
    const owner = {
      ...source,
      fail: () => {
        throw Error("closed");
      },
      storage: (tenant, fields) => ({ tenant, ...fields }),
      member: () => ({
        recordId: (value) => value,
        rows: (response) => response.result,
      }),
    };
    global.SERVICE = {
      DefaultPasswordService: {
        get: async (request) => {
          assert.equal(owner.ownsRead(request), true);
          assert.deepEqual(request.query, { _id: "credential-id" });
          assert.equal(request.options.skipItemCache, true);
          if (variant !== "missing-model") request.schemaModel = requestModel;
          return { count: 1, result: [row] };
        },
      },
      DefaultModelConcurrencyService: {
        retireCredential: () => {
          throw Error("read must not write");
        },
        assertCredentialRetirementModel: (model) => {
          if (model !== requestModel) throw Error("closed");
          return {
            ownerService:
              variant === "wrong-owner"
                ? "OtherOwner"
                : "DefaultCanonicalHistoricalIdentityLinkService",
            revisionField: "revision",
          };
        },
      },
    };
    if (variant === "qualified")
      assert.equal(
        await owner.readPasswordForRetirement("original", "credential-id"),
        row,
      );
    else
      await assert.rejects(
        owner.readPasswordForRetirement("original", "credential-id"),
        /closed/,
      );
  }
});

test("fresh original password proof cannot be replaced by mailbox or OTP metadata", async () => {
  let failed = 0;
  const identity = {
    tenantCode: "original",
    recordKind: "EMPLOYEE",
    recordId: "person-1",
  };
  const anchor = {
    identity: { tenantCode: "original" },
    state: {},
    person: { loginId: "person@example.test" },
  };
  const owner = {
    ...source,
    readPasswordForRetirement: async () => ({
      _id: "password-1",
      code: "password-code",
      revision: 1,
      loginId: "person@example.test",
      active: true,
      password: "hash",
    }),
    fail: () => {
      throw Error("proof");
    },
    member: () => ({
      identity: (x) => x,
      anchor: async () => anchor,
      credential: async () => ({ _id: "password-1", password: "hash" }),
      recordId: (x) => x,
    }),
  };
  global.SERVICE = {
    DefaultAuthenticationProviderService: {
      updateFailedAuthData: async () => {
        failed++;
      },
    },
  };
  global.UTILS = { compareHash: async (value) => value === "proved-password" };
  await assert.rejects(owner.prove(identity, undefined), /proof/);
  await assert.rejects(owner.prove(identity, "wrong"), /proof/);
  assert.equal(failed, 1);
  assert.equal(
    (await owner.prove(identity, "proved-password")).credentialId,
    "password-1",
  );
});

test("private generated admission is request-identity scoped and cleared after failure", async () => {
  const request = { body: { ownsWrite: true } };
  global.SERVICE = {
    GeneratedOwner: {
      update: async (input) => {
        assert.equal(source.ownsWrite(input), true);
        assert.equal(source.ownsWrite({ ...input }), false);
        throw Error("lost acknowledgement");
      },
    },
  };
  assert.equal(source.ownsWrite(request), false);
  await assert.rejects(
    source.write("GeneratedOwner", "update", request),
    /lost acknowledgement/,
  );
  assert.equal(source.ownsWrite(request), false);
});

test("shared credentials and existing target dependants reject rather than merging authority", () => {
  const owner = {
    ...source,
    fail: () => {
      throw Error("inventory");
    },
    digest: (x) => JSON.stringify(x),
    member: () => ({ identity: (x) => x }),
  };
  const canonical = {
    identity: { tenantCode: "a", recordKind: "EMPLOYEE", recordId: "one" },
    credentialId: "p1",
  };
  const historical = {
    identity: { tenantCode: "b", recordKind: "CUSTOMER", recordId: "two" },
    credentialId: "p2",
    code: "customer-2",
  };
  const state = {
    assignments: [],
    partitions: [
      {
        tenant: "a",
        employees: [{ _id: "one", password: "p1" }],
        customers: [],
      },
      {
        tenant: "b",
        employees: [],
        customers: [{ _id: "two", password: "p2" }],
      },
    ],
  };
  owner.validateInventory(state, canonical, historical);
  state.partitions[1].customers.push({ _id: "shared", password: "p2" });
  assert.throws(
    () => owner.validateInventory(state, canonical, historical),
    /inventory/,
  );
  state.partitions[1].customers.pop();
  state.partitions[0].employees.push({
    _id: "dependent",
    authenticationIdentity: historical.identity,
  });
  assert.throws(
    () => owner.validateInventory(state, canonical, historical),
    /inventory/,
  );
});

test("reserved nested evidence and rename destinations cannot be manufactured through generic CRUD", () => {
  assert.equal(
    source.containsEvidence({ snapshot: { canonicalHistoricalLink: {} } }),
    true,
  );
  assert.equal(
    source.containsEvidence({
      $rename: { ordinary: "identityLinkRetirement" },
    }),
    true,
  );
  assert.equal(source.containsEvidence([{ identityLinkRetirement: {} }]), true);
  assert.equal(
    source.containsEvidence({ ordinary: { displayName: "normal" } }),
    false,
  );
});

test("reviewed staged commit retains canonical credentials/history and produces only an inactive projection", async () => {
  const digest = (value) =>
    crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
  const canonicalIdentity = {
    tenantCode: "canonical",
    recordKind: "EMPLOYEE",
    recordId: "original",
  };
  const historicalIdentity = {
    tenantCode: "historical",
    recordKind: "CUSTOMER",
    recordId: "old-customer",
  };
  const canonical = {
    identity: canonicalIdentity,
    credentialId: "original-password",
    credentialCode: "original-code",
    credentialRevision: 2,
    person: {
      _id: "original",
      code: "admin",
      loginId: "original@example.invalid",
      principalType: "human",
      authVersion: 3,
      active: true,
    },
  };
  const historical = {
    identity: historicalIdentity,
    credentialId: "historical-password",
    credentialCode: "historical-code",
    credentialRevision: 4,
    person: {
      _id: "old-customer",
      code: "old",
      loginId: "historical@example.invalid",
      principalType: "customer",
      authVersion: 7,
      active: true,
      password: "historical-password",
      purchases: ["unchanged"],
    },
  };
  const plan = {
    canonical: source.facts(canonical),
    historical: source.facts(historical),
    preparedAt: new Date().toISOString(),
    inventoryFingerprint: digest({ inventory: true }),
  };
  const audit = {
    code: "canonical-link-" + "a".repeat(40),
    status: "LINK_PREPARED",
    snapshot: { canonicalHistoricalLink: plan },
    preview: { fingerprint: digest(plan) },
  };
  const credential = {
    _id: "historical-password",
    code: "historical-code",
    revision: 4,
    loginId: historical.person.loginId,
    active: true,
    password: "retained-original-hash",
  };
  const stamps = [];
  global.UTILS = {
    compareHash: async (supplied) => supplied === "historical-proof",
  };
  global.SERVICE = {
    DefaultPrincipalSecurityStampService: {
      register: async (...args) => stamps.push(args),
    },
  };
  const owner = {
    ...source,
    readPasswordForRetirement: async () => credential,
    readRecord: async (name) =>
      name === "DefaultPasswordService" ? credential : historical.person,
    digest,
    fail: () => {
      throw Error("closed");
    },
    operator: async () => ({}),
    policy: () => ({ proofMaximumAgeMs: 300000, recoveryQualified: true }),
    member: () => ({
      recordId: (x) => x,
      principalService: () => "DefaultCustomerService",
      base: () => ({
        input: (value, keys) => {
          if (Object.keys(value).some((key) => !keys.includes(key)))
            throw Error("selector");
          return value;
        },
      }),
      read: async (name) =>
        name === "DefaultPasswordService" ? credential : historical.person,
    }),
    prove: async (identity, password) => {
      assert.equal(
        password,
        identity.recordId === "original"
          ? "canonical-proof"
          : "historical-proof",
      );
      return identity.recordId === "original" ? canonical : historical;
    },
    audit: async () => audit,
    inventory: async () => ({ inventory: true }),
    validateInventory: () => {},
    assertEligibilityDependency: async () => {},
    advance: async (record, from, to) => {
      assert.equal(record.status, from);
      record.status = to;
      return record;
    },
    confirmWrite: async (name, tenant, query, model, lookup, matches) => {
      assert.equal(tenant, "historical");
      const row =
        name === "DefaultPasswordService" ? credential : historical.person;
      Object.assign(row, model.$set);
      for (const key of Object.keys(model.$unset || {})) delete row[key];
      if (name === "DefaultCustomerService") row.authVersion++;
      assert.equal(matches(row), true);
    },
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  SERVICE.DefaultCanonicalHistoricalIdentityLinkService = owner;
  SERVICE.DefaultIdentityGovernanceService = {
    getSystemAuthData: () => ({ system: true }),
  };
  SERVICE.DefaultModelConcurrencyService = { ...concurrencySource };
  const model = {
    ...providerSource,
    primaryKey: "code",
    versioned: false,
    rawSchema: {
      definition: { revision: { type: "long" } },
      backoffice: { concurrency: { managed: true, field: "revision" } },
      credentialRetirement: {
        enabled: true,
        writerCoverageQualified: true,
        revisionField: "revision",
        credentialField: "password",
        activeField: "active",
        evidenceField: "identityLinkRetirement",
        ownerService: "DefaultCanonicalHistoricalIdentityLinkService",
      },
    },
    normalizeModelForWrite: (value) => value,
    transactionOptions: () => ({}),
    getItems: async () => [structuredClone(credential)],
    findOneAndUpdate: async (query, update, options) => {
      assert.equal(query.password, undefined);
      assert.equal(update.$set.password, undefined);
      assert.equal(query.revision, credential.revision);
      assert.equal(options.projection.password, undefined);
      assert.equal(options.projection.revision, 1);
      Object.assign(credential, update.$set);
      const metadata = Object.fromEntries(
        Object.keys(options.projection).map((key) => [key, credential[key]]),
      );
      assert.equal(metadata.password, undefined);
      return { value: metadata, ok: 1 };
    },
  };
  SERVICE.DefaultPasswordService = {
    update: async (request) => {
      request.schemaModel = model;
      const result =
        await SERVICE.DefaultModelConcurrencyService.executeCredentialRetirement(
          request,
        );
      return { code: "SUC_UPDATE", result: { ...result, acknowledged: true } };
    },
  };
  const request = {
    body: {
      auditCode: audit.code,
      fingerprint: audit.preview.fingerprint,
      confirmed: true,
      canonicalPassword: "canonical-proof",
      historicalPassword: "historical-proof",
    },
    query: {},
  };
  const result = await sensitive(owner, "commit", request);
  assert.equal(result.phase, "LINK_COMPLETE");
  assert.equal(result.accessGranted, false);
  assert.equal(result.customerConsentGranted, false);
  assert.equal(historical.person.active, false);
  assert.equal(historical.person.disabled, true);
  assert.equal(historical.person.password, undefined);
  assert.deepEqual(historical.person.purchases, ["unchanged"]);
  assert.deepEqual(historical.person.authenticationIdentity, canonicalIdentity);
  assert.equal(credential.active, false);
  assert.equal(credential.password, "retained-original-hash");
  assert.equal(canonical.credentialId, "original-password");
  assert.equal(stamps.length, 4);
  const replay = await sensitive(owner, "commit", {
    ...request,
    body: {
      ...request.body,
      canonicalPassword: "canonical-proof",
      resume: true,
    },
  });
  assert.equal(replay.phase, "LINK_COMPLETE");
});

test("lost acknowledgement is accepted only for this exact persisted marker", async () => {
  const row = { identityLinkRetirement: { auditCode: "mine" } };
  const owner = {
    ...source,
    fail: () => {
      throw Error("unconfirmed");
    },
    storage: (tenant, fields) => ({ tenant, ...fields }),
    write: async () => {
      throw Error("transport");
    },
    readRecord: async () => row,
  };
  await owner.confirmWrite(
    "DefaultPasswordService",
    "t",
    {},
    {},
    {},
    (value) => value.identityLinkRetirement.auditCode === "mine",
  );
  await assert.rejects(
    owner.confirmWrite(
      "DefaultPasswordService",
      "t",
      {},
      {},
      {},
      (value) => value.identityLinkRetirement.auditCode === "other",
    ),
    /transport/,
  );
});

test("historical API-key artifacts reject even inactive, revoked, empty or legacy-cased fields without erasure", () => {
  const owner = {
    ...source,
    fail: () => {
      throw Error("closed");
    },
  };
  for (const [key, value] of [
    ["apiKey", "legacy-key"],
    ["apiKeyHash", "keyed-hash"],
    ["apiKey", ""],
    ["apiKeyHash", null],
    ["apiKeyScopes", []],
    ["apiKeyStatus", "revoked"],
    ["apiKeyPrefix", "nonsecret"],
    ["APIKeyHash", "legacy-hash"],
  ]) {
    const person = { active: false, disabled: true, [key]: value };
    assert.throws(
      () => owner.assertHistoricalCredentialArtifacts(person),
      /closed/,
    );
    assert.equal(person[key], value);
  }
  owner.assertHistoricalCredentialArtifacts({
    active: false,
    disabled: true,
    password: "original-reference",
  });
  for (const [key, predicate] of Object.entries(
    owner.historicalCredentialExclusions(),
  )) {
    assert.match(key, /^apiKey/);
    assert.deepEqual(predicate, { $exists: false });
  }
});

test("prepare refuses historical API keys before inventory or audit writes and scrubs proof aliases", async () => {
  let inventory = 0,
    writes = 0;
  const canonical = {
    identity: {
      tenantCode: "one",
      recordKind: "EMPLOYEE",
      recordId: "canonical",
    },
    person: {},
  };
  const historical = {
    identity: {
      tenantCode: "two",
      recordKind: "CUSTOMER",
      recordId: "historical",
    },
    person: { apiKeyHash: "unretired-api-key-hash" },
  };
  const originalBody = {
    canonicalIdentity: canonical.identity,
    historicalIdentity: historical.identity,
    canonicalPassword: "canonical-proof",
    historicalPassword: "historical-proof",
    confirmed: true,
  };
  const request = {
    body: originalBody,
    model: originalBody,
    httpRequest: { body: originalBody, query: {} },
    query: {},
  };
  const owner = {
    ...source,
    fail: () => {
      throw Error("closed");
    },
    member: () => ({
      base: () => ({
        input: (value, allowed) => {
          if (Object.keys(value).some((key) => !allowed.includes(key)))
            throw Error("selector");
          return value;
        },
      }),
    }),
    operator: async (current) => {
      assert.equal(JSON.stringify(current).includes("canonical-proof"), false);
      assert.equal(JSON.stringify(current).includes("historical-proof"), false);
      return { identity: { recordId: "operator" } };
    },
    prove: async (identity, proof) => {
      assert.ok(proof.endsWith("-proof"));
      return identity.recordId === "canonical" ? canonical : historical;
    },
    inventory: async () => {
      inventory++;
    },
    write: async () => {
      writes++;
    },
  };
  await assert.rejects(sensitive(owner, "prepare", request), /closed/);
  assert.equal(inventory, 0);
  assert.equal(writes, 0);
  assert.equal(historical.person.apiKeyHash, "unretired-api-key-hash");
  assert.equal(originalBody.canonicalPassword, undefined);
  assert.equal(originalBody.historicalPassword, undefined);
});

test("malformed DTO and both query aliases refuse after plaintext is scrubbed", () => {
  const owner = {
    ...source,
    fail: () => {
      throw Error("closed");
    },
    member: () => ({
      base: () => ({
        input: (value, allowed) => {
          if (Object.keys(value).some((key) => !allowed.includes(key)))
            throw Error("selector");
          return value;
        },
      }),
    }),
  };
  for (const request of [
    { body: { canonicalPassword: "secret", forbidden: true } },
    {
      body: { canonicalPassword: "secret" },
      query: { historicalPassword: "query-secret" },
      httpRequest: { query: {} },
    },
    {
      body: { canonicalPassword: "secret" },
      query: {},
      httpRequest: { query: { historicalPassword: "query-secret" } },
    },
  ]) {
    assert.throws(
      () => owner.takeInput(request, ["canonicalPassword"]),
      /closed/,
    );
    assert.equal(JSON.stringify(request).includes("secret"), false);
  }
});

test("entry denial redacts provider diagnostics and clears detached proof even with a frozen body", async () => {
  let retainedInput;
  const owner = {
    ...source,
    fail: () => {
      throw Error("closed");
    },
    member: () => ({ base: () => ({ input: (value) => value }) }),
    prepareCommand: async (command) => {
      retainedInput = command.input;
      throw Error("provider exposed canonical-proof historical-proof");
    },
  };
  const request = {
    body: Object.freeze({
      canonicalPassword: "canonical-proof",
      historicalPassword: "historical-proof",
    }),
  };
  await assert.rejects(
    sensitive(owner, "prepare", request),
    (error) => error.message === "closed",
  );
  assert.equal(request.body.canonicalPassword, undefined);
  assert.equal(request.body.historicalPassword, undefined);
  assert.equal(retainedInput.canonicalPassword, undefined);
  assert.equal(retainedInput.historicalPassword, undefined);
});

test("recovery refuses retained API credentials before replaying historical writes", async () => {
  const digest = (value) =>
    crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
  const canonical = {
    identity: { tenantCode: "a", recordKind: "EMPLOYEE", recordId: "one" },
    credentialId: "original-password",
    credentialCode: "original-code",
    credentialRevision: 2,
    person: {
      code: "original",
      loginId: "original@example.invalid",
      authVersion: 3,
      principalType: "human",
      active: true,
    },
  };
  const historical = { active: false, disabled: true, apiKeyHash: "unretired" };
  const plan = {
    canonical: source.facts(canonical),
    historical: {
      identity: { tenantCode: "b", recordKind: "CUSTOMER", recordId: "two" },
    },
  };
  const audit = {
    code: "canonical-link-" + "a".repeat(40),
    status: "LINK_COMPLETE",
    snapshot: { canonicalHistoricalLink: plan },
    preview: { fingerprint: digest(plan) },
  };
  let writes = 0;
  const owner = {
    ...source,
    digest,
    readRecord: async () => historical,
    fail: () => {
      throw Error("closed");
    },
    policy: () => ({ recoveryQualified: true }),
    operator: async () => ({}),
    prove: async () => canonical,
    audit: async () => audit,
    confirmWrite: async () => {
      writes++;
    },
    member: () => ({
      principalService: () => "DefaultCustomerService",
      read: async () => historical,
      base: () => ({ input: (value) => value }),
    }),
  };
  await assert.rejects(
    sensitive(owner, "commit", {
      body: {
        auditCode: audit.code,
        fingerprint: audit.preview.fingerprint,
        confirmed: true,
        canonicalPassword: "fresh-proof",
        resume: true,
      },
    }),
    /closed/,
  );
  assert.equal(writes, 0);
  assert.equal(historical.apiKeyHash, "unretired");
});

test("principal readback with introduced API artifacts refuses before stamp confirmation", async () => {
  let stamped = false;
  const owner = {
    ...source,
    readRecord: async () => ({
      active: false,
      disabled: true,
      apiKeyHash: "introduced",
    }),
    fail: () => {
      throw Error("closed");
    },
    storage: (tenant, fields) => ({ tenant, ...fields }),
    write: async () => ({ result: { acknowledged: true, matchedCount: 1 } }),
    member: () => ({
      read: async () => ({
        active: false,
        disabled: true,
        apiKeyHash: "introduced",
      }),
    }),
    confirmRetirementStamp: async () => {
      stamped = true;
    },
  };
  await assert.rejects(
    owner.confirmWrite("DefaultCustomerService", "t", {}, {}, {}, () => true),
    /closed/,
  );
  assert.equal(stamped, false);
});

test("prepare storage and response never receive detached plaintext or credential bodies", async () => {
  const digest = (value) =>
    crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
  const canonical = {
    identity: { tenantCode: "a", recordKind: "EMPLOYEE", recordId: "one" },
    credentialId: "original-reference",
    credentialCode: "original-credential",
    credentialRevision: 1,
    person: {
      code: "original",
      loginId: "original@example.invalid",
      authVersion: 1,
      active: true,
      principalType: "human",
      password: { password: "original-password-hash" },
    },
  };
  const historical = {
    identity: { tenantCode: "b", recordKind: "CUSTOMER", recordId: "two" },
    credentialId: "historical-reference",
    credentialCode: "historical-credential",
    credentialRevision: 1,
    person: {
      code: "historical",
      loginId: "historical@example.invalid",
      authVersion: 1,
      active: true,
      principalType: "customer",
      password: { password: "historical-password-hash" },
    },
  };
  let saved;
  global.SERVICE = {
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({}) },
  };
  const owner = {
    ...source,
    digest,
    fail: () => {
      throw Error("closed");
    },
    operator: async () => ({ identity: canonical.identity }),
    member: () => ({
      authority: () => "authority",
      base: () => ({ input: (value) => value }),
    }),
    prove: async (identity) =>
      identity.recordId === "one" ? canonical : historical,
    inventory: async () => ({ complete: true }),
    validateInventory: () => {},
    assertEligibilityDependency: async () => {},
    audit: async () => saved,
    write: async (name, operation, request) => {
      assert.equal(name, "DefaultIdentityMigrationAuditService");
      assert.equal(operation, "save");
      for (const secret of [
        "canonical-proof",
        "historical-proof",
        "original-password-hash",
        "historical-password-hash",
      ])
        assert.equal(JSON.stringify(request).includes(secret), false);
      saved = request.model;
    },
  };
  const result = await sensitive(owner, "prepare", {
    authData: { loginId: "operator" },
    body: {
      canonicalIdentity: canonical.identity,
      historicalIdentity: historical.identity,
      canonicalPassword: "canonical-proof",
      historicalPassword: "historical-proof",
      confirmed: true,
    },
  });
  assert.equal(result.phase, "PREPARED");
  for (const secret of [
    "canonical-proof",
    "historical-proof",
    "original-password-hash",
    "historical-password-hash",
  ]) {
    assert.equal(JSON.stringify(saved).includes(secret), false);
    assert.equal(JSON.stringify(result).includes(secret), false);
  }
});
