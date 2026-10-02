/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
/** @module profile/test/enterpriseNotificationContract @description Injected lifecycle notification fixtures; not provider delivery or runtime qualification. @layer test @owner profile */
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const source = require("../src/service/enterprise/defaultEnterpriseNotificationService");
/** Supplies an isolated assignment owner and one uncertain Communication response. */
function fixture() {
  const privateEntries = new WeakSet();
  global.CLASSES = { NodicsError: class extends Error {} };
  const item = {
    code: "assignment",
    revision: 3,
    active: true,
    status: "PENDING",
    normalizedEmail: "invited@example.test",
    roleCode: "VIEWER",
  };
  const calls = [];
  const digest = (value) =>
    crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
  global.ENUMS = {
    ProfileEmployeeNotificationStatus: Object.fromEntries(
      ["NOT_REQUESTED", "PENDING", "UNCONFIRMED"].map((key) => [key, { key }]),
    ),
  };
  global.CONFIG = {
    get: (key) =>
      key === "enterpriseManagement"
        ? {
            notifications: {
              enabled: true,
              qualified: true,
              connectionName: "commsApi",
              timeoutMilliseconds: 1000,
              INVITATION: {
                templateCode: "profile.employee.invitation",
                purpose: "EMPLOYEE_INVITATION",
                locale: "en",
                nextStep: "Review access.",
              },
            },
          }
        : "default",
  };
  global.SERVICE = {
    DefaultEnterpriseManagementService: require("../src/service/enterprise/defaultEnterpriseManagementService"),
    DefaultLoggerService: {
      runSensitiveOperation: async (request, operation) => {
        privateEntries.add(request);
        return operation();
      },
      assertSensitiveRequest: (request) => assert(privateEntries.has(request)),
    },
    DefaultEnterpriseMembershipService: {
      policy: () => true,
      digest,
      authority: () => "authority",
      fail: (key) => {
        throw Error(key);
      },
      assignment: async () => ({
        item,
        enterprise: { code: "business", name: "Business" },
      }),
      write: async (_, patch) => {
        Object.assign(item, patch);
        item.revision++;
        return item;
      },
    },
    DefaultEnterpriseApplicationReviewService: { result: (value) => value },
    DefaultModuleService: {
      invokeModule: async (request) => {
        calls.push(request);
        if (calls.length === 1) throw Error("unknown delivery");
        return { intentCode: "COMM_" + "a".repeat(64), status: "QUEUED" };
      },
    },
  };
  return { owner: { ...source }, item, calls };
}
test("uncertain intent creation retries the frozen recipient/message/key and reconciles one intent", async () => {
  const f = fixture();
  assert.equal(
    (await f.owner.request("assignment", "INVITATION")).status,
    "UNCONFIRMED",
  );
  const frozen = JSON.stringify(
    f.item.lifecycleNotifications.INVITATION.message,
  );
  assert.equal(
    (await f.owner.request("assignment", "INVITATION")).status,
    "QUEUED",
  );
  assert.deepEqual(f.calls[0].requestBody, f.calls[1].requestBody);
  assert.equal(
    JSON.stringify(f.item.lifecycleNotifications.INVITATION.message),
    frozen,
  );
  assert.equal(
    (await f.owner.request("assignment", "INVITATION")).intentCode,
    "COMM_" + "a".repeat(64),
  );
  assert.equal(f.calls.length, 2);
});
test("withdrawn, claimed or expired invitations and incomplete ready events cannot request delivery", async () => {
  for (const patch of [
    { invitationWithdrawal: {} },
    { identityClaimed: true },
    { expiresAt: "2000-01-01" },
    { membership: { phase: "PENDING" } },
  ]) {
    const f = fixture();
    Object.assign(f.item, patch);
    assert.equal(
      (await f.owner.request("assignment", "INVITATION")).status,
      "UNCONFIRMED",
    );
    assert.equal(f.calls.length, 0);
  }
  const f = fixture();
  assert.equal(
    (await f.owner.request("assignment", "ACCOUNT_READY")).status,
    "UNCONFIRMED",
  );
  assert.equal(f.calls.length, 0);
});
