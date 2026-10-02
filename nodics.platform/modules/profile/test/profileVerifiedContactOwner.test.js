/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module profile/test/profileVerifiedContactOwner @description Deferred Contact owner lifecycle, secret privacy, exact admission and CAS refusal fixtures. @owner profile @layer test */
const test = require("node:test");
const assert = require("node:assert/strict");
const owner = require("../src/service/contact/defaultProfileVerifiedContactService");

test("ordinary Contact insertion before code allocation stays available with rollout absent", async () => {
  const service = { ...owner };
  assert.equal(
    await service.guardContactMutation(
      { model: { type: "EMAIL", value: "ordinary@example.invalid" } },
      "INSERT",
    ),
    true,
  );
  assert.equal(service.inheritContactAdmission({}, { private: true }), false);
});

function harness(run) {
  const previous = {
    SERVICE: global.SERVICE,
    CONFIG: global.CONFIG,
    CLASSES: global.CLASSES,
  };
  const identity = { tenantCode: "t1", recordKind: "CUSTOMER", recordId: "c1" };
  const privateRequests = new WeakSet();
  const request = {
    tenant: "t1",
    authData: { principalType: "customer", entCode: "e1" },
  };
  privateRequests.add(request);
  const policy = {
    enabled: true,
    qualified: true,
    contactCasQualified: true,
    crudProtectionQualified: true,
    readPrivacyQualified: true,
    verificationTransportQualified: true,
    deliveryQualified: true,
    receiptRepairQualified: true,
    maximumContacts: 10,
    maximumVerifiedAgeSeconds: 3600,
    clockSkewSeconds: 0,
    transport: { connectionName: "communication", timeoutMs: 1000 },
    purposes: {
      RECEIPT: {
        category: "TRANSACTIONAL",
        channels: ["EMAIL", "SMS"],
        requiresConsent: true,
        version: 1,
      },
    },
    rates: Object.fromEntries(
      ["ISSUE", "VERIFY", "CONSUME"].map((key) => [
        key,
        { limit: 5, windowSeconds: 60 },
      ]),
    ),
  };
  const contact = {
    _id: "ct1",
    code: "contact1",
    active: true,
    type: "EMAIL",
    value: "stored@example.invalid",
    priority: 0,
  };
  const customer = {
    _id: "c1",
    code: "customer1",
    active: true,
    principalType: "customer",
    contacts: [contact.code],
  };
  const selected = () => ({
    identity,
    contact: structuredClone(contact),
    contactId: "ct1",
    binding: "b".repeat(64),
    destination: contact.value,
    channel: "EMAIL",
    tenant: "t1",
    ownerId: "c1",
  });
  const calls = [];
  let match = 1;
  let loseConsume = false;
  global.CONFIG = {
    get: (key) => (key === "profileVerifiedContacts" ? policy : undefined),
  };
  global.CLASSES = { NodicsError: class extends Error {} };
  global.SERVICE = {
    DefaultLoggerService: {
      assertSensitiveRequest: (value) => {
        if (!privateRequests.has(value))
          throw new Error("private admission required");
      },
      runSensitiveOperation: async (_, fn) => fn(),
    },
    DefaultEnterpriseMembershipService: {
      actor: async () => ({ identity }),
      recordId: (value) => value,
      identity: (value) => value,
      resolve: async () => ({ identity, person: customer }),
      anchor: async () => ({ identity, person: customer }),
    },
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ isSystem: true }),
    },
    DefaultRateLimitService: { enforce: async () => undefined },
    DefaultCustomerService: {
      get: async () => ({
        code: "SUC_READ",
        result: [structuredClone(customer)],
      }),
    },
    DefaultContactService: {
      get: async () => ({
        code: "SUC_READ",
        result: [structuredClone(contact)],
      }),
      update: async (value) => {
        calls.push({
          kind: "CAS",
          phase: value.model.profileVerifiedContact.verification.phase,
        });
        assert.equal(owner.ownsWrite(value), true);
        if (match === 1)
          contact.profileVerifiedContact = structuredClone(
            value.model.profileVerifiedContact,
          );
        return { code: "SUC_WRITE", result: { matchedCount: match } };
      },
    },
    DefaultModuleService: {
      invokeModule: async (value) => {
        const cmd = value.requestBody;
        calls.push({
          kind: "RPC",
          path: value.apiName,
          operation: cmd.operation,
          template: cmd.templateCode,
        });
        if (value.apiName === "/internal/communications") {
          assert.equal(cmd.templateCode, "profile.contact.emailVerification");
          assert.equal(cmd.sourceType, "PROFILE_CONTACT_VERIFICATION");
          assert.equal(cmd.variables.verificationCode, "a".repeat(12));
          assert.ok(!JSON.stringify(contact).includes("a".repeat(12)));
          return {
            intentCode: "COMM_" + owner.digest(["t1", cmd.idempotencyKey]),
            status: "QUEUED",
            revision: 1,
          };
        }
        if (value.apiName.endsWith("/inspect")) {
          assert.deepEqual(cmd, {});
          return {
            intentCode:
              contact.profileVerifiedContact.verification.delivery.intentCode,
            status: "DEAD_LETTER",
            revision: 2,
          };
        }
        const base = {
          contractVersion: 1,
          challengeCode: "CV_" + "c".repeat(64),
          generation: 1,
          revision: 1,
          expiresAt: new Date(Date.now() + 60000).toISOString(),
        };
        if (cmd.operation === "ISSUE")
          return {
            ...base,
            status: "PENDING",
            replayed: false,
            secret: "a".repeat(12),
          };
        if (cmd.operation === "VERIFY")
          return {
            ...base,
            status: "VERIFIED",
            proof: "d".repeat(64),
            proofExpiresAt: base.expiresAt,
          };
        if (cmd.operation === "CONSUME") {
          assert.equal(
            contact.profileVerifiedContact.verification.phase,
            "CONSUME_PENDING",
          );
          if (loseConsume) throw new Error("uncertain private response");
        }
        return {
          ...base,
          status: "CONSUMED",
          consumedAt: new Date().toISOString(),
          executionGranted: cmd.operation === "CONSUME",
        };
      },
    },
  };
  const service = { ...owner, select: async () => selected() };
  return Promise.resolve()
    .then(() =>
      run({
        service,
        request,
        contact,
        identity,
        policy,
        calls,
        privateRequests,
        setMatch: (value) => {
          match = value;
        },
        setLoseConsume: (value) => {
          loseConsume = value;
        },
      }),
    )
    .finally(() => Object.assign(global, previous));
}

