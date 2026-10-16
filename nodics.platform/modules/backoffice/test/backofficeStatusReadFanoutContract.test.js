/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/* Nodics. Copyright (c) 2026. Governed by the root LICENSE. */
"use strict";
/**
 * @module backoffice/test/backofficeStatusReadFanoutContract
 * @description Composes bootstrap/readiness and real Media controller/facade/aggregate with safe owner mocks; no HTTP/provider/runtime writes.
 * @layer test
 * @owner backoffice
 * @override Inert owner fixtures must retain exact-request identity, bounded reads and readiness contracts.
 */
const assert = require("node:assert/strict");
const path = require("node:path");
const application = require("../src/service/defaultBackofficeApplicationInitializationService");
const registry = require("../src/service/registry/defaultBackofficeRegistryService");
const readiness = require("../src/service/operations/defaultBackofficeOperationalReadinessService");
const mediaRoot = path.resolve(
  __dirname,
  "../../../../nodics.wcms/modules/media/src",
);
const mediaController = require(
  path.join(mediaRoot, "controller/storage/defaultMediaStorageController"),
);
const mediaFacade = require(
  path.join(mediaRoot, "facade/storage/defaultMediaStorageFacade"),
);
const mediaService = require(
  path.join(mediaRoot, "service/storage/defaultMediaReadinessService"),
);
const mediaLibrary = require(
  path.join(mediaRoot, "service/defaultMediaLibraryService"),
);

