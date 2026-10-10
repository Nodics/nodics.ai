/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/** @module backoffice/test/applicationContributionReadiness @description Keeps owner contribution refusals blocked despite current receipts without exposing raw owner evidence. @layer test @owner backoffice */
const assert = require("node:assert/strict");
const { test } = require("node:test");
const base = require("../src/service/defaultBackofficeApplicationInitializationService");
const profile = { code: "partner", owner: "partner.orders" };
const step = { order: 1, type: "DATA_RELEASE", code: "partner.orders:firstReceipt", required: true,
  dataType: "init", targetServer: "commerce", targetRuntimeRole: "COMMERCE" };

function fixture(response) {
  const calls = [];
  const service = Object.assign(Object.create(base), {
    preparationSteps: () => [step],
    functionalModulePreparationStatus: async () => [],
    preparationGroups: () => [{ steps: [step] }],
    invokeDataReleaseOperation: async (mode, group, request) => {
      calls.push(mode);
      assert.equal(mode, "preflight");
      assert.equal(request.tenant, "partnerTenant");
      return response;
    },
  });
  const status = () => service.preparationStatus(profile, { tenant: "partnerTenant" });
  return { service, calls, status };
}

for (const status of ["CURRENT", "NOT_INSTALLED", "UPDATE_AVAILABLE", "RUNNING"]) {
  test("owner ready:false blocks " + status + " receipts with sanitized owner evidence", async () => {
    const result = { releases: [{ releaseCode: step.code, status, installer: "PARTNER_RECEIPT" }],
      validation: { ready: false, importExecuted: false },
      contributionPlans: [{ releaseCode: step.code, ready: false,
        blocker: { code: "ERR_PARTNER_00003", message: "secret-token /private/provider", stack: "private-stack" },
        evidence: { password: "private-password" }, plan: { secret: "private-plan" } }] };
    for (const response of [result, { data: result }]) {
      const f = fixture(response);
      const preparation = await f.status();
      assert.equal(preparation.status, "BLOCKED");
      assert.equal(preparation.steps[0].status, "VALIDATION_BLOCKED");
      assert.deepEqual(preparation.steps[0].ownerBlocker, { owner: step.code, code: "ERR_PARTNER_00003",
        message: "Selected contribution prerequisites require owner review." });
      const blockers = f.service.capabilityBlockers({ preparation });
      assert.equal(blockers[0].code, "READINESS_VALIDATION_BLOCKED");
      assert.equal(blockers[0].repair.action, "REVIEW_SETUP_PREREQUISITES");
      assert.equal(blockers[0].repair.available, false);
      assert.deepEqual(blockers[0].ownerBlocker, preparation.steps[0].ownerBlocker);
      assert(!/secret|private|password|stack|provider/.test(JSON.stringify({ preparation, blockers })));
      assert.deepEqual(f.calls, ["preflight"]);
    }
  });
}

test("aggregate refusal, contradictory and malformed or missing custom plans fail closed", async () => {
  const release = { releaseCode: step.code, status: "CURRENT", installer: "PARTNER_RECEIPT" };
  for (const evidence of [
    { validation: { ready: false } },
    { validation: { ready: true }, contributionPlans: [{ releaseCode: step.code, ready: false }] },
    { validation: { ready: "true" }, contributionPlans: [{ releaseCode: step.code, ready: true }] },
    { validation: { ready: true }, contributionPlans: "private-response" },
    { validation: { ready: true }, contributionPlans: [null] },
    { validation: { ready: true }, contributionPlans: [{ releaseCode: step.code }] },
    { validation: { ready: true }, contributionPlans: [{ releaseCode: "other:release", ready: true }] },
    { validation: { ready: true }, contributionPlans: [{ releaseCode: step.code, ready: true }, { releaseCode: step.code, ready: true }] },
    { validation: { ready: true }, contributionPlans: [] },
    { contributionPlans: [{ releaseCode: step.code, ready: true }] },
  ]) {
    const f = fixture({ releases: [release], ...evidence });
    assert.equal((await f.status()).status, "BLOCKED");
    assert.deepEqual(f.calls, ["preflight"]);
  }
});

test("one blocked custom owner holds its selected batch and invalid error codes are dropped", async () => {
  const sibling = { ...step, order: 2, code: "partner.orders:reference" };
  const f = fixture({ releases: [{ releaseCode: step.code, status: "CURRENT" },
    { releaseCode: sibling.code, status: "NOT_INSTALLED" }], validation: { ready: true },
    contributionPlans: [{ releaseCode: step.code, ready: false, blocker: { code: "secret-token\n" } }] });
  f.service.preparationSteps = () => [step, sibling];
  f.service.preparationGroups = () => [{ steps: [step, sibling] }];
  const preparation = await f.status();
  assert.equal(preparation.status, "BLOCKED");
  assert(preparation.steps.every((item) => item.status === "VALIDATION_BLOCKED"));
  assert(preparation.steps.every((item) => item.ownerBlocker.code === "READINESS_VALIDATION_BLOCKED"));
  assert(!JSON.stringify(preparation).includes("secret-token"));
});

test("Promotion's typed secure-token prerequisite remains visible without private owner details", async () => {
  const code = "ERR_PROMOTION_SETUP_TOKEN_OWNER_REQUIRED";
  const f = fixture({ releases: [{ releaseCode: step.code, status: "NOT_INSTALLED", installer: "PROMOTION_CAMPAIGN_ISSUANCE" }],
    validation: { ready: false }, contributionPlans: [{ releaseCode: step.code, ready: false,
      blocker: { code, message: "private-provider-detail", token: "private-token" } }] });
  const preparation = await f.status();
  assert.equal(preparation.status, "BLOCKED");
  assert.equal(preparation.steps[0].ownerBlocker.code, code);
  assert(!JSON.stringify(preparation).includes("private-"));
  assert.deepEqual(f.calls, ["preflight"]);
});

test("ready custom owner and standard preflight preserve existing statuses", async () => {
  for (const [status, expected] of [["CURRENT", "CURRENT"], ["NOT_INSTALLED", "ACTION_REQUIRED"]]) {
    for (const custom of [false, true]) {
      const f = fixture({ releases: [{ releaseCode: step.code, status, installer: custom ? "PARTNER_RECEIPT" : undefined }],
        ...(custom ? { validation: { ready: true }, contributionPlans: [{ releaseCode: step.code, ready: true }] } : {}) });
      const preparation = await f.status();
      assert.equal(preparation.status, expected);
      assert.equal(preparation.steps[0].status, status);
      assert.equal(preparation.steps[0].ownerBlocker, undefined);
    }
  }
});

