/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/**
 * @module workflow/test/processCommandCapabilities
 * @description Exercises native security/exposure guards for read-only trigger command metadata, including denied and unavailable authority and inspection after recording shutdown.
 * @layer test
 * @owner workflow
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const capabilities = require("../src/service/operation/defaultProcessCommandCapabilityService");
const receipts = require("../src/service/operation/defaultProcessTriggerCommandReceiptService");
const security = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
const exposure = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultRequestHandlerPipelineService");
const routes = require("../src/router/routers");

function fixture(t) {
  const previous = Object.fromEntries(["SERVICE", "CONFIG", "CLASSES", "_"].map(key => [key, global[key]]));
  t.after(() => Object.assign(global, previous));
  const effective = structuredClone(routes);
  const config = {
    defaultTenant: "local", defaultEnterprise: "default",
    identityGovernance: { principalPolicy: { serviceGroup: "serviceAccountUserGroup" } },
    routeActionAuthorization: { enabled: true, strict: true },
    apiExposure: { categories: { processManagement: { enabled: true } } },
  };
  global._ = { isString: value => typeof value === "string" };
  global.CONFIG = { get: key => config[key] };
  global.CLASSES = { NodicsError: Error };
  global.SERVICE = {
    DefaultRouterConfigurationService: { getRawRouters: () => effective },
    DefaultSecuredRequestPipelineService: { ...security },
    DefaultRequestHandlerPipelineService: { ...exposure },
    DefaultProcessTriggerCommandReceiptService: receipts,
    DefaultModelCommandReceiptService: {
      enabled: () => config.commandReceipts?.enabled === true && config.commandReceipts?.owners?.workflow === true,
      fail: () => { throw new Error("Unavailable original evidence"); },
    },
  };
  const request = {
    tenant: "local", moduleName: "workflow", router: { operation: "getCommandCapabilities" },
    authData: { tokenType: "access", principalType: "human", loginId: "reviewer", tenant: "local", entCode: "default",
      userGroups: ["runtimeConfigAdminUserGroup"],
      permissions: ["process.backoffice.view", "process.trigger.manage", "process.trigger.execute"] },
  };
  return { config, effective, request };
}

test("native guards project command and receipt permissions without records or credentials in the result", async t => {
  const { request } = fixture(t);
  const original = structuredClone(request);
  const result = await capabilities.get(request);
  assert.equal(result.code, "SUC_PROCESS_00000");
  assert.equal(result.data.contractVersion, 1);
  assert.equal(result.data.newRecording, "DISABLED");
  assert.deepEqual(Object.keys(result.data.triggerCommands), ["create", "update", "archive", "execute"]);
  for (const command of Object.values(result.data.triggerCommands))
    assert.deepEqual(command, { authorization: "AUTHORIZED", receiptInspection: "AUTHORIZED" });
  assert.deepEqual(request, original);
  assert(!JSON.stringify(result).includes("reviewer"));
  assert(!JSON.stringify(result).includes("permissions"));
  assert(!JSON.stringify(result).includes("/triggers"));
});

test("execute permission remains independent from manage permission", async t => {
  const { request } = fixture(t);
  request.authData.permissions = ["process.backoffice.view", "process.trigger.manage"];
  const { data } = await capabilities.get(request);
  assert.equal(data.triggerCommands.create.authorization, "AUTHORIZED");
  assert.equal(data.triggerCommands.execute.authorization, "DENIED");
  assert.equal(data.triggerCommands.execute.receiptInspection, "DENIED");
});

for (const change of ["group", "token", "runtime-scope", "exposure"]) {
  test(`native ${change} denial cannot become command authority`, async t => {
    const { request, config } = fixture(t);
    if (change === "group") request.authData.userGroups = ["userGroup"];
    if (change === "token") request.authData.tokenType = "refresh";
    if (change === "runtime-scope") request.authData.runtimeScope = { owner: "other" };
    if (change === "exposure") config.apiExposure.categories.processManagement.enabled = false;
    for (const entry of Object.values((await capabilities.get(request)).data.triggerCommands))
      assert.deepEqual(entry, { authorization: "DENIED", receiptInspection: "DENIED" });
  });
}

test("effective route permission overrides are checked rather than copied from base grants", async t => {
  const { request, effective } = fixture(t);
  effective.workflow.processOperations.updateTrigger.permission = "partner.trigger.update";
  const { data } = await capabilities.get(request);
  assert.equal(data.triggerCommands.update.authorization, "DENIED");
  assert.equal(data.triggerCommands.create.authorization, "AUTHORIZED");
});

for (const change of ["inactive", "path", "version", "missing", "owner", "throw", "contradictory"]) {
  test(`unavailable ${change} route evidence never authorizes execution`, async t => {
    const { request, effective } = fixture(t);
    const route = effective.workflow.processOperations.executeTrigger;
    if (change === "inactive") route.active = false;
    if (change === "path") route.key = "/partner/execute";
    if (change === "version") route.apiVersion = "v1";
    if (change === "missing") delete effective.workflow.processOperations.executeTrigger;
    if (change === "owner") delete SERVICE.DefaultSecuredRequestPipelineService;
    if (change === "throw") SERVICE.DefaultSecuredRequestPipelineService.checkAccess = () => { throw new Error("private diagnostic"); };
    if (change === "contradictory") SERVICE.DefaultSecuredRequestPipelineService.checkAccess = (r, s, p) => { p.nextSuccess(r, s); p.error(r, s); };
    const result = await capabilities.get(request);
    assert.equal(result.data.triggerCommands.execute.authorization, "UNAVAILABLE");
    assert(!JSON.stringify(result).includes("private diagnostic"));
  });
}

test("recording shutdown and inactive command do not remove otherwise authorized original receipt inspection", async t => {
  const { request, config, effective } = fixture(t);
  config.commandReceipts = { enabled: true, owners: { workflow: true } };
  assert.equal((await capabilities.get(request)).data.newRecording, "ENABLED");
  config.commandReceipts.enabled = false;
  effective.workflow.processOperations.executeTrigger.active = false;
  const { data } = await capabilities.get(request);
  assert.equal(data.newRecording, "DISABLED");
  assert.equal(data.triggerCommands.execute.authorization, "UNAVAILABLE");
  assert.equal(data.triggerCommands.execute.receiptInspection, "AUTHORIZED");
});

test("legacy route admission never invents the explicit original-command grant", async t => {
  const { request, config } = fixture(t);
  config.routeActionAuthorization = { strict: false };
  request.authData.permissions = [];
  const { data } = await capabilities.get(request);
  assert.equal(data.triggerCommands.execute.authorization, "AUTHORIZED");
  assert.equal(data.triggerCommands.execute.receiptInspection, "DENIED");
});

test("metadata endpoint is private, read-only and never cached", () => {
  const route = routes.workflow.processOperations.getCommandCapabilities;
  assert.equal(route.method, "GET"); assert.equal(route.secured, true);
  assert.equal(route.permission, "process.backoffice.view");
  assert.deepEqual(route.authTokenTypes, ["access"]);
  assert.deepEqual(route.cache, { enabled: false });
});
