/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */

/** @module backoffice/test/sharedPreparationObservationConcurrency @description Verifies bounded read-only preparation scheduling, ordered evidence and fresh request authority. @layer test @owner backoffice */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const owner = require("../src/service/defaultBackofficeApplicationInitializationService");
const registry = require("../src/service/registry/defaultBackofficeRegistryService");
const work = require("../src/utils/applicationReadinessWork");
const turn = () => new Promise(resolve => setImmediate(resolve));
const stages = count => Array.from({ length: count }, (_, index) => ({
  code: "partner:stage" + index, type: "DATA_RELEASE", phase: "BEFORE_PUBLICATION", required: true,
}));

test("browser scheduling projects framework defaults and validated layered overrides only", () => {
  const previous = global.CONFIG;
  try {
    global.CONFIG = { get: () => undefined };
    assert.deepEqual(work.browserPolicy(), { contractVersion: 1, concurrency: 1, priorityBurst: 1 });
    global.CONFIG = { get: () => ({ browserReadiness: { concurrency: 2, priorityBurst: 3, secret: "not projected" } }) };
    assert.deepEqual(work.browserPolicy(), { contractVersion: 1, concurrency: 2, priorityBurst: 3 });
    for (const field of ["concurrency", "priorityBurst"]) {
      for (const value of [0, -1, 17, 1.5, "4", null, Infinity]) {
        global.CONFIG = { get: () => ({ browserReadiness: { [field]: value } }) };
        assert.throws(() => work.browserPolicy(), /must be an integer/);
      }
    }
  } finally { global.CONFIG = previous; }
});

test("twelve independent owner reads settle in three bounded waves with original ordering", async () => {
  const input = stages(12), request = { tenant: "partner", authData: { principalId: "viewer" } };
  let active = 0, peak = 0, completed = 0;
  const pending = [], modes = [];
  const service = Object.assign(Object.create(owner), {
    preparationSteps: () => input,
    setupObservation: async (profile, context, step, mode) => {
      assert.equal(context, request);
      modes.push(mode); active++; peak = Math.max(peak, active);
      await new Promise(resolve => pending.push(resolve));
      active--; completed++;
      return { ready: true, status: "CURRENT", version: step.code };
    },
    functionalModulePreparationStatus: async () => {
      assert.equal(completed, input.length);
      return [{ code: "functional", status: "CURRENT" }];
    },
  });
  const resultPromise = service.sharedPreparationObservation({}, request);
  let waves = 0;
  while (completed < input.length) {
    await turn();
    const wave = pending.splice(0);
    if (wave.length) { waves++; wave.reverse().forEach(resolve => resolve()); }
  }
  const result = await resultPromise;
  assert.equal(peak, 4);
  assert.equal(waves, 3);
  assert.deepEqual(result.steps.map(step => step.code), input.map(step => step.code).concat("functional"));
  assert.equal(result.status, "CURRENT");
  assert(modes.every(mode => mode === "INSTALLATION"));
});

test("optional stages do not read owners; refusals and synchronous failures settle without losing siblings", async () => {
  const input = stages(7);
  input[1].required = false;
  input[4].type = "MEDIA_ASSET_MANIFEST";
  const calls = [];
  const service = Object.assign(Object.create(owner), {
    preparationSteps: () => input,
    setupObservation: (profile, request, step, mode) => {
      calls.push(step.code);
      if (step === input[0]) throw { code: "ERR_AUTH_00003", message: "private-secret" };
      if (step === input[2]) return Promise.reject(new Error("private-provider"));
      if (step === input[3]) return Promise.resolve({ ready: false, status: "NOT_CURRENT" });
      if (step === input[4]) {
        assert.equal(mode, "MEDIA");
        return Promise.resolve({ ready: true, evidenceKind: "PERSISTED_CURRENT_METADATA", items: [{ metadataMatched: true }] });
      }
      return Promise.resolve({ ready: true, status: "CURRENT" });
    },
    functionalModulePreparationStatus: async () => [],
  });
  const result = await service.sharedPreparationObservation({}, {});
  assert.equal(calls.length, 6);
  assert(!calls.includes(input[1].code));
  assert.deepEqual(result.steps.map(step => step.status), ["AUTHORITY_PENDING", "OPTIONAL", "AUTHORITY_PENDING", "NOT_INSTALLED", "SOURCE_READY", "CURRENT", "CURRENT"]);
  assert.equal(result.steps[0].reasonCode, "ERR_AUTH_00003");
  assert.equal(result.steps[2].reasonCode, "ERR_BOF_00083");
  assert.equal(result.status, "BLOCKED");
  assert(!JSON.stringify(result).includes("private"));
});