test("Contact persistence invokes exact eligibility before-CAS and acknowledged-readback callback without addresses", () =>
  harness(async (h) => {
    const events = [],
      handle = Object.freeze({});
    global.CONFIG = {
      get: (key) =>
        key === "profileVerifiedContacts"
          ? h.policy
          : key === "profileCustomerEligibility"
            ? { enabled: true }
            : undefined,
    };
    global.SERVICE.DefaultCustomerEligibilityDecisionGovernanceService = {
      prepareCanonicalContactChange: async (identity, evidence) => {
        assert.deepEqual(identity, h.identity);
        assert.deepEqual(Object.keys(evidence).sort(), [
          "afterPhase",
          "afterRevision",
          "beforePhase",
          "beforeRevision",
          "contactCode",
        ]);
        assert.equal(Object.hasOwn(evidence, "value"), false);
        events.push("PREPARE");
        return handle;
      },
      completeCanonicalContactChange: async (selected, identity, revision) => {
        assert.equal(selected, handle);
        assert.deepEqual(identity, h.identity);
        assert.equal(revision, h.contact.profileVerifiedContact.revision);
        assert.ok(h.calls.some((call) => call.kind === "CAS"));
        events.push("COMPLETE");
      },
    };
    await h.service.beginAndDeliver(h.request, {
      ownerId: "c1",
      channel: "EMAIL",
      expectedRevision: 0,
    });
    assert.equal(events[0], "PREPARE");
    assert.ok(events.includes("COMPLETE"));
  }));

