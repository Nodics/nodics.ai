/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

"use strict";
/** @module cronjob/test/cronJobRemovalTenantPipeline
 * @description Reproduces ordinary reactivation with the real removal pipeline,
 * handler and tenant validator configuration; storage and timer effects are isolated.
 * @layer test @owner cronjob No runtime server or native data is touched.
 */
const test = require("node:test"), assert = require("node:assert/strict");
const runtimeSource = require("../src/service/cronjob/defaultCronJobRuntimeService");
const pipelineSource = require("../../../../nodics.foundation/modules/nPipeline/src/service/pipeline/defaultPipelineService");
const PipelineHead = require("../../../../nodics.foundation/modules/nPipeline/src/lib/pipelineHead");
const PipelineNode = require("../../../../nodics.foundation/modules/nPipeline/src/lib/pipelineNode");
const handler = require("../src/service/trigger/defaultCronJobRemovedHandlerService");
const configuration = require("../src/service/config/defaultCronJobConfigurationService");
const validators = require("../../../../nodics.foundation/modules/nValidator/src/service/config/defaultValidatorConfigurationService");
test("reactivation removes a stopped wrapper through the real pipeline with its trusted tenant", async t => {
  const saved = Object.fromEntries(["SERVICE", "CONFIG", "NODICS", "UTILS", "ENUMS", "CLASSES", "PIPELINE"].map(key => [key, global[key]]));
  const originalString = Object.getOwnPropertyDescriptor(String.prototype, "toUpperCaseFirstChar");
  if (!originalString) Object.defineProperty(String.prototype, "toUpperCaseFirstChar", { configurable: true, value() { return this[0].toUpperCase() + this.slice(1); } });
  t.after(() => { Object.assign(global, saved); if (!originalString) delete String.prototype.toUpperCaseFirstChar; });
  const log = { debug() {}, info() {}, warn() {}, error() {} }, writes = [], validatorReads = [];
  class NodicsError extends Error {
    constructor(error, message, code) { super(message || error?.message || error); this.code = code || error?.code; }
    static enrich(error) { return error; }
  }
  class Timer {
    constructor(definition) { this.definition = definition; this.active = false; }
    validate() {} init() {} setAuthToken() {} setJobPool() {}
    getDefinition() { return this.definition; }
    isActive() { return this.active; } isRunning() { return false; }
    async startJob() { this.active = true; }
    async stopJob() { this.active = false; }
  }
  global.CLASSES = { NodicsError, CronJobError: NodicsError, CronJob: Timer, PipelineHead, PipelineNode };
  global.UTILS = { isBlank: value => value == null || value === "" || typeof value === "object" && !Object.keys(value).length,
    isObject: value => value !== null && typeof value === "object", generateUniqueCode: () => "isolated-removal" };
  global.CONFIG = { get: key => key === "nodeId" ? "node0" : undefined };
  global.NODICS = { getActiveTenants: () => ["tenantA", "tenantB"] };
  global.ENUMS = { CronJobState: { CREATED: { key: "CREATED" }, REMOVED: { key: "REMOVED" } }, InterceptorType: { schema: { key: "schema" } } };
  global.PIPELINE = { ...require("../../../../nodics.foundation/modules/nPipeline/src/pipelines/pipelines"),
    ...require("../src/pipelines/pipelines") };
  const runtime = { ...runtimeSource, jobPool: {}, LOG: log };
  const validatorOwner = { ...validators, rawValidators: {}, LOG: log };
  const getRaw = validatorOwner.getTenantRawValidators;
  validatorOwner.getTenantRawValidators = function (tenant) { validatorReads.push(tenant); return getRaw.call(this, tenant); };
  global.SERVICE = { DefaultCronJobRuntimeService: runtime,
    DefaultCronJobRemovedHandlerService: { ...handler, LOG: log },
    DefaultCronJobConfigurationService: { ...configuration, interceptors: { sameJob: {} }, validators: {} },
    DefaultValidatorConfigurationService: validatorOwner,
    DefaultPipelineService: { ...pipelineSource, LOG: log },
    DefaultLoggerService: { createLogger: () => log, inheritRequestPrivacy() {}, isSensitiveRequest: () => false },
    DefaultIdentityGovernanceService: { getSystemAuthData: () => ({ isSystem: true }) },
    DefaultCronJobService: { update: async request => { writes.push(structuredClone(request)); return { code: "SUC_DBS_00000", result: { matchedCount: 1 } }; } },
  };
  const definition = tenant => ({ tenant, code: "sameJob", trigger: "0 * * * * *", runOnNode: "node0" });
  await runtime.createJob("fixture-A", definition("tenantA"));
  await runtime.createJob("fixture-B", definition("tenantB"));
  const old = runtime.jobPool.tenantA.sameJob, foreign = runtime.jobPool.tenantB.sameJob;
  await runtime.startJob("tenantA", "sameJob");
  await runtime.stopJob("tenantA", "sameJob");
  assert.equal(old.isActive(), false);
  await runtime.removeJob("tenantA", "sameJob");
  assert.deepEqual(validatorReads, ["tenantA"]);
  assert.equal(runtime.jobPool.tenantA.sameJob, undefined);
  assert.equal(runtime.jobPool.tenantB.sameJob, foreign);
  assert.deepEqual(writes.at(-1).model, { state: "REMOVED" });
  assert.equal(writes.at(-1).tenant, "tenantA");
  assert.deepEqual(writes.at(-1).query, { code: "sameJob", runOnNode: "node0" });
  await runtime.createJob("fixture-A", definition("tenantA"));
  await runtime.startJob("tenantA", "sameJob");
  assert.notEqual(runtime.jobPool.tenantA.sameJob, old);
  assert.equal(runtime.jobPool.tenantA.sameJob.isActive(), true);
  assert.equal(runtime.jobPool.tenantB.sameJob, foreign);
});