function phasedFixture(t) {
  const previous = { CONFIG: global.CONFIG, NODICS: global.NODICS, SERVICE: global.SERVICE, CLASSES: global.CLASSES };
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete global[key];
      else global[key] = value;
    }
  });
  global.CLASSES = { NodicsError: class extends Error {
    constructor(code, message) {
      super(typeof code === "object" ? code.message : message);
      if (typeof code === "object") Object.assign(this, code);
      else this.code = code;
    }
    static cleanContext(value) { return value; }
  } };
  global.CONFIG = { get: () => undefined };
  global.NODICS = { getInternalAuthToken: () => "internal-cms-token" };
  const before = { code: "partner.storefront:catalogue", dataType: "sample",
    targetServer: "contentStaged", targetRuntimeRole: "WCMS_STAGED", required: true };
  const media = { code: "partner.storefront:media", type: "MEDIA_ASSET_MANIFEST", manifestPath: "data/mediaManifest.js",
    targetServer: "contentStaged", targetRuntimeRole: "WCMS_STAGED", required: true };
  const after = ["opening", "policy"].map((code) => ({ code: "partner.storefront:" + code,
    dataType: "sample", type: "DATA_RELEASE", targetServer: "commerce", targetRuntimeRole: "COMMERCE",
    required: true, phase: "AFTER_PUBLICATION" }));
  const application = { code: "partnerApp", owner: "partner.storefront", type: "STOREFRONT_DOMAIN_BUNDLE",
    applicationCode: "partnerApp", siteCode: "partnerSite", baselineCode: "partnerBaseline",
    target: { moduleName: "cms", connectionName: "contentStaged", runtimeRole: "WCMS_STAGED", timeoutMs: 120000 },
    dataPackages: [before, media, ...after] };
  const request = { tenant: "partnerTenant", requestId: "partner-setup-1", authData: { principalId: "partner-admin" },
    httpRequest: { headers: { authorization: "Bearer original-partner-human" } } };
  const installed = new Set([before.code]);
  const authority = { readiness: "READY", releaseStatus: "CURRENT", releaseCode: "partner.storefront:site",
    publication: { code: "partnerPublication", state: "ONLINE", version: 1 },
    mediaDependencies: { contractVersion: 1, owner: "media", qualified: true, dependencies: [] } };
  const state = { ownerReady: true, afterStatus: undefined, postInstallStatus: undefined,
    postInstallMedia: undefined, afterBaseline: undefined };
  const calls = [];
  global.SERVICE = { DefaultModuleService: { invokeModule: async (input) => {
    if (input.moduleName === "import") {
      assert.equal(input.header.Authorization, request.httpRequest.headers.authorization);
      const codes = input.requestBody.releaseCodes;
      const deferred = codes.some((code) => after.some((item) => item.code === code));
      assert(codes.every((code) => deferred === after.some((item) => item.code === code)), "phases never share a batch");
      const execute = input.apiName.endsWith("/install");
      calls.push({ owner: "import", operation: execute ? "install" : "preflight", codes });
      if (deferred) {
        assert.equal(authority.readiness, "READY");
        assert.equal(authority.publication.state, "ONLINE");
        assert.equal(authority.mediaDependencies.qualified, true);
      }
      if (execute) {
        assert(!deferred || state.ownerReady);
        codes.forEach((code) => installed.add(code));
        if (deferred && state.postInstallStatus) authority.readiness = state.postInstallStatus;
        if (deferred && state.postInstallMedia) authority.mediaDependencies = state.postInstallMedia;
      }
      return { releases: codes.map((code) => ({ releaseCode: code, status:
        deferred && state.afterStatus ? state.afterStatus : installed.has(code) ? "CURRENT" : "NOT_INSTALLED",
        version: "1.0.0", installer: deferred ? "PARTNER_SETUP" : undefined })),
        validation: { ready: !deferred || state.ownerReady },
        contributionPlans: deferred ? codes.map((code) => ({ releaseCode: code, ready: state.ownerReady,
          blocker: state.ownerReady ? undefined : { code: "ERR_PARTNER_00003", message: "private-secret-provider" } })) : [] };
    }
    assert.equal(input.moduleName, "cms");
    calls.push({ owner: "cms", operation: input.methodName, apiName: input.apiName });
    assert.equal(input.header.Authorization, "Bearer internal-cms-token");
    if (input.methodName === "POST" && state.afterBaseline) Object.assign(authority, state.afterBaseline);
    return { data: structuredClone(authority) };
  } } };
  const service = Object.assign(Object.create(base), {
    profile: () => application,
    functionalModulePreparationStatus: async () => [],
    applicationTargetBinding: (connectionName) => ({ connectionName }),
    mediaManifestCodes: () => ["partnerMedia"],
    mediaPreparationStatus: async (step) => ({ ...step, status: "SOURCE_READY" }),
    prepareMediaAssets: async () => { calls.push({ owner: "media", operation: "prepare" }); },
  });
  return { service, application, authority, request, installed, before, media, after, state, calls,
    status: () => service.status(application.code, request), initiate: () => service.initiate(application.code, request) };
}

function governedFixture(t) {
  const f = phasedFixture(t), invoke = global.SERVICE.DefaultModuleService.invokeModule;
  const plan = { contractVersion: 1, items: ['one', 'two'].map(code => ({ code: 'partner-' + code,
    domain: 'product', rootCode: code, rootType: 'product', sourceVersion: '1',
    input: { publicationCode: 'partner-' + code } })) };
  const step = { code: 'partner.storefront:publications', type: 'GOVERNED_PUBLICATIONS', required: true,
    phase: 'AFTER_PUBLICATION', dataType: 'sample', targetServer: 'staged', targetRuntimeRole: 'COMMERCE_STAGED', publicationPlan: plan };
  f.application.dataPackages.splice(2, 0, step);
  f.state.publications = plan.items.map(item => ({ ...item, status: 'NOT_REQUESTED' }));
  global.SERVICE.DefaultModuleService.invokeModule = async input => {
    if (input.moduleName !== 'publish') return invoke(input);
    assert.equal(input.header.Authorization, f.request.httpRequest.headers.authorization);
    assert.equal(input.maxAttempts, 1);
    assert.equal(input.timeoutMs, f.application.target.timeoutMs);
    assert.equal(input.local, false);
    assert.deepEqual(input.requestBody, plan);
    f.calls.push({ owner: 'publish', operation: input.apiName });
    if (input.apiName.endsWith('/submit')) f.state.publications = f.state.publications.map(item =>
      item.status === 'NOT_REQUESTED' ? { ...item, status: 'PENDING_APPROVAL', state: 'PENDING_APPROVAL', workflowRef: 'process-' + item.rootCode } : item);
    return f.state.publicationResponse || { contractVersion: 1,
      ready: f.state.publications.every(item => item.status === 'CURRENT'), items: f.state.publications };
  };
  return f;
}

function scopedFixture(t) {
  const f = governedFixture(t);
  f.request.authData = { principalId: "issuer-staff", principalType: "human", tokenType: "access",
    tenant: f.request.tenant, enterpriseCode: "ISSUER_A" };
  for (const item of f.application.dataPackages.filter(item => item.phase === "AFTER_PUBLICATION"))
    item.operatorEnterpriseCode = "ISSUER_A";
  f.publication = f.application.dataPackages.find(item => item.type === "GOVERNED_PUBLICATIONS");
  f.select = code => { f.request.applicationInitialization = { afterPublicationStepCode: code }; };
  f.foreign = () => {
    const step = { ...f.publication, code: "partner.storefront:foreignPublication", operatorEnterpriseCode: "ISSUER_B" };
    f.application.dataPackages.push(step);
    return step;
  };
  return f;
}

function observationFixture(t) {
  const f = scopedFixture(t), observer = require("../../../../nodics.foundation/modules/nPublish/src/service/defaultPublicationSetupObservationService");
  const foreign = f.foreign();
  foreign.publicationPlan = structuredClone(foreign.publicationPlan);
  foreign.publicationPlan.items.forEach(item => { item.code += "-foreign"; item.rootCode += "-foreign"; item.input.publicationCode = item.code; });
  const foreignRelease = { ...f.after[0], code: "partner.setup:foreignInstalled", operatorEnterpriseCode: "ISSUER_B" };
  f.application.dataPackages.push(foreignRelease);
  f.state.publications.forEach(item => { item.status = "CURRENT"; });
  f.after.forEach(step => f.installed.add(step.code));
  f.installed.add(foreignRelease.code);
  f.state.observationReady = true;
  const steps = f.service.preparationSteps(f.application).filter(step => step.required !== false);
  const plan = { code: "reviewed-partner", revision: 1, tenant: f.request.tenant, profileCode: f.application.code,
    baselineCode: f.application.baselineCode, profileDigest: observer.digest(f.application),
    stages: steps.map(step => ({ code: step.code, server: step.targetServer, descriptor: observer.stepIdentity(step),
      enterpriseCode: step.operatorEnterpriseCode || "SHARED", online: { server: "online", runtimeRole: "COMMERCE" } })),
    baseline: { server: f.application.target.connectionName, runtimeRole: f.application.target.runtimeRole, enterpriseCode: "SHARED" } };
  const checksum = "a".repeat(64), oldGet = global.CONFIG.get, invoke = global.SERVICE.DefaultModuleService.invokeModule;
  global.CONFIG.get = key => key === "publish" ? { setup: { observation: { enabled: true,
    profilePlans: { [f.application.code]: plan.code } } } } : oldGet(key);
  global.SERVICE.DefaultPublicationSetupObservationService = Object.assign(Object.create(observer), {
    resolvePlan: () => ({ plan: structuredClone(plan), checksum, reference: { moduleName: f.application.owner } }),
  });
  global.SERVICE.DefaultModuleService.invokeModule = async input => {
    if (input.apiName !== "/publications/setup/observe") return invoke(input);
    assert.equal(input.moduleName, "publish"); assert.equal(input.header.Authorization, "Bearer internal-cms-token");
    assert.equal(input.header.tenant, f.request.tenant); assert.equal(input.maxAttempts, 1);
    const body = input.requestBody, step = steps.find(item => item.code === body.stageCode);
    const stage = body.mode === "BASELINE" ? plan.baseline : plan.stages.find(item => item.code === body.stageCode);
    f.calls.push({ owner: "observation", operation: body.mode, code: body.stageCode });
    const items = step?.publicationPlan?.items.map(item => ({ code: item.code, domain: item.domain, rootType: item.rootType,
      rootCode: item.rootCode, sourceVersion: item.sourceVersion, targetVersion: "digest", operationKey: "actual-owner-operation",
      previousOnlineVersion: null, revision: body.mode === "SOURCE" ? 4 : 1, status: "CURRENT" }));
    if (body.mode === "TARGET") {
      assert.deepEqual(body.operations, items.map(item => ({ code: item.code, operationKey: item.operationKey })));
      if (f.state.targetDrift) items[0].operationKey = "foreign-operation";
    }
    return { data: { contractVersion: 1, planCode: body.planCode, revision: body.revision, checksum: body.checksum,
      stageCode: body.stageCode, mode: body.mode, profileCode: f.application.code, baselineCode: f.application.baselineCode,
      tenant: f.state.wrongObservationTenant ? "foreign" : f.request.tenant, enterpriseCode: stage.enterpriseCode,
      server: body.mode === "TARGET" ? stage.online.server : stage.server,
      runtimeRole: body.mode === "TARGET" ? stage.online.runtimeRole : body.mode === "BASELINE" ? stage.runtimeRole : stage.descriptor.targetRuntimeRole,
      ready: f.state.observationReady, items, version: "1.0.0", evidenceKind: "PERSISTED_CURRENT_METADATA",
      authority: structuredClone(f.authority) } };
  };
  return { ...f, foreign, foreignRelease, plan };
}