test("canonical link/retirement/deactivation PATCH cannot reinterpret retained Contact proof", () =>
  harness(async (h) => {
    h.contact.profileVerifiedContact = { version: 1 };
    global.SERVICE.DefaultCustomerService.get = async () => ({
      code: "SUC_READ",
      result: [{ _id: "c1", contacts: [h.contact.code] }],
    });
    for (const model of [
      {
        $set: {
          authenticationIdentity: {
            tenantCode: "other",
            recordKind: "EMPLOYEE",
            recordId: "target",
          },
        },
      },
      { $set: { identityLinkRetirement: {} } },
      { $set: { active: false } },
      { $unset: { authenticationIdentity: "" } },
    ])
      await assert.rejects(
        h.service.guardCustomerAssociationMutation(
          { tenant: "t1", query: { _id: "c1" }, model },
          "PATCH",
        ),
      );
  }));

test("first inspection exposes only safe revision-zero bootstrap without writes or RPC", () =>
  harness(async (h) => {
    assert.deepEqual(
      await h.service.inspectVerification(h.request, {
        ownerId: "c1",
        channel: "EMAIL",
      }),
      { revision: 0, status: "NOT_STARTED", verified: false },
    );
    assert.equal(h.contact.profileVerifiedContact, undefined);
    assert.equal(h.calls.length, 0);
  }));

test("trusted code-less Customer/Employee insert supports unmarked associations without rollout", () =>
  harness(async (h) => {
    h.policy.enabled = false;
    global.SERVICE.DefaultCustomerService.get = async () => {
      throw new Error("insert must not select an existing Customer");
    };
    global.SERVICE.DefaultEmployeeService = {
      get: async () => {
        throw new Error("insert must not select an existing Employee");
      },
    };
    const request = {
      tenant: "t1",
      model: { firstName: "New", contacts: [h.contact.code] },
    };
    assert.equal(
      await h.service.guardCustomerAssociationMutation(request, "INSERT"),
      true,
    );
    assert.equal(
      await h.service.guardEmployeeAssociationMutation(request, "INSERT"),
      true,
    );
    h.contact.profileVerifiedContact = { version: 1 };
    await assert.rejects(
      h.service.guardEmployeeAssociationMutation(request, "INSERT"),
    );
    await assert.rejects(
      h.service.guardCustomerAssociationMutation(
        { ...request, options: { upsert: true } },
        "INSERT",
      ),
    );
    assert.equal(h.contact.profileVerifiedContact.version, 1);
  }));

test("generated $set keeps unmarked ordinary association update usable and blocks incoming protected Contact", () =>
  harness(async (h) => {
    global.SERVICE.DefaultCustomerService.get = async () => ({
      code: "SUC_READ",
      result: [{ contacts: [h.contact.code] }],
    });
    const request = {
      tenant: "t1",
      query: { active: true, code: "customer1" },
      model: { $set: { contacts: [h.contact.code] } },
    };
    assert.equal(
      await h.service.guardCustomerAssociationMutation(request, "PATCH"),
      true,
    );
    h.contact.profileVerifiedContact = { version: 1 };
    await assert.rejects(
      h.service.guardCustomerAssociationMutation(request, "PATCH"),
    );
  }));

test("Employee replacement/removal checks original Employee associations even when model omits contacts", () =>
  harness(async (h) => {
    let employeeReads = 0;
    global.SERVICE.DefaultEmployeeService = {
      get: async () => {
        employeeReads++;
        return {
          code: "SUC_READ",
          result: [{ _id: "employee1", contacts: [h.contact.code] }],
        };
      },
    };
    global.SERVICE.DefaultCustomerService.get = async () => {
      throw new Error("wrong association owner");
    };
    h.contact.profileVerifiedContact = { version: 1 };
    for (const operation of ["REPLACE", "REMOVE"])
      await assert.rejects(
        h.service.guardEmployeeAssociationMutation(
          {
            tenant: "t1",
            query: { _id: "employee1" },
            model: { firstName: "Changed" },
          },
          operation,
        ),
      );
    assert.equal(employeeReads, 2);
  }));

