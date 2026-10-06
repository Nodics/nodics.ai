/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotKnowledge/test/runtimeSession
 * @description Holds a disposable backend for separately owned frontend acceptance. Credentials remain in a private temporary manifest; no frontend is launched.
 * @layer test @owner copilotKnowledge
 */
const fs = require("node:fs");
const path = require("node:path");
const readline = require("node:readline/promises");
const fixture = require("./runtimeFixture");

/** Serves a fixed fixture lifecycle over stdin, never exposing an administrative HTTP test API. */
async function main() {
  if (process.env.NODICS_COPILOT_RUNTIME_ACCEPTANCE !== "1")
    throw new Error("Explicit acceptance opt-in required");
  const runtime = await fixture.start({
    erasureEnabled: true,
    withRegistration: process.env.NODICS_COPILOT_REGISTER_ACCEPTANCE === "1",
    withAxis: process.env.NODICS_COPILOT_AXIS_ACCEPTANCE === "1",
    withOllama: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE === "1",
    withBudgets: process.env.NODICS_COPILOT_PERSISTENT_ACCEPTANCE === "1",
    withProcessInspection:
      process.env.NODICS_COPILOT_PROCESS_INSPECTION_ACCEPTANCE === "1",
    withRulesInspection:
      process.env.NODICS_COPILOT_RULES_INSPECTION_ACCEPTANCE === "1",
    withEnterpriseActions:
      process.env.NODICS_COPILOT_ENTERPRISE_ACCEPTANCE === "1",
    withEnterpriseResponseLoss:
      process.env.NODICS_COPILOT_ENTERPRISE_RESPONSE_LOSS === "1",
    withDeleteResponseLoss:
      process.env.NODICS_COPILOT_DELETE_RESPONSE_LOSS === "1",
    journalResponseLoss:
      process.env.NODICS_COPILOT_JOURNAL_RESPONSE_LOSS || null,
  });
  const input = readline.createInterface({ input: process.stdin });
  const manifest = path.join(runtime.root, "browser-acceptance.json");
  const evidencePath = process.env.NODICS_COPILOT_RESOURCE_LEDGER;
  /** Persists only the fixture's explicitly sanitized resource inventory. */
  function persistEvidence() {
    if (evidencePath)
      fs.writeFileSync(
        evidencePath,
        JSON.stringify(runtime.evidence(), null, 2) + "\n",
        { mode: 0o600 },
      );
  }
  persistEvidence();
  fs.writeFileSync(
    manifest,
    JSON.stringify({
      baseUrl: runtime.baseUrl,
      projectCode: runtime.projectCode,
      loginId: "copilot_acceptance_operator",
      password: runtime.password,
      enterpriseCode: "default",
      axisRuntimes: runtime.axisRuntimes,
    }),
    { mode: 0o600 },
  );
  console.log(
    JSON.stringify({
      phase: "READY",
      baseUrl: runtime.baseUrl,
      privateManifest: manifest,
    }),
  );
  const stop = () => input.close();
  process.once("SIGTERM", stop);
  process.once("SIGINT", stop);
  try {
    for await (const command of input) {
      if (command === "close") break;
      if (
        ["restart-process", "restart-staged", "restart-online"].includes(
          command,
        )
      ) {
        await runtime.restartAxisRuntime(
          {
            "restart-process": "PROCESS",
            "restart-staged": "WCMS_STAGED",
            "restart-online": "WCMS_ONLINE",
          }[command],
        );
        console.log("RESTARTED_AXIS_RUNTIME");
        continue;
      }
      if (command === "diagnostics") {
        console.log(JSON.stringify(runtime.runtimeDiagnostics()));
        continue;
      }
      if (command === "restart") {
        await runtime.restart();
        console.log("RESTARTED");
      } else if (command === "revoke") {
        await runtime.target.revoke();
        console.log("WRITER_REVOKED");
      } else if (command === "lose-delete-response" && runtime.fault) {
        runtime.fault.arm();
        console.log("DELETE_RESPONSE_LOSS_ARMED");
      } else if (command === "restart-read-only") {
        await runtime.restartReadOnly();
        console.log("RESTARTED_READ_ONLY");
      } else console.log("UNKNOWN_COMMAND");
    }
  } finally {
    input.close();
    try {
      await runtime.close();
    } finally {
      persistEvidence();
    }
  }
}
main().catch(() => {
  console.error("DISPOSABLE_ACCEPTANCE_SESSION_FAILED");
  process.exitCode = 1;
});
