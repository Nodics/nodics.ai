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
 * @module profile/test/enterpriseAdministratorOwnerAdmission
 * @description Deferred exact registration/membership constructor and held-Team admission fixtures; not installed qualification.
 * @layer test
 * @owner profile
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const registrationSource = require("../src/service/enterprise/defaultEnterpriseRegistrationService");
const membershipSource = require("../src/service/enterprise/defaultEnterpriseMembershipService");
const teamSource = require("../src/service/enterprise/defaultEnterpriseTeamAdministrationService");

function fixture() {
  const digest = (value) =>
    crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
  const management = {
    teamAdministration: {
      genericMutationGuard: {
        enabled: true,
        installedCoverageQualified: true,
        maximumRecords: 100,
        superAdministratorRoleCodes: ["ENTERPRISE_ADMIN"],
        nativeSuperAdministratorGroupCodes: ["adminGroup"],
      },
    },
  };
  global.CONFIG = { get: () => management };
  global.ENUMS = {
    ProfileEmployeeApplicationStatus: { REGISTERED: { key: "REGISTERED" } },
    ProfileRegistrationPhase: { COMPLETE: { key: "COMPLETE" } },
  };
  global.CLASSES = {
    NodicsError: class extends Error {
      constructor(code) {
        super(code);
        this.code = code;
      }
    },
  };
  const enterprise = {
    code: "enterprise-a",
    tenantCode: "tenant-a",
    active: true,
  };
  const person = {
    _id: "person-a",
    code: "person@example.test",
    loginId: "person@example.test",
    principalType: "human",
    active: false,
    authVersion: 1,
    password: "password-a",
    userGroups: ["adminGroup"],
    registrationAssignmentCode: "assignment-a",
  };
  const item = {
    code: "assignment-a",
    tenantCode: "tenant-a",
    enterpriseCode: enterprise.code,
    revision: 1,
    status: "PENDING",
    normalizedEmail: person.loginId,
    groupCodes: person.userGroups,
    registration: {
      commandId: "command-a",
      assignmentDigest: "assignment-digest",
      phase: "CREDENTIAL",
      employeeCode: person.code,
      passwordId: person.password,
      scopeCode: "registrationScope_" + digest(["assignment-a", "command-a"]),
    },
  };
  let scope;
  const commands = [];
  const read = async (name) =>
    structuredClone(
      name === "DefaultEmployeeService"
        ? person
        : name === "DefaultPrincipalScopeAssignmentService"
          ? scope
          : item,
    );
  const registration = {
    ...registrationSource,
    digest,
    now: () => 100,
    assignmentDigest: () => "assignment-digest",
    current: async () => structuredClone(item),
    read,
    verifyRpc: async () => ({ executionGranted: true }),
    assertWrite: (response) => {
      assert.equal(response.code, "SUC_DBS_00000");
    },
  };
  const memberships = {
    authority: () => "authority",
    base: () => registration,
    digest,
    read: async () => structuredClone(enterprise),
    rows: (response) => registration.rows(response),
  };
  const team = {
    ...teamSource,
    memberships: () => memberships,
    policy: () => {},
    persist: async (record, query, patch) => {
      assert.equal(record.teamRevision, enterprise.teamRevision);
      Object.assign(enterprise, structuredClone(patch));
      return structuredClone(enterprise);
    },
  };
  global.SERVICE = {
    DefaultEnterpriseRegistrationService: registration,
    DefaultEnterpriseTeamAdministrationService: team,
    DefaultIdentityGovernanceService: {
      getSystemAuthData: () => ({ system: true }),
    },
  };
  SERVICE.DefaultEnterpriseService = {
    get: async (request) => {
      assert.equal(team.ownsEnterpriseRead(request), true);
      const response = {
        code: "SUC_DBS_00000",
        result: [structuredClone(enterprise)],
      };
      team.redactEnterprise(request, response);
      return response;
    },
  };
  const generated = async (operation, command) => {
    commands.push(command);
    assert.equal(enterprise.teamOperation.phase, "PENDING");
    assert.equal(
      await team.admitsAdministratorOwnerMutation(
        command,
        "DefaultPrincipalScopeAssignmentService",
        operation,
      ),
      true,
    );
    assert.equal(
      await team.admitsAdministratorOwnerMutation(
        structuredClone(command),
        "DefaultPrincipalScopeAssignmentService",
        operation,
      ),
      false,
    );
    assert.equal(
      await team.protectAdministratorScope(command, operation),
      true,
    );
    if (operation === "save") scope = structuredClone(command.model);
    return { code: "SUC_DBS_00000", result: { matchedCount: 1 } };
  };
  SERVICE.DefaultPrincipalScopeAssignmentService = {
    save: (command) => generated("save", command),
    update: (command) => generated("update", command),
  };
  const session = {
    email: person.loginId,
    proof: "private-proof",
    proofExpiresAt: 1000,
    challenge: { challengeCode: "challenge-a", generation: 1 },
  };
  const context = { tenant: "authority", authData: { system: true } };
  const scopeModel = () => ({
    code: item.registration.scopeCode,
    principalType: "human",
    principalCode: person.loginId,
    scopeType: "ENTERPRISE",
    scopeCode: enterprise.code,
    tenantCode: "tenant-a",
    enterpriseCode: enterprise.code,
    effect: "ALLOW",
    inheritanceMode: "DIRECT",
    status: "ACTIVE",
    reasonCode: "ENTERPRISE_ACCESS_ASSIGNMENT",
    active: true,
  });
  registration.provisionOwned = async (owned) => {
    const model = scopeModel();
    await registration.insert(
      "DefaultPrincipalScopeAssignmentService",
      owned,
      item.tenantCode,
      model,
      model,
    );
    await registration.updateOne(
      "DefaultPrincipalScopeAssignmentService",
      owned,
      item.tenantCode,
      registration.administratorScopeQuery(model),
      { status: "ACTIVE" },
    );
  };
  return {
    registration,
    team,
    memberships,
    item,
    person,
    enterprise,
    commands,
    session,
    context,
    scopeModel,
    management,
  };
}