test("browser chain delivers Contact resource and consumes proof without exposing secrets or consent", () =>
  harness(async (h) => {
    const begun = await h.service.beginAndDeliver(h.request, {
      ownerId: "c1",
      channel: "EMAIL",
      expectedRevision: 0,
    });
    assert.equal(begun.secret, undefined);
    assert.equal(begun.proof, undefined);
    const verified = await h.service.verifyAndConfirm(h.request, {
      ownerId: "c1",
      channel: "EMAIL",
      expectedRevision: begun.revision,
      commandId: begun.commandId,
      secret: "a".repeat(12),
    });
    assert.equal(verified.verified, true);
    assert.equal(verified.proof, undefined);
    assert.deepEqual(h.contact.profileVerifiedContact.notificationConsent, []);
    assert.ok(!JSON.stringify(h.contact).includes("d".repeat(64)));
    const consume = h.calls.findIndex((value) => value.operation === "CONSUME");
    assert.equal(h.calls[consume - 1].phase, "CONSUME_PENDING");
    const input = {
      tenant: "t1",
      ownerId: "c1",
      channel: "EMAIL",
      purpose: "RECEIPT",
    };
    h.privateRequests.add(input);
    await assert.rejects(h.service.resolveCanonicalContact(input));
    await h.service.setNotificationConsent(h.request, {
      ownerId: "c1",
      channel: "EMAIL",
      expectedRevision: verified.revision,
      purpose: "RECEIPT",
      purposeVersion: 1,
      granted: true,
      operationReference: "choice1",
    });
    assert.equal(
      (await h.service.resolveCanonicalContact(input))
        .recipientAddressReference,
      "stored@example.invalid",
    );
    const state = h.contact.profileVerifiedContact;
    await h.service.setSuppression(h.request, {
      ownerId: "c1",
      channel: "EMAIL",
      expectedRevision: state.revision,
      purpose: "ALL",
      suppressed: true,
    });
    await assert.rejects(h.service.resolveCanonicalContact(input));
  }));

for (const count of [0, 2])
  test("non-single Contact CAS prevents verification RPC: " + count, () =>
    harness(async (h) => {
      h.setMatch(count);
      await assert.rejects(
        h.service.beginAndDeliver(h.request, {
          ownerId: "c1",
          channel: "EMAIL",
          expectedRevision: 0,
        }),
      );
      assert.equal(h.calls.filter((value) => value.kind === "RPC").length, 0);
    }),
  );

test("inspection uses authoritative DEAD_LETTER evidence without replaying a send", () =>
  harness(async (h) => {
    await h.service.beginAndDeliver(h.request, {
      ownerId: "c1",
      channel: "EMAIL",
      expectedRevision: 0,
    });
    const progress = await h.service.inspectVerification(h.request, {
      ownerId: "c1",
      channel: "EMAIL",
    });
    assert.equal(progress.deliveryStatus, "DEAD_LETTER");
    assert.equal(
      h.calls.filter((value) => value.path === "/internal/communications")
        .length,
      1,
    );
  }));

test("lost consume stays held; inspection never upgrades evidence or repeats CONSUME", () =>
  harness(async (h) => {
    const begin = await h.service.beginAndDeliver(h.request, {
      ownerId: "c1",
      channel: "EMAIL",
      expectedRevision: 0,
    });
    h.setLoseConsume(true);
    await assert.rejects(
      h.service.verifyAndConfirm(h.request, {
        ownerId: "c1",
        channel: "EMAIL",
        expectedRevision: begin.revision,
        commandId: begin.commandId,
        secret: "a".repeat(12),
      }),
    );
    assert.equal(
      h.contact.profileVerifiedContact.verification.phase,
      "CONSUME_PENDING",
    );
    assert.equal(
      (
        await h.service.inspectVerification(h.request, {
          ownerId: "c1",
          channel: "EMAIL",
        })
      ).verified,
      false,
    );
    assert.equal(
      h.calls.filter((value) => value.operation === "CONSUME").length,
      1,
    );
    await assert.rejects(
      h.service.repairConsumedVerification(h.request, {
        ownerId: "c1",
        channel: "EMAIL",
        expectedRevision: h.contact.profileVerifiedContact.revision,
        commandId: "f".repeat(64),
        proof: "d".repeat(64),
      }),
    );
  }));

test("exact privacy and customer principal cannot be replaced by copied flags or human admin", () =>
  harness(async (h) => {
    await assert.rejects(
      h.service.beginAndDeliver(
        { ...h.request, private: true },
        { ownerId: "c1", channel: "EMAIL", expectedRevision: 0 },
      ),
    );
    h.request.authData.principalType = "human";
    await assert.rejects(
      h.service.beginAndDeliver(h.request, {
        ownerId: "c1",
        channel: "EMAIL",
        expectedRevision: 0,
      }),
    );
  }));

