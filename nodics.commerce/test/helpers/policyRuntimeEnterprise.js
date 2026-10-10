/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/** @module commerce/test/helpers/policyRuntimeEnterprise @description Registers the four policy owners' shared runtime/business-scope regression contract using real admission and transport owners with isolated persistence/HTTP ports, not JWT or native qualification. @layer test @owner nodics.commerce */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const path = require("node:path");
const root = path.resolve(__dirname, "../../..");
const foundation = file => require(path.join(root, "nodics.foundation/modules", file));
const runtime = foundation("nAuth/src/service/identity/defaultServiceTokenService");
const workflow = foundation("nPublish/src/service/defaultPublicationApprovalWorkflowService");
const identity = foundation("nAuth/src/service/identity/defaultIdentityGovernanceService");

module.exports = function register({ domain, setup, request }) {
  const title = domain[0].toUpperCase() + domain.slice(1);
  const ownerName = "Default" + title + "PublicationService";
  const transportName = "Default" + title + "PublicationTransportService";
  const directory = path.join(root, "nodics.commerce/modules/baseCommerce/modules", domain);
  const controller = require(path.join(directory, "src/controller/default" + title + "PublicationTargetController"));
  const transport = require(path.join(directory, "src/service/default" + title + "PublicationTransportService"));

  async function fixture(t) {
    const previous = Object.fromEntries(["CONFIG", "SERVICE", "CLASSES", "NODICS", "UTILS"].map(key => [key, global[key]]));
    t.after(() => Object.assign(global, previous));
    const f = setup(), publication = await f.publication();
    publication.tenantCode = request.tenant;
    publication.enterpriseCode = request.enterpriseCode;
    const release = await f.source.getVersion(publication, request);
    const policy = { enabled: true, enterpriseCodes: [request.enterpriseCode] };
    const settings = { runtimeRole: "ONLINE", sourceAuthority: { moduleName: domain,
      connectionName: "reviewed-staged", runtimeRole: "COMMERCE_STAGED" },
      target: { moduleName: domain, connectionName: "reviewed-online", runtimeRole: "COMMERCE" } };
    global.CONFIG = { get: name => name === "publish" ? { approvalWorkflow: { runtimeEnterpriseScope: policy } } :
      name === "identityGovernance" ? { systemAccessGroups: ["serviceAccountUserGroup"] } :
      name === domain ? { publication: settings } : {} };
    global.CLASSES = { NodicsError: class extends Error { constructor(code, message) { super(message || code); this.code = code; } } };
    const authData = { tenant: request.tenant, entCode: "default", enterpriseCode: "default",
      tokenType: "service", principalType: "service", serviceId: "isolated-deployment-principal",
      runtimeInstanceId: "isolated-instance", runtimeScope: { instanceCode: "isolated-instance", projectCode: "isolated-project",
        environmentCode: "isolated-environment", serverCode: "isolated-server", assignmentCode: "isolated-assignment" },
      modules: [domain], userGroups: [], permissions: [] };
    const body = { publication, release, targetVersion: release.code, operationKey: publication.activationOperation.key,
      expectedVersion: null, expectedRevision: 0 };
    const incoming = { tenant: request.tenant, enterpriseCode: "default", entCode: "default", authData, httpRequest: { body } };
    const state = { writes: 0, sourceReads: 0, sourceCommands: [], selections: [], targetContexts: [], transports: [] };
    global.SERVICE[ownerName] = f.target;
    global.SERVICE[transportName] = transport;
    global.SERVICE.DefaultServiceTokenService = runtime;
    global.SERVICE.DefaultIdentityGovernanceService = identity;
    global.SERVICE.DefaultPublicationApprovalWorkflowService = { ...workflow, requireRuntimeEnterprise: function (auth, enterprise) {
      state.selections.push({ auth: structuredClone(auth), enterprise });
      return workflow.requireRuntimeEnterprise.call(this, auth, enterprise);
    } };
    const stored = structuredClone(publication);
    global.SERVICE.DefaultPublicationLifecycleService = { getRepository: () => ({ get: async (code, context) => {
      state.sourceReads++;
      assert.equal(code, stored.code);
      assert.equal(context.enterpriseCode, request.enterpriseCode);
      assert.equal(context.authData.entCode, "default");
      assert.equal(context.authData.serviceId, authData.serviceId);
      assert.equal(context.authData.isSystem, true);
      return structuredClone(stored);
    } }) };
    global.NODICS.getInternalAuthToken = tenant => {
      assert.equal(tenant, request.tenant); return "isolated-runtime-token";
    };
    global.SERVICE.DefaultModuleService = { invokeModule: async invocation => {
      state.transports.push({ ...invocation, header: structuredClone(invocation.header), requestBody: structuredClone(invocation.requestBody) });
      assert.equal(invocation.local, false);
      assert.equal(invocation.connectionName, "reviewed-staged");
      assert.deepEqual(invocation.targetAuthority, { runtimeRole: "COMMERCE_STAGED" });
      assert.equal(invocation.apiName, "/publication/policy/authorize");
      assert.deepEqual(invocation.header, { Authorization: "Bearer isolated-runtime-token", tenant: request.tenant });
      const command = structuredClone(invocation.requestBody);
      state.sourceCommands.push(command);
      assert.deepEqual(command, { operation: command.operation, enterpriseCode: request.enterpriseCode,
        publicationCode: publication.code, sourceVersion: release.code, rootType: publication.rootType,
        rootCode: publication.rootCode, operationKey: publication.activationOperation.key,
        targetVersion: release.code, expectedVersion: null, expectedRevision: 0 });
      // Re-enter the actual source controller as an independently verified runtime, not with the business header.
      global.SERVICE[ownerName] = f.source;
      try {
        const sourceRequest = { tenant: request.tenant, enterpriseCode: "default", entCode: "default",
          authData: structuredClone(authData), httpRequest: { body: command } };
        const original = structuredClone(sourceRequest);
        const result = await controller.authorize(sourceRequest);
        assert.deepEqual(sourceRequest, original);
        return invocation.responseSelector(result);
      } finally { global.SERVICE[ownerName] = f.target; }
    } };
    for (const store of Object.values(f.targetStore)) {
      for (const method of ["get", "save", "update"]) {
        const original = store[method].bind(store);
        store[method] = async input => {
          state.targetContexts.push(structuredClone(input));
          assert.equal(input.authData.entCode, "default");
          assert.equal(input.authData.serviceId, authData.serviceId);
          assert.equal(input.authData.isSystem, true);
          assert.deepEqual(input.authData.userGroups, ["serviceAccountUserGroup"]);
          const scope = method === "get" || method === "update" ? input.query : input.model;
          assert.equal(scope.tenant, request.tenant);
          assert.equal(scope.enterpriseCode, request.enterpriseCode);
          if (method !== "get") state.writes++;
          return original(input);
        };
      }
    }
    return { ...f, publication, stored, release, incoming, authData, policy, settings, state };
  }

  test("cross-enterprise runtime uses real admission, exact source authority and unchanged group-free deployment claims", async t => {
    const f = await fixture(t), original = structuredClone(f.incoming);
    assert.equal(runtime.requireRuntimePrincipal(f.incoming, domain), f.authData);
    await controller.prepare(f.incoming);
    assert.equal(f.targetStore.release.rows.size, 1);
    assert.equal(f.targetStore.pointer.rows.size, 0);
    assert.equal((await controller.status(f.incoming)).result.version, null);
    const activated = (await controller.activate(f.incoming)).result;
    assert.equal(f.targetStore.pointer.rows.size, 1);
    assert.equal(activated.receipt.applied, true);
    const writes = f.state.writes;
    const reconciled = (await controller.reconcile(f.incoming)).result;
    assert.equal(reconciled.receipt.code, activated.receipt.code);
    assert.equal(f.state.writes, writes);
    assert.deepEqual(f.incoming, original);
    assert.deepEqual(f.authData.userGroups, []);
    assert.equal(f.authData.isSystem, undefined);
    assert.deepEqual(f.state.sourceCommands.map(command => command.operation), ["prepare", "activate", "reconcile"]);
    assert.equal(f.state.sourceReads, 3);
    assert(f.state.selections.length >= 9);
    assert(f.state.selections.every(call => call.enterprise === request.enterpriseCode && call.auth.entCode === "default"));
    assert(f.state.targetContexts.length > 0);
  });

  test("cross-enterprise selection, principal, scope and source corruption refuse before target writes", async t => {
    const scenarios = {
      "default-off": f => { delete f.policy.enabled; },
      "disabled": f => { f.policy.enabled = false; },
      "unselected": f => { f.policy.enterpriseCodes = ["another-business"]; },
      "duplicate-selection": f => { f.policy.enterpriseCodes.push(request.enterpriseCode); },
      "wildcard-selection": f => { f.policy.enterpriseCodes = ["*"]; },
      "missing-shared-owner": () => { delete SERVICE.DefaultPublicationApprovalWorkflowService; },
      "missing-service-id": f => { delete f.authData.serviceId; },
      "missing-runtime-proof": f => { delete f.authData.runtimeScope; },
      "foreign-runtime-instance": f => { f.authData.runtimeScope.instanceCode = "foreign"; },
      "missing-runtime-assignment": f => { delete f.authData.runtimeScope.assignmentCode; },
      "wrong-module": f => { f.authData.modules = ["foreign"]; },
      "human-token": f => { f.authData.tokenType = "access"; },
      "human-principal": f => { f.authData.principalType = "human"; },
      "foreign-signed-tenant": f => { f.authData.tenant = "foreign"; },
      "request-business-alias": f => { f.incoming.enterpriseCode = request.enterpriseCode; },
      "request-short-business-alias": f => { f.incoming.entCode = request.enterpriseCode; },
      "signed-alias-conflict": f => { f.authData.enterpriseCode = request.enterpriseCode; },
      "invalid-business": f => { f.publication.enterpriseCode = "invalid business"; },
      "foreign-business": f => { f.publication.enterpriseCode = "another-business"; },
      "foreign-publication-tenant": f => { f.publication.tenantCode = "foreign"; },
      "source-unqualified": f => { f.source.publicationSettings = () => ({ runtimeRole: "STAGED", sourceVersioningQualified: false }); },
      "target-role-unselected": f => { f.target.publicationSettings = () => ({ runtimeRole: "STAGED" }); },
      "stored-business-corrupt": f => { f.stored.enterpriseCode = "foreign"; },
      "stored-source-corrupt": f => { f.stored.sourceVersion = "foreign"; },
      "stored-root-corrupt": f => { f.stored.rootCode = "foreign"; },
      "stored-operation-corrupt": f => { f.stored.activationOperation.key = "foreign"; },
      "no-source-authority": () => { SERVICE[transportName] = { authorizeTarget: async () => ({ authorized: false }) }; },
      "copied-source-envelope": () => { SERVICE[transportName] = { authorizeTarget: async () => ({ authorized: true, fingerprint: "foreign" }) }; },
    };
    for (const [name, mutate] of Object.entries(scenarios)) await t.test(name, async child => {
      const f = await fixture(child);
      mutate(f);
      await assert.rejects(controller.prepare(f.incoming), error => error.code !== "ERR_ASSERTION");
      assert.equal(f.state.writes, 0);
      assert.equal(f.targetStore.release.rows.size, 0);
      assert.equal(f.targetStore.pointer.rows.size, 0);
      assert.equal(f.targetStore.receipt.rows.size, 0);
    });
  });

  test("all policy transport directions preserve body business identity without forwarding human enterprise headers", async t => {
    const f = await fixture(t), sent = [];
    SERVICE.DefaultModuleService = { invokeModule: async input => { sent.push(input); return {}; } };
    const human = { tenant: request.tenant, enterpriseCode: request.enterpriseCode,
      authData: { tokenType: "access", principalType: "human", entCode: request.enterpriseCode },
      httpRequest: { headers: { authorization: "Bearer isolated-human-token", "x-enterprise-code": request.enterpriseCode } } };
    const original = structuredClone(human);
    f.settings.runtimeRole = "STAGED";
    await transport.prepareTarget(f.release, human, f.publication);
    await transport.getTargetStatus(f.publication, human);
    await transport.switchTarget(f.incoming.httpRequest.body, human);
    await transport.reconcileTarget(f.publication, f.publication.activationOperation.key, human);
    f.settings.runtimeRole = "ONLINE";
    await transport.authorizeTarget({ enterpriseCode: request.enterpriseCode, operationKey: f.publication.activationOperation.key }, human);
    assert.deepEqual(sent.map(item => item.apiName), ["prepare", "status", "activate", "reconcile", "authorize"]
      .map(operation => "/publication/policy/" + operation));
    for (const item of sent) {
      assert.deepEqual(item.header, { Authorization: "Bearer isolated-runtime-token", tenant: request.tenant });
      assert.equal(item.local, false);
      assert.equal(item.requestBody.publication?.enterpriseCode ?? item.requestBody.enterpriseCode, request.enterpriseCode);
      assert(!JSON.stringify(item.header).includes("isolated-human-token"));
    }
    assert.deepEqual(human, original);
  });
};
