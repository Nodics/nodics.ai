/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module profile/test/enterpriseActorOwnerAcceptance @description Focused Profile owner acceptance-command contract tests; no runtime or persisted membership is mutated. @layer test @owner profile */
import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import {
  enterpriseActorOwnerAcceptanceArgument,
  runEnterpriseActorOwnerAcceptance,
  validateEnterpriseActorOwnerAcceptanceSelection,
} from "../src/service/acceptance/defaultEnterpriseActorOwnerAcceptanceService.mjs";

const require = createRequire(import.meta.url);
const properties = require("../config/properties.js");

function selection() {
  return {
    contractVersion: 1,
    approvalReference: "review-E01-2026-10-21",
    runCode: "e01-local-001",
    owner: {
      tenantCode: "owner-tenant",
      enterpriseCode: "owner-enterprise",
      membershipAssignmentCode: "owner-admin-membership",
      requiredScopes: [
        { scopeType: "ENTERPRISE", scopeCode: "owner-enterprise" },
        { scopeType: "STORE", scopeCode: "owner-store", permissionCode: "profile.enterpriseAccess.assign" },
      ],
    },
    relatedEnterprise: {
      enterpriseCode: "related-enterprise",
      grantCode: "related-explicit-grant",
      sourceEnterpriseCode: "owner-enterprise",
    },
    unrelatedEnterpriseCode: "unrelated-enterprise",
    foreignTenantCode: "foreign-tenant",
    revocation: {
      assignmentCode: "disposable-member",
      enterpriseCode: "owner-enterprise",
      revision: 7,
      operationId: "e01_disposable_revoke_001",
    },
  };
}

function fixture() {
  const selected = selection();
  const tokens = { owner: "owner-token", subject: "subject-token" };
  let revoked = false;
  const calls = [];
  const ownerMembership = {
    code: selected.owner.membershipAssignmentCode, revision: 4,
    enterpriseCode: selected.owner.enterpriseCode, status: "REGISTERED", accepted: true,
  };
  const subjectMembership = {
    code: selected.revocation.assignmentCode, revision: selected.revocation.revision,
    enterpriseCode: selected.revocation.enterpriseCode, status: "REGISTERED", accepted: true,
  };
  const scopes = token => ({
    principalCode: token === tokens.owner ? "owner" : "subject", principalType: "human",
    scopeCount: token === tokens.owner ? 2 : 1,
    scopes: token === tokens.owner ? [
      { scopeType: "ENTERPRISE", scopeCode: "owner-enterprise" },
      { scopeType: "STORE", scopeCode: "owner-store", permissionCode: "profile.enterpriseAccess.assign" },
    ] : [{ scopeType: "ENTERPRISE", scopeCode: "owner-enterprise" }],
    deniedScopes: [],
  });
  const token = options => options.headers.Authorization.slice("Bearer ".length);
  return {
    selected, tokens, calls,
    context: {
      request: async (role, route, options = {}) => {
        calls.push({ kind: "request", role, route, options });
        const current = token(options);
        if (route.endsWith("/enterprise-memberships")) return {
          contractVersion: 1,
          items: current === tokens.owner ? [ownerMembership] : [subjectMembership],
        };
        if (route.endsWith("/identity/scopes/me")) return scopes(current);
        if (route.endsWith("/enterprise-administration/related-enterprise/workspace")) return {
          version: 1, kind: "ENTERPRISE_ADMINISTRATION_CONSENT", enterpriseCode: "related-enterprise",
          grants: [{ code: "related-explicit-grant", sourceEnterpriseCode: "owner-enterprise", status: "ACTIVE" }],
        };
        if (route.endsWith("/enterprise-team/workspace")) return {
          contractVersion: 1, owner: "profile", enterpriseCode: "owner-enterprise",
          items: [{ ...subjectMembership, actions: ["SUSPEND", "REVOKE"] }],
        };
        if (route.endsWith("/enterprise-team/revoke")) {
          assert.equal(options.method, "POST");
          assert.deepEqual(JSON.parse(options.body), {
            assignmentCode: "disposable-member", revision: 7, operationId: "e01_disposable_revoke_001",
          });
          revoked = true;
          return { ...subjectMembership, revision: 8, status: "REVOKED", accepted: false };
        }
        assert.fail("Unexpected request " + route);
      },
      raw: async (role, route, options = {}) => {
        calls.push({ kind: "raw", role, route, options });
        if (route.endsWith("/enterprise-administration/unrelated-enterprise/workspace"))
          return Response.json({ code: "ERR_AUTH_00003" }, { status: 403 });
        if (options.headers.tenant === "foreign-tenant")
          return Response.json({ code: "ERR_AUTH_00003" }, { status: 403 });
        if (revoked && token(options) === tokens.subject)
          return Response.json({ code: "ERR_AUTH_00001" }, { status: 401 });
        return Response.json({ code: "SUC_PRFL_00000" });
      },
    },
  };
}

