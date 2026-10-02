/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module profile/test/installedOnboardingQualification
 * @description Runs opt-in disposable provider probes or an explicitly selected read-only authenticated inventory/installed-index inspection. Never creates an Employee, Customer, Password or approved browser persona.
 * @layer test
 * @owner profile
 * @sideEffects Explicit live execution writes disposable fixture rows and keys, then removes only those rows/keys. No runtime configuration or qualification flag is written.
 * @override Deployment tests may select local endpoints; preserve namespace admission, native provider owners and evidence boundaries.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const ownerInspection = require("./helpers/installedOnboardingOwnerInspection");
const ownerCli = require.main === module && process.argv.slice(2).some((argument) => argument.startsWith("--installed-owner"));
const foundation = "../../../../nodics.foundation/modules/";
const logger = { debug() {}, info() {}, error() {} };
const binder = require(
  foundation +
    "nDatabase/mongodb/src/service/model/defaultMongodbInstalledVersionMigrationService",
);
const connectionSource = require(
  foundation +
    "nDatabase/mongodb/src/service/connection/defaultMongodbDatabaseConnectionHandlerService",
);
const indexSource = require(
  foundation +
    "nDatabase/mongodb/src/service/model/defaultMongodbDatabaseModelHandlerService",
);
const redisSource = require(
  foundation + "nCache/redisCache/src/service/cache/defaultRedisCacheService",
);
const redisEngine = require(
  foundation +
    "nCache/redisCache/src/service/engine/defaultRedisCacheEngineService",
);

/** Admits disposable test scope, never an installed project or shared auth namespace. @param {string} namespace Selected fixture scope. @returns {void} */
function assertFixtureScope(namespace) {
  assert.match(namespace, /^nodics_profile_qualification_[a-f0-9]{32}$/);
}

/** Restricts this explicitly authorized Local runner to loopback provider endpoints. @param {string} endpoint Selected test URI. @param {string} protocol Provider protocol. @returns {void} */
function assertLocalEndpoint(endpoint, protocol) {
  const value = new URL(endpoint);
  assert.equal(value.protocol, protocol);
  assert(["localhost", "127.0.0.1", "[::1]"].includes(value.hostname));
}

/** Installs real selected provider collaborators for this isolated test process only. @returns {void} */
function owners() {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code, message, explicitCode) {
        super(message || String(code));
        this.code = explicitCode || code;
      }
    },
    CacheError: class extends Error {},
  };
  global.UTILS = {
    isBlank: (value) => !value || Object.keys(value).length === 0,
  };
  global.SERVICE = {
    DefaultModelValidatorService: {
      ...require(
        foundation +
          "nDatabase/database/src/service/model/defaultModelValidatorService",
      ),
      LOG: logger,
    },
    DefaultNodicsPromiseService: { all: (values) => Promise.all(values) },
    DefaultCacheConfigurationService: require(
      foundation +
        "nCache/cache/src/service/config/defaultCacheConfigurationService",
    ),
  };
}

/** Proves installed conditional-write and claim-index semantics using existing MongoDB owners, not business principals. @param {Object} connection Existing owner connection. @param {string} namespace Explicit disposable database. @param {Object} claimIndex Profile's source claim declaration. @returns {Promise<Object>} Primitive evidence only, not end-to-end qualification. */
async function qualifyMongo(connection, namespace, claimIndex) {
  assertFixtureScope(namespace);
  assert.equal(connection.connection.databaseName, namespace);
  const schema = {
    definition: { code: { type: "string", primary: true } },
    schemaOptions: {
      fixture: {
        indexedFields: [
          { fields: { code: 1 }, options: { unique: true } },
          {
            fields: { [claimIndex.name]: 1 },
            options: structuredClone(claimIndex.options),
          },
        ],
      },
    },
  };
  const model = binder.bindMaintenanceModel({
    connection,
    schema,
    scope: {
      database: namespace,
      collection: "OnboardingPrimitiveFixture",
      tenant: "fixture",
      channel: "master",
      schemaName: "onboardingPrimitiveFixture",
    },
    databaseOptions: {
      defaultIndexes: ["_id"],
      modelRemoveOptions: { j: true },
    },
  });
  const codes = [
    "cas-probe",
    "claim-one",
    "claim-two",
    "pending-one",
    "pending-two",
    "credential-writer-probe",
  ];
  const create = (model) => ({
    operation: "create",
    internalPersistence: "DURABLE_JOURNAL",
    model,
  });
  try {
    const original = await model.compareAndSetItem(
      create({ code: codes[0], revision: 0, phase: "PENDING" }),
    );
    await indexSource.createIndexes(model, false);
    const outcomes = await Promise.all(
      [1, 2].map((value) =>
        model.compareAndSetItem({
          operation: "update",
          internalPersistence: "DURABLE_JOURNAL",
          query: { _id: original._id, revision: 0, phase: "PENDING" },
          model: { revision: value, phase: "COMPLETE" },
        }),
      ),
    );
    assert.equal(outcomes.filter(Boolean).length, 1);
    const stale = await model.compareAndSetItem({
      operation: "update",
      internalPersistence: "DURABLE_JOURNAL",
      query: { _id: original._id, revision: 0 },
      model: { revision: 3, phase: "PENDING" },
    });
    assert.equal(stale, null);
    const read = await model.getItems({
      internalPersistence: "DURABLE_JOURNAL",
      query: { _id: original._id },
      searchOptions: { limit: 2 },
    });
    assert.equal(read.count, 1);
    assert.equal(read.result[0].phase, "COMPLETE");
    assert.equal(read.result[0].revision, outcomes.find(Boolean).revision);
    const claims = await Promise.allSettled(
      codes.slice(1, 3).map((code) =>
        model.compareAndSetItem(
          create({
            code,
            normalizedEmail: "disposable-claim-probe.invalid",
            identityClaimed: true,
          }),
        ),
      ),
    );
    assert.equal(claims.filter((x) => x.status === "fulfilled").length, 1);
    assert.equal(
      claims.find((x) => x.status === "rejected").reason.code,
      "ERR_CONCURRENCY_00001",
    );
    for (const code of codes.slice(3, 5))
      await model.compareAndSetItem(
        create({
          code,
          normalizedEmail: "disposable-pending-probe.invalid",
          identityClaimed: false,
        }),
      );
    const credentialProbe = await model.compareAndSetItem(
      create({
        code: codes[5],
        loginId: "disposable-native-writer-probe.invalid",
        password: "opaque-original-fixture-value",
      }),
    );
    const selector = {
      _id: credentialProbe._id,
      loginId: credentialProbe.loginId,
      password: credentialProbe.password,
    };
    const writes = await Promise.all(
      ["opaque-next-fixture-one", "opaque-next-fixture-two"].map((password) =>
        model.updateItems({
          query: selector,
          model: { password },
          options: { upsert: false },
        }),
      ),
    );
    assert(writes.every((write) => write.acknowledged === true));
    assert.deepEqual(writes.map((write) => write.matchedCount).sort(), [0, 1]);
    const updated = await model.getItems({
      internalPersistence: "DURABLE_JOURNAL",
      query: { _id: credentialProbe._id },
      searchOptions: { limit: 2 },
    });
    assert.equal(updated.count, 1);
    assert.notEqual(updated.result[0].password, credentialProbe.password);
    assert.equal(updated.result[0].loginId, credentialProbe.loginId);
    return {
      casSingleWinner: true,
      staleRevisionRejected: true,
      exactReadback: true,
      partialClaimUnique: true,
      unclaimedMultiplicity: true,
      nativeWriterSingleAcknowledgement: true,
    };
  } finally {
    await model.removeItems({ query: { code: { $in: codes } }, options: {} });
    const remaining = await model.getItems({
      internalPersistence: "DURABLE_JOURNAL",
      query: { code: { $in: codes } },
      searchOptions: { limit: 10 },
    });
    assert.equal(remaining.count, 0);
  }
}

