/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Copyright (c) 2026 Nodics. Governed by the root LICENSE. */
"use strict";
/**
 * @module profile/test/enterpriseTeamReadPrivacy
 * @description Deferred Team read privacy and explicit shared-reader integration fixtures; qualification stays off.
 * @layer test
 * @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const teamSource = require("../src/service/enterprise/defaultEnterpriseTeamAdministrationService");
const membershipSource = require("../src/service/enterprise/defaultEnterpriseMembershipService");
const registrationSource = require("../src/service/enterprise/defaultEnterpriseRegistrationService");
const { ObjectId } = require("mongodb");

function fixture() {
  global.CONFIG = {
    get: () => ({
      teamAdministration: {
        genericMutationGuard: {
          enabled: false,
          installedCoverageQualified: false,
        },
      },
    }),
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  const digest = (value) =>
    crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
  const base = { ...registrationSource, digest };
  const memberships = {
    ...membershipSource,
    base: () => base,
    authority: () => "platform",
  };
  const team = { ...teamSource, memberships: () => memberships };
  const row = Object.freeze({
    code: "business",
    active: true,
    tenant: "businessTenant",
    teamRevision: 4,
    defaultAdminAssignmentCode: "default-assignment",
    teamOperation: Object.freeze({
      id: "private-operation",
      phase: "PENDING",
      hash: "private-hash",
    }),
    administrationConsent: Object.freeze({ private: true }),
  });
  const reads = [],
    consentReads = new WeakSet();
  const request = (code) => ({
    tenant: "platform",
    authData: { system: true },
    query: { code },
    options: { recursive: false, skipItemCache: true },
    searchOptions: { pageSize: 2, pageNumber: 1 },
  });
  global.SERVICE = {
    DefaultEnterpriseTeamAdministrationService: team,
    DefaultEnterpriseMembershipService: memberships,
    DefaultEnterpriseRegistrationService: base,
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ system: true }),
    },
  };
  SERVICE.DefaultEnterpriseService = {
    get: async (command) => {
      reads.push(command);
      const response = {
        success: { code: "SUC_READ", count: 1, result: [row] },
      };
      team.redactEnterprise(command, response);
      // Isolated Consent owner substitute. Its actual source is not modified here.
      if (!consentReads.has(command))
        response.success = {
          ...response.success,
          result: response.success.result.map((value) => {
            const copy = { ...value };
            delete copy.administrationConsent;
            return copy;
          }),
        };
      return response.success;
    },
  };
  SERVICE.DefaultTenantService = {
    get: async (command) => {
      assert.equal(team.ownsEnterpriseRead(command), false);
      return {
        code: "SUC_READ",
        result: [{ code: "businessTenant", active: true }],
      };
    },
  };
  SERVICE.DefaultEnterpriseManagementService = {
    retrieveEnterpriseForAccess: async (code, reader) => {
      const command = request(code);
      const execute = async () => {
        consentReads.add(command);
        try {
          return await SERVICE.DefaultEnterpriseService.get(command);
        } finally {
          consentReads.delete(command);
        }
      };
      const envelope = reader
        ? await reader(SERVICE.DefaultEnterpriseService, command, execute)
        : await execute();
      const tenant = await SERVICE.DefaultTenantService.get(
        request("businessTenant"),
      );
      return {
        enterprise: { ...envelope.result[0], tenant: tenant.result[0] },
        tenantCode: "businessTenant",
      };
    },
  };
  return { team, memberships, base, row, reads, request };
}

test("public system-shaped generated reads redact Team fields with all qualification flags false", async () => {
  const f = fixture(),
    response = await SERVICE.DefaultEnterpriseService.get(
      f.request("business"),
    );
  assert.equal(response.result[0].teamOperation, undefined);
  assert.equal(response.result[0].teamRevision, undefined);
  assert.equal(response.result[0].defaultAdminAssignmentCode, undefined);
  assert.equal(response.result[0].code, "business");
  assert.equal(response.count, 1);
  assert.equal(f.row.teamOperation.hash, "private-hash");
});

test("public redaction clones nested populated rows and envelope while preserving value types", () => {
  const f = fixture(),
    date = new Date("2026-01-01T00:00:00Z"),
    buffer = Buffer.from("id");
  const nested = Object.freeze({ ...f.row, created: date, bytes: buffer });
  const cached = Object.freeze({
    code: "SUC_READ",
    count: 1,
    result: Object.freeze([{ code: "child", superEnterprise: nested }]),
  });
  const response = { success: cached };
  f.team.redactEnterprise(
    { authData: { system: true }, privateRead: true },
    response,
  );
  assert.notEqual(response.success, cached);
  assert.notEqual(response.success.result, cached.result);
  assert.equal(
    response.success.result[0].superEnterprise.teamOperation,
    undefined,
  );
  assert.equal(nested.teamOperation.id, "private-operation");
  assert.ok(response.success.result[0].superEnterprise.created instanceof Date);
  assert.ok(Buffer.isBuffer(response.success.result[0].superEnterprise.bytes));
});

test("exact Team-generated read retains private authority and always clears its admission", async () => {
  const f = fixture(),
    value = await f.team.readEnterprise("platform", { code: "business" });
  assert.equal(value.teamRevision, 4);
  assert.equal(value.defaultAdminAssignmentCode, "default-assignment");
  assert.equal(f.team.ownsEnterpriseRead(f.reads[0]), false);
  assert.equal(f.team.ownsEnterpriseRead(structuredClone(f.reads[0])), false);
});

test("only explicit Team access selects private callback; Consent and Tenant admission remain separate", async () => {
  const f = fixture(),
    ordinary = await f.memberships.enterprise("business");
  assert.equal(ordinary.enterprise.teamOperation, undefined);
  assert.deepEqual(ordinary.enterprise.administrationConsent, {
    private: true,
  });
  const privateValue = await f.team.enterpriseForAccess("business");
  assert.equal(privateValue.enterprise.teamOperation.id, "private-operation");
  assert.deepEqual(privateValue.enterprise.administrationConsent, {
    private: true,
  });
  const current = {
    code: "assignment",
    enterpriseCode: "business",
    tenantCode: "businessTenant",
    normalizedEmail: "person@example.test",
  };
  f.base.read = async () => current;
  f.base.assertAssignment = () => {};
  const registration = await registrationSource.current.call(
    f.base,
    { tenant: "platform" },
    { email: current.normalizedEmail },
    current.code,
  );
  assert.equal(registration.code, current.code);
  assert.equal(f.team.ownsEnterpriseRead(f.reads.at(-1)), false);
});

test("copied or changed read request cannot retain private evidence, and throwing reads clear admission", async () => {
  const f = fixture(),
    command = f.request("business");
  await assert.rejects(
    f.team.readEnterpriseEnvelope(
      SERVICE.DefaultEnterpriseService,
      command,
      async () => {
        assert.equal(f.team.ownsEnterpriseRead(command), true);
        assert.equal(
          f.team.ownsEnterpriseRead(structuredClone(command)),
          false,
        );
        command.query.code = "other";
        assert.equal(f.team.ownsEnterpriseRead(command), false);
        throw new Error("lost read");
      },
    ),
    /lost read/,
  );
  assert.equal(f.team.ownsEnterpriseRead(command), false);
  await assert.rejects(
    f.team.readEnterpriseEnvelope(
      SERVICE.DefaultTenantService,
      f.request("business"),
    ),
    /UNAVAILABLE/,
  );
});

test("missing shared callback integration rejects rather than silently accepting a redacted owner read", async () => {
  const f = fixture();
  SERVICE.DefaultEnterpriseManagementService.retrieveEnterpriseForAccess =
    async () => ({ enterprise: f.row, tenantCode: "businessTenant" });
  await assert.rejects(f.team.enterpriseForAccess("business"), /UNAVAILABLE/);
});

test("generic save/remove protections still see private default-admin evidence with mutation guards off", async () => {
  const f = fixture();
  await assert.rejects(
    f.team.protectEnterpriseSave({
      tenant: "platform",
      model: { code: "business" },
    }),
    /FORBIDDEN/,
  );
  await assert.rejects(
    f.team.protectEnterpriseRemove({
      tenant: "platform",
      query: { code: "business" },
    }),
    /FORBIDDEN/,
  );
  assert.equal(f.row.defaultAdminAssignmentCode, "default-assignment");
});

test("unsupported provider classes/custom serializers and scalar-private adornments fail closed", () => {
  const f = fixture();
  class ProviderRecord {
    constructor() {
      this.teamOperation = { hash: "private" };
    }
    toJSON() {
      return this.teamOperation;
    }
  }
  const date = new Date("2026-01-01");
  date.teamRevision = 7;
  const id = new ObjectId("000000000000000000000000");
  id.private = { defaultAdminAssignmentCode: "private" };
  for (const rows of [
    [new ProviderRecord()],
    [{ code: "business", nested: new ProviderRecord() }],
    [{ code: "business", toJSON: () => ({ teamRevision: 1 }) }],
    [{ code: "business", date }],
    [{ code: "business", id }],
    [{ code: "business", nested: new Map([["teamOperation", "private"]]) }],
  ]) {
    assert.throws(
      () => f.team.redactEnterprise({}, { result: rows }),
      /UNAVAILABLE/,
    );
  }
  let invoked = false;
  const row = { code: "business" };
  Object.defineProperty(row, "private", {
    enumerable: true,
    get() {
      invoked = true;
      return { teamOperation: "secret" };
    },
  });
  assert.throws(
    () => f.team.redactEnterprise({}, { result: [row] }),
    /UNAVAILABLE/,
  );
  assert.equal(invoked, false);
  const roots = [];
  Object.defineProperty(roots, "0", {
    enumerable: true,
    get() {
      invoked = true;
      return { code: "business" };
    },
  });
  assert.throws(
    () => f.team.redactEnterprise({}, { result: roots }),
    /UNAVAILABLE/,
  );
  assert.equal(invoked, false);
  const proxy = new Proxy(
    { code: "business" },
    {
      get() {
        invoked = true;
        return { teamOperation: "private" };
      },
    },
  );
  assert.throws(
    () => f.team.redactEnterprise({}, { result: [proxy] }),
    /UNAVAILABLE/,
  );
  assert.equal(invoked, false);
});

test("normal ObjectId/Date scalars retain their serialization semantics without extra properties", () => {
  const f = fixture(),
    id = new ObjectId("000000000000000000000001"),
    date = new Date("2026-01-01");
  const response = {
    result: [{ code: "business", _id: id, created: date, teamRevision: 7 }],
  };
  f.team.redactEnterprise({}, response);
  assert.ok(response.result[0]._id instanceof ObjectId);
  assert.equal(response.result[0]._id.toHexString(), id.toHexString());
  assert.equal(response.result[0].created.toISOString(), date.toISOString());
  assert.equal(response.result[0].teamRevision, undefined);
});

test("public shape, record count, depth, traversal budget and cycles are bounded before cloning", () => {
  const f = fixture();
  assert.throws(
    () =>
      f.team.redactEnterprise(
        {},
        { result: { code: "business", teamOperation: "private" } },
      ),
    /UNAVAILABLE/,
  );
  assert.throws(
    () => f.team.redactEnterprise({}, { success: { code: "SUC_READ" } }),
    /UNAVAILABLE/,
  );
  assert.throws(
    () =>
      f.team.redactEnterprise(
        {},
        { result: Array.from({ length: 1001 }, () => ({ code: "business" })) },
      ),
    /UNAVAILABLE/,
  );
  const deep = { code: "business" };
  let target = deep;
  for (let index = 0; index < 34; index++) {
    target.next = {};
    target = target.next;
  }
  assert.throws(
    () => f.team.redactEnterprise({}, { result: [deep] }),
    /UNAVAILABLE/,
  );
  const wide = {
    code: "business",
    items: Array.from({ length: 50001 }, () => 1),
  };
  assert.throws(
    () => f.team.redactEnterprise({}, { result: [wide] }),
    /UNAVAILABLE/,
  );
  const cyclic = { code: "business" };
  cyclic.next = cyclic;
  assert.throws(
    () => f.team.redactEnterprise({}, { result: [cyclic] }),
    /UNAVAILABLE/,
  );
  const response = {
    result: Array.from({ length: 1000 }, (_, index) => ({
      code: String(index),
      teamRevision: 1,
    })),
  };
  f.team.redactEnterprise({}, response);
  assert.equal(response.result.length, 1000);
});