test("reviewed service proof admits shared BEFORE and aggregate foreign stages without changing local human authority", async t => {
  const f = observationFixture(t), auth = structuredClone(f.request.authData);
  const result = await f.status();
  assert.equal(result.readiness, "READY");
  assert.equal(result.preparation.steps.find(step => step.code === f.foreign.code).status, "CURRENT");
  assert.equal(result.preparation.steps.find(step => step.code === f.foreignRelease.code).status, "CURRENT");
  assert(f.calls.some(call => call.owner === "observation" && call.operation === "BASELINE"));
  assert(!f.calls.some(call => call.owner === "cms" || call.owner === "import" && call.codes.includes(f.before.code)));
  assert(!f.calls.some(call => call.operation === "install" || call.operation.endsWith("/submit")));
  assert.deepEqual(f.request.authData, auth);
  f.select(f.foreignRelease.code); f.calls.length = 0;
  await assert.rejects(f.initiate(), { code: "ERR_BOF_00082" }); assert.deepEqual(f.calls, []);
});

test("shared observation refusal or foreign tenant blocks before CMS and all AFTER owner work", async t => {
  const f = observationFixture(t); f.state.observationReady = false;
  assert.equal((await f.status()).readiness, "BLOCKED");
  assert(f.calls.every(call => call.owner === "observation" && ["INSTALLATION", "MEDIA"].includes(call.operation)));
  f.calls.length = 0; f.state.observationReady = true; f.state.wrongObservationTenant = true;
  assert.equal((await f.status()).readiness, "BLOCKED");
  assert(f.calls.every(call => call.owner === "observation" && ["INSTALLATION", "MEDIA"].includes(call.operation)));
});

test("actual installation observer envelope preserves plan hash through foreign aggregate readiness without an import run", async t => {
  const f = observationFixture(t), crypto = require("node:crypto");
  const owner = global.SERVICE.DefaultPublicationSetupObservationService;
  const invoke = global.SERVICE.DefaultModuleService.invokeModule;
  const bytes = Buffer.from('{"reviewed":true}');
  const hash = value => crypto.createHash("sha256").update(value).digest("hex");
  const stage = f.plan.stages.find(item => item.code === f.foreignRelease.code);
  const release = { moduleName: "partner.setup", releaseCode: stage.code, sectionCode: "foreignInstalled", dataType: "core",
    version: "1.0.0", sourceRoot: "core-v001", declaredFiles: ["core-v001/reviewed.json"], environmentScope: ["local"],
    checksum: hash("core-v001/reviewed.json:" + hash(bytes)) };
  stage.release = release;
  global.NODICS.getSelectedEnvironmentName = () => "local";
  global.NODICS.getServerName = () => stage.server;
  const get = global.CONFIG.get;
  global.CONFIG.get = key => key === "runtimeRole" ? { code: stage.descriptor.targetRuntimeRole } : get(key);
  global.SERVICE.DefaultIdentityGovernanceService = Object.assign(Object.create(
    require("../../../../nodics.foundation/modules/nAuth/src/service/identity/defaultIdentityGovernanceService")), {
    getConfiguration: () => require("../../../../nodics.foundation/modules/nAuth/config/properties").identityGovernance });
  global.SERVICE.DefaultDataReleaseService = { discoverReleases: () => [release], validateDestination: () => {},
    installationCode: () => "exact-installation" };
  global.SERVICE.DefaultDataInstallationService = { get: async request => {
    assert.equal(request.authData.isSystem, true); assert.equal(request.options.skipItemCache, true);
    assert.deepEqual(request.query, { code: "exact-installation" });
    return { result: [{ ...release, code: "exact-installation", tenant: f.request.tenant,
      environment: "local", active: true, status: "CURRENT", executionId: "typed-execution" }] };
  } };
  const actual = Object.assign(Object.create(owner), {
    authorize: () => ({ plan: f.plan, checksum: "a".repeat(64), stage, policyDigest: "fixed-reviewed-policy",
      ownerRequest: { tenant: f.request.tenant, enterpriseCode: stage.enterpriseCode, authData: { userGroups: [] } } }),
    sourceSnapshot: () => ({ files: new Map([[release.declaredFiles[0], bytes]]) }),
  });
  global.SERVICE.DefaultModuleService.invokeModule = async input => {
    if (input.apiName !== "/publications/setup/observe" || input.requestBody.stageCode !== stage.code) return invoke(input);
    const result = await actual.observe({}, input.requestBody);
    assert.equal(result.checksum, input.requestBody.checksum); assert.equal(result.releaseChecksum, release.checksum);
    assert.notEqual(result.checksum, result.releaseChecksum); assert.equal(result.installationRunId, undefined);
    return { result };
  };
  const result = await f.status();
  assert.equal(result.readiness, "READY");
  assert.equal(result.preparation.steps.find(item => item.code === stage.code).status, "CURRENT");
});

test("aggregate observation failures expose only recognized bounded codes without private diagnostics", async t => {
  const f = observationFixture(t), invoke = global.SERVICE.DefaultModuleService.invokeModule;
  for (const code of ["ERR_PUB_SETUP_OBSERVATION", "ERR_AUTH_00003", "ERR_BOF_00081", "ERR_PRIVATE_secret-token"]) {
    global.SERVICE.DefaultModuleService.invokeModule = async input => {
      if (input.apiName === "/publications/setup/observe")
        throw Object.assign(new Error("secret-token /private/provider"), { code, metadata: { token: "secret-token" } });
      return invoke(input);
    };
    const expected = code === "ERR_PRIVATE_secret-token" ? "ERR_BOF_00083" : code;
    const shared = await f.service.sharedPreparationObservation(f.application, f.request);
    const pending = shared.steps.filter(item => item.status === "AUTHORITY_PENDING");
    assert(pending.length > 0); assert(pending.every(item => item.reasonCode === expected));
    const foreign = await f.service.observeForeignPreparation(f.application, f.request, f.foreign);
    assert.equal(foreign.status, "AUTHORITY_PENDING"); assert.equal(foreign.reasonCode, expected);
    assert(!JSON.stringify([shared, foreign]).includes("secret-token"));
    assert(!JSON.stringify([shared, foreign]).includes("/private/provider"));
  }
  assert(!f.calls.some(call => call.operation === "install" || call.operation.endsWith("/submit")));
});

test("source/target operation drift removes aggregate readiness without authorizing another operator", async t => {
  const f = observationFixture(t); assert.equal((await f.status()).readiness, "READY");
  f.state.targetDrift = true;
  const result = await f.status(); assert.notEqual(result.readiness, "READY");
  assert.equal(result.preparation.steps.find(step => step.code === f.foreign.code).status, "AUTHORITY_PENDING");
  assert(!f.calls.some(call => call.operation === "install" || call.operation.endsWith("/submit")));
});

test("Platform rejects effective profile, owner, baseline and required-stage drift before dispatch", async t => {
  const f = observationFixture(t), original = structuredClone(f.plan);
  for (const mutate of [() => f.plan.profileDigest = "0".repeat(64),
    () => f.plan.baselineCode = "foreign", () => f.plan.stages.pop(),
    () => f.plan.stages[0].descriptor.targetServer = "foreign", () => f.plan.stages[0].server = "foreign"]) {
    mutate();
    assert.throws(() => f.service.setupObservationPlan(f.application, f.request), { code: "ERR_BOF_00081" });
    assert.deepEqual(f.calls, []); Object.assign(f.plan, structuredClone(original));
  }
  global.SERVICE.DefaultPublicationSetupObservationService.resolvePlan = () => ({ plan: f.plan,
    checksum: "a".repeat(64), reference: { moduleName: "foreign" } });
  assert.throws(() => f.service.setupObservationPlan(f.application, f.request), { code: "ERR_BOF_00081" });
  assert.deepEqual(f.calls, []);
});

