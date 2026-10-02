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
  it("one real bootstrap reuses every profile result between navigation and real readiness composition", async function () {
    const calls = [];
    const profiles = [{ code: "docs" }, { code: "application" }];
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
        return { profileCode: code, readiness: "IMPORTED" };
      },
    };
    SERVICE.DefaultBackofficeCapabilityRegistryService = {
      applyFunctionalModuleEligibility: (value) => value,
    };
    SERVICE.DefaultAxisExperiencePolicyService = {
      getEffective: async () => ({}),
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
    await bootstrap.bootstrap(request);
    assert.deepEqual(
      calls.map((call) => call.code),
      ["docs", "application"],
    );
    assert(calls.every((call) => call.context === request));
    await bootstrap.bootstrap({
      ...request,
      authData: { ...request.authData, principalId: "other" },
    });
    assert.equal(calls.length, 4);
    assert.equal(calls[2].context.authData.principalId, "other");
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