/** Proves installed atomic consume, bounded counters and nonregressing stamps in exact disposable keys. @param {Object} client Existing Redis owner client. @param {string} namespace Approved fixture namespace. @returns {Promise<Object>} Distributed primitive evidence, not session or privacy acceptance. */
async function qualifyRedis(client, namespace) {
  assertFixtureScope(namespace);
  const cache = { ...redisSource, LOG: logger };
  const channel = {
    client,
    channelName: "qualification",
    engineOptions: { options: { prefix: namespace } },
    channelOptions: { ttl: 120 },
  };
  const base = { moduleName: "profile", channel, tenant: "fixture" };
  try {
    await cache.put({ ...base, key: "continuation", value: { fixture: true } });
    const consumed = await Promise.allSettled([
      cache.consume({ ...base, key: "continuation" }),
      cache.consume({ ...base, key: "continuation" }),
    ]);
    assert.equal(consumed.filter((x) => x.status === "fulfilled").length, 1);
    const increments = await Promise.allSettled(
      Array.from({ length: 8 }, () =>
        cache.incrementBounded({ ...base, key: "counter", maximum: 3 }),
      ),
    );
    assert.equal(
      increments.filter(
        (x) => x.status === "fulfilled" && x.value.allowed === true,
      ).length,
      3,
    );
    assert.equal(
      increments.filter(
        (x) => x.status === "fulfilled" && x.value.allowed === false,
      ).length,
      5,
    );
    await cache.putVersioned({ ...base, key: "stamp", value: { revision: 5 } });
    await assert.rejects(
      cache.putVersioned({ ...base, key: "stamp", value: { revision: 4 } }),
    );
    assert.equal((await cache.get({ ...base, key: "stamp" })).revision, 5);
    return {
      consumeSingleWinner: true,
      distributedLimitBounded: true,
      stampMonotonic: true,
    };
  } finally {
    await cache.flushByKeys({
      ...base,
      keys: ["continuation", "counter", "stamp"],
    });
  }
}