for (const group of ["commerceSetupPublisherUserGroup", "commerceCouponIssuerUserGroup"]) {
  test(group + " refuses unselected global bootstrap and legacy initialization before owner reads", async t => {
    const f = scopedFixture(t);
    global.SERVICE.DefaultSecuredRequestPipelineService = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
    f.request.authData.userGroups = [group];
    f.installed.delete(f.before.code);
    f.authority.readiness = "NOT_IMPORTED";
    await assert.rejects(f.initiate(), { code: "ERR_BOF_00082" });
    assert.deepEqual(f.calls, []);
    f.application.dataPackages.filter(step => step.phase === "AFTER_PUBLICATION")
      .forEach(step => { delete step.operatorEnterpriseCode; });
    await assert.rejects(f.initiate(), { code: "ERR_BOF_00082" });
    assert.deepEqual(f.calls, []);
  });

  test(group + " admits only selected own AFTER owner work and retains pending CMS guards", async t => {
    const f = scopedFixture(t), foreign = f.foreign();
    global.SERVICE.DefaultSecuredRequestPipelineService = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
    f.request.authData.userGroups = [group];
    f.state.publications.forEach(item => { item.status = "CURRENT"; });
    f.select(f.after[0].code);
    const result = await f.initiate();
    assert.deepEqual(f.calls.filter(call => call.operation === "install").map(call => call.codes), [[f.after[0].code]]);
    assert(!f.calls.some(call => call.owner === "cms" && call.operation === "POST" || call.operation.endsWith("/submit")));
    assert.equal(result.preparation.steps.find(step => step.code === foreign.code).status, "AUTHORITY_PENDING");
    f.calls.length = 0;
    f.authority.readiness = "PUBLICATION_PENDING";
    assert.notEqual((await f.initiate()).readiness, "READY");
    assert(f.calls.every(call => ["GET", "preflight"].includes(call.operation)));
    f.select(foreign.code); f.calls.length = 0;
    await assert.rejects(f.initiate(), { code: "ERR_BOF_00082" });
    assert.deepEqual(f.calls, []);
  });
}

test("inherited Commerce setup groups use canonical resolution and cannot bypass selection", async t => {
  const f = scopedFixture(t);
  global.SERVICE.DefaultSecuredRequestPipelineService = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
  f.request.authData.userGroups = [{ code: "partnerPublisher", parentGroups: ["commerceSetupPublisherUserGroup"] }];
  await assert.rejects(f.initiate(), { code: "ERR_BOF_00082" });
  assert.deepEqual(f.calls, []);
  delete global.SERVICE.DefaultSecuredRequestPipelineService;
  f.select(f.publication.code);
  await assert.rejects(f.initiate(), { code: "ERR_BOF_00082" });
  assert.deepEqual(f.calls, []);
});

test("separately held runtime administrator authority retains normal bootstrap despite a narrow Commerce group", async t => {
  const f = scopedFixture(t);
  global.SERVICE.DefaultSecuredRequestPipelineService = require("../../../../nodics.foundation/modules/nRouter/src/service/request/defaultSecuredRequestPipelineService");
  f.request.authData.userGroups = ["runtimeConfigAdminUserGroup", "commerceSetupPublisherUserGroup"];
  f.installed.delete(f.before.code);
  await f.initiate();
  assert.deepEqual(f.calls.filter(call => call.operation === "install").map(call => call.codes), [[f.before.code]]);
  assert(f.calls.some(call => call.owner === "cms" && call.operation === "POST"));
  assert(!f.calls.some(call => call.operation.endsWith("/submit")));
});

test("only BackOffice initiate admits narrow Commerce groups and its selector is declared in the API schema", () => {
  const routes = require("../src/router/routers").backoffice.applicationInitialization;
  const initiate = routes.initiateApplicationInitialization;
  assert.deepEqual(initiate.accessGroups, ["runtimeConfigAdminUserGroup", "commerceSetupPublisherUserGroup", "commerceCouponIssuerUserGroup"]);
  assert.equal(initiate.permission, "backoffice.application.initialization.initiate");
  assert.deepEqual(initiate.authTokenTypes, ["access"]);
  const schema = initiate.requestBody.content["application/json"].schema.properties.afterPublicationStepCode;
  assert.equal(schema.type, "string");
  assert(new RegExp(schema.pattern).test("partner.storefront:budget"));
  assert(!new RegExp(schema.pattern).test("unknown"));
  assert.deepEqual(routes.applicationInitializationStatus.accessGroups, ["userGroup"]);
  for (const [name, route] of Object.entries(routes)) {
    if (name === "initiateApplicationInitialization") continue;
    assert(!route.accessGroups.includes("commerceSetupPublisherUserGroup"));
    assert(!route.accessGroups.includes("commerceCouponIssuerUserGroup"));
  }
});

test("scoped status retains all required foreign stages without any foreign owner invocation or CURRENT inference", async t => {
  const f = scopedFixture(t), foreign = f.foreign();
  f.state.publications.forEach(item => { item.status = "CURRENT"; });
  const result = await f.status();
  assert.equal(result.readiness, "BLOCKED");
  assert.equal(result.preparation.selectionRequired, true);
  assert.equal(result.preparation.steps.find(step => step.code === foreign.code).status, "AUTHORITY_PENDING");
  assert.equal(result.preparation.steps.filter(step => step.phase === "AFTER_PUBLICATION").length, 4);
  assert.equal(f.calls.filter(call => call.owner === "publish").length, 1);
  assert(f.calls.some(call => call.operation === "preflight" && call.codes?.includes(f.after[0].code)));
  assert(!f.calls.some(call => call.operation === "install"));
  assert.deepEqual(result.preparation.selectableStepCodes, f.after.map(step => step.code));
  assert(!JSON.stringify(result).includes("publicationPlan"));
});

test("scoped initialize without explicit selection observes only; selecting one publication never installs data", async t => {
  const f = scopedFixture(t), foreign = f.foreign();
  let result = await f.initiate();
  assert(f.calls.every(call => ["GET", "preflight"].includes(call.operation) || call.operation.endsWith("/status")));
  assert.deepEqual(result.preparation.selectableStepCodes, [f.publication.code]);
  assert.deepEqual(result.allowedActions, ["INITIALIZE"]);
  f.calls.length = 0;
  f.select(f.publication.code);
  result = await f.initiate();
  assert.deepEqual(f.calls.filter(call => call.owner === "publish").map(call => call.operation), ["/publications/setup/submit"]);
  assert(!f.calls.some(call => call.operation === "install"));
  assert.equal(result.preparation.steps.find(step => step.code === foreign.code).status, "AUTHORITY_PENDING");
  assert.notEqual(result.readiness, "READY");
});

test("a completed foreign operator view and caller CURRENT claims never become aggregate authority", async t => {
  const f = scopedFixture(t), foreign = f.foreign();
  const foreignBudget = { ...f.after[0], code: "partner.storefront:foreignBudget", operatorEnterpriseCode: "ISSUER_B" };
  f.application.dataPackages.push(foreignBudget);
  f.state.publications.forEach(item => { item.status = "CURRENT"; });
  f.installed.add(foreignBudget.code);
  f.request.authData.enterpriseCode = "ISSUER_B";
  const prior = await f.status();
  assert.equal(prior.preparation.steps.find(step => step.code === foreign.code).status, "CURRENT");
  assert.equal(prior.preparation.steps.find(step => step.code === foreignBudget.code).status, "CURRENT");
  f.request.authData.enterpriseCode = "ISSUER_A";
  f.request.applicationInitialization = { readiness: "READY", preparation: prior.preparation };
  for (const stage of [foreign, foreignBudget]) stage.status = "CURRENT";
  f.after.forEach(step => f.installed.add(step.code));
  f.calls.length = 0;
  const result = await f.initiate();
  assert.equal(result.readiness, "BLOCKED");
  for (const stage of [foreign, foreignBudget])
    assert.equal(result.preparation.steps.find(step => step.code === stage.code).status, "AUTHORITY_PENDING");
  assert.equal(f.calls.filter(call => call.owner === "publish").length, 1);
  assert(!f.calls.some(call => call.codes?.includes(foreignBudget.code)));
  assert(!f.calls.some(call => call.operation === "install" || call.operation.endsWith("/submit")));
});

test("scoped status rereads installed owner state and drops READY when a previously current release changes", async t => {
  const f = scopedFixture(t);
  f.state.publications.forEach(item => { item.status = "CURRENT"; });
  f.after.forEach(step => f.installed.add(step.code));
  const prior = await f.status();
  assert.equal(prior.readiness, "READY");
  f.installed.delete(f.after[1].code);
  f.calls.length = 0;
  const refreshed = await f.status();
  assert.notEqual(refreshed.readiness, "READY");
  assert.equal(refreshed.preparation.steps.find(step => step.code === f.after[1].code).status, "NOT_INSTALLED");
  assert.equal(prior.readiness, "READY");
  for (const stage of f.after)
    assert(f.calls.some(call => call.operation === "preflight" && call.codes?.includes(stage.code)));
  assert(f.calls.some(call => call.owner === "publish" && call.operation.endsWith("/status")));
  assert(!f.calls.some(call => call.operation === "install" || call.operation.endsWith("/submit")));
});