test("public recursive read strips private markers; customization cannot introduce marketing consent", () =>
  harness(async (h) => {
    const response = {
      result: [
        {
          contacts: [
            {
              value: "visible",
              profileVerifiedContact: { proofDigest: "private" },
            },
          ],
        },
      ],
    };
    h.service.redactContactRead({}, response);
    assert.deepEqual(response.result, [{ contacts: [{ value: "visible" }] }]);
    const mixed = {
      success: true,
      result: {
        value: "visible",
        profileVerifiedContact: { proofDigest: "private" },
      },
    };
    h.service.redactContactRead({}, mixed);
    assert.deepEqual(mixed, { success: true, result: { value: "visible" } });
    h.policy.purposes.RECEIPT.category = "MARKETING";
    assert.throws(() => h.service.purpose("RECEIPT", "EMAIL"));
    h.policy.enabled = false;
    assert.throws(() => h.service.policy());
  }));

test("original EMPLOYEE anchor is reachable only through a customer participation self context", () =>
  harness(async (h) => {
    h.identity.recordKind = "EMPLOYEE";
    await assert.rejects(
      h.service.self(h.request, { ownerId: "c1", channel: "EMAIL" }, [
        "ownerId",
        "channel",
      ]),
    );
    h.request.authData.sessionContext = {
      owner: "profile.customerParticipation",
    };
    assert.equal(
      (
        await h.service.self(h.request, { ownerId: "c1", channel: "EMAIL" }, [
          "ownerId",
          "channel",
        ])
      ).identity.recordKind,
      "EMPLOYEE",
    );
    const terms = { version: 1, digest: "reviewed", documentCode: "terms1" };
    global.SERVICE.DefaultCustomerRegistrationService = {
      participationPolicy: () => ({ terms }),
    };
    global.SERVICE.DefaultCustomerService.get = async () => ({
      code: "SUC_READ",
      result: [
        {
          _id: "c1",
          active: true,
          principalType: "customer",
          authenticationIdentity: h.identity,
          customerParticipation: {
            phase: "COMPLETE",
            revision: 1,
            termsVersion: 1,
            termsDigest: "reviewed",
            termsDocumentCode: "terms1",
          },
        },
      ],
    });
    global.SERVICE.DefaultEnterpriseMembershipService.resolve = async () => ({
      identity: h.identity,
      person: { principalType: "human", contacts: [h.contact.code] },
    });
    const selected = await owner.select.call(h.service, {
      tenant: "t1",
      ownerId: "c1",
      channel: "EMAIL",
    });
    assert.equal(selected.identity.recordKind, "EMPLOYEE");
    assert.equal(selected.destination, h.contact.value);
  }));

test("original pending proof repairs receipt only with frozen completion and no new consent", () =>
  harness(async (h) => {
    const begin = await h.service.beginAndDeliver(h.request, {
      ownerId: "c1",
      channel: "EMAIL",
      expectedRevision: 0,
    });
    h.setLoseConsume(true);
    await assert.rejects(
      h.service.verifyAndConfirm(h.request, {
        ownerId: "c1",
        channel: "EMAIL",
        expectedRevision: begin.revision,
        commandId: begin.commandId,
        secret: "a".repeat(12),
      }),
    );
    const pending = structuredClone(h.contact.profileVerifiedContact);
    const repaired = await h.service.repairConsumedVerification(h.request, {
      ownerId: "c1",
      channel: "EMAIL",
      expectedRevision: pending.revision,
      commandId: begin.commandId,
      proof: "d".repeat(64),
    });
    assert.equal(repaired.verified, true);
    assert.equal(
      h.contact.profileVerifiedContact.verification.verifiedExpiresAt,
      pending.verification.completion.verifiedExpiresAt,
    );
    assert.deepEqual(h.contact.profileVerifiedContact.notificationConsent, []);
    assert.equal(
      h.calls.filter((value) => value.operation === "CONSUME").length,
      1,
    );
    assert.equal(
      h.calls.filter((value) => value.operation === "RECEIPT").length,
      1,
    );
  }));

