/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
/** @module profile/test/passwordWriterRevisionContract @description Deferred actual Password writer policy, recovery acknowledgement and bootstrap original-reference fixtures; no installed or behavioral qualification. @layer test @owner profile */
const test = require("node:test");
const assert = require("node:assert/strict");
const writer = require("../src/service/interceptors/defaultPasswordSaveInterceptorService");
const concurrency = require("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelConcurrencyService");
const recovery = require("../src/service/employee/defaultEmployeeRecoveryService");

function fixture() {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  const schema = {
    definition: { revision: { type: "long" } },
    backoffice: { concurrency: { managed: true, field: "revision" } },
    credentialRetirement: {
      enabled: false,
      writerCoverageQualified: false,
      revisionField: "revision",
      credentialField: "password",
      activeField: "active",
      evidenceField: "identityLinkRetirement",
    },
  };
  const row = {
    _id: "credential-id",
    code: "original-code",
    loginId: "person@example.test",
    active: true,
    revision: 4,
    password: "old-hash",
  };
  global.CONFIG = {
    get: (key) => (key === "defaultTenant" ? "original" : undefined),
  };
  global.NODICS = {
    getModels: (module, tenant) => {
      assert.equal(module, "profile");
      assert.equal(tenant, "original");
      return { PasswordModel: { rawSchema: schema } };
    },
  };
  global.SERVICE = {
    DefaultProfileService: { getProfileModuleName: () => "profile" },
    DefaultPasswordSaveInterceptorService: { ...writer },
    DefaultModelConcurrencyService: { ...concurrency },
    DefaultPrincipalSecurityStampGovernanceService: require("../src/service/identity/defaultPrincipalSecurityStampGovernanceService"),
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ system: true }),
    },
  };
  return { schema, row };
}

test("writer policy uses the actual prepared model and disabled legacy mode does not infer record counters", () => {
  const f = fixture();
  assert.deepEqual(writer.mutationQuery("original", f.row), {
    _id: "credential-id",
    code: "original-code",
    loginId: "person@example.test",
    revision: 4,
    active: true,
    identityLinkRetirement: { $exists: false },
  });
  f.schema.backoffice.concurrency.managed = false;
  f.row.revision = 99;
  f.row.active = false;
  assert.equal(writer.mutationQuery("original", f.row), undefined);
  global.NODICS.getModels = () => ({});
  assert.throws(() => writer.managedPolicy("original"), /ERR_CONCURRENCY/);
});

test("configured writers reject retired/inactive/missing-token/overflowing original credentials", () => {
  for (const variant of ["retired", "inactive", "missing-token", "overflow"]) {
    const f = fixture();
    if (variant === "retired") f.row.identityLinkRetirement = {};
    if (variant === "inactive") f.row.active = false;
    if (variant === "missing-token") delete f.row.revision;
    if (variant === "overflow") f.row.revision = Number.MAX_SAFE_INTEGER;
    assert.throws(
      () => writer.mutationQuery("original", f.row),
      /ERR_CONCURRENCY/,
    );
  }
});

test("recovery cannot acknowledge a competing or pre-write same-password state as its own reset", async () => {
  for (const variant of [
    "matching",
    "not-written",
    "competing-version",
    "missing-original",
    "changed-id",
  ]) {
    const f = fixture();
    f.row.revision =
      variant === "not-written" ? 4 : variant === "competing-version" ? 6 : 5;
    if (variant === "changed-id") f.row._id = "other-id";
    const session = {
      identity: { tenant: "original", authVersion: 1 },
      passwordMutation: {
        credentialId: "credential-id",
        code: "original-code",
        revision: 4,
      },
    };
    if (variant === "missing-original") delete session.passwordMutation;
    let stamps = 0;
    SERVICE.DefaultPrincipalSecurityStampService = {
      register: async () => {
        stamps++;
      },
      validate: async () => {},
    };
    global.UTILS = { compareHash: async () => true };
    global.ENUMS = {
      ProfileEmployeeAccessStage: { COMPLETE: { key: "COMPLETE" } },
      ProfileEmployeeNotificationStatus: {
        REQUESTED: { key: "REQUESTED" },
        UNAVAILABLE: { key: "UNAVAILABLE" },
      },
    };
    const owner = {
      ...recovery,
      fail: () => {
        throw Error("closed");
      },
      current: async () => ({
        person: { loginId: f.row.loginId, authVersion: 2 },
        credential: f.row,
      }),
      confirmation: async () => {},
      now: () => 1,
      project: (value) => value,
    };
    if (variant === "matching") {
      assert.equal(
        (await owner.confirmReset({}, session, "proof")).stage,
        "COMPLETE",
      );
      assert.equal(stamps, 1);
    } else {
      await assert.rejects(owner.confirmReset({}, session, "proof"), /closed/);
      assert.equal(stamps, 0);
    }
  }
});
