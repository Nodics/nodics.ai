/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotKnowledge/test/copilotAxisInitialization
 * @description Qualifies real four-runtime CMS initialization, Process approval and Copilot activation without substituting the Axis browser or owner persistence.
 * @layer test @owner copilotKnowledge
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const fixture = require("./helpers/runtimeAcceptance/runtimeFixture");
const { initialize } = require("./helpers/runtimeAcceptance/initializeAxis");

test(
  "isolated Axis baseline publishes through Process and activates Copilot",
  {
    skip: process.env.NODICS_COPILOT_AXIS_ACCEPTANCE !== "1",
    timeout: 600000,
  },
  async (t) => {
    const runtime = await fixture.start({
      withAxis: true,
      withRegistration: true,
    });
    t.after(async () => {
      await runtime.close();
      const evidence = runtime.evidence();
      assert.equal(evidence.axisRuntimes.length, 3);
      assert.equal(
        new Set([
          evidence.databaseName,
          ...evidence.axisRuntimes.map((row) => row.databaseName),
        ]).size,
        4,
      );
      assert.equal(evidence.cleanup.finalized, true);
      assert.ok(
        evidence.cleanup.resources.every((row) => row.state === "CLOSED"),
      );
      assert.equal(fs.existsSync(evidence.compositionRoot), false);
    });
    try {
      assert.deepEqual(await initialize(runtime), {
        readiness: "READY",
        publicationState: "ONLINE",
        copilotActivated: true,
      });
    } catch (error) {
      t.diagnostic(JSON.stringify(runtime.runtimeDiagnostics()));
      throw error;
    }
  },
);