test("consent requires the exact reviewed version; missing and stale decisions never write", () =>
  harness(async (h) => {
    const begun = await h.service.beginAndDeliver(h.request, {
      ownerId: "c1",
      channel: "EMAIL",
      expectedRevision: 0,
    });
    h.policy.purposes.RECEIPT.version = 2;
    const before = JSON.stringify(h.contact.profileVerifiedContact);
    const calls = h.calls.length;
    for (const purposeVersion of [undefined, 1, "2", 0]) {
      const command = {
        ownerId: "c1",
        channel: "EMAIL",
        expectedRevision: begun.revision,
        purpose: "RECEIPT",
        granted: false,
        operationReference: "review1",
      };
      if (purposeVersion !== undefined) command.purposeVersion = purposeVersion;
      await assert.rejects(
        h.service.setNotificationConsent(h.request, command),
      );
    }
    assert.equal(JSON.stringify(h.contact.profileVerifiedContact), before);
    assert.equal(h.calls.length, calls);
  }));

test("purpose change while preparing CAS refuses before Contact write", () =>
  harness(async (h) => {
    const begun = await h.service.beginAndDeliver(h.request, {
      ownerId: "c1",
      channel: "EMAIL",
      expectedRevision: 0,
    });
    const before = JSON.stringify(h.contact.profileVerifiedContact);
    global.SERVICE.DefaultCustomerEligibilityDecisionGovernanceService = {
      prepareCanonicalContactChange: async () => {
        h.policy.purposes.RECEIPT.version = 2;
      },
    };
    await assert.rejects(
      h.service.setNotificationConsent(h.request, {
        ownerId: "c1",
        channel: "EMAIL",
        expectedRevision: begun.revision,
        purpose: "RECEIPT",
        purposeVersion: 1,
        granted: false,
        operationReference: "review1",
      }),
    );
    assert.equal(JSON.stringify(h.contact.profileVerifiedContact), before);
  }));

test("purpose change during CAS/readback never silently records consent for the new version", () =>
  harness(async (h) => {
    const begun = await h.service.beginAndDeliver(h.request, {
      ownerId: "c1",
      channel: "EMAIL",
      expectedRevision: 0,
    });
    const verified = await h.service.verifyAndConfirm(h.request, {
      ownerId: "c1",
      channel: "EMAIL",
      expectedRevision: begun.revision,
      commandId: begun.commandId,
      secret: "a".repeat(12),
    });
    const update = global.SERVICE.DefaultContactService.update;
    global.SERVICE.DefaultContactService.update = async (request) => {
      const response = await update(request);
      h.policy.purposes.RECEIPT.version = 2;
      return response;
    };
    await assert.rejects(
      h.service.setNotificationConsent(h.request, {
        ownerId: "c1",
        channel: "EMAIL",
        expectedRevision: verified.revision,
        purpose: "RECEIPT",
        purposeVersion: 1,
        granted: true,
        operationReference: "review1",
      }),
    );
    assert.equal(
      h.contact.profileVerifiedContact.notificationConsent[0].purposeVersion,
      1,
    );
    const input = {
      tenant: "t1",
      ownerId: "c1",
      channel: "EMAIL",
      purpose: "RECEIPT",
    };
    h.privateRequests.add(input);
    await assert.rejects(h.service.resolveCanonicalContact(input));
  }));

test("protected Contact lookup preserves ordinary unmarked mutation shape while disabled", () =>
  harness(async (h) => {
    h.policy.enabled = false;
    let query;
    global.SERVICE.DefaultContactService.get = async (request) => {
      query = request.query;
      return { code: "SUC_READ", result: [] };
    };
    assert.equal(
      await h.service.guardContactMutation({
        tenant: "t1",
        query: { type: "EMAIL" },
        model: { priority: 2 },
      }),
      true,
    );
    assert.deepEqual(query, {
      $and: [{ type: "EMAIL" }, { profileVerifiedContact: { $exists: true } }],
    });
    await assert.rejects(
      h.service.guardContactMutation(
        { tenant: "t1", model: { profileVerifiedContact: { version: 1 } } },
        "INSERT",
      ),
    );
  }));