test("local CURRENT publication admits exactly one selected budget while foreign authority keeps aggregate blocked", async t => {
  const f = scopedFixture(t), foreign = f.foreign();
  const foreignBudget = { ...f.after[0], code: "partner.storefront:foreignBudget", operatorEnterpriseCode: "ISSUER_B" };
  f.application.dataPackages.push(foreignBudget);
  f.state.publications.forEach(item => { item.status = "CURRENT"; });
  f.select(f.after[0].code);
  const result = await f.initiate();
  assert.equal(result.readiness, "BLOCKED");
  assert.equal(result.preparation.status, "BLOCKED");
  const afterSteps = result.preparation.steps.filter(step => step.phase === "AFTER_PUBLICATION");
  assert.equal(afterSteps.length, 5);
  assert.equal(new Set(afterSteps.map(step => step.code)).size, 5);
  assert.equal(result.preparation.steps.find(step => step.code === foreign.code).status, "AUTHORITY_PENDING");
  assert.equal(result.preparation.steps.find(step => step.code === foreignBudget.code).status, "AUTHORITY_PENDING");
  assert.equal(result.preparation.steps.find(step => step.code === f.publication.code).status, "CURRENT");
  assert.equal(result.preparation.steps.find(step => step.code === f.after[0].code).status, "CURRENT");
  assert.equal(result.preparation.steps.find(step => step.code === f.after[1].code).status, "NOT_INSTALLED");
  assert.deepEqual(f.calls.filter(call => call.operation === "install").map(call => call.codes), [[f.after[0].code]]);
  assert(!f.calls.some(call => call.codes?.includes(foreignBudget.code)));
  assert.equal(f.calls.filter(call => call.owner === "publish").length, 2);
  assert(!f.calls.some(call => call.operation.endsWith("/submit")));
  assert.deepEqual(result.preparation.selectableStepCodes, [f.after[1].code]);
});

test("non-CURRENT local publication still blocks selected budget even with foreign stages pending", async t => {
  const f = scopedFixture(t), foreign = f.foreign();
  f.state.publications[0].status = "CURRENT";
  f.state.publications[1].status = "PENDING_APPROVAL";
  f.select(f.after[0].code);
  const result = await f.initiate();
  assert.equal(result.readiness, "BLOCKED");
  assert.equal(result.preparation.steps.find(step => step.code === foreign.code).status, "AUTHORITY_PENDING");
  assert(!f.calls.some(call => call.codes?.some(code => f.after.some(step => step.code === code))));
  assert.deepEqual(result.preparation.selectableStepCodes, []);
  assert(!f.calls.some(call => call.operation.endsWith("/submit")));
});

test("one selected operational stage never batches or executes its adjacent issuance and refreshes actual owner evidence", async t => {
  const f = scopedFixture(t);
  f.state.publications.forEach(item => { item.status = "CURRENT"; });
  f.select(f.after[0].code);
  const result = await f.initiate();
  assert.equal(result.preparation.selectionRequired, true);
  const deferred = f.calls.filter(call => call.codes?.some(code => f.after.some(step => step.code === code)));
  assert(deferred.length > 0);
  assert(deferred.every(call => call.codes.length === 1));
  assert.deepEqual(deferred.filter(call => call.operation === "install").map(call => call.codes), [[f.after[0].code]]);
  assert.equal(result.preparation.steps.find(step => step.code === f.after[0].code).status, "CURRENT");
  assert.equal(result.preparation.steps.find(step => step.code === f.after[1].code).status, "NOT_INSTALLED");
  assert.notEqual(result.readiness, "READY");
  const installed = f.calls.findIndex(call => call.operation === "install");
  assert(f.calls.slice(installed + 1).some(call => call.owner === "cms" && call.operation === "GET"));
  f.calls.length = 0;
  await f.initiate();
  assert(!f.calls.some(call => call.operation === "install"));
});

test("scoped singleton keys distinguish budget and issuance even when their correlation is reused", t => {
  const f = scopedFixture(t);
  const all = f.service.preparationGroups(f.application, f.request, f.service.preparationSteps(f.application));
  const singleton = f.after.map(step => f.service.preparationGroups(f.application, f.request,
    f.service.preparationSteps(f.application).filter(item => item.code === step.code))[0]);
  assert.equal(new Set(singleton.map(group => group.idempotencyKey)).size, 2);
  for (const group of singleton) {
    assert.equal(group.steps.length, 1);
    assert.equal(group.idempotencyKey, all.find(item => item.steps[0].code === group.steps[0].code).idempotencyKey);
  }
});

test("scoped import boundary refuses batched, unselected and foreign execution before transport", t => {
  const f = scopedFixture(t);
  const steps = f.service.preparationSteps(f.application).filter(step => step.type === "DATA_RELEASE" && step.phase === "AFTER_PUBLICATION");
  const group = f.service.preparationGroups(f.application, f.request, steps)[0];
  f.select(steps[0].code);
  assert.throws(() => f.service.invokeDataReleaseOperation("execute", { ...group, steps }, f.request),
    error => error.code === "ERR_BOF_00082");
  f.select(steps[1].code);
  assert.throws(() => f.service.invokeDataReleaseOperation("execute", group, f.request),
    error => error.code === "ERR_BOF_00082");
  f.request.authData.enterpriseCode = "ISSUER_B";
  assert.throws(() => f.service.invokeDataReleaseOperation("preflight", group, f.request),
    error => error.code === "ERR_BOF_00082");
  assert.deepEqual(f.calls, []);
});

test("scoped failed installation retains its receipt and refreshes evidence without retrying or executing issuance", async t => {
  const f = scopedFixture(t);
  f.state.publications.forEach(item => { item.status = "CURRENT"; });
  f.select(f.after[0].code);
  const invoke = global.SERVICE.DefaultModuleService.invokeModule;
  global.SERVICE.DefaultModuleService.invokeModule = async input => {
    if (input.moduleName === "import" && input.apiName.endsWith("/install")) {
      f.calls.push({ owner: "import", operation: "install", codes: input.requestBody.releaseCodes });
      throw Object.assign(new Error("private-owner-failure"), { code: "ERR_PARTNER_00003" });
    }
    return invoke(input);
  };
  const result = await f.initiate();
  assert.deepEqual(f.calls.filter(call => call.operation === "install").map(call => call.codes), [[f.after[0].code]]);
  assert.equal(result.preparation.groupReceipts[0].status, "FAILED");
  assert.equal(result.preparation.operationFailure.automaticRetry, false);
  assert.equal(result.preparation.steps.filter(step => step.phase === "AFTER_PUBLICATION").length, 3);
  assert.notEqual(result.readiness, "READY");
  assert(!JSON.stringify(result).includes("private-owner"));
});

test("selected AFTER stage cannot prepare BEFORE data, resubmit CMS approval or act before qualified Media", async t => {
  const f = scopedFixture(t);
  f.select(f.publication.code);
  for (const blocked of ["before", "cms", "media"]) {
    f.installed.add(f.before.code);
    f.authority.readiness = "READY";
    f.authority.mediaDependencies.qualified = true;
    if (blocked === "before") f.installed.delete(f.before.code);
    if (blocked === "cms") f.authority.readiness = "PUBLICATION_PENDING";
    if (blocked === "media") f.authority.mediaDependencies.qualified = false;
    f.calls.length = 0;
    const result = await f.initiate();
    assert.notEqual(result.readiness, "READY");
    assert.equal(result.preparation.selectionRequired, false);
    assert.deepEqual(result.preparation.selectableStepCodes, []);
    assert(f.calls.every(call => ["GET", "preflight"].includes(call.operation)));
    assert.equal(result.preparation.steps.filter(step => step.phase === "AFTER_PUBLICATION").length, 3);
  }
});

test("required AFTER visibility survives a blocked BEFORE owner and a failed ordinary preparation", async t => {
  const f = scopedFixture(t), foreign = f.foreign();
  const invoke = global.SERVICE.DefaultModuleService.invokeModule;
  let refusePreflight = true;
  global.SERVICE.DefaultModuleService.invokeModule = async input => {
    if (input.moduleName === "import" && (refusePreflight || input.apiName.endsWith("/install")))
      throw Object.assign(new Error("private-before-owner"), { code: "ERR_PARTNER_00003" });
    return invoke(input);
  };
  for (const mode of ["preflight", "install"]) {
    refusePreflight = mode === "preflight";
    f.installed.delete(f.before.code);
    const result = await f.initiate();
    assert.equal(result.readiness, "BLOCKED");
    assert.equal(result.preparation.selectionRequired, false);
    assert.deepEqual(result.preparation.selectableStepCodes, []);
    assert.equal(result.preparation.steps.filter(step => step.phase === "AFTER_PUBLICATION").length, 4);
    assert.equal(result.preparation.steps.find(step => step.code === foreign.code).status, "AUTHORITY_PENDING");
    assert(!f.calls.some(call => call.owner === "publish" || call.owner === "cms"));
  }
});

