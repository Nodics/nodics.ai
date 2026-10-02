/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module profile/test/enterpriseApplicationReviewRecovery
 * @description Exercises review correlation, notification idempotency and operator recovery with controlled owner fixtures.
 * @owner profile @layer test No runtime, database, SMTP or browser acceptance is asserted.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const Enum = require("../../../../nodics.foundation/modules/nConfig/bin/enum");
global.ENUMS = Object.fromEntries(
  Object.entries(require("../src/utils/enums")).map(([name, definition]) => [
    name,
    new Enum(definition.definition, definition._options),
  ]),
);
const original = require("../src/service/enterprise/defaultEnterpriseApplicationReviewService");
const management = require("../src/service/enterprise/defaultEnterpriseManagementService");
const intake = require("../src/service/enterprise/defaultEnterpriseApplicationService");
const digest = management.commandDigest.bind(management);

test("historical retirement selects stored closure and never current approval or browser Process handles", async () => {
  const f = fixture();
  const prior = structuredClone(f.record.application);
  prior.attempt = 1;
  prior.closedFromRevision = 2;
  prior.closedAt = "2026-09-30T02:00:00.000Z";
  delete prior.review.decision;
  delete prior.review.decisionHash;
  f.record.application.attempt = 2;
  f.record.application.requestHash = "d".repeat(64);
  f.record.application.history = [
    { application: prior, status: "WITHDRAWN", revision: 3 },
  ];
  f.record.revision = 7;
  f.policy.retirementQualified = true;
  CONFIG.get = (key) =>
    key === "enterpriseManagement"
      ? { applications: { review: f.policy } }
      : "default";
  SERVICE.DefaultModuleService.invokeModule = async (command) => {
    f.sent.push(command);
    return {
      result: { status: "RETIRED", instanceCode: prior.review.instanceCode },
    };
  };
  const snapshot = structuredClone(f.record);
  assert.deepEqual(await f.owner.retireClosedReview(f.record, 1), {
    status: "RETIRED",
    attempt: 1,
  });
  assert.equal(f.sent[0].requestBody.instanceCode, prior.review.instanceCode);
  assert.equal(f.sent[0].requestBody.context.requestHash, prior.requestHash);
  assert.equal(f.sent[0].maxAttempts, 1);
  assert.deepEqual(f.record, snapshot);
  assert.equal(f.writes, 0);
  assert.throws(() => f.owner.retirementAttempt(f.record, 2));
  assert.throws(() => f.owner.retirementAttempt(f.record, "1"));
  const inspection = f.owner.retirementInspection(f.record);
  assert.deepEqual(Object.keys(inspection[0]).sort(), [
    "attempt",
    "canRetireReview",
    "closedAt",
    "reviewStarted",
    "status",
  ]);
  f.record.application.history.push(
    structuredClone(f.record.application.history[0]),
  );
  assert.throws(() => f.owner.retirementAttempt(f.record, 1));
});

test("closed review retirement remains disabled and read-only without qualification", async () => {
  const f = fixture();
  assert.deepEqual(await f.owner.retireClosedReview(f.record, 1), {
    status: "DISABLED",
  });
  assert.equal(f.sent.length, 0);
  assert.equal(f.writes, 0);
});

