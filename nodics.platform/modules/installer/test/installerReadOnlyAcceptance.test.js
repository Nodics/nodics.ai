/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics - Copyright (c) 2026. Governed by the root LICENSE. */
/** @module installer/test/readOnlyAcceptance @description Verifies composed routes, canonical grants, read-only plans, containment, bounded redaction, observed ports and deployment overrides. @layer test @owner installer */
const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const net = require("node:net");
const owner = require("../src/service/defaultInstallerApplicationBuilderService");
const controller = require("../src/controller/defaultInstallerApplicationBuilderController");
const security = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
const permission = require("../src/service/defaultInstallerPermissionService");
const config = require("../src/service/defaultInstallerConfigurationService");
const routes = require("../src/router/routers");
const router = require("../../../../nodics.foundation/modules/nRouter/src/service/router/defaultRouterService");
const root = fs.mkdtempSync(path.join(os.tmpdir(), "builder-read-only-"));
const workspace = path.join(root, "customer");
const outside = path.join(root, "outside");
fs.mkdirSync(workspace);
fs.mkdirSync(outside);
let selection = { workspace: { allowedRoots: [workspace] } };
global._ = require("lodash");
global.CONFIG = {
  get: (k) =>
    ({
      "installer.applicationBuilder": selection,
      installer: { applicationBuilder: selection },
      servers: { options: { contextRoot: "nodics" } },
      identityGovernance: {
        principalPolicy: { serviceGroup: "internalServiceUserGroup" },
      },
      defaultTenant: "default",
      defaultEnterprise: "default",
      routeActionAuthorization: {},
    })[k],
};
global.SERVICE = { DefaultSecuredRequestPipelineService: security };
after(() => fs.rmSync(root, { recursive: true, force: true }));
const request = (body = {}, permissions = ["installer.workspace.plan"]) => ({
  tenant: "default",
  authData: {
    principalType: "human",
    tokenType: "access",
    authenticationMethod: "PASSWORD",
    tenant: "default",
    entCode: "default",
    loginId: "fixture",
    permissions,
  },
  payload: {
    workspaceRoot: workspace,
    applicationName: "example.app",
    accelerator: "apparel",
    ...body,
  },
});
test("actual nRouter composition matches the advertised read-only catalog exactly once", () => {
  const actual = [];
  global.NODICS = { addRouter: () => {} };
  global.SERVICE.DefaultRouterOperationService = {
    get: (_, d) => actual.push(d.url),
    post: (_, d) => actual.push(d.url),
  };
  for (const [groupName, group] of Object.entries(routes.installer))
    for (const [routerName, routerDef] of Object.entries(group))
      router.prepareRouter({
        groupName,
        routerName,
        routerDef,
        urlPrefix: "installer",
        moduleName: "installer",
        moduleRouter: {},
      });
  const expected =
    require("../src/service/defaultInstallerOperationCatalogService")
      .listOperations()
      .filter((x) => !x.mutating)
      .map((x) => x.route);
  assert.deepEqual(actual.sort(), [...expected, "/nodics/installer/v0/builds/:command"].sort());
  assert(actual.every((x) => !x.includes("/v0/nodics/")));
});
test("canonical Platform full access works; a forged wildcard, request-body permission and service identity do not", async () => {
  let r = request({}, ["*"]);
  r.authData.userGroups = [{ code: "platformAdministratorUserGroup" }];
  assert.equal((await owner.setupPlan(r)).data.valid, true);
  assert.throws(() =>
    permission.assertPermission(request({}, ["*"]), "installer.workspace.plan"),
  );
  r = request({}, []);
  r.payload.permissions = ["*"];
  assert.throws(() =>
    permission.assertPermission(r, "installer.workspace.plan"),
  );
  r = request();
  r.authData.principalType = "service";
  assert.throws(() =>
    permission.assertPermission(r, "installer.workspace.plan"),
  );
});
test("controller failures are non-success HTTP outcomes and never disclose raw filesystem errors", async () => {
  let r = await controller.setupPlan(request({}, []));
  assert.equal(r.status, "FAILED");
  assert.equal(String(r.responseCode), "403");
  assert(r.code.startsWith("ERR_"));
  const e = new Error("ENOENT /private/secret/password");
  const safe =
    require("../src/service/defaultInstallerResponseService").failure(
      {},
      "setup.plan",
      e,
    );
  assert(!JSON.stringify(safe).includes("/private/"));
  assert.equal(String(safe.responseCode), "503");
});
test("unconfigured allowlists refuse caller-supplied self-authorization; disabled operations remain unavailable", async () => {
  selection = {};
  let r = await controller.setupPlan(
    request({ allowedWorkspaceRoots: [workspace] }),
  );
  assert.equal(r.status, "FAILED");
  selection = { enabled: false };
  r = await controller.info(request({}, ["installer.workspace.view"]));
  assert.equal(String(r.responseCode), "503");
  selection = { workspace: { allowedRoots: [workspace] } };
});
test("workspace and evidence symlinks cannot escape the approved root", async () => {
  fs.symlinkSync(outside, path.join(workspace, "escape"));
  let r = await controller.setupPlan(
    request({ workspaceRoot: path.join(workspace, "escape") }),
  );
  assert.equal(String(r.responseCode), "403");
  fs.writeFileSync(path.join(outside, "private.txt"), "must never be returned");
  fs.symlinkSync(
    path.join(outside, "private.txt"),
    path.join(workspace, ".nodics-workspace.json"),
  );
  r = await controller.evidenceRead(
    request({ evidenceFile: ".nodics-workspace.json" }, [
      "installer.workspace.evidence.read",
    ]),
  );
  assert.equal(String(r.responseCode), "403");
  fs.unlinkSync(path.join(workspace, ".nodics-workspace.json"));
});
test("evidence is bounded before reading and unterminated private keys are redacted", async () => {
  selection = {
    workspace: { allowedRoots: [workspace], maxEvidenceBytes: 96 },
  };
  fs.mkdirSync(path.join(workspace, ".nodics-installer"));
  fs.writeFileSync(
    path.join(workspace, ".nodics-installer", "setup.log"),
    "-----BEGIN PRIVATE KEY-----\n" + "secret".repeat(300),
  );
  const r = await owner.evidenceRead(
    request({ evidenceFile: "setup.log" }, [
      "installer.workspace.evidence.read",
    ]),
  );
  assert.equal(r.data.evidence[0].truncated, true);
  assert(!JSON.stringify(r.data).includes("secret"));
  assert(r.redactions.includes("private-key"));
  selection = { workspace: { allowedRoots: [workspace] } };
});
test("preflight observes a genuinely occupied loopback port and keeps invalid evidence unknown", async () => {
  const server = net.createServer();
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  try {
    const result = await owner.workspacePreflight(
      request({ ports: [server.address().port, "bad"] }, [
        "installer.workspace.view",
      ]),
    );
    assert.deepEqual(
      result.data.ports.map((x) => [x.bound, x.observation]),
      [
        [true, "IN_USE"],
        [null, "INVALID"],
      ],
    );
  } finally {
    await new Promise((r) => server.close(r));
  }
});
test("partial configuration overrides inherit defaults; valid plans create no files and invalid vendor selections produce no plan", async () => {
  selection = {
    planning: { defaultEnvironment: "review" },
    workspace: { allowedRoots: [workspace] },
    presentation: { plan: "Inspect intent" },
  };
  assert(
    config
      .getApplicationBuilderConfig()
      .planning.supportedAccelerators.includes("apparel"),
  );
  const before = fs.readdirSync(workspace).sort();
  let r = await owner.setupPlan(request());
  assert.equal(r.data.plan.firstEnvironment, "review");
  assert.equal(r.data.plan.dryRunOnly, true);
  assert.equal(
    config.getApplicationBuilderConfig().presentation.plan,
    "Inspect intent",
  );
  r = await owner.setupPlan(request({ applicationName: "nodics.ai" }));
  assert.equal(r.data.valid, false);
  assert.equal(r.data.plan, null);
  r = await owner.setupPlan(request({ environment: "../unsafe" }));
  assert.equal(r.data.valid, false);
  assert.deepEqual(fs.readdirSync(workspace).sort(), before);
  selection = { workspace: { allowedRoots: [workspace] } };
});
test('native navigation keeps its read intent vocabulary separate from the planning operation catalog',()=>{const cap=require('../src/service/defaultInstallerBackofficeCapabilityService').getCapability();assert(cap.navigation[0].lifecycleActions.every(x=>['READ','VERIFY'].includes(x.intent)));assert.equal(require('../src/service/defaultInstallerOperationCatalogService').listOperations().find(x=>x.code==='setup.plan').intent,'PLAN');});