test("fresh scoped profile offers normal INITIALIZE without a stage and dispatches only BEFORE/CMS preparation", async t => {
  const f = scopedFixture(t), foreign = f.foreign();
  f.installed.delete(f.before.code);
  f.authority.readiness = "NOT_IMPORTED";
  f.authority.publication.state = "STAGED";
  f.authority.mediaDependencies.qualified = false;
  const status = await f.status();
  assert.deepEqual(status.allowedActions, ["INITIALIZE"]);
  assert.equal(status.preparation.selectionRequired, false);
  assert.deepEqual(status.preparation.selectableStepCodes, []);
  assert.equal(status.preparation.steps.filter(step => step.phase === "AFTER_PUBLICATION").length, 4);
  assert.equal(status.preparation.steps.find(step => step.code === foreign.code).status, "AUTHORITY_PENDING");
  f.state.afterBaseline = { readiness: "PUBLICATION_PENDING", publication: { state: "PENDING_APPROVAL" } };
  f.calls.length = 0;
  const result = await f.initiate();
  assert.equal(result.preparation.selectionRequired, false);
  assert.deepEqual(result.preparation.selectableStepCodes, []);
  assert.equal(result.readiness, "PUBLICATION_PENDING");
  assert.equal(result.preparation.steps.filter(step => step.phase === "AFTER_PUBLICATION").length, 4);
  assert.deepEqual(f.calls.filter(call => call.operation === "install").map(call => call.codes), [[f.before.code]]);
  assert(f.calls.some(call => call.owner === "cms" && call.operation === "POST"));
  assert(!f.calls.some(call => call.owner === "publish" || call.codes?.some(code => f.after.some(step => step.code === code))));
});

test("scoped CMS/Media pending states never require a stage selection before AFTER admission", async t => {
  const f = scopedFixture(t);
  for (const state of ["NOT_IMPORTED", "IMPORTED", "IMPORTING", "PUBLICATION_PENDING", "media", "offline"]) {
    f.authority.readiness = ["media", "offline"].includes(state) ? "READY" : state;
    f.authority.publication.state = state === "offline" ? "STAGED" : "ONLINE";
    f.authority.mediaDependencies.qualified = state !== "media";
    f.calls.length = 0;
    const result = await f.status();
    assert.equal(result.preparation.selectionRequired, false, state);
    assert.deepEqual(result.preparation.selectableStepCodes, [], state);
    assert.equal(result.preparation.steps.filter(step => step.phase === "AFTER_PUBLICATION").length, 3);
    assert(!f.calls.some(call => call.owner === "publish" || call.codes?.some(code => f.after.some(step => step.code === code))));
  }
});

test("blocked capability preparation preserves required AFTER visibility without requiring selection", async t => {
  const f = scopedFixture(t), foreign = f.foreign();
  const invoke = global.SERVICE.DefaultModuleService.invokeModule;
  let refusePreflight = true;
  global.SERVICE.DefaultModuleService.invokeModule = async input => {
    if (input.moduleName === "import" && (refusePreflight || input.apiName.endsWith("/install")))
      throw Object.assign(new Error("private-before-owner"), { code: "ERR_PARTNER_00003" });
    return invoke(input);
  };
  for (const mode of ["preflight", "install"]) {
    refusePreflight = mode === "preflight";
    f.installed.delete(f.before.code);
    const result = await f.service.prepareCapability(f.application.code, f.request);
    assert.equal(result.preparation.selectionRequired, false);
    assert.deepEqual(result.preparation.selectableStepCodes, []);
    assert.equal(result.preparation.steps.filter(step => step.phase === "AFTER_PUBLICATION").length, 4);
    assert.equal(result.preparation.steps.find(step => step.code === foreign.code).status, "AUTHORITY_PENDING");
    assert(!f.calls.some(call => call.owner === "publish" || call.owner === "cms"));
  }
});

test("malformed, unknown, BEFORE and foreign selectors fail before any owner call", async t => {
  const f = scopedFixture(t), foreign = f.foreign();
  for (const code of [null, [], {}, "", "x".repeat(300), "unknown:stage", f.before.code, foreign.code]) {
    f.select(code); f.calls.length = 0;
    await assert.rejects(f.initiate(), error => ["ERR_BOF_00081", "ERR_BOF_00082"].includes(error.code));
    assert.deepEqual(f.calls, []);
  }
  f.select(f.publication.code);
  await assert.rejects(f.service.invoke("rollback", f.application.code, f.request));
  assert.deepEqual(f.calls, []);
});

test("scoped dispatch rejects service/customer/refresh/system identities, conflicting aliases and missing bearer", async t => {
  const f = scopedFixture(t);
  const auth = { ...f.request.authData }, headers = { ...f.request.httpRequest.headers };
  f.select(f.publication.code);
  for (const altered of [
    { principalType: "service" }, { principalType: "customer" }, { tokenType: "refresh" }, { isSystem: true },
    { tenant: "foreign" }, { entCode: "foreign" }, { enterpriseCode: "foreign" }, { tenantCode: "foreign" },
  ]) {
    f.request.authData = { ...auth, ...altered };
    await assert.rejects(f.initiate(), error => error.code === "ERR_BOF_00082");
  }
  f.request.authData = auth;
  for (const altered of [{ authorization: undefined }, { authorization: "Bearer invalid\nvalue" },
    { "x-enterprise-code": "foreign" }, { "x-tenant-code": "foreign" }]) {
    f.request.httpRequest.headers = { ...headers, ...altered };
    await assert.rejects(f.initiate(), error => error.code === "ERR_BOF_00082");
  }
  assert.deepEqual(f.calls, []);
});

test("scoped descriptor validation rejects mixed/duplicate stages and later-layer scope narrowing is honored", async t => {
  const f = scopedFixture(t);
  f.select(f.publication.code);
  const scope = f.after[0].operatorEnterpriseCode;
  delete f.after[0].operatorEnterpriseCode;
  await assert.rejects(f.initiate(), error => error.code === "ERR_BOF_00081");
  f.after[0].operatorEnterpriseCode = scope;
  f.application.dataPackages.push({ ...f.after[0] });
  await assert.rejects(f.initiate(), error => error.code === "ERR_BOF_00081");
  f.application.dataPackages.pop();
  f.service.isPreparationOperator = () => false;
  await assert.rejects(f.initiate(), error => error.code === "ERR_BOF_00082");
  assert.deepEqual(f.calls, []);
});

test("controller preserves only the bounded stage selector and never accepts caller enterprise or owner payload", async t => {
  const f = scopedFixture(t);
  const controller = require("../src/controller/defaultBackofficeApplicationInitializationController");
  const request = { httpRequest: { params: { profileCode: f.application.code }, body: {
    afterPublicationStepCode: f.publication.code, enterpriseCode: "foreign", publicationPlan: { private: true },
    releaseCodes: [f.after[0].code], authorization: "forged",
  } } };
  controller.prepare(request);
  assert.deepEqual(request.applicationInitialization, { reason: undefined, correlationId: undefined,
    forceRefresh: undefined, afterPublicationStepCode: f.publication.code });
});

test("scoped publication 403 preserves owner refusal without operational preflight, retries or private details", async t => {
  const f = scopedFixture(t), foreign = f.foreign();
  const invoke = global.SERVICE.DefaultModuleService.invokeModule;
  global.SERVICE.DefaultModuleService.invokeModule = async input => {
    if (input.moduleName !== "publish") return invoke(input);
    f.calls.push({ owner: "publish", operation: input.apiName });
    assert.equal(input.header.Authorization, "Bearer original-partner-human");
    assert.equal(input.maxAttempts, 1);
    throw Object.assign(new Error("private-staff-permission-detail"), { code: "ERR_AUTH_00003", statusCode: 403 });
  };
  const result = await f.status();
  assert.equal(result.readiness, "BLOCKED");
  assert.equal(result.preparation.steps.find(step => step.code === f.publication.code).status, "VALIDATION_BLOCKED");
  assert.equal(result.preparation.steps.find(step => step.code === foreign.code).status, "AUTHORITY_PENDING");
  assert.deepEqual(result.preparation.selectableStepCodes, []);
  assert.deepEqual(result.allowedActions, []);
  assert.equal(f.calls.filter(call => call.owner === "publish").length, 1);
  assert(!f.calls.some(call => call.codes?.some(code => f.after.some(step => step.code === code))));
  assert(!JSON.stringify(result).includes("private-staff"));
  f.calls.length = 0;
  f.select(f.after[0].code);
  await f.initiate();
  assert.equal(f.calls.filter(call => call.owner === "publish").length, 1);
  assert(!f.calls.some(call => call.operation === "install"));
});

test("scoped execution detaches signed authority and selector before awaiting other owners", async t => {
  const f = scopedFixture(t);
  f.state.publications.forEach(item => { item.status = "CURRENT"; });
  f.select(f.after[0].code);
  const invoke = global.SERVICE.DefaultModuleService.invokeModule;
  let changed = false;
  global.SERVICE.DefaultModuleService.invokeModule = async input => {
    if (!changed && input.moduleName === "cms") {
      changed = true;
      f.request.authData.enterpriseCode = "ISSUER_B";
      f.request.applicationInitialization.afterPublicationStepCode = f.after[1].code;
      f.request.httpRequest.headers.authorization = "Bearer replaced-request";
    }
    if (["publish", "import"].includes(input.moduleName)) {
      assert.equal(input.header.Authorization, "Bearer original-partner-human");
      // The fixture also checks transport against its request reference.
      const authorization = f.request.httpRequest.headers.authorization;
      f.request.httpRequest.headers.authorization = "Bearer original-partner-human";
      try { return await invoke(input); }
      finally { f.request.httpRequest.headers.authorization = authorization; }
    }
    return invoke(input);
  };
  await f.initiate();
  assert(changed);
  assert.deepEqual(f.calls.filter(call => call.operation === "install").map(call => call.codes), [[f.after[0].code]]);
});