test("late Process start reconciles a superseded closed attempt without marking the new attempt started", async () => {
  const f = fixture();
  f.record.status = "AWAITING_REVIEW";
  f.record.application.review.started = false;
  delete f.record.application.review.decision;
  delete f.record.application.review.decisionHash;
  f.owner.assertSource = async () => ({});
  const original = structuredClone(f.record);
  let reconciled;
  SERVICE.DefaultEnterpriseApplicationService = {
    ...intake,
    reconcileClosedReview: async (record, attempt) => {
      reconciled = { revision: record.revision, attempt };
      return { status: "DISABLED" };
    },
  };
  SERVICE.DefaultModuleService.invokeModule = async (command) => {
    const prior = structuredClone(original.application);
    prior.closedAt = "2026-09-30T02:00:00.000Z";
    prior.closedFromRevision = 3;
    f.record.revision = 5;
    f.record.application = {
      ...f.record.application,
      attempt: 2,
      requestHash: "e".repeat(64),
      history: [{ status: "WITHDRAWN", revision: 4, application: prior }],
    };
    delete f.record.application.review;
    return {
      result: {
        instance: {
          code: original.application.review.instanceCode,
          definitionCode: original.application.review.definitionCode,
          version: 1,
          startCompleted: true,
          context: command.requestBody.context,
        },
      },
    };
  };
  const result = await f.owner.resumeStart(original);
  assert.deepEqual(reconciled, { revision: 5, attempt: 1 });
  assert.equal(result.application.attempt, 2);
  assert.equal(result.application.review, undefined);
  assert.equal(f.writes, 0);
});

test("acknowledged retirement with changed source history is unconfirmed, never a second domain write", async () => {
  const f = fixture();
  f.record.status = "WITHDRAWN";
  f.record.application.closedFromRevision = 2;
  f.record.application.closedAt = "2026-09-30T02:00:00.000Z";
  f.policy.retirementQualified = true;
  CONFIG.get = (key) =>
    key === "enterpriseManagement"
      ? { applications: { review: f.policy } }
      : "default";
  SERVICE.DefaultModuleService.invokeModule = async () => {
    f.record.application.closedAt = "2026-10-01T00:00:00.000Z";
    return {
      result: {
        status: "RETIRED",
        instanceCode: f.record.application.review.instanceCode,
      },
    };
  };
  assert.deepEqual(
    await f.owner.retireClosedReview(structuredClone(f.record)),
    { status: "UNCONFIRMED" },
  );
  assert.equal(f.writes, 0);
});

test("historical retirement rejects altered stored correlation before transport", async () => {
  const f = fixture();
  f.record.status = "EXPIRED";
  f.record.application.closedFromRevision = 2;
  f.record.application.closedAt = "2026-09-30T02:00:00.000Z";
  f.record.application.review.instanceCode = "browser-picked";
  f.policy.retirementQualified = true;
  CONFIG.get = (key) =>
    key === "enterpriseManagement"
      ? { applications: { review: f.policy } }
      : "default";
  await assert.rejects(f.owner.retireClosedReview(f.record));
  assert.equal(f.sent.length, 0);
});

