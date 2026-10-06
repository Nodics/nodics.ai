/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotWorkbench/test/copilotEnterpriseRuntime
 * @description Exercises enterprise preparation, approval and execution through actual Profile HTTP authority and generated action persistence in an isolated test database.
 * @layer test @owner copilotWorkbench
 * @sideEffects Creates synthetic enterprises and pending invitations only in the owned fixture; does not activate employees or qualify notification delivery.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fixture = require("../../copilotKnowledge/test/helpers/runtimeAcceptance/runtimeFixture");

for (const scenario of ["normal", "response-loss", "natural-language"])
  test(
    "real employee enterprise action persists original business results without replay: " +
      scenario,
    {
      skip: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE !== "1",
      timeout: 600000,
    },
    async (t) => {
      const withEnterpriseResponseLoss = scenario === "response-loss";
      const runtime = await fixture.start({
        withRegistration: true,
        withEnterpriseActions: true,
        withEnterpriseResponseLoss,
        withOllama: scenario === "natural-language",
      });
      t.after(() => runtime.close());
      let token;
      /** Sends one known owner API call without transport retries or credential output. */
      async function request(path, body, expected = 200) {
        const response = await fetch(runtime.baseUrl + "/nodics/" + path, {
          method: body === undefined ? "GET" : "POST",
          redirect: "error",
          signal: AbortSignal.timeout(120000),
          headers: {
            "Content-Type": "application/json",
            "x-enterprise-code": "default",
            ...(token ? { Authorization: "Bearer " + token } : {}),
          },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
        const value = await response.json();
        if (response.status !== expected)
          t.diagnostic(JSON.stringify(runtime.runtimeDiagnostics()));
        assert.equal(response.status, expected, JSON.stringify(value));
        return value.data || value.result || value;
      }
      /** Authenticates through actual Profile credentials. */
      async function login(role = "operator") {
        token = undefined;
        token = (
          await request("profile/v0/employee/authenticate", {
            loginId: "copilot_acceptance_" + role,
            password: runtime.password,
          })
        ).authToken;
        assert.ok(token);
      }
      const input = {
        operation: "profile.enterprise.onboard",
        enterprise: {
          code: "acceptance_business",
          name: "Disposable Copilot Business",
          adminEmail: "admin@acceptance.invalid",
        },
        employees: [
          { email: "one@acceptance.invalid", roleCode: "OPERATOR" },
          { email: "two@acceptance.invalid", roleCode: "VIEWER" },
          { email: "three@acceptance.invalid", roleCode: "CONTENT_MANAGER" },
        ],
      };
      await login("reader");
      await request("copilotApi/v0/enterprises/prepare", input, 403);
      await login();
      const incomplete = await request("copilotApi/v0/enterprises/prepare", {
        operation: input.operation,
      });
      assert.equal(incomplete.plan.state, "CLARIFICATION_REQUIRED");
      let prepared;
      if (scenario === "natural-language") {
        const created = await request("copilotApi/v0/conversations", {
          title: "Owned enterprise acceptance",
        });
        const path =
          "copilotApi/v0/conversations/" +
          created.conversation.conversationCode +
          "/turns";
        const turnInput = {
          idempotencyKey: "enterprise-language-turn",
          message:
            "Create enterprise with code acceptance_business, name Disposable Copilot Business, administrator email admin@acceptance.invalid. Invite three employees: one@acceptance.invalid with role OPERATOR; two@acceptance.invalid with role VIEWER; three@acceptance.invalid with role CONTENT_MANAGER.",
        };
        const turn = await request(path, turnInput);
        assert.ok(turn.confirmation, JSON.stringify(turn));
        assert.equal(turn.confirmation.operationId, input.operation);
        prepared = {
          actionCode: turn.confirmation.confirmationCode,
          confirmation: turn.confirmation,
        };
        const usage = await request("copilotApi/v0/usage");
        assert.equal(usage.totals.calls, 1);
        assert.ok(usage.totals.consumed > 0);
        await request(path, turnInput);
        assert.deepEqual(
          (await request("copilotApi/v0/usage")).totals,
          usage.totals,
        );
        t.diagnostic("REAL_OLLAMA_ENTERPRISE_INTENT_MEASURED_NO_REPLAY_PASS");
      } else {
        prepared = await request("copilotApi/v0/enterprises/prepare", input);
        assert.equal(
          prepared.preview.employeeActivation,
          "INVITEE_REGISTRATION_REQUIRED",
        );
      }
      const endpoint = "copilotApi/v0/confirmations/" + prepared.actionCode;
      const proof = {
        expectedRevision: prepared.confirmation.revision,
        argumentsDigest: prepared.confirmation.argumentsDigest,
      };
      const before = await request(
        "profile/v0/enterprises/search?code=acceptance_business",
      );
      assert.equal(before.items.length, 0);
      const approved = await request(endpoint + "/approve", proof);
      assert.equal(
        (
          await request(
            "profile/v0/enterprises/search?code=acceptance_business",
          )
        ).items.length,
        0,
      );
      let execution = await request(endpoint + "/execute", {
        ...proof,
        expectedRevision: approved.confirmation.revision,
      });
      if (withEnterpriseResponseLoss) {
        assert.equal(execution.state, "OUTCOME_UNKNOWN");
        assert.deepEqual(
          execution.rows.map((row) => row.state),
          ["OUTCOME_UNKNOWN", "NOT_STARTED", "NOT_STARTED", "NOT_STARTED"],
        );
        assert.equal(
          (
            await request(
              "profile/v0/enterprises/search?code=acceptance_business",
            )
          ).items.length,
          1,
        );
        const nativeInvitations =
          "profile/v0/enterprises/access-assignments?enterpriseCode=acceptance_business";
        assert.equal((await request(nativeInvitations)).items.length, 1);
        const uncertain = await request(endpoint);
        await runtime.restart();
        await login("reader");
        await request(
          endpoint + "/original-results",
          { ...proof, expectedRevision: execution.revision },
          403,
        );
        await login();
        assert.deepEqual(await request(endpoint), uncertain);
        const recovered = await request(endpoint + "/original-results", {
          ...proof,
          expectedRevision: execution.revision,
        });
        assert.equal(recovered.confirmation.state, "PENDING");
        assert.equal((await request(nativeInvitations)).items.length, 1);
        const continuation = {
          expectedRevision: recovered.confirmation.revision,
          argumentsDigest: recovered.confirmation.argumentsDigest,
        };
        const renewed = await request(endpoint + "/approve", continuation);
        execution = await request(endpoint + "/execute", {
          ...continuation,
          expectedRevision: renewed.confirmation.revision,
        });
        assert.equal(
          runtime
            .runtimeDiagnostics()
            .diagnostics.filter(
              (item) => item.code === "ENTERPRISE_NATIVE_COMPLETED",
            ).length,
          1,
        );
        assert.equal(
          runtime
            .runtimeDiagnostics()
            .diagnostics.filter(
              (item) => item.code === "ENTERPRISE_RESPONSE_LOST",
            ).length,
          1,
        );
      }
      if (execution.state !== "CONSUMED")
        t.diagnostic(JSON.stringify(runtime.runtimeDiagnostics()));
      assert.equal(execution.state, "CONSUMED", JSON.stringify(execution));
      assert.equal(execution.result.operationsCompleted, 4);
      assert.deepEqual(
        execution.rows.map((row) => row.state),
        ["COMPLETED", "COMPLETED", "COMPLETED", "COMPLETED"],
      );
      const enterprises = await request(
        "profile/v0/enterprises/search?code=acceptance_business",
      );
      assert.equal(enterprises.items.length, 1);
      assert.equal(enterprises.items[0].code, input.enterprise.code);
      const invitations = await request(
        "profile/v0/enterprises/access-assignments?enterpriseCode=acceptance_business",
      );
      assert.equal(invitations.items.length, 4);
      assert.ok(invitations.items.every((item) => item.status === "PENDING"));
      assert.deepEqual(
        invitations.items.map((item) => item.email).sort(),
        [
          input.enterprise.adminEmail,
          ...input.employees.map((item) => item.email),
        ].sort(),
      );
      const original = await request(endpoint);
      await runtime.restart();
      await login();
      assert.deepEqual(await request(endpoint), original);
      assert.equal(
        (
          await request(
            "profile/v0/enterprises/search?code=acceptance_business",
          )
        ).items.length,
        1,
      );
      assert.equal(
        (
          await request(
            "profile/v0/enterprises/access-assignments?enterpriseCode=acceptance_business",
          )
        ).items.length,
        4,
      );
      t.diagnostic("REAL_PROFILE_ENTERPRISE_INVITATIONS_RESTART_PASS");
      if (scenario === "normal") {
        const invitationInput = {
          operation: "profile.enterprise.invite",
          enterpriseCode: input.enterprise.code,
          employees: [{ email: "four@acceptance.invalid", roleCode: "VIEWER" }],
        };
        const nativePath =
          "profile/v0/enterprises/access-assignments?enterpriseCode=acceptance_business";
        await login("reader");
        await request(
          "copilotApi/v0/invitations/prepare",
          invitationInput,
          403,
        );
        await login();
        await request(
          "copilotApi/v0/invitations/prepare",
          {
            ...invitationInput,
            employees: [
              { email: "four@acceptance.invalid", roleCode: "INVALID" },
            ],
          },
          400,
        );
        const missingRole = await request("copilotApi/v0/invitations/prepare", {
          ...invitationInput,
          employees: [{ email: "four@acceptance.invalid" }],
        });
        assert.equal(missingRole.plan.state, "CLARIFICATION_REQUIRED");
        const invitation = await request(
          "copilotApi/v0/invitations/prepare",
          invitationInput,
        );
        assert.equal((await request(nativePath)).items.length, 4);
        const invitationPath =
          "copilotApi/v0/confirmations/" + invitation.actionCode;
        const invitationProof = {
          expectedRevision: invitation.confirmation.revision,
          argumentsDigest: invitation.confirmation.argumentsDigest,
        };
        const invitationApproval = await request(
          invitationPath + "/approve",
          invitationProof,
        );
        assert.equal((await request(nativePath)).items.length, 4);
        await request(invitationPath + "/execute", invitationProof, 409);
        assert.equal((await request(nativePath)).items.length, 4);
        const invitationExecution = await request(invitationPath + "/execute", {
          ...invitationProof,
          expectedRevision: invitationApproval.confirmation.revision,
        });
        assert.equal(invitationExecution.state, "CONSUMED");
        assert.equal(invitationExecution.rows.length, 1);
        assert.equal(invitationExecution.rows[0].state, "COMPLETED");
        const finalInvitations = await request(nativePath);
        assert.equal(finalInvitations.items.length, 5);
        assert.equal(
          finalInvitations.items.filter(
            (item) => item.email === "four@acceptance.invalid",
          ).length,
          1,
        );
        assert.ok(
          finalInvitations.items.every((item) => item.status === "PENDING"),
        );
        const invitationOriginal = await request(invitationPath);
        await runtime.restart();
        await login();
        assert.deepEqual(await request(invitationPath), invitationOriginal);
        assert.equal((await request(nativePath)).items.length, 5);
        t.diagnostic(
          "REAL_PROFILE_STANDALONE_INVITATION_NO_WRITE_REVIEW_STALE_REVISION_RESTART_PASS",
        );
      }
    },
  );