/** Controls owner completion without wall-clock performance assertions. */
function deferredStatus() {
  let resolve, reject;
  const promise = new Promise((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

/** Allows the current promise workers to finish or claim their next item. */
function flushStatusWorkers() {
  return new Promise(resolve => setImmediate(resolve));
}

describe("Bounded setup status fanout", function () {
  let request, owner, transportCalls, databaseCalls, rows, oldFetch;
  beforeEach(function () {
    global.CLASSES = {
      NodicsError: class extends Error {
        constructor(code, message) {
          super(message);
          this.code = code;
        }
      },
    };
    global.CONFIG = { get: () => undefined };
    global.NODICS = {
      getModels: () => ({
        MediaModel: {
          versioned: true,
          rawSchema: { versionedReadMode: "CURRENT" },
        },
      }),
    };
    global.UTILS = { createModelName: () => "MediaModel" };
    oldFetch = global.fetch;
    global.fetch = () => {
      throw new Error("Per-asset network forbidden during routine status");
    };
    request = {
      tenant: "tenant-a",
      enterpriseCode: "enterprise-a",
      authData: {
        tenant: "tenant-a",
        entCode: "enterprise-a",
        tokenType: "access",
        principalId: "operator-a",
      },
      httpRequest: { headers: { authorization: "Bearer human-token" } },
    };
    owner = Object.create(application);
    owner.safeManifestPath = () =>
      path.join(
        __dirname,
        "fixtures/applicationMediaAssets/readinessManifest.js",
      );
    owner.safeManifestAssetPath = () =>
      path.join(
        __dirname,
        "fixtures/applicationMediaAssets/files/sample-product-media.svg",
      );
    owner.applicationTargetBinding = () => ({
      connectionName: "staged",
      targetAuthority: { runtimeRole: { code: "WCMS_STAGED" } },
    });
    owner.operatorOrigin = () => "https://axis.example.test";
    transportCalls = [];
    databaseCalls = [];
    rows = undefined;
    global.FACADE = { DefaultMediaStorageFacade: mediaFacade };
    global.SERVICE = {
      DefaultMediaLibraryService: mediaLibrary,
      DefaultMediaReadinessService: mediaService,
      DefaultSecuredRequestPipelineService: {
        getGrantedPermissions: () => [],
        isPermissionGranted: (permission) =>
          permission === "media.upload.create",
      },
      DefaultMediaStoragePolicyService: { validateDescriptor: () => true },
      DefaultMediaService: {
        get: async (input) => {
          databaseCalls.push(input);
          return { code: 'SUC_FIND_00000', result: rows };
        },
      },
      DefaultModuleService: {
        invokeModule: async (input) => {
          transportCalls.push(input);
          assert.equal(input.apiName, "/storage/readiness");
          assert.equal(input.header.Authorization, "Bearer human-token");
          assert.equal(input.tenant, request.tenant);
          assert.equal(input.header.tenant, request.tenant);
          assert.equal(input.local, false);
          assert.equal(input.maxAttempts, 1);
          rows ??= input.requestBody.assets.map((asset) => ({
            ...asset,
            code: asset.mediaCode,
            active: true,
            status: "READY",
            versionId: 3,
            checksumAlgorithm: "sha256",
            enterpriseCode: request.authData.entCode,
          }));
          return mediaController.readReadiness({
            tenant: request.tenant,
            authData: request.authData,
            httpRequest: { body: input.requestBody },
          });
        },
      },
    };
  });
  afterEach(function () {
    global.fetch = oldFetch;
  });
  it("37 assets produce one transport and one fresh Media owner read, not 37 byte inspections", async function () {
    const result = await owner.mediaPreparationStatus(
      {
        code: "assets",
        targetServer: "staged",
        targetRuntimeRole: "WCMS_STAGED",
      },
      request,
    );
    assert.equal(result.status, "SOURCE_READY");
    assert.equal(result.mediaEvidence.length, 37);
    assert.equal(transportCalls.length, 1);
    assert.equal(databaseCalls.length, 1);
    assert(
      result.mediaEvidence.every((item) => item.storedBytesVerified === false),
    );
    rows[0].checksum = "0".repeat(64);
    assert.equal(
      (await owner.mediaPreparationStatus({ code: "assets" }, request)).status,
      "UPDATE_AVAILABLE",
    );
    assert.equal(databaseCalls.length, 2);
  });
  it("missing, denied, stale, truncated and forged-positive evidence never becomes SOURCE_READY", async function () {
    rows = [];
    assert.equal(
      (await owner.mediaPreparationStatus({ code: "assets" }, request)).status,
      "NOT_INSTALLED",
    );
    const invoke = SERVICE.DefaultModuleService.invokeModule;
    for (const tamper of [
      (data) => {
        data.checkedAt = "2000-01-01T00:00:00.000Z";
      },
      (data) => {
        data.items.pop();
      },
      (data) => {
        data.owner = "other";
      },
      (data) => {
        data.items[0].metadataMatched = true;
      },
      (data) => {
        data.items[0].storedBytesVerified = true;
      },
      (data) => {
        data.items[0].storageKey = 'private-path';
      },
    ]) {
      SERVICE.DefaultModuleService.invokeModule = async (input) => {
        const response = await invoke(input);
        tamper(response.data);
        return response;
      };
      assert.equal(
        (await owner.mediaPreparationStatus({ code: "assets" }, request))
          .status,
        "UNAVAILABLE",
      );
    }
    SERVICE.DefaultModuleService.invokeModule = async () => {
      throw new Error("private failure");
    };
    const result = await owner.mediaPreparationStatus(
      { code: "assets" },
      request,
    );
    assert.equal(result.status, "UNAVAILABLE");
    assert(!result.description.includes("private failure"));
  });
  it("real bootstrap bounds remaining reads, reuses navigation results and awaits readiness/admission", async function () {
    const calls = [];
    const profiles = [{ code: "docs" }, ...Array.from({ length: 9 }, (_, index) => ({ code: "application-" + index }))];
    const lastRead = deferredStatus();
    let active = 0, peak = 0, settled = false;
    const reports = [], admissions = [];
    const sources = [
      {
        type: "CMS",
        id: "docs",
        route: "/docs/framework",
        initializationProfile: "docs",
      },
      {
        type: "CMS",
        id: "alias",
        route: "/docs/alias",
        initializationProfile: "docs",
      },
    ];
    SERVICE.DefaultBackofficeApplicationInitializationService = {
      profiles: () => profiles,
      status: async (code, context) => {
        calls.push({ code, context });
        peak = Math.max(peak, ++active);
        await flushStatusWorkers();
        if (code === "application-8") await lastRead.promise;
        active--;
        return { profileCode: code, readiness: "IMPORTED" };
      },
    };
    SERVICE.DefaultBackofficeCapabilityRegistryService = {
      applyFunctionalModuleEligibility: (value) => value,
    };
    SERVICE.DefaultAxisExperiencePolicyService = {
      getEffective: async () => ({}),
    };
    SERVICE.DefaultAxisInitializationService = {
      status: async context => {
        assert.equal(active, 0);
        assert.equal(reports.length, admissions.length + 1);
        admissions.push(context);
        return { readiness: "READY" };
      },
    };
    const operational = Object.create(readiness);
    operational.startupValidationReport = () => ({
      state: "READY",
      findings: [],
      summary: {},
      bootstrapChecks: {},
    });
    for (const method of [
      "importReadinessSection",
      "moduleRuntimeSection",
      "publishingSection",
      "approvalSection",
      "documentationSection",
      "mediaSection",
      "eWasteAcceptanceSection",
      "searchSection",
      "assistantSection",
      "applicationSection",
      "repairGovernanceSection",
      "acceptanceSection",
    ])
      operational[method] = () => undefined;
    operational.publishingSection = report => {
      assert.equal(active, 0);
      reports.push(report);
      return undefined;
    };
    operational.operationalRecoveryMatrix = () => [];
    operational.recordOperationalReadinessSnapshot = (report) => ({
      state: report.state,
      checkedAt: report.checkedAt,
      blockerCount: 0,
    });
    operational.operationalReadinessTimeline = () => [];
    SERVICE.DefaultBackofficeOperationalReadinessService = operational;
    const bootstrap = Object.create(registry);
    bootstrap.getClientContractVersion = () => 1;
    bootstrap.list = async () => ({ data: { modules: [] } });
    bootstrap.buildCatalogue = () => ({});
    bootstrap.getConfiguration = () => ({});
    bootstrap.buildAvailability = () => ({});
    bootstrap.buildDocumentationSources = () => sources;
    bootstrap.buildEffectiveNavigationComposition = () => ({});
    bootstrap.getOverallCompatibilityStatus = () => "COMPATIBLE";
    bootstrap.selectUiComposition = () => ({});
    const pending = bootstrap.bootstrap(request).then(result => {
      settled = true;
      return result;
    });
    try {
      for (let turn = 0; turn < 20 && !calls.some(call => call.code === "application-8"); turn++) await flushStatusWorkers();
      assert(calls.some(call => call.code === "application-8"));
      assert.equal(settled, false);
      assert.equal(reports.length, 0);
      assert.equal(admissions.length, 0);
      assert.equal(peak, 4);
    } finally {
      lastRead.resolve();
    }
    const result = await pending;
    assert.equal(result.data.axisInitializationAdmission, "READY");
    assert.deepEqual(
      calls.map((call) => call.code),
      profiles.map(profile => profile.code),
    );
    assert.deepEqual(reports[0].statuses.map(status => status.profileCode), profiles.map(profile => profile.code));
    assert.deepEqual(reports[0].errors, []);
    assert.equal(admissions[0], request);
    assert(calls.every((call) => call.context === request));
    const otherRequest = {
      ...request,
      authData: { ...request.authData, principalId: "other" },
    };
    await bootstrap.bootstrap(otherRequest);
    assert.equal(calls.length, profiles.length * 2);
    assert(calls.slice(profiles.length).every(call => call.context === otherRequest));
    assert.equal(admissions[1], otherRequest);
  });
  it("keeps four reads in flight and assembles mixed outcomes in input order after all settle", async function () {
    const profiles = Array.from({ length: 9 }, (_, index) => ({ code: String(index) }));
    const gates = profiles.map(deferredStatus);
    const started = [], statuses = profiles.map(profile => ({ profileCode: profile.code }));
    const errors = [new Error("first denial"), new Error("second denial")];
    let active = 0, peak = 0, settled = false;
    const pending = registry.applicationStatusReport(profiles, async code => {
      const index = Number(code);
      started.push(index);
      peak = Math.max(peak, ++active);
      try { return await gates[index].promise; }
      finally { active--; }
    }).then(report => { settled = true; return report; });
    try {
      await flushStatusWorkers();
      assert.deepEqual(started, [0, 1, 2, 3]);
      gates[3].resolve(statuses[3]);
      await flushStatusWorkers();
      assert.deepEqual(started, [0, 1, 2, 3, 4]);
      assert.equal(active, 4);
      gates[2].reject(errors[1]);
      gates[1].reject(errors[0]);
      for (const index of [4, 5, 6, 7, 8]) gates[index].resolve(index === 7 ? undefined : statuses[index]);
      await flushStatusWorkers();
      assert.equal(settled, false);
      assert.equal(active, 1);
      assert.equal(peak, 4);
    } finally {
      gates.forEach((gate, index) => gate.resolve(index === 7 ? undefined : statuses[index]));
    }
    const report = await pending;
    assert.deepEqual(report.statuses, [statuses[0], statuses[3], statuses[4], statuses[5], statuses[6], undefined, statuses[8]]);
    report.statuses.forEach(status => { if (status) assert.equal(status, statuses[Number(status.profileCode)]); });
    assert.deepEqual(report.errors, [{ profile: profiles[1], error: errors[0] }, { profile: profiles[2], error: errors[1] }]);
    assert.equal(report.errors[0].profile, profiles[1]);
    assert.equal(report.errors[0].error, errors[0]);
  });
  it("skips empty profile entries, preserves inert successes and collects synchronous throws without stopping workers", async function () {
    const error = new Error("synchronous denial"), failed = { code: "denied" };
    const seen = [];
    const report = await registry.applicationStatusReport([null, undefined, {}, { code: "" }, { code: 0 }, failed, { code: 7 }, { code: "empty" }], code => {
      seen.push(code);
      if (code === "denied") throw error;
      return code === "empty" ? undefined : code;
    });
    assert.deepEqual(seen, ["denied", "7", "empty"]);
    assert.deepEqual(report, { statuses: ["7", undefined], errors: [{ profile: failed, error }] });
    for (const profiles of [undefined, null, [], [null, {}]]) {
      assert.deepEqual(await registry.applicationStatusReport(profiles, () => { throw new Error("Unexpected read"); }), { statuses: [], errors: [] });
    }
  });
  it("bounds single, partial, full and 66-profile reports without dropping any owner result", async function () {
    for (const count of [1, 3, 4, 66]) {
      const profiles = Array.from({ length: count }, (_, index) => ({ code: String(index) }));
      let active = 0, peak = 0, calls = 0;
      const report = await registry.applicationStatusReport(profiles, async code => {
        calls++;
        peak = Math.max(peak, ++active);
        await flushStatusWorkers();
        active--;
        return code;
      });
      assert.equal(peak, Math.min(4, count));
      assert.equal(active, 0);
      assert.equal(calls, count);
      assert.deepEqual(report, { statuses: profiles.map(profile => profile.code), errors: [] });
    }
  });
  it("isolates simultaneous actors and same-actor request copies while retaining duplicate outcome positions", async function () {
    const requests = [request, { ...request, authData: { ...request.authData } }, {
      ...request, tenant: "tenant-b", authData: { ...request.authData, tenant: "tenant-b", principalId: "operator-b" },
    }];
    const profiles = [...Array.from({ length: 7 }, (_, index) => ({ code: String(index) })), { code: "0" }, { code: "denied" }, { code: "denied" }];
    const calls = new Map(), active = new Map(), peaks = new Map();
    const failures = new Map(requests.map(context => [context, new Error("isolated denial")]));
    SERVICE.DefaultBackofficeApplicationInitializationService = {
      status: async (code, context) => {
        assert(requests.includes(context));
        const seen = calls.get(context) || [];
        seen.push(code);
        calls.set(context, seen);
        active.set(context, (active.get(context) || 0) + 1);
        peaks.set(context, Math.max(peaks.get(context) || 0, active.get(context)));
        try {
          await flushStatusWorkers();
          if (code === "denied") throw failures.get(context);
          return { code, context };
        } finally { active.set(context, active.get(context) - 1); }
      },
    };
    const reports = await Promise.all(requests.map(context => registry.applicationStatusReport(profiles, registry.applicationStatusReader(context))));
    requests.forEach((context, index) => {
      assert.equal(peaks.get(context), 4);
      assert.deepEqual(calls.get(context), ["0", "1", "2", "3", "4", "5", "6", "denied"]);
      assert(reports[index].statuses.every(status => status.context === context));
      assert.equal(reports[index].statuses[0], reports[index].statuses[7]);
      assert.equal(reports[index].errors.length, 2);
      assert(reports[index].errors.every(outcome => outcome.error === failures.get(context)));
      assert.equal(active.get(context), 0);
    });
    assert.notEqual(reports[0].statuses[0], reports[1].statuses[0]);
    assert.notEqual(reports[0].errors[0].error, reports[2].errors[0].error);
  });
  it("rechecks fresh owner authority after a synchronous failure without retrying the failed composition", async function () {
    const profiles = [{ code: "application" }, { code: "application" }];
    const error = new Error("authority unavailable"), status = { readiness: "READY" };
    let calls = 0;
    SERVICE.DefaultBackofficeApplicationInitializationService = {
      status: (code, context) => {
        assert.equal(context, request);
        calls++;
        throw error;
      },
    };
    const failedRead = registry.applicationStatusReader(request);
    const first = await registry.applicationStatusReport(profiles, failedRead);
    assert.equal(calls, 1);
    assert.deepEqual(first.statuses, []);
    assert(first.errors.every(outcome => outcome.error === error));
    SERVICE.DefaultBackofficeApplicationInitializationService = {
      status: (code, context) => { assert.equal(context, request); calls++; return status; },
    };
    const retained = await registry.applicationStatusReport(profiles, failedRead);
    assert.equal(calls, 1);
    assert.equal(retained.errors.length, 2);
    const recovered = await registry.applicationStatusReport(profiles, registry.applicationStatusReader(request));
    assert.equal(calls, 2);
    assert.deepEqual(recovered, { statuses: [status, status], errors: [] });
    assert.equal(recovered.statuses[0], status);
  });
  it("reuses a rejected owner read only within its request, without retry or successful fallback", async function () {
    let reads = 0;
    SERVICE.DefaultBackofficeApplicationInitializationService = {
      status: async () => {
        reads++;
        throw new Error("denied");
      },
    };
    const read = registry.applicationStatusReader(request);
    const state = await registry.buildDocumentationPublicationState(
      [
        {
          type: "CMS",
          id: "docs",
          route: "/docs",
          initializationProfile: "docs",
        },
      ],
      request,
      read,
    );
    const report = await registry.applicationStatusReport(
      [{ code: "docs" }],
      read,
    );
    assert.equal(reads, 1);
    assert.equal(state.byRoute["/docs"].ready, false);
    assert.equal(report.statuses.length, 0);
    assert.equal(report.errors.length, 1);
    await registry.applicationStatusReport(
      [{ code: "docs" }],
      registry.applicationStatusReader(request),
    );
    assert.equal(reads, 2);
  });
});
