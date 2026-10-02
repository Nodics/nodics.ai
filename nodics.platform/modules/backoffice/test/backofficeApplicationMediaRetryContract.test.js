/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */

/**
 * @module backoffice/test/backofficeApplicationMediaRetryContract
 * @description Protects inspected asset reuse, one-shot CAS replacement and fail-closed preparation.
 */
const assert = require("node:assert/strict");
const path = require("node:path");
const service = require("../src/service/defaultBackofficeApplicationInitializationService");

describe("BackOffice preparation Media retries", function () {
  let owner;
  let calls;
  let inspect;
  let upload;
  let request;
  let originalFetch;
  beforeEach(function () {
    originalFetch = global.fetch;
    global.CLASSES = {
      NodicsError: class extends Error {
        constructor(code, message) {
          super(message);
          this.code = code;
        }
      },
    };
    owner = Object.create(service);
    owner.safeManifestAssetPath = () =>
      path.join(
        __dirname,
        "fixtures/applicationMediaAssets/files/sample-product-media.svg",
      );
    owner.moduleBaseUrl = async () => "https://media.example.test/nodics";
    owner.operatorOrigin = () => "https://axis.example.test";
    calls = [];
    request = {
      tenant: "tenant-a",
      enterpriseCode: "enterprise-a",
      authData: { principalId: "operator" },
      httpRequest: { headers: { authorization: "Bearer human-token" } },
    };
    inspect = {
      contractVersion: 1,
      mediaCode: "asset",
      versioned: true,
      exists: true,
      unchanged: false,
      versionId: 7,
    };
    upload = { ok: true };
    global.fetch = async (url, options) => {
      calls.push({ url, options });
      if (url.endsWith("/inspect"))
        return {
          ok: true,
          text: async () => JSON.stringify({ data: inspect }),
        };
      return {
        ...upload,
        text: async () =>
          JSON.stringify({
            data: {
              code: "asset",
              versionId: 8,
              checksumAlgorithm: "sha256",
              checksum: JSON.parse(calls[0].options.body).checksum,
            },
          }),
      };
    };
  });
  afterEach(function () {
    global.fetch = originalFetch;
  });
  const run = () =>
    owner.uploadMediaAsset(
      { targetServer: "mediaStaged" },
      { mediaCode: "asset", fileName: "sample-product-media.svg" },
      request,
    );
  it("carries the current revision and the same human context into exactly one upload", async function () {
    await run();
    assert.equal(calls.length, 2);
    assert.equal(calls[1].options.body.get("versionId"), "7");
    for (const call of calls) {
      assert.equal(call.options.headers.Authorization, "Bearer human-token");
      assert.equal(call.options.headers["x-enterprise-code"], "enterprise-a");
      assert.equal(call.options.headers.Origin, "https://axis.example.test");
    }
  });
  it("skips only an owner-verified unchanged current asset", async function () {
    inspect.unchanged = true;
    const result = await run();
    assert.equal(result.mediaCode, "asset");
    assert.equal(calls.length, 1);
  });
  it("creates absent Media without inventing a revision", async function () {
    inspect.exists = false;
    delete inspect.versionId;
    global.fetch = async (url, options) => {
      calls.push({ url, options });
      const data = url.endsWith("/inspect")
        ? inspect
        : {
            code: "asset",
            versionId: 0,
            checksumAlgorithm: "sha256",
            checksum: JSON.parse(calls[0].options.body).checksum,
          };
      return { ok: true, text: async () => JSON.stringify({ data }) };
    };
    await run();
    assert.equal(calls[1].options.body.has("versionId"), false);
  });
  it("does not suppress duplicate or conflict errors and never automatically retries", async function () {
    global.fetch = async (url, options) => {
      calls.push({ url, options });
      return url.endsWith("/inspect")
        ? {
            ok: true,
            text: async () => JSON.stringify({ data: inspect }),
          }
        : {
            ok: false,
            status: 409,
            text: async () => "already exists E11000 duplicate",
          };
    };
    await assert.rejects(run(), (error) => error.code === "ERR_BOF_00085");
    assert.equal(calls.length, 2);
  });
  it("propagates inspection denial without attempting an upload", async function () {
    global.fetch = async () => {
      calls.push({});
      return { ok: false, status: 403 };
    };
    await assert.rejects(run(), /HTTP 403/);
    assert.equal(calls.length, 1);
  });
  it("rejects malformed inspection or unacknowledged upload", async function () {
    delete inspect.versionId;
    await assert.rejects(run(), /inspection is invalid/);
    assert.equal(calls.length, 1);
    inspect.versionId = 7;
    calls = [];
    global.fetch = async (url, options) => {
      calls.push({ url, options });
      return {
        ok: true,
        text: async () =>
          JSON.stringify(url.endsWith("/inspect") ? { data: inspect } : {}),
      };
    };
    await assert.rejects(run(), /not acknowledged/);
    assert.equal(calls.length, 2);
  });
  it("rejects service-only authority before transport", async function () {
    request.authData.tokenType = "service";
    await assert.rejects(run(), (error) => error.code === "ERR_BOF_00082");
    assert.equal(calls.length, 0);
  });
  it("does not equate a declared manifest with stored media preparation", async function () {
    owner.safeManifestPath = () =>
      path.join(__dirname, "fixtures/applicationMediaAssets/assetManifest.js");
    owner.applicationTargetBinding = () => ({ connectionName: 'staged' });
    global.SERVICE = { DefaultModuleService: { invokeModule: async input => ({ data: {
      contractVersion: 1, owner: 'media', evidenceKind: 'PERSISTED_CURRENT_METADATA', checkedAt: new Date().toISOString(),
      items: input.requestBody.assets.map(asset => ({ mediaCode: asset.mediaCode, checksum: asset.checksum,
        versionId: null, exists: false, metadataMatched: false, storedBytesVerified: false }))
    } }) } };
    const result = await owner.mediaPreparationStatus(
      { code: "assets", type: "MEDIA_ASSET_MANIFEST" },
      request,
    );
    assert.equal(result.status, "NOT_INSTALLED");
    assert.equal(result.mediaEvidence[0].storedBytesVerified, false);
    assert.equal(calls.length, 0);
  });
  it("separates persisted Staged metadata readiness from byte and Online publication proof", async function () {
    owner.safeManifestPath = () =>
      path.join(__dirname, "fixtures/applicationMediaAssets/assetManifest.js");
    owner.applicationTargetBinding = () => ({ connectionName: 'staged' });
    global.SERVICE = { DefaultModuleService: { invokeModule: async input => ({ data: {
      contractVersion: 1, owner: 'media', evidenceKind: 'PERSISTED_CURRENT_METADATA', checkedAt: new Date().toISOString(),
      items: input.requestBody.assets.map(asset => ({ mediaCode: asset.mediaCode, checksum: asset.checksum,
        versionId: 3, exists: true, metadataMatched: true, storedBytesVerified: false }))
    } }) } };
    const result = await owner.mediaPreparationStatus(
      { code: "assets", type: "MEDIA_ASSET_MANIFEST" },
      request,
    );
    assert.equal(result.status, "SOURCE_READY");
    assert.equal(result.mediaEvidence[0].versionId, 3);
    assert.equal(result.mediaEvidence[0].storedBytesVerified, false);
    assert.equal(result.mediaEvidence[0].online, undefined);
    assert.match(result.description, /separate operations/);
  });
  it("blocks unavailable inspection instead of falling back to a source count", async function () {
    owner.safeManifestPath = () =>
      path.join(__dirname, "fixtures/applicationMediaAssets/assetManifest.js");
    owner.applicationTargetBinding = () => ({ connectionName: 'staged' });
    global.SERVICE = { DefaultModuleService: { invokeModule: async () => {
      throw new Error("private provider path must not leak");
    } } };
    const result = await owner.mediaPreparationStatus(
      { code: "assets" },
      request,
    );
    assert.equal(result.status, "UNAVAILABLE");
    assert.equal(result.mediaEvidence, undefined);
    assert.doesNotMatch(result.description, /private provider/);
  });
  it("never maps CMS READY to business ONLINE when Media owner evidence is unqualified", function () {
    const projection = {
      readiness: "READY",
      releaseStatus: "CURRENT",
      publication: { state: "ONLINE" },
      preparation: { status: "CURRENT", steps: [] },
      mediaDependencies: {
        qualified: false,
        status: "ACTION_REQUIRED",
        dependencies: [
          {
            mediaCode: "hero",
            status: "NOT_ACTIVATED",
            qualified: false,
          },
        ],
      },
    };
    assert.equal(owner.capabilityBusinessStatus(projection), "NEEDS_ATTENTION");
    const blockers = owner.capabilityBlockers(projection);
    assert.equal(blockers[0].source, "MEDIA_PUBLICATION");
    assert.equal(blockers[0].repair.automaticExecution, false);
    assert.equal(
      owner.capabilityPublicationSummary(projection, blockers).media,
      "ACTION_REQUIRED",
    );
    assert.equal(
      owner.approvalWorkflowDiagnostic(projection).status,
      "APPROVED",
    );
  });
  it("does not claim media readiness from missing owner evidence and a source declaration", function () {
    const projection = {
      preparation: {
        steps: [{ type: "MEDIA_ASSET_MANIFEST", status: "SOURCE_READY" }],
      },
    };
    assert.equal(
      owner.capabilityPublicationSummary(projection, []).media,
      "UNKNOWN",
    );
    assert.equal(
      owner.capabilityPublicationSummary({ preparation: { steps: [] } }, [])
        .media,
      "NOT_REQUIRED",
    );
  });
  it("publishes a confirmed fresh CMS review only for unpinned legacy releases", function () {
    const projection = {
      mediaDependencies: {
        qualified: false,
        dependencies: [{ mediaCode: "hero", status: "VERSION_UNPINNED" }],
      },
    };
    const repair = owner.capabilityBlockers(projection)[0].repair;
    assert.equal(repair.operation, "applicationInitialization.initiate");
    assert.equal(repair.requiresConfirmation, true);
    assert.equal(repair.input, undefined);
  });
  it("does not offer unnecessary CMS initialization while separate Media approval is pending", async function () {
    owner.applicationTargetBinding = () => ({});
    owner.profile = () => ({
      code: "site",
      type: "WEBSITE",
      target: { moduleName: "cms" },
    });
    owner.preparationSteps = () => [];
    owner.preparationStatus = async () => ({
      status: "CURRENT",
      steps: [],
    });
    owner.describe = () => ({});
    owner.capabilityProjection = () => ({});
    global.NODICS = { getInternalAuthToken: () => "scoped-runtime-token" };
    global.SERVICE = {
      DefaultModuleService: {
        invokeModule: async () => ({
          data: {
            readiness: "MEDIA_DEPENDENCIES_PENDING",
            releaseStatus: "CURRENT",
            publication: { state: "ONLINE" },
            mediaDependencies: {
              qualified: false,
              status: "ACTION_REQUIRED",
              dependencies: [{ status: "NOT_ACTIVATED" }],
            },
          },
        }),
      },
    };
    const result = await owner.invoke("status", "site", request);
    assert.equal(result.readiness, "MEDIA_DEPENDENCIES_PENDING");
    assert.deepEqual(result.allowedActions, ["RETIRE"]);
  });
  for (const readiness of [
    "NOT_IMPORTED",
    "IMPORTING",
    "IMPORTED",
    "PUBLICATION_PENDING",
  ]) {
    it(`does not invent Online Media evidence blockers during ${readiness}`, async function () {
      owner.profile = () => ({
        code: "site",
        type: "WEBSITE",
        target: { moduleName: "cms" },
      });
      owner.applicationTargetBinding = () => ({});
      owner.preparationSteps = () => [
        { type: "MEDIA_ASSET_MANIFEST", required: true },
      ];
      owner.preparationStatus = async () => ({ status: "CURRENT", steps: [] });
      owner.describe = () => ({});
      owner.capabilityProjection = () => ({});
      global.NODICS = { getInternalAuthToken: () => "scoped-runtime-token" };
      global.SERVICE = {
        DefaultModuleService: {
          invokeModule: async () => ({
            data: { readiness, releaseStatus: "CURRENT" },
          }),
        },
      };
      const result = await owner.invoke("status", "site", request);
      assert.equal(result.readiness, readiness);
      assert.equal(result.mediaDependencies, undefined);
      assert.equal(
        owner
          .capabilityBlockers(result)
          .some((item) => item.source === "MEDIA_PUBLICATION"),
        false,
      );
      assert.deepEqual(
        result.allowedActions,
        ["NOT_IMPORTED", "IMPORTED"].includes(readiness) ? ["INITIALIZE"] : [],
      );
      if (readiness === "NOT_IMPORTED")
        assert.equal(owner.capabilityBusinessStatus(result), "NOT_PREPARED");
    });
  }
  it("keeps first-run preparation available and prepares before requesting CMS publication", async function () {
    const sequence = [];
    owner.profile = () => ({
      code: "site",
      type: "WEBSITE",
      target: { moduleName: "cms" },
    });
    owner.human = () => "operator";
    owner.applicationTargetBinding = () => ({});
    owner.mediaManifestCodes = () => ["hero"];
    owner.preparationSteps = () => [
      { type: "MEDIA_ASSET_MANIFEST", required: true },
    ];
    owner.preparationStatus = async () => ({
      status: "ACTION_REQUIRED",
      steps: [
        {
          code: "assets",
          type: "MEDIA_ASSET_MANIFEST",
          status: "NOT_INSTALLED",
        },
      ],
    });
    owner.prepareApplication = async () => {
      sequence.push("prepare");
      return { status: "CURRENT", steps: [] };
    };
    owner.describe = () => ({});
    owner.capabilityProjection = () => ({});
    global.NODICS = { getInternalAuthToken: () => "scoped-runtime-token" };
    global.SERVICE = {
      DefaultModuleService: {
        invokeModule: async (input) => {
          sequence.push(input.methodName);
          return {
            data: {
              readiness:
                input.methodName === "GET"
                  ? "NOT_IMPORTED"
                  : "PUBLICATION_PENDING",
              releaseStatus: "CURRENT",
            },
          };
        },
      },
    };
    const initial = await owner.invoke("status", "site", request);
    assert.deepEqual(initial.allowedActions, ["INITIALIZE"]);
    assert.equal(initial.mediaDependencies, undefined);
    assert.equal(
      owner
        .capabilityBlockers(initial)
        .some((item) => item.source === "MEDIA_PUBLICATION"),
      false,
    );
    sequence.length = 0;
    const initiated = await owner.invoke("initiate", "site", request);
    assert.deepEqual(sequence, ["prepare", "POST"]);
    assert.equal(initiated.readiness, "PUBLICATION_PENDING");
    assert.equal(initiated.mediaDependencies, undefined);
    assert.deepEqual(initiated.allowedActions, []);
  });
  it("still blocks Online readiness when required Media owner evidence is missing", async function () {
    owner.profile = () => ({
      code: "site",
      type: "WEBSITE",
      target: { moduleName: "cms" },
    });
    owner.applicationTargetBinding = () => ({});
    owner.preparationSteps = () => [
      { type: "MEDIA_ASSET_MANIFEST", required: true },
    ];
    owner.preparationStatus = async () => ({ status: "CURRENT", steps: [] });
    owner.describe = () => ({});
    owner.capabilityProjection = () => ({});
    global.NODICS = { getInternalAuthToken: () => "scoped-runtime-token" };
    global.SERVICE = {
      DefaultModuleService: {
        invokeModule: async () => ({
          data: {
            readiness: "READY",
            releaseStatus: "CURRENT",
            publication: { state: "ONLINE" },
          },
        }),
      },
    };
    const result = await owner.invoke("status", "site", request);
    assert.equal(result.readiness, "MEDIA_DEPENDENCIES_PENDING");
    assert.equal(result.mediaDependencies.status, "UNAVAILABLE");
    assert.equal(owner.capabilityBusinessStatus(result), "NEEDS_ATTENTION");
  });
});