test("Profile owns the reusable command, limits, refusal policy, and route defaults", () => {
  assert.deepEqual(properties.tooling.commands["acceptance:enterprise-actor-owner"], {
    acceptanceContract: true,
    projectHome: true,
    handler: "@nTooling/node-script",
    script: "src/service/acceptance/defaultEnterpriseActorOwnerAcceptanceService.mjs",
  });
  assert.equal(properties.profileAcceptance.enterpriseActorOwner.contractVersion, 1);
  assert.deepEqual(properties.profileAcceptance.enterpriseActorOwner.refusalStatuses, [401, 403, 404]);
  assert.equal(properties.profileAcceptance.enterpriseActorOwner.routes.memberships,
    "/nodics/profile/v0/enterprise-memberships");
});

test("live composition verifies membership, scopes, explicit related authority, isolation and revocation", async () => {
  const f = fixture();
  const report = await runEnterpriseActorOwnerAcceptance({
    execute: true, selection: f.selected, actors: f.tokens, context: f.context,
  });
  assert.equal(report.state, "PASSED");
  assert.equal(report.authorityOwner, "PROFILE");
  assert.equal(report.membershipVerified, true);
  assert.equal(report.relatedEnterprise.verified, true);
  assert.equal(report.unrelatedEnterpriseRefusalStatus, 403);
  assert.equal(report.tenantIsolationRefusalStatus, 403);
  assert.deepEqual(report.revocation, {
    assignment: report.revocation.assignment,
    revision: 8,
    replayVerified: true,
    membershipRefusalStatus: 401,
    scopeRefusalStatus: 401,
  });
  assert.equal(f.calls.filter(call => call.route.endsWith("/enterprise-team/revoke")).length, 2);
  assert.ok(!JSON.stringify(report).includes(f.tokens.owner));
  assert.ok(!JSON.stringify(report).includes(f.tokens.subject));
});

test("reviewed selection refuses self-relationship, self-revocation and inferred authority", () => {
  const variants = [
    value => { value.relatedEnterprise.enterpriseCode = value.owner.enterpriseCode; },
    value => { value.relatedEnterprise.sourceEnterpriseCode = "another-enterprise"; },
    value => { value.unrelatedEnterpriseCode = value.relatedEnterprise.enterpriseCode; },
    value => { value.foreignTenantCode = value.owner.tenantCode; },
    value => { value.revocation.assignmentCode = value.owner.membershipAssignmentCode; },
    value => { value.revocation.enterpriseCode = "another-enterprise"; },
  ];
  for (const mutate of variants) {
    const value = selection();
    mutate(value);
    assert.throws(() => validateEnterpriseActorOwnerAcceptanceSelection(value));
  }
});

test("mutation and two distinct runtime-only sessions are mandatory", async () => {
  const f = fixture();
  await assert.rejects(runEnterpriseActorOwnerAcceptance({
    selection: f.selected, actors: f.tokens, context: f.context,
  }), /requires --execute/);
  await assert.rejects(runEnterpriseActorOwnerAcceptance({
    execute: true, selection: f.selected, actors: { owner: "same", subject: "same" }, context: f.context,
  }), /distinct sessions/);
  assert.equal(f.calls.length, 0);
});

test("a successful unrelated or foreign-tenant probe fails the suite before mutation", async () => {
  const f = fixture();
  f.context.raw = async () => Response.json({ code: "SUC_PRFL_00000" });
  await assert.rejects(runEnterpriseActorOwnerAcceptance({
    execute: true, selection: f.selected, actors: f.tokens, context: f.context,
  }), /did not fail closed/);
  assert.equal(f.calls.some(call => call.route.endsWith("/enterprise-team/revoke")), false);
});

test("stale or non-revocable disposable membership fails before mutation", async () => {
  const f = fixture();
  const original = f.context.request;
  f.context.request = async (role, route, options) => {
    const result = await original(role, route, options);
    if (route.endsWith("/enterprise-team/workspace")) result.items[0].revision = 8;
    return result;
  };
  await assert.rejects(runEnterpriseActorOwnerAcceptance({
    execute: true, selection: f.selected, actors: f.tokens, context: f.context,
  }), /not currently revocable/);
  assert.equal(f.calls.some(call => call.route.endsWith("/enterprise-team/revoke")), false);
});

test("CLI accepts exactly one explicit reviewed selection and execute flag", () => {
  assert.equal(enterpriseActorOwnerAcceptanceArgument(["--execute", "--selection=/tmp/e01.json"]), "/tmp/e01.json");
  for (const argv of [[], ["--selection=/tmp/e01.json"], ["--execute"],
    ["--execute", "--selection=a", "--selection=b"], ["--execute", "--selection=a", "--unknown"]])
    assert.throws(() => enterpriseActorOwnerAcceptanceArgument(argv));
});
