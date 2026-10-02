/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/**
 * @module profile/test/installedTeamComposition
 * @description Opt-in loopback disposable Team/Mongo generated-CAS/Redis-stamp composition. No installed business personas or qualification changes.
 * @layer test
 * @owner profile
 * @sideEffects With both explicit provider opt-ins, writes random fixture records/keys and removes only those records/keys.
 * Run: NODICS_PROFILE_INSTALLED_TEAM_MONGO_URI=mongodb://127.0.0.1:27017 NODICS_PROFILE_INSTALLED_TEAM_REDIS_URL=redis://127.0.0.1:6379 node --test <this file>
 */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const { readFileSync } = require("node:fs");
const { createHash } = require("node:crypto");
const {
  localEndpoint,
  fixtureScope,
  installedTeam,
} = require("./helpers/installedTeamComposition");

/** Captures selected source evidence; this is not deployed-build or effective-layer attestation. */
function fingerprint() {
  const hash = createHash("sha256");
  for (const path of [
    __filename,
    require.resolve("./helpers/installedTeamComposition"),
    require.resolve("../src/service/enterprise/defaultEnterpriseTeamAdministrationService"),
    require.resolve("../src/service/enterprise/defaultEnterpriseMembershipService"),
    require.resolve("../../../../nodics.foundation/modules/nDatabase/database/src/service/schema/defaultModelConcurrencyService"),
    require.resolve("../../../../nodics.foundation/modules/nDatabase/mongodb/src/schemas/model"),
    require.resolve("../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultPrincipalSecurityStampService"),
    require.resolve("../../../../nodics.foundation/modules/nCache/redisCache/src/service/cache/defaultRedisCacheService"),
  ])
    hash.update(path).update("\0").update(readFileSync(path)).update("\0");
  return hash.digest("hex");
}

test("Team provider probes reject nonlocal, credentialed, selected-database and nonrandom scopes", () => {
  for (const uri of [
    "mongodb://remote.invalid:27017",
    "mongodb://127.0.0.1:27017/business",
    "mongodb://user:secret@127.0.0.1:27017",
    "mongodb://127.0.0.1:27017/?replicaSet=foreign",
  ])
    assert.throws(() => localEndpoint(uri, "mongodb:"));
  for (const uri of [
    "redis://remote.invalid:6379",
    "redis://127.0.0.1:6379/3",
    "http://127.0.0.1:6379",
  ])
    assert.throws(() => localEndpoint(uri, "redis:"));
  for (const scope of [
    "default",
    "profile",
    "nodics_profile_qualification_../project",
  ])
    assert.throws(() => fixtureScope(scope));
});