test("actual registration constructors privately admit exact ALLOW save/re-ack and clear request provenance", async () => {
  const f = fixture();
  await f.registration.provision(f.context, f.session, {}, f.item);
  assert.equal(f.session.consumedOperation, "assignment-a:command-a");
  assert.equal(f.commands.length, 2);
  assert.equal(f.enterprise.teamOperation.phase, "COMPLETE");
  for (const command of f.commands)
    assert.equal(f.registration.ownsAdministratorMutation(command), false);
  assert.equal(
    f.registration.ownsAdministratorMutation({
      ownsProjectionWrite: true,
      authData: { system: true },
    }),
    false,
  );
  await assert.rejects(
    f.registration.withAdministratorMutation(
      f.context,
      "DefaultPrincipalScopeAssignmentService",
      "save",
      {},
      async () => {},
    ),
    /CONFLICT/,
  );
});

test("lost scope-save acknowledgement recovers using the same scope-step fence and exact re-ack", async () => {
  const f = fixture(),
    save = SERVICE.DefaultPrincipalScopeAssignmentService.save;
  SERVICE.DefaultPrincipalScopeAssignmentService.save = async (request) => {
    await save(request);
    throw new Error("lost acknowledgement");
  };
  await f.registration.provision(f.context, f.session, {}, f.item);
  assert.equal(f.enterprise.teamRevision, 1);
  assert.equal(f.enterprise.teamOperation.phase, "COMPLETE");
  assert.equal(f.commands.length, 2);
});

test("altered admitted scope model rejects and retains pending evidence without leaked admission", async () => {
  const f = fixture();
  SERVICE.DefaultPrincipalScopeAssignmentService.save = async (request) => {
    f.commands.push(request);
    request.model.effect = "DENY";
    await f.team.protectAdministratorScopeSave(request);
  };
  await assert.rejects(
    f.registration.provision(f.context, f.session, {}, f.item),
    /CONFLICT/,
  );
  assert.equal(f.enterprise.teamOperation.phase, "PENDING");
  assert.equal(f.registration.ownsAdministratorMutation(f.commands[0]), false);
});

test("registration activation is exact active-only with fresh version/group preimage under held Team", async () => {
  const f = fixture();
  f.item.registration.phase = "ACTIVATING";
  SERVICE.DefaultEmployeeService = {
    update: async (request) => {
      f.commands.push(request);
      assert.equal(
        await f.team.protectAdministratorEmployeeUpdate(request),
        true,
      );
      assert.deepEqual(request.model, { active: true });
      f.person.active = true;
      f.person.authVersion += 1;
      return { code: "SUC_DBS_00000", result: { matchedCount: 1 } };
    },
  };
  f.registration.provisionOwned = async (owned) =>
    f.registration.updateOne(
      "DefaultEmployeeService",
      owned,
      "tenant-a",
      {
        code: f.person.code,
        loginId: f.person.loginId,
        registrationAssignmentCode: f.item.code,
        authVersion: 1,
        active: false,
        registrationSuspended: { $ne: true },
        password: f.person.password,
        principalType: "human",
        userGroups: f.item.groupCodes,
        disabled: { $ne: true },
        authenticationIdentity: { $exists: false },
      },
      { active: true },
    );
  await f.registration.provision(f.context, f.session, {}, f.item);
  assert.equal(f.enterprise.teamOperation.input.step, "ACTIVATE");
  assert.equal(f.enterprise.teamOperation.phase, "COMPLETE");
});