function fixture() {
  const mail = {
    enabled: true,
    connectionName: "commsApi",
    templateCode: "profile.employee.applicationOutcome",
    purpose: "EMPLOYEE_APPLICATION_OUTCOME",
    locale: "en",
    approvedNextStep: "Complete account setup.",
    rejectedNextStep: "Contact your administrator.",
  };
  const policy = {
    enabled: true,
    definitionCode: "profileEmployeeApplicationReview",
    definitionVersion: 1,
    connectionName: "process",
    timeoutMilliseconds: 10000,
    decisionPermission: "profile.enterpriseAccess.assign",
    mail,
  };
  const sent = [],
    captured = new WeakSet();
  let writes = 0;
  const code = management.assignmentCode("example", "maya@example.test");
  const application = {
    firstName: "Maya",
    lastName: "Example",
    note: "",
    enterpriseName: "Example enterprise",
    policyDigest: digest(["PASSWORD", "OPERATOR", ["axisViewerUserGroup"]]),
    submittedAt: "2026-09-30T00:00:00.000Z",
  };
  application.requestHash = digest([
    code,
    application.policyDigest,
    {
      firstName: application.firstName,
      lastName: application.lastName,
      note: application.note,
    },
  ]);
  const decision = {
    approved: true,
    actor: "reviewer@example.test",
    reason: "",
    taskCode: "review-task",
    decidedAt: "2026-09-30T01:00:00.000Z",
  };
  application.review = {
    instanceCode:
      "employeeApplicationReview_" +
      digest([code, application.requestHash, policy.definitionCode, 1]),
    definitionCode: policy.definitionCode,
    version: 1,
    requestHash: application.requestHash,
    enterpriseCode: "example",
    tenantCode: "example-tenant",
    started: true,
    decision,
    decisionHash: digest([
      application.requestHash,
      decision.taskCode,
      decision.actor,
      true,
      "",
    ]),
  };
  let record = {
    code,
    normalizedEmail: "maya@example.test",
    email: "maya@example.test",
    enterpriseCode: "example",
    tenantCode: "example-tenant",
    roleCode: "OPERATOR",
    groupCodes: ["axisViewerUserGroup"],
    origin: "SELF_APPLICATION",
    status: "APPROVED",
    active: true,
    revision: 3,
    application,
  };
  const base = {
    digest,
    now: () => Date.parse("2026-09-30T02:00:00.000Z"),
    input: (value, allowed) => {
      if (!value || Object.keys(value).some((key) => !allowed.includes(key)))
        throw new Error("invalid input");
    },
  };
  const owner = {
    ...original,
    base: () => base,
    settings: () => policy,
    read: async () => structuredClone(record),
    change: async (current, review, patch = {}) => {
      assert.equal(current.revision, record.revision);
      writes++;
      record = {
        ...record,
        ...patch,
        revision: record.revision + 1,
        application: { ...record.application, review: structuredClone(review) },
      };
      return structuredClone(record);
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
  global.CONFIG = {
    get: (key) =>
      key === "defaultTenant" || key === "defaultEnterprise"
        ? "default"
        : undefined,
  };
  global.SERVICE = {
    DefaultLoggerService: {
      runSensitiveOperation: async (request, operation) => {
        captured.add(request);
        try {
          return await operation();
        } finally {
          captured.delete(request);
        }
      },
      assertSensitiveRequest: (request) => {
        assert.equal(captured.has(request), true);
      },
    },
    DefaultEnterpriseManagementService: management,
    DefaultEnterpriseApplicationService: intake,
    DefaultModuleService: {
      invokeModule: async (command) => {
        if (command.apiName === "/internal/communications") {
          SERVICE.DefaultLoggerService.assertSensitiveRequest(command.request);
          assert.equal(captured.has({ ...command.request }), false);
          assert.deepEqual(command.secureTransport, {
            required: true,
            allowInsecureLoopback: false,
          });
          assert.equal(command.followRedirects, false);
          assert.equal(command.maxAttempts, 1);
        }
        sent.push(structuredClone(command));
        return {
          result: { intentCode: "COMM_" + "b".repeat(64), status: "ACCEPTED" },
        };
      },
    },
  };
  return {
    owner,
    policy,
    sent,
    get record() {
      return record;
    },
    get writes() {
      return writes;
    },
  };
}

test("review correlation retains its pinned definition after a later selection change", () => {
  const f = fixture();
  f.policy.definitionVersion = 9;
  assert.equal(f.owner.correlation(f.record).version, 1);
  assert.equal(
    f.owner.correlation(f.record).instanceCode,
    f.record.application.review.instanceCode,
  );
});
test("approved corrected attempts validate their attempt-bound hash, not the original submission hash", () => {
  const f = fixture(),
    record = structuredClone(f.record),
    a = record.application;
  a.attempt = 2;
  a.requestHash = digest([
    record.code,
    a.policyDigest,
    { firstName: a.firstName, lastName: a.lastName, note: a.note },
    2,
  ]);
  a.review.requestHash = a.requestHash;
  a.review.instanceCode =
    "employeeApplicationReview_" +
    digest([
      record.code,
      a.requestHash,
      a.review.definitionCode,
      a.review.version,
    ]);
  a.review.decisionHash = digest([
    a.requestHash,
    a.review.decision.taskCode,
    a.review.decision.actor,
    true,
    "",
  ]);
  assert.equal(f.owner.assertApprovedAssignment(record), true);
  assert.equal(f.owner.assertDecisionRecord(record).approved, true);
  a.attempt = 3;
  assert.throws(() => f.owner.assertApprovedAssignment(record));
});
test("notification stores the existing intent once without changing the decision", async () => {
  const f = fixture(),
    decisionHash = f.record.application.review.decisionHash;
  assert.equal(await f.owner.requestNotification(f.record), "ACCEPTED");
  assert.equal(await f.owner.requestNotification(f.record), "ACCEPTED");
  assert.equal(f.sent.length, 1);
  assert.equal(f.writes, 2);
  assert.equal(f.record.application.review.decisionHash, decisionHash);
  assert.equal(f.record.status, "APPROVED");
  assert.equal(f.sent[0].maxAttempts, 1);
  assert.equal(
    f.record.application.review.notification.intentCode,
    "COMM_" + "b".repeat(64),
  );
});
test("unconfirmed delivery preserves the original message across a later copy change", async () => {
  const f = fixture();
  let attempts = 0;
  SERVICE.DefaultModuleService.invokeModule = async (command) => {
    f.sent.push(structuredClone(command));
    if (++attempts === 1) throw new Error("lost response");
    return {
      result: { intentCode: "COMM_" + "c".repeat(64), status: "ACCEPTED" },
    };
  };
  assert.equal(await f.owner.requestNotification(f.record), "UNCONFIRMED");
  f.policy.mail.approvedNextStep = "Different later text.";
  assert.equal(await f.owner.requestNotification(f.record), "ACCEPTED");
  assert.deepEqual(f.sent[0].requestBody, f.sent[1].requestBody);
  assert.equal(
    f.record.application.review.notification.message.variables.nextStep,
    "Complete account setup.",
  );
});
test("mail disabled does not create an intent or rewrite an approval", async () => {
  const f = fixture();
  f.policy.mail.enabled = false;
  assert.equal(await f.owner.requestNotification(f.record), "NOT_REQUESTED");
  assert.equal(f.writes, 0);
  assert.equal(f.sent.length, 0);
});
test("registered applicant is not sent obsolete setup instructions", async () => {
  const f = fixture();
  f.record.status = "REGISTERED";
  assert.equal(await f.owner.requestNotification(f.record), "NOT_REQUESTED");
  assert.equal(f.sent.length, 0);
});
test("altered decision evidence prevents sending", async () => {
  const f = fixture();
  f.record.application.review.decision.actor = "maya@example.test";
  assert.equal(await f.owner.requestNotification(f.record), "UNCONFIRMED");
  assert.equal(f.writes, 0);
  assert.equal(f.sent.length, 0);
});
test("operator endpoint cannot directly approve an application", async () => {
  const f = fixture();
  await assert.rejects(
    f.owner.manage({
      params: { applicationCode: f.record.code },
      body: { operation: "APPROVE", revision: 3 },
    }),
  );
  assert.equal(f.writes, 0);
  assert.equal(f.sent.length, 0);
});
test("operator endpoint rejects an arbitrary recipient before sending", async () => {
  const f = fixture();
  await assert.rejects(
    f.owner.manage({
      params: { applicationCode: f.record.code },
      body: {
        operation: "RETRY_NOTIFICATION",
        revision: 3,
        recipient: "other@example.test",
      },
    }),
  );
  assert.equal(f.sent.length, 0);
});
for (const [name, enterprise, revision] of [
  ["another enterprise", "other", 3],
  ["stale revision", "example", 2],
]) {
  test("operator retry rejects " + name, async () => {
    const f = fixture();
    SERVICE.DefaultEnterpriseApplicationService = {
      ...intake,
      reviewEnterprise: () => enterprise,
    };
    SERVICE.DefaultSecuredRequestPipelineService = {
      getGrantedPermissions: () => ["profile.enterpriseAccess.assign"],
      getRouteActionAuthorizationConfig: () => ({}),
      isPermissionGranted: (permission, granted) =>
        granted.includes(permission),
    };
    await assert.rejects(
      f.owner.manage({
        params: { applicationCode: f.record.code },
        body: { operation: "RETRY_NOTIFICATION", revision },
      }),
    );
    assert.equal(f.writes, 0);
    assert.equal(f.sent.length, 0);
  });
}
test("authorised notification recovery returns only projected evidence", async () => {
  const f = fixture();
  SERVICE.DefaultEnterpriseApplicationService = {
    ...intake,
    reviewEnterprise: () => "example",
  };
  SERVICE.DefaultSecuredRequestPipelineService = {
    getGrantedPermissions: () => ["profile.enterpriseAccess.assign"],
    getRouteActionAuthorizationConfig: () => ({}),
    isPermissionGranted: (permission, granted) => granted.includes(permission),
  };
  const result = await f.owner.manage({
    tenant: "example-tenant",
    authData: { tenant: "example-tenant", entCode: "example" },
    params: { applicationCode: f.record.code },
    body: { operation: "RETRY_NOTIFICATION", revision: 3 },
  });
  assert.equal(result.revision, 5);
  assert.equal(result.notificationStatus, "ACCEPTED");
  assert.equal(result.status, "APPROVED");
  assert.equal(result.application, undefined);
  assert.equal(result.decisionHash, undefined);
  assert.equal(result.message, undefined);
  assert.equal(f.sent.length, 1);
});
test("malformed persisted notification evidence is not reported as accepted", async () => {
  const f = fixture();
  f.record.application.review.notification = {
    intentCode: "unexpected",
    status: "ACCEPTED",
  };
  assert.equal(await f.owner.requestNotification(f.record), "UNCONFIRMED");
  assert.equal(f.sent.length, 0);
});
test("authorised registered-applicant recovery projects completion without sending or writing", async () => {
  const f = fixture();
  f.record.status = "REGISTERED";
  SERVICE.DefaultEnterpriseApplicationService = {
    ...intake,
    reviewEnterprise: () => "example",
  };
  SERVICE.DefaultSecuredRequestPipelineService = {
    getGrantedPermissions: () => ["profile.enterpriseAccess.assign"],
    getRouteActionAuthorizationConfig: () => ({}),
    isPermissionGranted: (permission, granted) => granted.includes(permission),
  };
  const result = await f.owner.manage({
    tenant: "example-tenant",
    authData: { tenant: "example-tenant", entCode: "example" },
    params: { applicationCode: f.record.code },
    body: { operation: "RETRY_NOTIFICATION", revision: 3 },
  });
  assert.equal(result.status, "REGISTERED");
  assert.equal(result.revision, 3);
  assert.equal(result.notificationStatus, "NOT_REQUESTED");
  assert.equal(
    result.reviewInstanceCode,
    f.record.application.review.instanceCode,
  );
  assert.equal(result.application, undefined);
  assert.equal(result.tenantCode, undefined);
  assert.equal(result.normalizedEmail, undefined);
  assert.equal(f.sent.length, 0);
  assert.equal(f.writes, 0);
});
test("application projection still rejects drafts and unsupported lifecycle states", () => {
  const f = fixture();
  for (const status of ["APPLICATION_DRAFT", "PENDING", "REVOKED", "UNKNOWN"]) {
    assert.throws(() => intake.projectRecord({ ...f.record, status }), {
      code: "ERR_PROFILE_APP_CONFLICT",
    });
  }
});
test("review workspace remains visible when intake is paused without mutating shared metadata", () => {
  fixture();
  const capability = require("../src/service/defaultProfileBackofficeCapabilityService");
  const config = {
    workspace: { tabs: [] },
    applications: {
      enabled: false,
      review: { enabled: true },
      reviewWorkspace: { id: "employee-applications", sections: [] },
    },
  };
  CONFIG.get = (key) => (key === "enterpriseManagement" ? config : undefined);
  const first = capability
    .getCapability()
    .navigation.find((item) => item.id === "enterprises");
  assert.equal(first.backendWorkspace.tabs[0].id, "employee-applications");
  assert.deepEqual(config.workspace.tabs, []);
  config.applications.review.enabled = false;
  const second = capability
    .getCapability()
    .navigation.find((item) => item.id === "enterprises");
  assert.deepEqual(second.backendWorkspace.tabs, []);
});