const mongo = process.env.NODICS_PROFILE_INSTALLED_TEAM_MONGO_URI;
const redis = process.env.NODICS_PROFILE_INSTALLED_TEAM_REDIS_URL;
test(
  "installed disposable Team generated Mongo CAS and Redis stamp composition",
  {
    skip: !mongo && !redis,
    timeout: 60000,
  },
  async (context) => {
    assert(mongo && redis, "Both explicit Team provider opt-ins are required");
    const before = fingerprint();
    const installed = await installedTeam(mongo, redis);
    let passed = 0;
    try {
      await context.test(
        "committed WITHDRAW lost ack repairs through original command without a second assignment write",
        async () => {
          const f = await installed.scenario();
          f.faults.assignmentAck = true;
          await assert.rejects(
            f.team.withdrawInvitation(f.original),
            /fixture assignment read lost/,
          );
          assert.equal((await f.readAssignment()).status, "REVOKED");
          assert.equal(
            (await f.readEnterprise()).teamOperation.phase,
            "PENDING",
          );
          const result = await f.team.withdrawInvitation(f.original);
          assert.equal(result.status, "REVOKED");
          assert.equal(result.accepted, false);
          assert.equal(f.counts.assignment, 1);
          assert.equal((await f.readStamp()).authVersion, 4);
          assert.equal(
            (await f.readEnterprise()).teamOperation.phase,
            "COMPLETE",
          );
          assert.deepEqual(await f.team.withdrawInvitation(f.original), result);
          assert.equal(f.counts.assignment, 1);
          passed++;
        },
      );
      await context.test(
        "operator repairs committed stamp failure after original actor loss and projects no private evidence",
        async () => {
          const f = await installed.scenario();
          f.faults.stampBefore = true;
          await assert.rejects(
            f.team.withdrawInvitation(f.original),
            /fixture stamp unavailable/,
          );
          f.loseOriginalActor();
          await assert.rejects(
            f.team.withdrawInvitation(f.original),
            /fixture actor denied/,
          );
          const view = await f.inspect();
          assert.equal(view.operation.recoverable, true);
          const result = await f.team.reconcileCommittedOperation(f.operator);
          assert.equal(result.status, "REVOKED");
          assert.equal((await f.readStamp()).authVersion, 4);
          assert.equal(f.counts.assignment, 1);
          const publicRow = (await f.publicEnterprise()).result[0];
          for (const value of [result, view, publicRow])
            for (const privateKey of [
              "fixture-original",
              "fixture-operator",
              "invitationWithdrawal",
              "membershipMutation",
              '"hash"',
              '"input"',
            ])
              assert(!JSON.stringify(value).includes(privateKey));
          assert.equal(publicRow.teamOperation, undefined);
          assert.equal(publicRow.teamRevision, undefined);
          passed++;
        },
      );
      await context.test(
        "Redis lost acknowledgement retains committed evidence and rejects stale or non-PASSWORD recovery",
        async () => {
          const f = await installed.scenario();
          f.faults.stampAfter = true;
          await assert.rejects(
            f.team.withdrawInvitation(f.original),
            /fixture stamp acknowledgement lost/,
          );
          assert.equal((await f.readStamp()).authVersion, 4);
          const pending = await f.readEnterprise();
          await assert.rejects(
            f.team.reconcileCommittedOperation({
              ...f.operator,
              body: { ...f.operator.body, teamRevision: 2 },
            }),
          );
          await assert.rejects(
            f.team.reconcileCommittedOperation({
              ...f.operator,
              body: {
                ...f.operator.body,
                operationId: "other_operation_123456",
              },
            }),
          );
          f.operator.authData.authenticationMethod = "OTP";
          await assert.rejects(f.team.reconcileCommittedOperation(f.operator));
          f.operator.authData.authenticationMethod = "PASSWORD";
          f.operator.authData.principalType = "service";
          await assert.rejects(f.team.reconcileCommittedOperation(f.operator));
          f.operator.authData.principalType = "human";
          assert.deepEqual(await f.readEnterprise(), pending);
          assert.equal(f.counts.enterprise, 1);
          assert.equal(f.counts.assignment, 1);
          assert.equal(
            (await f.team.reconcileCommittedOperation(f.operator)).status,
            "REVOKED",
          );
          assert.equal((await f.readStamp()).authVersion, 4);
          assert.equal(f.counts.assignment, 1);
          assert.equal(
            (await f.readEnterprise()).teamOperation.phase,
            "COMPLETE",
          );
          passed++;
        },
      );
      await context.test(
        "same-command concurrency remains one assignment commit and competing commands cannot steal the fence",
        async () => {
          const f = await installed.scenario();
          await f.team.begin(
            f.original,
            "WITHDRAW",
            f.original.body,
            f.enterprise.code,
          );
          const competing = {
            ...f.original,
            body: { ...f.original.body, operationId: "other_operation_123456" },
          };
          await assert.rejects(f.team.withdrawInvitation(competing));
          assert.equal(f.counts.assignment, 0);
          const results = await Promise.allSettled([
            f.team.withdrawInvitation(f.original),
            f.team.withdrawInvitation(f.original),
          ]);
          assert(results.some((result) => result.status === "fulfilled"));
          assert.equal(f.counts.assignment, 1);
          assert.equal((await f.readAssignment()).revision, 4);
          assert.equal(
            (await f.readEnterprise()).teamOperation.id,
            f.original.body.operationId,
          );
          assert.equal((await f.readStamp()).authVersion, 4);
          passed++;
        },
      );
      await context.test(
        "uncommitted/stale evidence and forged direct writes preserve the pending fence",
        async () => {
          const f = await installed.scenario();
          await f.team.begin(
            f.original,
            "WITHDRAW",
            f.original.body,
            f.enterprise.code,
          );
          assert.equal((await f.inspect()).operation.recoverable, false);
          await assert.rejects(f.team.reconcileCommittedOperation(f.operator));
          await assert.rejects(
            f.team.withdrawInvitation({
              ...f.original,
              body: { ...f.original.body, revision: 2 },
            }),
          );
          await assert.rejects(
            SERVICE.DefaultEnterpriseService.update({
              tenant: "fixture",
              query: { code: f.enterprise.code },
              model: { teamOperation: {} },
            }),
          );
          assert.equal(
            (await f.readEnterprise()).teamOperation.phase,
            "PENDING",
          );
          assert.equal(f.counts.assignment, 0);
          assert.equal(f.counts.enterprise, 1);
          passed++;
        },
      );
      await context.test(
        "HANDOVER before final write never stores partial designation and stays nonrecoverable",
        async () => {
          const f = await installed.scenario();
          f.prepareHandover();
          f.faults.rejectFinish = true;
          await assert.rejects(
            f.team.handover(f.original),
            /fixture finish uncommitted/,
          );
          const saved = await f.readEnterprise();
          assert.equal(
            saved.defaultAdminAssignmentCode,
            "original-fixture-admin",
          );
          assert.equal(saved.teamOperation.phase, "PENDING");
          assert.equal((await f.inspect()).operation.recoverable, false);
          await assert.rejects(f.team.reconcileCommittedOperation(f.operator));
          assert.equal(f.counts.assignment, 0);
          passed++;
        },
      );
      await context.test(
        "HANDOVER atomic designation and COMPLETE survive lost ack/readback without another mutation",
        async () => {
          const f = await installed.scenario();
          f.prepareHandover();
          f.faults.finishAck = f.faults.finishRead = true;
          await assert.rejects(
            f.team.handover(f.original),
            /fixture enterprise read lost/,
          );
          const saved = await f.readEnterprise();
          assert.equal(saved.defaultAdminAssignmentCode, f.assignment.code);
          assert.equal(saved.adminEmail, f.assignment.normalizedEmail);
          assert.equal(saved.teamOperation.phase, "COMPLETE");
          const write = f.updates.find(
            (update) => update.model.teamOperation?.phase === "COMPLETE",
          );
          assert.equal(
            write.model.defaultAdminAssignmentCode,
            f.assignment.code,
          );
          assert.equal(write.query["teamOperation.phase"], "PENDING");
          assert.equal(write.query.teamRevision, 1);
          assert.equal((await f.inspect()).operation.recoverable, false);
          assert.deepEqual(
            await f.team.handover(f.original),
            saved.teamOperation.outcome,
          );
          assert.equal(f.counts.enterprise, 2);
          assert.equal(f.counts.assignment, 0);
          passed++;
        },
      );
      assert.equal(passed, 7);
      assert.equal(
        fingerprint(),
        before,
        "Selected source changed during the installed probe",
      );
    } finally {
      await installed.close();
    }
    context.diagnostic(
      JSON.stringify({
        kind: "PROFILE_INSTALLED_TEAM_COMPOSITION",
        scenarios: passed,
        sourceFingerprint: before,
        cleanupVerified: true,
        installedMongoCas: true,
        redisStampOwner: true,
        fixtureStampTtlSeconds: 120,
        redisConnectTimeoutMs: 5000,
        redisReconnect: false,
        fixtureSchemasOnly: true,
        actorProof: "IN_MEMORY_FIXTURE",
        fullProfileHooks: false,
        installedRuntimeSourceMatch: "NOT_ESTABLISHED",
        teamQualified: false,
        browserAccepted: false,
      }),
    );
  },
);