test("scoped selection validates descriptor bounds and rejects optional or legacy selectors before dispatch", async t => {
  const f = scopedFixture(t);
  for (const enterprise of [null, "", {}, "x".repeat(129), "foreign/scope"]) {
    f.after[0].operatorEnterpriseCode = enterprise;
    await assert.rejects(f.status(), error => error.code === "ERR_BOF_00081");
  }
  f.after[0].operatorEnterpriseCode = "ISSUER_A";
  f.after[0].required = false;
  f.select(f.after[0].code);
  await assert.rejects(f.initiate(), error => error.code === "ERR_BOF_00081");
  f.after[0].required = true;
  const packages = [...f.application.dataPackages];
  for (let index = 0; index < 256; index++) f.application.dataPackages.push({ ...f.after[0], code: "partner.storefront:stage" + index });
  await assert.rejects(f.initiate(), error => error.code === "ERR_BOF_00081");
  f.application.dataPackages = packages;
  packages.filter(step => step.phase === "AFTER_PUBLICATION").forEach(step => { delete step.operatorEnterpriseCode; });
  await assert.rejects(f.initiate(), error => error.code === "ERR_BOF_00081");
  assert.deepEqual(f.calls, []);
});

test("controller rejects stage selectors on other commands and malformed DTOs before facade dispatch", t => {
  const f = scopedFixture(t);
  const controller = require("../src/controller/defaultBackofficeApplicationInitializationController");
  const request = code => ({ httpRequest: { params: { profileCode: f.application.code }, body: { afterPublicationStepCode: code } } });
  for (const code of [null, [], {}, "", "unknown", "x".repeat(300)])
    assert.throws(() => controller.prepare(request(code)), error => error.code === "ERR_BOF_00081");
  for (const operation of ["prepare", "rollback", "retire", "reconcileApproval", "installContentPack", "contentPackStatus"])
    assert.throws(() => controller.invoke(operation, request(f.publication.code)), error => error.code === "ERR_BOF_00081");
});

test('coordinated publication status and submission precede any operational owner preflight', async t => {
  const f = governedFixture(t);
  const status = await f.status();
  assert.notEqual(status.readiness, 'READY');
  assert.deepEqual(status.allowedActions, ['INITIALIZE']);
  assert(f.calls.some(call => call.owner === 'publish' && call.operation.endsWith('/status')));
  assert(!f.calls.some(call => call.codes?.includes(f.after[0].code)));
  f.calls.length = 0;
  const pending = await f.initiate();
  assert.notEqual(pending.readiness, 'READY');
  assert.deepEqual(pending.allowedActions, []);
  assert(f.calls.some(call => call.owner === 'publish' && call.operation.endsWith('/submit')));
  assert(!f.calls.some(call => call.codes?.includes(f.after[0].code)));
  assert(pending.preparation.steps.some(item => item.publications?.every(row => row.workflowRef)));
  assert(!JSON.stringify(pending).includes('publicationPlan'));
  f.state.publications[0].status = 'CURRENT';
  assert.notEqual((await f.status()).readiness, 'READY');
  f.state.publications[1].status = 'CURRENT';
  f.calls.length = 0;
  const complete = await f.initiate();
  assert.equal(complete.readiness, 'READY');
  const publications = f.calls.findIndex(call => call.owner === 'publish');
  const install = f.calls.findIndex(call => call.operation === 'install');
  assert(publications >= 0 && install > publications);
});

test('malformed, ambiguous or contradictory publication evidence blocks operational setup', async t => {
  const f = governedFixture(t);
  for (const response of [
    { contractVersion: 1, ready: true, items: [] },
    { contractVersion: 1, ready: true, items: f.state.publications },
    { contractVersion: 1, ready: false, items: [f.state.publications[0], f.state.publications[0]] },
    { contractVersion: 2, ready: false, items: f.state.publications },
  ]) {
    f.state.publicationResponse = response; f.calls.length = 0;
    assert.equal((await f.status()).readiness, 'BLOCKED');
    assert(!f.calls.some(call => call.codes?.includes(f.after[0].code)));
  }
});

test('full publication evidence uses the layered application timeout, not the short module default', async t => {
  const f = governedFixture(t);
  const plan = f.application.dataPackages.find(item => item.type === 'GOVERNED_PUBLICATIONS').publicationPlan;
  plan.items = Array.from({ length: 67 }, (_, index) => ({
    ...plan.items[0], code: 'partner-' + index, rootCode: 'root-' + index,
    input: { publicationCode: 'partner-' + index },
  }));
  f.state.publications = plan.items.map(item => ({ ...item, status: 'CURRENT' }));
  const invoke = global.SERVICE.DefaultModuleService.invokeModule;
  global.SERVICE.DefaultModuleService.invokeModule = async input => {
    if (input.moduleName === 'publish') {
      assert(input.timeoutMs > 7000, 'complete owner validation must not inherit the five-second transport default');
    }
    return invoke(input);
  };
  for (const timeoutMs of [120000, 90000]) {
    delete f.application.target.timeoutMs;
    global.CONFIG.get = name => name === 'backofficeApplicationInitialization' ? { target: { timeoutMs } } : undefined;
    f.application.target = f.service.resolveProfile(f.application).target;
    assert.equal(f.application.target.timeoutMs, timeoutMs);
    const evidence = { contractVersion: 1, ready: true, items: f.state.publications };
    for (const response of [evidence, { data: evidence }, { result: evidence }]) {
      f.state.publicationResponse = response;
      const result = await f.service.publicationPreparation(f.application, f.request, false);
      assert.equal(result.ready, true);
      assert.equal(result.steps[0].status, 'CURRENT');
      assert.equal(result.steps[0].publications.length, 67);
      assert.equal(result.steps[0].runtimeDiagnostic, undefined);
    }
  }
});

test('publication invocation failures expose bounded owner codes and stages without private metadata', async t => {
  const f = governedFixture(t);
  const moduleService = require('../../../../nodics.foundation/modules/nService/src/service/module/defaultModuleService');
  global.SERVICE.DefaultModuleService.classifyTransportFailure = moduleService.classifyTransportFailure;
  const fixtures = [
    { code: 'ERR_SYS_00001', metadata: { transportFailure: { code: 'ETIMEDOUT' } }, expected: 'ETIMEDOUT' },
    { code: 'ERR_PUB_SETUP_INVALID', expected: 'ERR_PUB_SETUP_INVALID' },
    { code: 'private-token\n', expected: 'ERR_BOF_00081' },
  ];
  for (const failure of fixtures) {
    let attempts = 0;
    global.SERVICE.DefaultModuleService.invokeModule = async () => {
      attempts++;
      throw Object.assign(new Error('private-provider /private/path Bearer private-token'), failure, {
        remoteResponse: { password: 'private-password' },
      });
    };
    const result = await f.service.publicationPreparation(f.application, f.request, true);
    assert.equal(attempts, 1);
    assert.equal(result.ready, false);
    assert.equal(result.steps[0].status, 'VALIDATION_BLOCKED');
    assert.deepEqual(result.steps[0].runtimeDiagnostic, {
      phase: 'invocation', targetModule: 'publish', failureCode: failure.expected,
    });
    assert(!/private-|Bearer|password|publicationPlan/.test(JSON.stringify(result)));
  }
});

test('publication diagnostics distinguish target binding, human authorization and owner evidence refusals', async t => {
  const f = governedFixture(t);
  const binding = f.service.applicationTargetBinding;
  let attempts = 0;
  global.SERVICE.DefaultModuleService.invokeModule = async () => { attempts++; return { privatePayload: 'private-token' }; };
  f.service.applicationTargetBinding = () => { throw new global.CLASSES.NodicsError('ERR_BOF_00081', 'private-endpoint'); };
  let result = await f.service.publicationPreparation(f.application, f.request, false);
  assert.equal(result.steps[0].runtimeDiagnostic.phase, 'targetBinding');
  assert.equal(attempts, 0);
  f.service.applicationTargetBinding = binding;
  for (const request of [
    { ...f.request, httpRequest: { headers: {} } },
    { ...f.request, authData: { ...f.request.authData, tokenType: 'service' } },
  ]) {
    result = await f.service.publicationPreparation(f.application, request, false);
    assert.equal(result.ready, false);
    assert.equal(result.steps[0].runtimeDiagnostic.phase, 'authorization');
    assert.equal(result.steps[0].runtimeDiagnostic.failureCode, 'ERR_BOF_00082');
    assert.equal(attempts, 0);
  }
  result = await f.service.publicationPreparation(f.application, f.request, false);
  assert.equal(result.ready, false);
  assert.equal(result.steps[0].runtimeDiagnostic.phase, 'evidence');
  assert.equal(attempts, 1);
  assert(!/private-|Bearer|publicationPlan/.test(JSON.stringify(result)));
});