test("simultaneous actors and later reads re-observe authority without sharing results", async () => {
  const input = stages(6), calls = [];
  let ready = true;
  const service = Object.assign(Object.create(owner), {
    preparationSteps: () => input,
    setupObservation: async (profile, request, step) => {
      calls.push([request, step.code]);
      await turn();
      return { ready, status: ready ? "CURRENT" : "NOT_CURRENT" };
    },
    functionalModulePreparationStatus: async () => [],
  });
  const a = { tenant: "a" }, b = { tenant: "b" };
  const results = await Promise.all([service.sharedPreparationObservation({}, a), service.sharedPreparationObservation({}, b)]);
  assert(results.every(result => result.status === "CURRENT"));
  ready = false;
  const next = await service.sharedPreparationObservation({}, a);
  assert.equal(next.status, "ACTION_REQUIRED");
  assert(next.steps.every(step => step.status === "NOT_INSTALLED"));
  assert.equal(calls.filter(([request]) => request === a).length, 12);
  assert.equal(calls.filter(([request]) => request === b).length, 6);
});

test("owner policy overrides bound both profile and direct-stage reads; invalid values dispatch nothing", async () => {
  const previous = global.CONFIG;
  try {
    for (const workers of [1, 2, 8]) {
      global.CONFIG = { get: () => ({ readinessWorkers: workers }) };
      let active = 0, peak = 0;
      const read = async () => {
        active++; peak = Math.max(peak, active); await turn(); active--;
        return { ready: true, status: "CURRENT" };
      };
      await registry.applicationStatusReport(stages(12), read);
      assert.equal(peak, workers);
      peak = 0;
      const service = Object.assign(Object.create(owner), {
        preparationSteps: () => stages(12), setupObservation: read,
        functionalModulePreparationStatus: async () => [],
      });
      await service.sharedPreparationObservation({}, {});
      assert.equal(peak, workers);
    }
    for (const workers of [0, -1, 17, 1.5, "4", null, Infinity]) {
      global.CONFIG = { get: () => ({ readinessWorkers: workers }) };
      let dispatched = false;
      await assert.rejects(registry.applicationStatusReport(stages(1), () => { dispatched = true; }), /readinessWorkers/);
      assert.throws(() => work.queue(), /readinessWorkers/);
      const service = Object.assign(Object.create(owner), {
        preparationSteps: () => stages(1), setupObservation: () => { dispatched = true; },
      });
      await assert.rejects(service.sharedPreparationObservation({}, {}), /readinessWorkers/);
      assert.equal(dispatched, false);
    }
  } finally { global.CONFIG = previous; }
});

test("74 composed profiles with six nested stages never multiply the owner budget", async () => {
  const previous = { CONFIG: global.CONFIG, SERVICE: global.SERVICE };
  try {
    for (const workers of [1, 2, 4]) {
      global.CONFIG = { get: () => ({ readinessWorkers: workers }) };
      let active = 0, peak = 0, calls = 0;
      const service = Object.assign(Object.create(owner), {
        preparationSteps: () => stages(6),
        setupObservation: async () => {
          calls++; active++; peak = Math.max(peak, active);
          await turn(); active--; return { ready: true, status: "CURRENT" };
        },
        functionalModulePreparationStatus: async () => [],
      });
      global.SERVICE = { DefaultBackofficeApplicationInitializationService: {
        status: async (code, request) => {
          const cloned = { ...request };
          work.inherit(request, cloned);
          return service.sharedPreparationObservation({ code }, cloned);
        },
      } };
      const profiles = stages(74), reader = registry.applicationStatusReader({ tenant: "partner" });
      // Documentation may enqueue all profiles before the bounded report runs.
      const results = await Promise.all(profiles.map(profile => reader(profile.code)));
      assert.equal(peak, workers);
      assert.equal(calls, 444);
      assert(results.every(result => result.status === "CURRENT"));
      const report = await registry.applicationStatusReport(profiles, reader);
      assert.equal(report.statuses.length, 74);
      assert.equal(calls, 444);
    }
  } finally { Object.assign(global, previous); }
});