test("membership accept uses real ensureScope constructors; direct system-shaped ensureScope has no admission", async () => {
  const f = fixture();
  delete f.item.registration;
  const identity = {
    tenantCode: "tenant-origin",
    recordKind: "EMPLOYEE",
    recordId: "canonical-a",
  };
  f.person.authenticationIdentity = identity;
  f.person.userGroups = [];
  delete f.person.password;
  f.person.active = true;
  f.item.membership = {
    phase: "PREPARED",
    identity,
    commandId: "membership-command",
    assignmentDigest: "assignment-digest",
  };
  const anchor = {
    identity,
    person: { loginId: f.person.loginId, authVersion: 3 },
  };
  const membership = {
    ...membershipSource,
    policy: () => {},
    digest: f.registration.digest,
    base: () => f.registration,
    recordId: (value) => value,
    assignment: async () => ({ item: structuredClone(f.item) }),
    assertInviter: async () => {},
    anchor: async () => structuredClone(anchor),
    projection: async () => structuredClone(f.person),
    read: f.registration.read,
    write: async (item, patch) => ({ ...item, ...patch }),
  };
  f.registration.assertAssignment = () => {};
  SERVICE.DefaultEnterpriseMembershipService = membership;
  SERVICE.DefaultEnterpriseManagementService = {
    normalizeEmail: (email) => email,
  };
  await assert.rejects(membership.ensureScope(f.item, f.person), /CONFLICT/);
  const result = await membership.accept(anchor, structuredClone(f.item));
  assert.equal(result.membership.phase, "COMPLETE");
  assert.equal(f.commands.length, 2);
  assert.equal(f.enterprise.teamOperation.input.owner, "membership");
  for (const command of f.commands)
    assert.equal(membership.ownsAdministratorMutation(command), false);
});

test("an unrelated held operation cannot be replaced by registration owner admission", async () => {
  const f = fixture();
  f.enterprise.teamRevision = 7;
  f.enterprise.teamOperation = {
    id: "other-command",
    hash: "other",
    operation: "RESTRICT",
    phase: "PENDING",
  };
  await assert.rejects(
    f.registration.provision(f.context, f.session, {}, f.item),
    /CONFLICT/,
  );
  assert.equal(f.commands.length, 0);
  assert.equal(f.enterprise.teamRevision, 7);
});

test("private registration context never admits group changes, unrelated query fields or stale versions", async () => {
  for (const variant of [
    "group-patch",
    "extra-query",
    "stale-version",
    "wrong-phase",
  ]) {
    const f = fixture();
    f.item.registration.phase =
      variant === "wrong-phase" ? "CREDENTIAL" : "ACTIVATING";
    const query = {
      code: f.person.code,
      loginId: f.person.loginId,
      registrationAssignmentCode: f.item.code,
      authVersion: 1,
      active: false,
      registrationSuspended: { $ne: true },
      password: f.person.password,
      principalType: "human",
      userGroups: f.item.groupCodes,
      disabled: { $ne: true },
      authenticationIdentity: { $exists: false },
    };
    const patch = { active: true };
    if (variant === "group-patch") patch.userGroups = [];
    if (variant === "extra-query") query.extraAuthority = true;
    if (variant === "stale-version") query.authVersion = 2;
    SERVICE.DefaultEmployeeService = {
      update: async () => {
        throw new Error("generated write must not be reached");
      },
    };
    f.registration.provisionOwned = async (owned) =>
      f.registration.updateOne(
        "DefaultEmployeeService",
        owned,
        "tenant-a",
        query,
        patch,
      );
    await assert.rejects(
      f.registration.provision(f.context, f.session, {}, f.item),
      /CONFLICT/,
    );
    assert.equal(f.enterprise.teamOperation, undefined);
  }
});

test("enabled but unqualified generic coverage cannot acquire an onboarding fence", async () => {
  const f = fixture();
  f.management.teamAdministration.genericMutationGuard.installedCoverageQualified = false;
  await assert.rejects(
    f.registration.provision(f.context, f.session, {}, f.item),
    /UNAVAILABLE/,
  );
  assert.equal(f.commands.length, 0);
  assert.equal(f.enterprise.teamOperation, undefined);
});
