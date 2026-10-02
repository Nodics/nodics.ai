/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";

/**
 * @module profile/test/enterpriseLifecycleCustomization
 * @description Verifies effective receiver overrides without copying lifecycle implementations.
 * @owner profile
 * @layer test
 */
const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const registration = require("../src/service/enterprise/defaultEnterpriseRegistrationService");
const recovery = require("../src/service/employee/defaultEmployeeRecoveryService");
const saved = {
  SERVICE: global.SERVICE,
  CLASSES: global.CLASSES,
  ENUMS: global.ENUMS,
};
afterEach(() => {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete global[key];
    else global[key] = value;
  }
});

test("layered lifecycle enums preserve wire keys and adding a key grants no command", async () => {
  const Enum = require("../../../../nodics.foundation/modules/nConfig/bin/enum");
  const enumService = require("../../../../nodics.foundation/modules/nConfig/src/service/defaultEnumService");
  const definitions = require("../src/utils/enums");
  const expected = {
    ProfileEmployeeAccessStage: [
      "VERIFY_EMAIL",
      "RESOLVING",
      "DETAILS",
      "RECOVERY",
      "EXISTING_ACCOUNT",
      "SIGN_IN",
      "NO_INVITATION",
      "COMPLETE",
      "APPLICATION_DETAILS",
      "APPLICATION_PENDING",
      "APPLICATION_APPROVED",
      "APPLICATION_REJECTED",
      "APPLICATION_CLOSED",
      "RESET_PASSWORD",
      "RESETTING",
      "ACCOUNT_UNAVAILABLE",
    ],
    ProfileEmployeeAccessOperation: [
      "START",
      "VERIFY",
      "RESEND",
      "COMPLETE",
      "STATUS",
      "APPLY",
      "WITHDRAW_APPLICATION",
    ],
    ProfileRegistrationPhase: [
      "PREPARED",
      "CREDENTIAL",
      "ACTIVATING",
      "COMPLETE",
    ],
    ProfileEmployeeApplicationStatus: [
      "APPLICATION_DRAFT",
      "AWAITING_REVIEW",
      "APPROVED",
      "REJECTED",
      "REGISTERED",
      "WITHDRAWN",
      "EXPIRED",
    ],
    ProfileApplicationReviewOperation: [
      "RETRY_REVIEW_START",
      "RETRY_NOTIFICATION",
      "RETRY_REVIEW_RETIREMENT",
    ],
    ProfileEmployeeNotificationStatus: [
      "PENDING",
      "REQUESTED",
      "NOT_REQUESTED",
      "UNAVAILABLE",
      "UNCONFIRMED",
    ],
    ProfileApplicationReviewStatus: ["STARTED", "NOT_CONFIRMED"],
  };
  global.ENUMS = {};
  for (const [name, keys] of Object.entries(expected)) {
    assert.deepEqual(definitions[name].definition, keys);
    const extended = {
      ...definitions[name],
      definition: [...keys, "PROJECT_ONLY"],
    };
    const enumeration = new Enum(
      extended.definition,
      enumService.createEnumOptions(name, extended),
    );
    for (const key of keys) assert.equal(enumeration[key].key, key);
    assert.equal(enumeration.PROJECT_ONLY.key, "PROJECT_ONLY");
    assert.deepEqual(definitions[name].definition, keys);
    global.ENUMS[name] = enumeration;
  }
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  const owner = {
    ...registration,
    context: async () => {
      throw new Error("Must reject before admission");
    },
  };
  await assert.rejects(owner.execute({}, "PROJECT_ONLY"), {
    code: "ERR_PROFILE_REG_INPUT",
  });
});

test("registration store uses later clock and cache-key helpers without renewing lifetime", async () => {
  const calls = [];
  global.SERVICE = {
    DefaultAuthenticationProviderService: {
      addToken: async (...args) => {
        calls.push(args);
      },
    },
  };
  const owner = {
    ...registration,
    now: () => 10000,
    cacheKey: (token) => "custom:" + token,
  };
  const session = { expiresAt: 15500 };
  await owner.store("private-handle", session);
  assert.deepEqual(calls, [
    ["profile", true, "custom:private-handle", session, 5],
  ]);
});

test("recovery delegates shared storage with the effective recovery receiver", async () => {
  const calls = [];
  global.SERVICE = {
    DefaultEnterpriseRegistrationService: registration,
    DefaultAuthenticationProviderService: {
      addToken: async (...args) => {
        calls.push(args);
      },
    },
  };
  const owner = { ...recovery, now: () => 3000, digest: () => "custom-digest" };
  const session = { expiresAt: 8000 };
  await owner.store("a".repeat(43), session);
  assert.deepEqual(calls, [
    ["profile", true, "employee-recovery:custom-digest", session, 5],
  ]);
  assert.equal(
    registration.cacheKey.call(
      { ...registration, digest: owner.digest },
      "a".repeat(43),
    ),
    "enterprise-registration:custom-digest",
  );
});

test("customized recovery storage still rejects expired continuations before writing", async () => {
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  let writes = 0;
  global.SERVICE = {
    DefaultEnterpriseRegistrationService: registration,
    DefaultAuthenticationProviderService: {
      addToken: async () => {
        writes++;
      },
    },
  };
  const owner = {
    ...recovery,
    now: () => 10000,
    digest: () => "custom-digest",
  };
  await assert.rejects(owner.store("a".repeat(43), { expiresAt: 10000 }), {
    code: "ERR_PROFILE_RECOVERY_CONTINUATION",
  });
  assert.equal(writes, 0);
});
