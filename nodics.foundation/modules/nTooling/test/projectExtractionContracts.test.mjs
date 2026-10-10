/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

import assert from "node:assert/strict";
import test from "node:test";
import { EventEmitter } from "node:events";
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createReport, executeLocalPlan } from "../src/service/project/defaultProjectQualificationEvidenceService.mjs";
import { ensureAcceptanceRuntime } from "../src/service/project/defaultProjectAcceptanceService.mjs";
const require = createRequire(import.meta.url);
const probe = require("../src/service/project/defaultProjectConfigurationProbeService");

test("configuration probe import is inert and requires explicit valid selection", () => {
  assert.equal(global.CONFIG, undefined);
  assert.equal(global.NODICS, undefined);
  assert.throws(() => probe.coordinates({}), /projectRoot/);
  assert.throws(() => probe.coordinates({ projectRoot: "/fixture", environment: "../other", server: "api" }), /environment/);
  assert.throws(() => probe.coordinates({ projectRoot: "/fixture", environment: "test", server: "../api" }), /server/);
  assert.equal(probe.coordinates({ projectRoot: "/fixture", environment: "test", server: "api" }).projectRoot, "/fixture");
});

test("configuration probe passes deployment variables only through the child environment", () => {
  const filename = require.resolve("../../nConfig/src/service/defaultDeploymentConfigurationProjectionService");
  let call;
  const module = { exports: {} };
  const parent = { PATH: "/bin", HOME: "/fixture", PRIVATE_DEPLOYMENT_VALUE: "inherited-fixture" };
  vm.runInNewContext(fs.readFileSync(filename, "utf8"), {
    module, __filename: filename, __dirname: path.dirname(filename),
    process: { execPath: "/node", env: parent },
    require: name => name === "node:child_process" ? {
      execFileSync(command, args, options) { call = { command, args, options }; return "{}"; },
    } : createRequire(filename)(name),
  });
  for (const inheritEnvironment of [false, true]) {
    module.exports.read({ projectRoot: "/fixture", environment: "local", server: "api",
      inheritEnvironment, variables: { EXPLICIT_SECRET: "explicit-fixture" } });
    assert.equal(call.options.env.EXPLICIT_SECRET, "explicit-fixture");
    assert.equal(call.options.env.PRIVATE_DEPLOYMENT_VALUE, inheritEnvironment ? "inherited-fixture" : undefined);
    assert.equal(call.args.join(" ").includes("explicit-fixture"), false);
    assert.equal(call.args.join(" ").includes("inherited-fixture"), false);
  }
  assert.equal(parent.EXPLICIT_SECRET, undefined);
});

test("qualification evidence keeps deployment identity explicit and never approves production", () => {
  const plan = { local: [{ id: "owner-check", command: "fixture", cwd: "/fixture", args: [], environment: { SECRET: "not-in-report" } }], external: [{ id: "operator" }] };
  const results = executeLocalPlan(plan, { spawn: () => ({ error: new Error("spawn failed"), status: null }) });
  assert.equal(results[0].failureCode, "PROCESS_START_FAILED");
  const report = createReport(plan, results, { now: () => new Date(0) });
  assert.equal(report.qualificationEnvironment, null);
  assert.equal(report.productionApproved, false);
  assert.equal(report.summary.failed, 1);
  assert.equal(report.summary.externalPending, 1);
  assert.equal(JSON.stringify(report).includes("not-in-report"), false);
  assert.equal(createReport(plan, null, { environmentName: "partner-test" }).qualificationEnvironment, "partner-test");
});

test("acceptance startup never takes ownership of an existing listener", async () => {
  const managed = [];
  let ready = 0;
  await ensureAcceptanceRuntime({
    port: 1234, managed, probe: async () => true,
    spawnProcess: () => assert.fail("must not launch"),
    waitReady: async () => ready++,
  });
  assert.equal(ready, 1);
  assert.deepEqual(managed, []);
});

test("acceptance startup records only its own child and propagates readiness failure", async () => {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  const managed = [];
  await assert.rejects(ensureAcceptanceRuntime({
    port: 1234, label: "Partner", command: "fixture", args: ["--selected"], cwd: "/fixture", env: {},
    managed, probe: async () => false,
    spawnProcess: (command, args, options) => {
      assert.equal(command, "fixture");
      assert.deepEqual(args, ["--selected"]);
      assert.equal(options.detached, true);
      return child;
    },
    waitReady: async () => { throw new Error("not ready"); },
  }), /not ready/);
  assert.deepEqual(managed, [child]);
  child.emit("close", 0);
  await child.exitPromise;
});

test("spawn failures reject without an unhandled child error", async () => {
  const child = new EventEmitter();
  child.stdout = new EventEmitter();
  child.stderr = new EventEmitter();
  const managed = [];
  const run = ensureAcceptanceRuntime({
    managed, probe: async () => false, spawnProcess: () => child,
    waitReady: () => { queueMicrotask(() => child.emit("error", new Error("missing executable"))); return new Promise(() => {}); },
  });
  await assert.rejects(run, /missing executable/);
  child.emit("close", 1);
});