/** Runs fixed owner composition fixtures in an isolated process with provider opt-ins removed. Evidence is source-only, never installed or browser qualification. @returns {Object} Exact source/runtime receipt without credential values. */
function qualifySourceComposition() {
  const fixtures = [
    require.resolve("./passwordOwnershipPipelineContract.test"),
    require.resolve("./enterpriseRegistrationIntegrationContract.test"),
    require.resolve("./enterpriseSetupContinuationContract.test"),
  ];
  const sources = [
    "../src/interceptors/interceptors",
    "../src/schemas/schemas",
    "../src/service/interceptors/defaultPasswordSaveInterceptorService",
    "../src/service/identity/defaultPrincipalSecurityStampGovernanceService",
    "../src/service/enterprise/defaultEnterpriseRegistrationService",
    "../src/service/enterprise/defaultEnterpriseMembershipService",
    "../src/service/enterprise/defaultEnterpriseSetupContinuationService",
    "../src/service/enterprise/defaultEnterpriseTeamAdministrationService",
    "../src/service/enterprise/defaultTenantProvisioningGuardService",
    "../src/service/enterprise/defaultEnterpriseManagementService",
    "../src/controller/enterprise/defaultEnterpriseManagementController",
    "../src/facade/enterprise/defaultEnterpriseManagementFacade",
    "../src/router/routers",
    foundation + "nService/src/service/common",
    foundation + "nDatabase/database/src/service/schema/defaultModelConcurrencyService",
    foundation + "nDatabase/database/src/service/procs/update/defaultModelsUpdateInitializerService",
    foundation + "nDatabase/mongodb/src/schemas/model",
    foundation + "nDatabase/mongodb/src/service/model/defaultMongodbDatabaseModelHandlerService",
  ].map((source) => require.resolve(source));
  const sourceFingerprint = () => {
    const fingerprint = createHash("sha256");
    for (const path of [...sources, ...fixtures]) {
      fingerprint.update(path).update("\0").update(readFileSync(path)).update("\0");
    }
    return fingerprint.digest("hex");
  };
  const before = sourceFingerprint();
  const env = { ...process.env };
  delete env.NODICS_PROFILE_INSTALLED_MONGO_URI;
  delete env.NODICS_PROFILE_INSTALLED_REDIS_URL;
  delete env.NODICS_PROFILE_INSTALLED_SETUP_MONGO_URI;
  delete env.NODICS_PROFILE_INSTALLED_INDEX_READ_DATABASE;
  // This is an independent test-runner process, not a worker of the caller's harness.
  delete env.NODE_TEST_CONTEXT;
  // Installed cases are verified separately; they cannot count toward a source-only receipt.
  const result = spawnSync(process.execPath, ["--test", "--test-reporter=tap", "--test-name-pattern=^(?!installed )", ...fixtures], {
    env, encoding: "utf8", timeout: 30000, maxBuffer: 1024 * 1024,
  });
  assert.equal(result.error, undefined, "source composition process must complete");
  assert.equal(result.status, 0, "source composition fixtures must pass; run the fixed fixture paths directly to inspect failures");
  assert.equal(sourceFingerprint(), before, "selected source must remain unchanged throughout the composition run");
  const total = Number(result.stdout.match(/^# tests (\d+)$/m)?.[1]);
  const passed = Number(result.stdout.match(/^# pass (\d+)$/m)?.[1]);
  const excludedInstalled = (result.stdout.match(/^ok \d+ - installed canonical actor reads a BSON ID through generated GET and provider-owned conversion # SKIP$/gm) || []).length;
  assert(Number.isSafeInteger(total) && total > 0);
  assert.equal(excludedInstalled, 1, "only the separately verified installed BSON case may be excluded");
  assert.equal(passed + excludedInstalled, total);
  assert.match(result.stdout, /^# skipped 1$/m);
  return Object.freeze({
    evidence: "SOURCE_IN_MEMORY_COMPOSITION", nodeVersion: process.version,
    sourceFingerprint: before, fixtureFiles: fixtures.length,
    tests: passed, passed, excludedInstalled, installedOwnerQualified: false, browserAccepted: false,
  });
}

if (!ownerCli) {
  test("owner CLI refuses unauthenticated/direct worker invocation without running live primitive cases or leaking arbitrary diagnostics", () => {
    assert.equal(
      ownerInspection.sanitizeRefusal({
        code: "OWNER_PRIVATE_PROVIDER_CONTENT",
      }),
      "OWNER_CONTEXT_UNAVAILABLE",
    );
    assert.equal(
      ownerInspection.sanitizeRefusal({ code: "OWNER_INDEX_CHANGED" }),
      "OWNER_INDEX_CHANGED",
    );
    const coordinates = [
      "--project-root=/fixture/project",
      "--environment=fixtureLocal",
      "--server=platformServer",
      "--origin=http://localhost:4300",
    ];
    const env = {
      PATH: process.env.PATH,
      HOME: process.env.HOME,
      NODICS_PROFILE_INSTALLED_MONGO_URI: "mongodb://localhost:27017",
      NODICS_PROFILE_INSTALLED_REDIS_URL: "redis://localhost:6379",
    };
    const publicAttempt = spawnSync(
      process.execPath,
      [__filename, "--installed-owner-read-only", ...coordinates],
      { env, encoding: "utf8", timeout: 5000 },
    );
    assert.equal(publicAttempt.status, 1);
    assert.equal(publicAttempt.stdout, "");
    assert.deepEqual(JSON.parse(publicAttempt.stderr), {
      code: "OWNER_OPERATOR_PROOF_REQUIRED",
      registrationQualified: false,
      browserAccepted: false,
    });
    const workerAttempt = spawnSync(
      process.execPath,
      [__filename, "--installed-owner-read-only-worker", ...coordinates],
      { env, encoding: "utf8", timeout: 5000 },
    );
    assert.equal(workerAttempt.status, 1);
    assert.equal(
      workerAttempt.stdout,
      "PROFILE_OWNER_REFUSAL:OWNER_WORKER_REFUSED\n",
    );
    assert.equal(workerAttempt.stderr, "");
  });
  test("read-only owner selection rejects credentials, arbitrary selectors and nonloopback origins", () => {
    const valid = [
      "--project-root=/fixture/project",
      "--environment=fixtureLocal",
      "--server=platformServer",
      "--origin=http://localhost:4300",
    ];
    assert.equal(ownerInspection.parseOptions(valid).server, "platformServer");
    for (const extra of [
      "--token=private",
      "--database=other",
      "--execute",
      "--environment=otherLocal",
    ])
      assert.throws(
        () => ownerInspection.parseOptions([...valid, extra]),
        /OWNER_SELECTION_INVALID/,
      );
    for (const origin of [
      "http://example.com:4300",
      "http://localhost:4300/path",
      "http://user:private@localhost:4300",
      "http://localhost:4300?token=private",
    ])
      assert.throws(
        () => ownerInspection.assertLoopbackOrigin(origin),
        /OWNER_ORIGIN_INVALID/,
      );
  });

  /** Returns a reviewed owner envelope with aggregate fixture counts only. @returns {Object} In-memory transport response, not authenticated live evidence. */
  function assessmentFixture() {
    return {
      code: "SUC_SYS_00000",
      data: {
        contractVersion: 1,
        assessmentId: "00000000-0000-4000-8000-000000000001",
        observedAt: new Date().toISOString(),
        inventoryComplete: true,
        consistency: "TWO_PASS_OBSERVED_MATCH",
        atomicSnapshot: false,
        readyForApply: false,
        fingerprint: "a".repeat(64),
        reviewRequired: false,
        findings: [],
        counts: {
          tenants: 1,
          enterprises: 1,
          assignments: 0,
          employees: 0,
          customers: 0,
          servicePrincipals: 0,
          passwords: 0,
        },
      },
    };
  }

  test("owner inventory evidence refuses conflicts, incomplete/stale reports and unexpected private metadata", () => {
    assert.equal(
      ownerInspection.projectAssessment(assessmentFixture(), Date.now())
        .inventoryComplete,
      true,
    );
    for (const change of [
      (data) => {
        data.inventoryComplete = false;
      },
      (data) => {
        data.reviewRequired = true;
        data.findings = [{ code: "review", references: ["private"] }];
      },
      (data) => {
        data.atomicSnapshot = true;
      },
      (data) => {
        data.readyForApply = true;
      },
      (data) => {
        data.observedAt = new Date(0).toISOString();
      },
      (data) => {
        delete data.counts.passwords;
      },
      (data) => {
        data.password = "must-not-publish";
      },
    ]) {
      const response = assessmentFixture();
      change(response.data);
      assert.throws(
        () => ownerInspection.projectAssessment(response, Date.now()),
        /OWNER_ASSESSMENT_NOT_READY/,
      );
    }
  });

  test("exact installed claim index accepts native BSON Int32 but rejects legacy, competing and altered uniqueness", () => {
    const { Int32, Long } = require("bson");
    const expected = {
      fields: { normalizedEmail: 1 },
      options: {
        unique: true,
        partialFilterExpression: { identityClaimed: true },
      },
    };
    const index = {
      name: "normalizedEmail_1",
      key: { normalizedEmail: new Int32(1) },
      unique: true,
      partialFilterExpression: { identityClaimed: true },
    };
    assert.equal(
      ownerInspection.inspectClaimIndex([index], expected)
        .exactPartialUniqueClaimIndex,
      true,
    );
    for (const values of [
      [],
      [{ ...index, unique: false }],
      [{ ...index, partialFilterExpression: undefined }],
      [index, { ...index, name: "competing" }],
      [{ ...index, sparse: true }],
      [{ ...index, hidden: true }],
      [{ ...index, collation: { locale: "en" } }],
      [{ ...index, key: { normalizedEmail: Long.fromNumber(1) } }],
      [
        {
          ...index,
          partialFilterExpression: { identityClaimed: true, active: true },
        },
      ],
    ])
      assert.throws(
        () => ownerInspection.inspectClaimIndex(values, expected),
        /OWNER_CLAIM_INDEX_NOT_READY/,
      );
  });

  /** Builds one read-only collection fixture using the actual database-owner binding/index reader. @returns {Object} Context and observed calls, with no provider connection. */
  function installedOwnerFixture() {
    owners();
    const calls = {
      assessments: 0,
      opened: 0,
      closed: 0,
      indexReads: 0,
      cursorClosed: 0,
    };
    const indexes = [
      { name: "_id_", key: { _id: 1 } },
      {
        name: "normalizedEmail_1",
        key: { normalizedEmail: 1 },
        unique: true,
        partialFilterExpression: { identityClaimed: true },
      },
    ];
    const collection = {
      collectionName: "EnterpriseAccessAssignmentModel",
      namespace: "fixture.EnterpriseAccessAssignmentModel",
      listIndexes: () => {
        calls.indexReads++;
        let offset = 0;
        return {
          next: async () =>
            offset < indexes.length ? structuredClone(indexes[offset++]) : null,
          close: async () => {
            calls.cursorClosed++;
          },
        };
      },
    };
    const handle = {
      client: {
        close: async () => {
          calls.closed++;
        },
      },
      connection: { databaseName: "fixture", collection: () => collection },
      collections: [{ name: collection.collectionName }],
    };
    const context = {
      origin: "http://localhost:4300",
      project: "fixture.project",
      environment: "fixtureLocal",
      server: "platformServer",
      tenant: "default",
      moduleName: "profile",
      schemaName: "enterpriseAccessAssignment",
      collection: collection.collectionName,
      schema: { definition: { code: { type: "string", primary: true } } },
      config: { master: { databaseName: "fixture" }, options: {} },
      expectedIndex: {
        fields: { normalizedEmail: 1 },
        options: {
          unique: true,
          partialFilterExpression: { identityClaimed: true },
        },
      },
      connector: {
        createConnection: async () => {
          assert.equal(calls.assessments, 1);
          calls.opened++;
          return handle;
        },
      },
      indexReader: binder,
    };
    const assessment = async () => {
      calls.assessments++;
      return assessmentFixture();
    };
    return { context, calls, indexes, handle, assessment };
  }

  test("read-only owner receipt composes real index reader, closes held connection and excludes private proof", async () => {
    const f = installedOwnerFixture();
    const receipt = await ownerInspection.inspectInstalledOwners(
      f.context,
      "private-fixture-proof",
      f.assessment,
    );
    assert.equal(f.calls.opened, 1);
    assert.equal(f.calls.closed, 1);
    assert.equal(f.calls.indexReads, 2);
    assert.equal(f.calls.cursorClosed, 2);
    assert.equal(receipt.registrationQualified, false);
    assert.equal(receipt.browserAccepted, false);
    assert.equal(receipt.installedRuntimeSourceMatch, "NOT_ESTABLISHED");
    assert.deepEqual(receipt.effects, {
      identityWrites: 0,
      indexWrites: 0,
      qualificationChanges: 0,
    });
    assert(!JSON.stringify(receipt).includes("private-fixture-proof"));
    assert.equal(receipt.inventory.atomicSnapshot, false);
  });

  test("native index cursor is strictly bounded and closes on exhaustion, overflow and failure", async () => {
    for (const count of [0, 128, 129, 1000]) {
      let reads = 0,
        closed = 0;
      const cursor = {
        next: async () => (reads++ < count ? { name: "index" } : null),
        close: async () => {
          closed++;
        },
      };
      if (count <= 128)
        assert.equal(
          (await ownerInspection.readBoundedIndexCursor(cursor)).length,
          count,
        );
      else
        await assert.rejects(
          ownerInspection.readBoundedIndexCursor(cursor),
          /OWNER_INDEX_INSPECTION_REFUSED/,
        );
      assert.equal(reads, Math.min(count + 1, 129));
      assert.equal(closed, 1);
    }
    for (const failure of ["next", "close", "unsupported"]) {
      let closed = 0;
      const cursor = {
        next: async () => {
          if (failure === "next") throw new Error("private provider failure");
          return null;
        },
        close: async () => {
          closed++;
          if (failure === "close") throw new Error("private close failure");
        },
      };
      if (failure === "unsupported") delete cursor.next;
      await assert.rejects(ownerInspection.readBoundedIndexCursor(cursor));
      assert.equal(closed, 1);
    }
  });

  test("index overflow refuses the owner receipt and closes both cursor and connection", async () => {
    const f = installedOwnerFixture();
    for (let i = 0; i < 127; i++)
      f.indexes.push({ name: "extra_" + i, key: { code: 1 } });
    await assert.rejects(
      ownerInspection.inspectInstalledOwners(
        f.context,
        "private-fixture-proof",
        f.assessment,
      ),
      /OWNER_INDEX_INSPECTION_REFUSED/,
    );
    assert.equal(f.calls.indexReads, 1);
    assert.equal(f.calls.cursorClosed, 1);
    assert.equal(f.calls.closed, 1);
  });

  test(
    "installed native ListIndexesCursor read-only compatibility",
    {
      skip: !process.env.NODICS_PROFILE_INSTALLED_INDEX_READ_DATABASE,
    },
    async () => {
      owners();
      global.ENUMS = {
        ContactType: Object.fromEntries(
          ["EMAIL", "PHONE", "FAX", "PAGER"].map((key) => [key, { key }]),
        ),
      };
      const uri = process.env.NODICS_PROFILE_INSTALLED_MONGO_URI;
      assertLocalEndpoint(uri, "mongodb:");
      const databaseName =
        process.env.NODICS_PROFILE_INSTALLED_INDEX_READ_DATABASE;
      assert.match(databaseName, /^[A-Za-z][A-Za-z0-9_-]{0,62}$/);
      const handle = await {
        ...connectionSource,
        LOG: logger,
      }.createConnection({
        URI: uri,
        databaseName,
        options: { serverSelectionTimeoutMS: 5000, readPreference: "primary" },
      });
      try {
        const collection = handle.connection.collection(
          "EnterpriseAccessAssignmentModel",
        );
        const model = {
          listIndexes: (options) => ({
            toArray: async () => {
              const cursor = collection.listIndexes(options);
              assert.equal(typeof cursor.limit, "undefined");
              try {
                return await ownerInspection.readBoundedIndexCursor(cursor);
              } finally {
                assert.equal(cursor.closed, true);
              }
            },
          }),
        };
        const before = await binder.readIndexes(model);
        const expected = require("../src/schemas/schemas").profile
          .enterpriseAccessAssignment.indexes.individual.normalizedEmail;
        assert.equal(
          ownerInspection.inspectClaimIndex(before, {
            fields: { normalizedEmail: 1 },
            options: expected.options,
          }).exactPartialUniqueClaimIndex,
          true,
        );
        assert.equal(
          binder.sameIndexes(before, await binder.readIndexes(model)),
          true,
        );
      } finally {
        await handle.client.close();
      }
    },
  );

  test("explicit bootstrap review preserves findings and consumes only fresh bounded owner evidence", async () => {
    const reviewed = assessmentFixture();
    reviewed.data.reviewRequired = true;
    reviewed.data.findings = [
      {
        code: "RSN_PROFILE_IDENTITY_NON_EMAIL_LOGIN_REVIEW",
        references: ["a".repeat(64)],
      },
    ];
    reviewed.data.bootstrapReview = {
      version: 1,
      disposition: "REVIEWED_SOURCE_MATCH",
      findingCount: 1,
      auditRecorded: true,
      reviewerDigest: "c".repeat(64),
      evidenceDigest: "d".repeat(64),
      reviewedAt: new Date().toISOString(),
      effects: false,
      qualificationGranted: false,
    };
    assert.throws(
      () => ownerInspection.projectAssessment(reviewed, Date.now()),
      /OWNER_ASSESSMENT_NOT_READY/,
    );
    const projected = ownerInspection.projectAssessment(
      reviewed,
      Date.now(),
      true,
    );
    assert.equal(projected.reviewRequired, true);
    assert.equal(projected.bootstrapReview.qualificationGranted, false);
    assert.equal(JSON.stringify(projected).includes("a".repeat(64)), false);
    for (const mutate of [
      (r) => {
        r.data.bootstrapReview.reviewedAt = new Date(0).toISOString();
      },
      (r) => {
        r.data.bootstrapReview.qualificationGranted = true;
      },
      (r) => {
        r.data.bootstrapReview.auditRecorded = false;
      },
      (r) => {
        r.data.bootstrapReview.evidenceDigest = "not-evidence";
      },
      (r) => {
        r.data.bootstrapReview.findingCount = 2;
      },
      (r) => {
        r.data.findings[0].code = "RSN_PROFILE_IDENTITY_SHARED_CREDENTIAL";
      },
      (r) => {
        r.data.bootstrapReview.disposition = "REVIEW_REQUIRED";
      },
      (r) => {
        r.data.reviewRequired = false;
      },
    ]) {
      const changed = structuredClone(reviewed);
      mutate(changed);
      assert.throws(
        () => ownerInspection.projectAssessment(changed, Date.now(), true),
        /OWNER_ASSESSMENT_NOT_READY/,
      );
    }
    const f = installedOwnerFixture();
    const previous = global.fetch;
    const challenge = "fixture_challenge." + "b".repeat(64);
    try {
      let requests = 0;
      global.fetch = async (url, request) => {
        requests++;
        assert.equal(
          url,
          "http://localhost:4300/nodics/profile/v0/identity/migration/assessment/bootstrap-review",
        );
        assert.equal(request.method, "POST");
        assert.deepEqual(JSON.parse(request.body), {
          confirmed: true,
          reviewToken: challenge,
        });
        return new Response(JSON.stringify(reviewed), {
          headers: { "content-type": "application/json" },
        });
      };
      const receipt = await ownerInspection.inspectInstalledOwners(
        f.context,
        "fixture-token-" + "a".repeat(32),
        async () => {
          f.calls.assessments++;
          const response = structuredClone(reviewed);
          response.data.bootstrapReview = {
            version: 1,
            disposition: "REVIEW_REQUIRED",
            findingCount: 1,
            reviewToken: challenge,
          };
          return response;
        },
        true,
      );
      assert.equal(requests, 1);
      assert.equal(receipt.registrationQualified, false);
      assert.equal(receipt.inventory.reviewRequired, true);
      assert.equal(f.calls.opened, 1);
      assert.equal(f.calls.closed, 1);
      assert.equal(JSON.stringify(receipt).includes(challenge), false);
    } finally {
      global.fetch = previous;
    }
  });

  test("inventory refusal prevents provider open; missing/drifting indexes and failed close cannot produce readiness", async () => {
    const f = installedOwnerFixture();
    await assert.rejects(
      ownerInspection.inspectInstalledOwners(f.context, "private", async () => {
        const response = assessmentFixture();
        response.data.reviewRequired = true;
        return response;
      }),
      /OWNER_ASSESSMENT_NOT_READY/,
    );
    assert.equal(f.calls.opened, 0);
    for (const variant of ["missing", "drift", "close"]) {
      const g = installedOwnerFixture();
      if (variant === "missing") g.indexes.splice(1);
      if (variant === "drift") {
        const read = g.context.indexReader.readIndexes;
        g.context.indexReader = {
          ...binder,
          /** Injects second-observation index drift without modifying the provider or installed index. */
          readIndexes: async function (model) {
            const result = await read.call(this, model);
            if (g.calls.indexReads === 2) result[1].name = "changed";
            return result;
          },
        };
      }
      if (variant === "close")
        g.handle.client.close = async () => {
          g.calls.closed++;
          throw Error("private diagnostic");
        };
      await assert.rejects(
        ownerInspection.inspectInstalledOwners(
          g.context,
          "private",
          g.assessment,
        ),
        new RegExp(
          variant === "close"
            ? "OWNER_CONNECTION_CLOSE_FAILED"
            : variant === "drift"
              ? "OWNER_INDEX_CHANGED"
              : "OWNER_CLAIM_INDEX_NOT_READY",
        ),
      );
      assert.equal(g.calls.closed, 1);
    }
  });

  test("operator proof is opaque bounded bearer syntax shared by CLI and transport", async () => {
    const previous = global.fetch;
    let requests = 0;
    try {
      const valid = [
        "a".repeat(32),
        "fixture-opaque._~+/" + "a".repeat(32) + "==",
        "a".repeat(131072),
      ];
      for (const token of valid) {
        ownerInspection.assertOperatorProof(token);
        global.fetch = async (_url, request) => {
          requests++;
          assert.equal(
            request.headers.Authorization === "Bearer " + token,
            true,
          );
          return new Response(JSON.stringify(assessmentFixture()), {
            headers: { "content-type": "application/json" },
          });
        };
        await ownerInspection.requestAssessment("http://localhost:4300", token);
      }
      const invalid = [
        undefined,
        null,
        42,
        "",
        "a".repeat(31),
        "a".repeat(131073),
      ];
      for (const suffix of [
        "\r",
        "\n",
        "\r\nX-Test: injected",
        "\0",
        "\t",
        " ",
        "\u007f",
        "\u0080",
        ":",
        ",",
        ";",
        '"',
        "\\",
        "=middle",
      ])
        invalid.push("a".repeat(32) + suffix);
      global.fetch = async () => {
        requests++;
        throw Error("Invalid proofs must not reach transport");
      };
      for (const token of invalid) {
        assert.throws(
          () => ownerInspection.assertOperatorProof(token),
          /OWNER_OPERATOR_PROOF_REQUIRED/,
        );
        await assert.rejects(
          ownerInspection.requestAssessment("http://localhost:4300", token),
          /OWNER_OPERATOR_PROOF_REQUIRED/,
        );
      }
      assert.equal(requests, valid.length);
      const cli = spawnSync(
        process.execPath,
        [
          __filename,
          "--installed-owner-read-only",
          "--project-root=/fixture/customer",
          "--environment=fixtureLocal",
          "--server=platformServer",
          "--origin=http://localhost:4300",
        ],
        {
          env: {
            ...process.env,
            NODICS_PROFILE_INSTALLED_OPERATOR_TOKEN:
              "a".repeat(32) + "\r\nX-Test: injected",
          },
          encoding: "utf8",
        },
      );
      assert.equal(cli.status, 1);
      assert.equal(cli.stdout, "");
      assert.deepEqual(JSON.parse(cli.stderr), {
        code: "OWNER_OPERATOR_PROOF_REQUIRED",
        registrationQualified: false,
        browserAccepted: false,
      });
    } finally {
      global.fetch = previous;
    }
  });

  test("native nAuth emitted access JWT with large claims survives runner syntax unchanged", async () => {
    const previous = {
      CONFIG: global.CONFIG,
      SERVICE: global.SERVICE,
      fetch: global.fetch,
    };
    try {
      const security = require(
        foundation + "nAuth/src/service/security/defaultAuthSecurityService",
      );
      const issuer = require(
        foundation +
          "nAuth/src/service/authentication/defaultAuthenticationProviderService",
      );
      const defaults = require(
        foundation + "nAuth/config/properties",
      ).authSecurity;
      const configuration = { authSecurity: structuredClone(defaults) };
      configuration.authSecurity.jwt.secret = randomUUID() + randomUUID();
      global.CONFIG = { get: (key) => configuration[key] };
      global.SERVICE = { DefaultAuthSecurityService: security };
      const token = issuer.generateAuthToken({
        tokenType: "access",
        loginId: "fixture-operator",
        tenant: "fixture",
        entCode: "fixture",
        permissions: Array.from(
          { length: 80 },
          (_, index) => "fixture.permission." + index + "." + "a".repeat(100),
        ),
      });
      assert.equal(typeof token === "string" && token.length > 8192, true);
      ownerInspection.assertOperatorProof(token);
      global.fetch = async (_url, request) => {
        assert.equal(request.headers.Authorization === "Bearer " + token, true);
        return new Response(JSON.stringify(assessmentFixture()), {
          headers: { "content-type": "application/json" },
        });
      };
      await ownerInspection.requestAssessment("http://localhost:4300", token);
    } finally {
      Object.assign(global, previous);
    }
  });

  test("real HTTP assessment transport binds fixed endpoint and bearer, refuses authentication and suppresses diagnostics", async () => {
    const previous = global.fetch;
    try {
      const token = "fixture-private-token-" + "a".repeat(40);
      let requests = 0;
      global.fetch = async (url, request) => {
        requests++;
        assert.equal(
          url,
          "http://localhost:4300/nodics/profile/v0/identity/migration/assessment",
        );
        assert.equal(request.method, "POST");
        assert.equal(request.body, "{}");
        assert.equal(request.redirect, "error");
        assert.equal(request.headers.Authorization, "Bearer " + token);
        return new Response(JSON.stringify(assessmentFixture()), {
          headers: { "content-type": "application/json" },
        });
      };
      assert.equal(
        (
          await ownerInspection.requestAssessment(
            "http://localhost:4300",
            token,
          )
        ).code,
        "SUC_SYS_00000",
      );
      assert.equal(requests, 1);
      global.fetch = async () =>
        new Response("private raw failure", { status: 403 });
      await assert.rejects(
        ownerInspection.requestAssessment("http://localhost:4300", token),
        /OWNER_ASSESSMENT_ADMISSION_REFUSED/,
      );
      global.fetch = async () => {
        throw Error("private provider/token detail");
      };
      await assert.rejects(
        ownerInspection.requestAssessment("http://localhost:4300", token),
        /OWNER_ASSESSMENT_TRANSPORT_REFUSED/,
      );
      await assert.rejects(
        ownerInspection.requestAssessment(
          "http://localhost:4300",
          "invalid\nproof",
        ),
        /OWNER_OPERATOR_PROOF_REQUIRED/,
      );
    } finally {
      global.fetch = previous;
    }
  });

  test("generated Profile owner composition receipt is explicitly source-only", (context) => {
    const receipt = qualifySourceComposition();
    assert.equal(receipt.installedOwnerQualified, false);
    assert.equal(receipt.browserAccepted, false);
    context.diagnostic(JSON.stringify(receipt));
  });

  test("qualification refuses installed database and shared auth scopes", () => {
    for (const value of [
      "kickoffLocalPlatform",
      "kickoffLocalRuntimeAuth",
      "auth",
      "",
      "nodics_profile_qualification_../platform",
    ])
      assert.throws(() => assertFixtureScope(value));
    assert.throws(() =>
      assertLocalEndpoint("mongodb://example.com:27017", "mongodb:"),
    );
    assert.throws(() =>
      assertLocalEndpoint("redis://example.com:6379", "redis:"),
    );
  });
  test(
    "installed MongoDB onboarding primitives in disposable scope",
    { skip: !process.env.NODICS_PROFILE_INSTALLED_MONGO_URI },
    async () => {
      owners();
      assertLocalEndpoint(
        process.env.NODICS_PROFILE_INSTALLED_MONGO_URI,
        "mongodb:",
      );
      global.ENUMS = {
        ContactType: Object.fromEntries(
          ["EMAIL", "PHONE", "FAX", "PAGER"].map((key) => [key, { key }]),
        ),
      };
      const namespace =
        "nodics_profile_qualification_" + randomUUID().replaceAll("-", "");
      const connection = await {
        ...connectionSource,
        LOG: logger,
      }.createConnection({
        URI: process.env.NODICS_PROFILE_INSTALLED_MONGO_URI,
        databaseName: namespace,
        options: { serverSelectionTimeoutMS: 5000 },
      });
      try {
        const claim = require("../src/schemas/schemas").profile
          .enterpriseAccessAssignment.indexes.individual.normalizedEmail;
        assert.deepEqual(await qualifyMongo(connection, namespace, claim), {
          casSingleWinner: true,
          staleRevisionRejected: true,
          exactReadback: true,
          partialClaimUnique: true,
          unclaimedMultiplicity: true,
          nativeWriterSingleAcknowledgement: true,
        });
      } finally {
        await connection.client.close();
      }
    },
  );
  test(
    "installed Redis onboarding primitives in disposable namespace",
    { skip: !process.env.NODICS_PROFILE_INSTALLED_REDIS_URL },
    async () => {
      owners();
      assertLocalEndpoint(
        process.env.NODICS_PROFILE_INSTALLED_REDIS_URL,
        "redis:",
      );
      const namespace =
        "nodics_profile_qualification_" + randomUUID().replaceAll("-", "");
      const response = await { ...redisEngine, LOG: logger }.initCache(
        {
          options: {
            url: process.env.NODICS_PROFILE_INSTALLED_REDIS_URL,
            prefix: namespace,
          },
        },
        "profile",
      );
      try {
        assert.deepEqual(await qualifyRedis(response.result, namespace), {
          consumeSingleWinner: true,
          distributedLimitBounded: true,
          stampMonotonic: true,
        });
      } finally {
        await response.result.quit();
      }
    },
  );
  test("membership stamp worker rejects unsafe fixture selections before connecting", () => {
    const probe = require("./helpers/installedMembershipStampProbe");
    const selected = {
      action: "current",
      endpoint: "redis://127.0.0.1:6379",
      namespace: "nodics_profile_qualification_" + "a".repeat(32),
    };
    assert.doesNotThrow(() => probe.admit(selected));
    for (const change of [
      { namespace: "installed-profile-auth" },
      { action: "flush-all" },
      { endpoint: "redis://example.com:6379" },
      { endpoint: "redis://user:secret@localhost:6379" },
      { endpoint: "redis://localhost:6379/1" },
      { endpoint: "redis://localhost:6379?key=other" },
      { arbitraryKey: "securityStamp:other" },
    ])
      assert.throws(() => probe.admit({ ...selected, ...change }));
  });

  test(
    "installed Redis membership invalidation crosses processes without affecting another membership",
    {
      skip: !process.env.NODICS_PROFILE_INSTALLED_REDIS_URL,
    },
    () => {
      const namespace =
        "nodics_profile_qualification_" + randomUUID().replaceAll("-", "");
      const worker = require.resolve("./helpers/installedMembershipStampProbe");
      const processes = new Set();
      const execute = (action) => {
        const child = spawnSync(process.execPath, [worker], {
          input: JSON.stringify({
            action,
            namespace,
            endpoint: process.env.NODICS_PROFILE_INSTALLED_REDIS_URL,
          }),
          env: { PATH: process.env.PATH, HOME: process.env.HOME },
          encoding: "utf8",
          timeout: 10000,
          maxBuffer: 65536,
        });
        assert.equal(
          child.error,
          undefined,
          "stamp worker must finish within its deadline",
        );
        assert.equal(child.status, 0, `stamp ${action} probe must pass`);
        const result = JSON.parse(child.stdout);
        assert.equal(result.action, action);
        assert.equal(result.passed, true);
        assert(Number.isSafeInteger(result.pid) && result.pid > 0);
        assert(
          !processes.has(result.pid),
          "each probe must use an independent process",
        );
        processes.add(result.pid);
      };
      try {
        for (const action of [
          "seed",
          "current",
          "advance",
          "isolated",
          "regression",
          "missing",
        ])
          execute(action);
      } finally {
        execute("cleanup");
      }
      assert.equal(processes.size, 7);
    },
  );
}
module.exports = {
  assertFixtureScope,
  assertLocalEndpoint,
  qualifyMongo,
  qualifyRedis,
  qualifySourceComposition,
  ownerInspection,
};

/** Executes isolated read-only inspection without leaking captured loader/provider diagnostics or running primitive write tests. @returns {Promise<void>} Emits one sanitized receipt or refusal. */
async function runOwnerCli() {
  const mode = process.argv[2];
  try {
    if (!["--installed-owner-read-only", "--installed-owner-read-only-worker"].includes(mode))
      throw Object.assign(Error(), { code: "OWNER_SELECTION_INVALID" });
    if (mode === "--installed-owner-read-only-worker" &&
      process.env.NODICS_PROFILE_INSTALLED_OWNER_WORKER !== "READ_ONLY_PARENT")
      throw Object.assign(Error(), { code: "OWNER_WORKER_REFUSED" });
    const options = ownerInspection.parseOptions(process.argv.slice(3));
    const token = process.env.NODICS_PROFILE_INSTALLED_OPERATOR_TOKEN;
    ownerInspection.assertOperatorProof(token);
    if (mode === "--installed-owner-read-only-worker") {
      const context = await ownerInspection.loadContext(options);
      const receipt = await ownerInspection.inspectInstalledOwners(context, token, undefined, options.confirmBootstrapReview === true);
      process.stdout.write("PROFILE_OWNER_RECEIPT:" + JSON.stringify(receipt) + "\n");
      process.exit(0);
    }
    const env = { ...process.env };
    env.NODICS_PROFILE_INSTALLED_OWNER_WORKER = "READ_ONLY_PARENT";
    delete env.NODICS_PROFILE_INSTALLED_MONGO_URI;
    delete env.NODICS_PROFILE_INSTALLED_REDIS_URL;
    const worker = spawnSync(process.execPath, [__filename, "--installed-owner-read-only-worker", ...process.argv.slice(3)], {
      env, encoding: "utf8", timeout: 60000, maxBuffer: 1024 * 1024,
    });
    const lines = (worker.stdout || "").split("\n");
    if (worker.error || worker.status !== 0) {
      const refusal = lines.findLast((line) => /^PROFILE_OWNER_REFUSAL:OWNER_[A-Z_]+$/.test(line));
      throw Object.assign(Error(), { code: refusal?.split(":")[1] || "OWNER_WORKER_REFUSED" });
    }
    const encoded = lines.filter((line) => line.startsWith("PROFILE_OWNER_RECEIPT:"));
    if (encoded.length !== 1) throw Object.assign(Error(), { code: "OWNER_WORKER_REFUSED" });
    const receipt = JSON.parse(encoded[0].slice("PROFILE_OWNER_RECEIPT:".length));
    if (receipt.kind !== "PROFILE_INSTALLED_ONBOARDING_PREREQUISITES" || receipt.registrationQualified !== false || receipt.browserAccepted !== false)
      throw Object.assign(Error(), { code: "OWNER_WORKER_REFUSED" });
    process.stdout.write(JSON.stringify(receipt) + "\n");
  } catch (error) {
    const code = ownerInspection.sanitizeRefusal(error);
    if (mode === "--installed-owner-read-only-worker") {
      process.stdout.write("PROFILE_OWNER_REFUSAL:" + code + "\n");
      process.exit(1);
    }
    process.stderr.write(JSON.stringify({ code, registrationQualified: false, browserAccepted: false }) + "\n");
    process.exitCode = 1;
  }
}
if (ownerCli) runOwnerCli();
