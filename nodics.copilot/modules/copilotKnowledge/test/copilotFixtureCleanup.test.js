/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module copilotKnowledge/test/copilotFixtureCleanup @description Verifies cleanup continuation, failure minimization, retry and ownership. @layer test @owner copilotKnowledge */
const test = require("node:test");
const assert = require("node:assert/strict");
const { create } = require("./helpers/runtimeAcceptance/ownedCleanup");

test("cleanup attempts every owned resource, retains composition on failure and retries only failures", async () => {
  const calls = [];
  let fail = true;
  const cleanup = create(() => calls.push("composition"));
  cleanup.add("database:owned", () => calls.push("database"));
  cleanup.add("provider:owned", () => {
    calls.push("provider");
    if (fail) throw new Error("private credential");
  });
  cleanup.add("process:owned", () => calls.push("process"));
  await assert.rejects(
    cleanup.close(),
    (error) => error.message === "Owned fixture cleanup failed: provider:owned",
  );
  assert.deepEqual(calls, ["process", "provider", "database"]);
  assert.equal(cleanup.snapshot().finalized, false);
  assert.doesNotMatch(JSON.stringify(cleanup.snapshot()), /private credential/);
  fail = false;
  await cleanup.close();
  await cleanup.close();
  assert.deepEqual(calls, [
    "process",
    "provider",
    "database",
    "provider",
    "composition",
  ]);
  assert.ok(
    cleanup.snapshot().resources.every((item) => item.state === "CLOSED"),
  );
  assert.equal(cleanup.snapshot().finalized, true);
});

test("concurrent close coalesces and foreign/duplicate resource identifiers are rejected", async () => {
  let release;
  let calls = 0;
  const cleanup = create(() => {});
  cleanup.add("process:owned", () => {
    calls++;
    return new Promise((resolve) => {
      release = resolve;
    });
  });
  assert.throws(() => cleanup.add("process:owned", () => {}));
  assert.throws(() => cleanup.add("/shared/path", () => {}));
  const first = cleanup.close();
  const second = cleanup.close();
  assert.equal(first, second);
  assert.throws(() => cleanup.add("process:late", () => {}));
  release();
  await first;
  assert.equal(calls, 1);
  assert.throws(() => cleanup.add("process:late", () => {}));
});

test("failed composition finalization remains retryable without repeating closed releases", async () => {
  let attempts = 0,
    releases = 0;
  const cleanup = create(() => {
    if (++attempts === 1) throw new Error("finalization failed");
  });
  cleanup.add("database:owned", () => {
    releases++;
  });
  await assert.rejects(cleanup.close());
  await cleanup.close();
  assert.equal(releases, 1);
  assert.equal(attempts, 2);
});
