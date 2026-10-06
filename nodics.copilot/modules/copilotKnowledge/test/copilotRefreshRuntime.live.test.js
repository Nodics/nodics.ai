/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotKnowledge/test/copilotRefreshRuntime
 * @description Qualifies reviewed source refresh through real Process publication, runtime credentials, callback claims and persistent original-attempt inspection.
 * @layer test @owner copilotKnowledge
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fixture = require("./helpers/runtimeAcceptance/runtimeFixture");

for (const withScheduleResponseLoss of [false, true])
  test(
    "recorded refresh uses the real Process owner and survives restart; activation response loss=" +
      withScheduleResponseLoss,
    {
      skip: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE !== "1",
      timeout: 600000,
    },
    async (t) => {
      const runtime = await fixture.start({
        withAxis: true,
        withRegistration: true,
        withRefresh: true,
        withScheduleResponseLoss,
        withIncremental: true,
      });
      t.after(() => runtime.close());
      const processOrigin = runtime.axisRuntimes.find(
        (x) => x.role === "PROCESS",
      ).origin;
      let token;
      /** Calls a known owned runtime without retries or credential logging. */
      async function request(origin, path, body, status = 200) {
        const response = await fetch(origin + "/nodics/" + path, {
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
        if (response.status !== status)
          t.diagnostic(JSON.stringify(runtime.runtimeDiagnostics()));
        assert.equal(response.status, status, JSON.stringify(value));
        return value.data || value.result || value;
      }
      /** Authenticates a real scoped employee. */
      async function login(role = "operator") {
        token = undefined;
        token = (
          await request(runtime.baseUrl, "profile/v0/employee/authenticate", {
            loginId: "copilot_acceptance_" + role,
            password: runtime.password,
          })
        ).authToken;
        assert.ok(token);
      }
      await login();
      const catalogue = await request(processOrigin, "import/v0/init");
      const release = (catalogue.data || catalogue.items || catalogue).find(
        (x) => x.releaseCode === "copilotApi:knowledgeRefreshWorkflow",
      );
      assert.ok(
        release,
        "Canonical Copilot-owned Process release must be discoverable",
      );
      await request(processOrigin, "import/v0/init/install", {
        releaseCodes: [release.releaseCode],
        expectedReleases: { [release.releaseCode]: release.version },
      });
      const root = "copilotApi/v0/knowledge/sources/acceptance";
      await request(runtime.baseUrl, root + "/preview", {});
      const inventory = await request(
        runtime.baseUrl,
        "copilotApi/v0/knowledge/sources",
      );
      const source = inventory.sources.find((x) => x.code === "acceptance");
      const command = {
        requestId: crypto.randomUUID(),
        expectedPolicyDigest: source.sourcePolicyDigest,
      };
      assert.match(command.expectedPolicyDigest, /^[a-f0-9]{64}$/);
      const preview = await request(
        runtime.baseUrl,
        root + "/refresh/preview",
        command,
      );
      assert.equal(preview.state, "REVIEW");
      const confirmed = {
        ...command,
        reviewDigest: preview.reviewDigest,
        confirmed: true,
      };
      await request(
        runtime.baseUrl,
        root + "/refresh/start",
        { ...confirmed, confirmed: false },
        503,
      );
      const started = await request(
        runtime.baseUrl,
        root + "/refresh/start",
        confirmed,
      );
      assert.equal(started.state, "START_ACKNOWLEDGED");
      const original = await request(
        runtime.baseUrl,
        root + "/refresh/inspect",
        {
          requestId: command.requestId,
        },
      );
      assert.equal(original.state, "ATTEMPTS_AVAILABLE");
      assert.equal(original.history.items.length, 1);
      assert.equal(
        original.history.items[0].status,
        "COMPLETED",
        JSON.stringify(original),
      );
      const replay = await request(
        runtime.baseUrl,
        root + "/refresh/start",
        confirmed,
      );
      assert.equal(replay.instanceCode, started.instanceCode);
      assert.deepEqual(
        (
          await request(runtime.baseUrl, root + "/refresh/inspect", {
            requestId: command.requestId,
          })
        ).history.items,
        original.history.items,
      );
      await request(processOrigin, "process/v0/triggers", {
        code: "acceptance-refresh-trigger",
        definitionCode: "copilotKnowledgeRefresh",
        version: 1,
        status: "ACTIVE",
        triggerType: "CRON",
        ownerModule: "copilotApi",
        cronJobCode: "acceptance-refresh-job",
      });
      const cron = "cronjob/v0/schedules";
      const draft = {
        code: "acceptance-refresh-job",
        name: "Disposable source refresh",
        targetCode: "acceptance-refresh",
        expression: "*/5 * * * * *",
      };
      const draftReview = await request(
        processOrigin,
        cron + "/drafts/preview",
        draft,
      );
      const saved = await request(processOrigin, cron + "/drafts", {
        ...draft,
        reviewDigest: draftReview.reviewDigest,
        confirmed: true,
      });
      assert.equal(saved.outcome, "SAVED_INACTIVE");
      let schedule = await request(processOrigin, cron + "/lifecycle/inspect", {
        code: draft.code,
      });
      assert.equal(schedule.state, "SAVED_INACTIVE");
      const activation = {
        code: draft.code,
        expectedRevision: schedule.revision,
        intent: "ACTIVATE",
      };
      const activationReview = await request(
        processOrigin,
        cron + "/lifecycle/preview",
        activation,
      );
      const activationCommand = {
        ...activation,
        reviewDigest: activationReview.reviewDigest,
        confirmed: true,
      };
      schedule = await request(
        processOrigin,
        cron + "/lifecycle/execute",
        activationCommand,
        withScheduleResponseLoss ? 409 : 200,
      );
      if (withScheduleResponseLoss) {
        assert.equal(
          runtime.diagnostics.filter(
            (item) => item.code === "CRON_ACTIVATION_RESPONSE_LOST",
          ).length,
          1,
        );
        schedule = await request(processOrigin, cron + "/lifecycle/inspect", {
          code: draft.code,
        });
        assert.equal(schedule.state, "OUTCOME_UNKNOWN");
        await request(
          processOrigin,
          cron + "/lifecycle/execute",
          activationCommand,
          409,
        );
        schedule = await request(processOrigin, cron + "/lifecycle/reconcile", {
          code: draft.code,
          expectedRevision: schedule.revision,
        });
      }
      assert.equal(schedule.state, "ACTIVE");
      let scheduledAttempt;
      for (let poll = 0; poll < 60; poll++) {
        const history = await request(runtime.baseUrl, root + "/history");
        scheduledAttempt = history.items.find(
          (x) =>
            x.instanceCode !== started.instanceCode && x.status === "COMPLETED",
        );
        if (scheduledAttempt) break;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      assert.ok(
        scheduledAttempt,
        "Actual timer must produce a completed source refresh attempt",
      );
      schedule = await request(processOrigin, cron + "/lifecycle/inspect", {
        code: draft.code,
      });
      const deactivation = {
        code: draft.code,
        expectedRevision: schedule.revision,
        intent: "DEACTIVATE",
      };
      const stopReview = await request(
        processOrigin,
        cron + "/lifecycle/preview",
        deactivation,
      );
      schedule = await request(processOrigin, cron + "/lifecycle/execute", {
        ...deactivation,
        reviewDigest: stopReview.reviewDigest,
        confirmed: true,
      });
      assert.equal(schedule.state, "INACTIVE");
      const event = {
        eventId: crypto.randomUUID(),
        sourceCode: "acceptance",
        expectedPolicyDigest: command.expectedPolicyDigest,
      };
      const notified = await runtime.notifySourceEvent(event);
      assert.equal(notified.status, 200, JSON.stringify(notified.body));
      const eventReceipt = notified.body.data || notified.body.result;
      assert.equal(eventReceipt.state, "START_ACKNOWLEDGED");
      const eventAttempts = (
        await request(runtime.baseUrl, root + "/history")
      ).items.filter((x) => x.instanceCode === eventReceipt.instanceCode);
      assert.equal(eventAttempts.length, 1);
      assert.equal(eventAttempts[0].status, "COMPLETED");
      assert.equal((await runtime.notifySourceEvent(event)).status, 200);
      assert.deepEqual(
        (await request(runtime.baseUrl, root + "/history")).items.filter(
          (x) => x.instanceCode === eventReceipt.instanceCode,
        ),
        eventAttempts,
      );
      assert.equal(
        (
          await runtime.notifySourceEvent({
            ...event,
            eventId: crypto.randomUUID(),
            expectedPolicyDigest: "0".repeat(64),
          })
        ).status,
        503,
      );
      await request(
        runtime.baseUrl,
        "copilotApi/v0/knowledge/events/sourceChanged",
        event,
        403,
      );
      await runtime.restartAxisRuntime("PROCESS");
      await login();
      assert.equal(
        (
          await request(processOrigin, cron + "/lifecycle/inspect", {
            code: draft.code,
          })
        ).state,
        "INACTIVE",
      );
      await runtime.restart();
      await login();
      const restarted = await request(
        runtime.baseUrl,
        root + "/refresh/inspect",
        { requestId: command.requestId },
      );
      assert.deepEqual(restarted.history.items, original.history.items);
      assert.equal((await runtime.notifySourceEvent(event)).status, 200);
      assert.deepEqual(
        (await request(runtime.baseUrl, root + "/history")).items.filter(
          (x) => x.instanceCode === eventReceipt.instanceCode,
        ),
        eventAttempts,
      );
      await runtime.restartRecordedRefreshDisabled();
      await login();
      await request(runtime.baseUrl, root + "/refresh/start", confirmed, 503);
      assert.deepEqual(
        (
          await request(runtime.baseUrl, root + "/refresh/inspect", {
            requestId: command.requestId,
          })
        ).history.items,
        original.history.items,
      );
      t.diagnostic(
        "REAL_MANUAL_SCHEDULED_EVENT_REFRESH_ORIGINAL_HISTORY_RESTART_PASS",
      );
    },
  );