test("strict optional phase defaults before publication and rejects invalid/media deferred phases", (t) => {
  const f = phasedFixture(t);
  assert.deepEqual(f.service.preparationSteps(f.application).map((item) => item.phase),
    ["BEFORE_PUBLICATION", "BEFORE_PUBLICATION", "AFTER_PUBLICATION", "AFTER_PUBLICATION"]);
  assert.equal(f.service.describe(f.application).dataPackages[2].phase, "AFTER_PUBLICATION");
  for (const phase of [null, "", "after_publication", "AFTER", {}, 1]) {
    assert.throws(() => f.service.normalizePreparationStep({ ...f.before, phase }, 0),
      (error) => error.code === "ERR_BOF_00081");
  }
  assert.throws(() => f.service.normalizePreparationStep({ ...f.media, phase: "AFTER_PUBLICATION" }, 0),
    /phase is invalid/);
});

for (const readiness of ["NOT_IMPORTED", "IMPORTED", "PUBLICATION_PENDING", "IMPORTING"]) {
  test(readiness + " preserves CMS approval evidence and never preflights or installs deferred data", async (t) => {
    const f = phasedFixture(t);
    f.authority.readiness = readiness;
    f.authority.publication = { code: "partnerPublication", state: "PENDING", workflowRef: "approval-task" };
    f.installed.delete(f.before.code);
    const observed = await f.status();
    assert.equal(observed.readiness, readiness);
    assert.deepEqual(observed.publication, f.authority.publication);
    assert(f.calls.every((call) => call.operation !== "install" && call.operation !== "prepare" && call.operation !== "POST"));
    f.calls.length = 0;
    const initiated = await f.initiate();
    assert.equal(initiated.readiness, readiness);
    assert.deepEqual(initiated.publication, f.authority.publication);
    assert(f.calls.some((call) => call.owner === "import" && call.operation === "install" && call.codes[0] === f.before.code));
    assert(!f.calls.some((call) => call.codes?.some((code) => f.after.some((step) => step.code === code))));
    if (readiness === "PUBLICATION_PENDING") {
      assert.deepEqual(initiated.allowedActions, []);
      assert.equal(initiated.capability.businessStatus, "APPROVAL_IN_PROGRESS");
    }
  });
}

test("Online status inspects owner setup read-only and offers existing INITIALIZE until all required receipts are CURRENT", async (t) => {
  const f = phasedFixture(t);
  let result = await f.status();
  assert.equal(result.readiness, "IMPORTED");
  assert.equal(result.preparation.status, "ACTION_REQUIRED");
  assert.deepEqual(result.allowedActions, ["INITIALIZE"]);
  assert.equal(result.publication.state, "ONLINE");
  assert.equal(result.capability.businessStatus, "NEEDS_ATTENTION");
  assert(f.calls.every((call) => ["GET", "preflight"].includes(call.operation)));
  f.after.forEach((step) => f.installed.add(step.code));
  result = await f.status();
  assert.equal(result.readiness, "READY");
  assert.equal(result.preparation.status, "CURRENT");
  assert(!result.allowedActions.includes("INITIALIZE"));
});

test("one initiate combines existing catalogue/media publication and required deferred setup with human bearer", async (t) => {
  const f = phasedFixture(t);
  f.installed.delete(f.before.code);
  f.authority.readiness = "NOT_IMPORTED";
  f.authority.publication.state = "STAGED";
  f.state.afterBaseline = { readiness: "READY", publication: { code: "partnerPublication", state: "ONLINE" } };
  const result = await f.initiate();
  assert.equal(result.readiness, "READY");
  assert.equal(result.preparation.status, "CURRENT");
  const beforeInstall = f.calls.findIndex((call) => call.operation === "install" && call.codes.includes(f.before.code));
  const publication = f.calls.findIndex((call) => call.owner === "cms" && call.operation === "POST");
  const afterRead = f.calls.findIndex((call) => call.operation === "preflight" && call.codes.includes(f.after[0].code));
  const afterInstall = f.calls.findIndex((call) => call.operation === "install" && call.codes.includes(f.after[0].code));
  assert(beforeInstall >= 0 && beforeInstall < publication && publication < afterRead && afterRead < afterInstall);
  assert.equal(result.preparation.groupReceipts.length, 2);
  assert(result.preparation.groupReceipts.every((receipt) => receipt.status === "COMPLETE"));
  assert(f.calls.slice(afterInstall + 1).some((call) => call.owner === "cms" && call.operation === "GET"));
  f.calls.length = 0;
  assert.equal((await f.initiate()).readiness, "READY");
  assert(f.calls.every((call) => ["GET", "preflight"].includes(call.operation)), "repeat CURRENT initiate is read-only");
});

test("owner refusal on an Online baseline blocks initiate before writes while retaining publication and approval", async (t) => {
  const f = phasedFixture(t);
  f.state.ownerReady = false;
  f.after.forEach((step) => f.installed.add(step.code));
  f.authority.publication.workflowRef = "approved-workflow";
  for (const invoke of [f.status, f.initiate]) {
    f.calls.length = 0;
    const result = await invoke();
    assert.equal(result.readiness, "BLOCKED");
    assert.deepEqual(result.allowedActions, []);
    assert.deepEqual(result.publication, f.authority.publication);
    assert.equal(result.preparation.steps[2].status, "VALIDATION_BLOCKED");
    assert(!JSON.stringify(result).includes("private-secret-provider"));
    assert(f.calls.every((call) => ["GET", "preflight"].includes(call.operation)));
  }
});

test("Media or Online pointer must be qualified before deferred owner reads or writes", async (t) => {
  const f = phasedFixture(t);
  for (const invalid of ["media", "pointer", "missing-media"]) {
    f.authority.publication.state = invalid === "pointer" ? "PENDING" : "ONLINE";
    f.authority.mediaDependencies = invalid === "missing-media" ? undefined : {
      owner: "media", qualified: invalid !== "media", dependencies: [] };
    f.calls.length = 0;
    const result = await f.status();
    assert.notEqual(result.readiness, "READY");
    assert(!f.calls.some((call) => call.codes?.includes(f.after[0].code)));
    if (invalid !== "pointer") {
      f.calls.length = 0;
      assert.notEqual((await f.initiate()).readiness, "READY");
      assert(f.calls.every((call) => ["GET", "preflight"].includes(call.operation)));
    }
  }
});

test("reconcile, rollback and retire never execute deferred setup", async (t) => {
  const f = phasedFixture(t);
  for (const operation of ["reconcileApproval", "rollback", "retire"]) {
    f.calls.length = 0;
    const result = await f.service.invoke(operation, f.application.code, f.request);
    assert.notEqual(result.readiness, "READY", "unobserved required deferred setup cannot claim READY");
    assert(!f.calls.some((call) => call.codes?.includes(f.after[0].code)));
    assert(!f.calls.some((call) => call.operation === "install"));
  }
});

test("deferred execution rechecks CMS/Media and never promotes a now-pending baseline to READY", async (t) => {
  const f = phasedFixture(t);
  f.state.postInstallStatus = "PUBLICATION_PENDING";
  const result = await f.initiate();
  assert.equal(result.readiness, "PUBLICATION_PENDING");
  assert.deepEqual(result.allowedActions, []);
  assert.equal(f.calls.filter((call) => call.operation === "install").length, 1);
});

test("deferred SOURCE_READY and running receipts cannot advertise an install or claim READY", async (t) => {
  const f = phasedFixture(t);
  for (const status of ["SOURCE_READY", "RUNNING", "INVALID_RELEASE"]) {
    f.state.afterStatus = status;
    f.calls.length = 0;
    const result = await f.initiate();
    assert.notEqual(result.readiness, "READY");
    assert.deepEqual(result.allowedActions, []);
    assert(f.calls.every((call) => ["GET", "preflight"].includes(call.operation)));
  }
});

test("deferred installation rechecks Media qualification before confirming overall readiness", async (t) => {
  const f = phasedFixture(t);
  f.state.postInstallMedia = { owner: "media", qualified: false, dependencies: [] };
  const result = await f.initiate();
  assert.equal(result.readiness, "MEDIA_DEPENDENCIES_PENDING");
  const install = f.calls.findIndex((call) => call.operation === "install");
  assert(install >= 0);
  assert(!f.calls.slice(install + 1).some((call) => call.codes?.includes(f.after[0].code)),
    "unqualified Media prevents another deferred owner preflight");
});

test("deferred phase preserves baseline updates and explicit force refresh through existing CMS initiate", async (t) => {
  const f = phasedFixture(t);
  f.after.forEach((step) => f.installed.add(step.code));
  f.authority.releaseStatus = "UPDATE_AVAILABLE";
  await f.initiate();
  assert(f.calls.some((call) => call.owner === "cms" && call.operation === "POST"));
  f.calls.length = 0;
  f.authority.releaseStatus = "CURRENT";
  f.request.applicationInitialization = { forceRefresh: true };
  await f.initiate();
  assert(f.calls.some((call) => call.owner === "cms" && call.operation === "POST"));
});
