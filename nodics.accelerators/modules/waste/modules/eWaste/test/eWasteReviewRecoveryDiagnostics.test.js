/*
    Nodics - Enterprice Micro-Services Management Framework

    Copyright (c) 2026 Nodics All rights reserved.

    This software is governed by the Nodics Source-Available Commercial License.
    You may use, copy, modify, deploy, or distribute it only as permitted by the
    root LICENSE file or a separate written agreement with Nodics.

 */
"use strict";
/** @module eWaste/test/eWasteReviewRecoveryDiagnostics @description Exercises real assessment/resolution, Nodics status, Waste projection and Communication private owners with isolated generated storage/transport; never native/provider acceptance. @layer test @owner eWaste */
const { test, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const xp = require("../src/service/defaultEWasteExperienceService");
const notify = require("../src/service/defaultEWasteOutcomeCommunicationService");
const diagnostics = require("../src/utils/reviewDiagnostics");
const foundation = "../../../../../../nodics.foundation/modules/";
const persistence = require("../../../../../../nodics.waste/modules/wasteCore/src/service/defaultWastePersistenceService");
const workspace = require("../../../../../../nodics.waste/modules/wasteVerification/src/service/defaultWasteReviewWorkspaceService");
const status = require(
  foundation + "nService/src/service/status/defaultStatusService",
);
const NodicsError = require(foundation + "nCommon/src/lib/nodicsError");
const logger = require(foundation + "nConfig/src/service/DefaultLoggerService");

function fixture() {
  const defs = {
    ...require(foundation + "nCommon/src/utils/statusDefinitions"),
    ...require("../../../../../../nodics.communication/modules/commsApi/src/utils/statusDefinitions"),
    ...require("../src/utils/statusDefinitions"),
  };
  const state = {
    ruleReads: 0,
    remoteCalls: 0,
    writes: [],
    assessments: [],
    submission: {
      code: "SYNTHETIC_REVIEW",
      submissionStatus: "APPROVED",
      revision: 5,
      verificationRef: { module: "wasteVerification", schema: "wasteVerification", code: "SYNTHETIC_REVIEW_DECISION" },
      submitterRef: {
        module: "profile",
        schema: "customer",
        code: "customer-a",
      },
      submittedFacts: { name: "Synthetic item" },
      metadata: { reviewKey: "original-review", publicReason: "Approved" },
    },
    asset: {
      code: "WASTE_ASSET_SYNTHETIC_REVIEW",
      revision: 1,
      sourceSubmissionCode: "SYNTHETIC_REVIEW",
      verificationRef: { module: "wasteVerification", schema: "wasteVerification", code: "SYNTHETIC_REVIEW_DECISION" },
      ownerRef: { code: "customer-a" },
      metadata: { settlementStatus: "PENDING" },
    },
  };
  const config = {
    eWaste: { rewardRules: {} },
    log: { requestPrivacy: { qualified: true, captureMode: "disabled" } },
  };
  global.CONFIG = {
    get: (key) =>
      key === "defaultErrorCodes"
        ? { NodicsError: "ERR_SYS_00000" }
        : config[key] || {},
  };
  global.UTILS = {
    isBlank: (value) =>
      value == null ||
      (typeof value === "object" && !Object.keys(value).length),
    isObject: (value) => value !== null && typeof value === "object",
  };
  global.CLASSES = { NodicsError };
  const store = {
    ...persistence,
    list: async (schema, request, query, limit) => {
      assert.equal(request.tenant, "tenant-a");
      assert.equal(limit, 2);
      if (schema === "wasteAsset") {
        assert.deepEqual(query, { sourceSubmissionCode: state.submission.code });
        return [structuredClone(state.asset)];
      }
      assert.equal(schema, "wasteVerification");
      assert.deepEqual(query, { code: state.submission.verificationRef.code });
      return [{ code: query.code, submissionCode: state.submission.code, verificationStatus: "APPROVED" }];
    },
    one: async (schema, _request, code) =>
      structuredClone(
        schema === "wasteSubmission"
          ? state.submission
          : schema === "wasteAsset"
            ? state.asset
            : state.assessments.find((row) => row.code === code),
      ),
    update: async (schema, _request, current, patch) => {
      const key = schema === "wasteSubmission" ? "submission" : "asset";
      assert.equal(current.revision, state[key].revision);
      state.writes.push(schema);
      state[key] = {
        ...state[key],
        ...structuredClone(patch),
        revision: current.revision + 1,
      };
      return structuredClone(state[key]);
    },
  };
  global.SERVICE = {
    DefaultWastePersistenceService: store,
    DefaultWasteVerificationOperationService: require("../../../../../../nodics.waste/modules/wasteVerification/src/service/defaultWasteVerificationOperationService"),
    DefaultStatusService: { ...status, statusMap: defs },
    DefaultLoggerService: logger,
    DefaultWasteItemDescriptorService: { evidenceReview: () => undefined },
    DefaultWasteOperationalAccessService: {
      authorize: async () => {},
      assertRecord: async () => {},
    },
    DefaultEWasteRewardAssessmentOperationService: require("../src/service/defaultEWasteRewardAssessmentOperationService"),
    DefaultRulePolicyResolutionService: require("../../../../../../nodics.rulesEngine/modules/rulesDefinition/src/service/defaultRulePolicyResolutionService"),
    DefaultRuleSetVersionService: {
      get: async () => {
        state.ruleReads++;
        return { code: "SUC_GET_00000", result: [] };
      },
    },
  };
  const experience = {
    ...xp,
    remote: async () => {
      state.remoteCalls++;
      throw new Error("PRIVATE-DEPENDENCY-DETAIL");
    },
  };
  SERVICE.DefaultEWasteExperienceService = experience;
  const request = {
    tenant: "tenant-a",
    code: state.submission.code,
    expectedRevision: 5,
    confirmed: true,
    idempotencyKey: "original-review",
    authData: {
      principalType: "human",
      tokenType: "access",
      tenant: "tenant-a",
      entCode: "enterprise-a",
      loginId: "reviewer",
    },
  };
  return { state, config, store, experience, request };
}
afterEach(() => {
  for (const key of ["CONFIG", "UTILS", "CLASSES", "SERVICE", "FACADE"])
    delete global[key];
});

test("historical completed review has no notification retry authority and the real retry path never dispatches or backfills", async () => {
  const f = fixture();
  f.state.submission.submissionStatus = "REJECTED";
  f.state.submission.revision = 1;
  f.state.submission.metadata = { sample: true, publicReason: "Retained illustrative record" };
  f.config.waste = require("../../../../../../nodics.waste/modules/wasteVerification/config/properties").waste;
  f.config.eWaste.outcomeCommunication = { enabled: true };
  const original = structuredClone(f.state.submission);
  const projection = workspace.project(f.state.submission);
  assert.equal(projection.outcomeNotification.status, "NOT_ESTABLISHED");
  assert.equal(projection.outcomeNotification.retryAllowed, false);
  assert.equal(projection.outcomeNotification.message, f.config.waste.reviewWorkspace.labels.outcomeReviewAuthorityMissing);
  await assert.rejects(notify.retry(f.request), /Recorded decision is required/);
  assert.equal(f.state.remoteCalls, 0);
  assert.deepEqual(f.state.writes, []);
  assert.deepEqual(f.state.submission, original);
});

test("actual Rules resolution failure becomes registered authorized review diagnostic without raw details or settlement", async () => {
  const f = fixture();
  const result = await f.experience.finishReview(f.request, {
    submission: f.state.submission,
    asset: f.state.asset,
  });
  assert.equal(f.state.ruleReads, 1);
  assert.equal(f.state.remoteCalls, 0);
  assert.equal(result.settlementStatus, "BLOCKED");
  const projected = workspace.project(f.state.submission);
  assert.equal(
    projected.reviewDiagnostic.code,
    "ERR_EWASTE_REWARD_ASSESSMENT_UNCONFIRMED",
  );
  assert.equal(projected.reviewDiagnostic.retryAllowed, false);
  assert(!JSON.stringify(projected).includes("No active rule policy"));
  assert.equal(
    new NodicsError("ERR_EWASTE_REWARD_ASSESSMENT_REQUIRED").responseCode,
    "409",
  );
});

test("settlement-only retry with incomplete original source evidence refuses recovery without reevaluating changing unbound Rules", async () => {
  const f = fixture();
  const result = await f.experience.retrySettlement(f.request);
  assert.equal(result.settlementStatus, "BLOCKED");
  assert.equal(
    result.reviewDiagnostic.code,
    "ERR_EWASTE_REWARD_RECOVERY_CONFLICT",
  );
  assert.equal(f.state.ruleReads, 0);
  assert.equal(f.state.remoteCalls, 0);
  assert.deepEqual(f.state.writes, ["wasteSubmission"]);
});

test("completed review replay with missing evidence cannot evaluate a new policy", async () => {
  const f = fixture();
  const result = await f.experience.finishReview(f.request, {
    submission: f.state.submission,
    asset: f.state.asset,
    replayed: true,
  });
  assert.equal(
    result.reviewDiagnostic.code,
    "ERR_EWASTE_REWARD_ASSESSMENT_REQUIRED",
  );
  assert.equal(f.state.ruleReads, 0);
  assert.equal(f.state.remoteCalls, 0);
});

test("missing assessment owner blocks settlement without calling a dependency or inventing evidence", async () => {
  const f = fixture();
  delete SERVICE.DefaultEWasteRewardAssessmentOperationService;
  const result = await f.experience.finishReview(f.request, {
    submission: f.state.submission,
    asset: f.state.asset,
  });
  assert.equal(result.settlementStatus, "BLOCKED");
  assert.equal(result.reviewDiagnostic.stage, "REWARD_ASSESSMENT");
  assert.equal(result.reviewDiagnostic.retryAllowed, false);
  assert.equal(f.state.remoteCalls, 0);
  assert.equal(f.state.ruleReads, 0);
});

test("existing immutable confirmed assessment and completed settlement survive replay without policy resolution or asset writes", async () => {
  const f = fixture();
  const original = {
    code: "ORIGINAL_ASSESSMENT",
    assessmentType: "CONFIRMED",
    assetCode: f.state.asset.code,
    rewardAmount: "6",
    policyVersion: 1,
  };
  f.state.assessments.push(original);
  Object.assign(f.state.asset.metadata, {
    confirmedRewardAssessmentRef: { code: original.code },
    settlementStatus: "COMPLETED",
    rewardSettlement: { assessmentCode: original.code },
  });
  const asset = structuredClone(f.state.asset);
  const result = await f.experience.finishReview(f.request, {
    submission: f.state.submission,
    asset: f.state.asset,
    replayed: true,
  });
  assert.deepEqual(result.rewardAssessment, original);
  assert.deepEqual(f.state.asset, asset);
  assert.equal(f.state.ruleReads, 0);
  assert.equal(f.state.remoteCalls, 0);
  assert.equal(f.state.writes.length, 0);
});

test("a conflicting confirmed reference remains intact and is never replaced by recalculation", async () => {
  const f = fixture();
  f.state.assessments.push({
    code: "ORIGINAL",
    assessmentType: "CONFIRMED",
    assetCode: "foreign",
  });
  f.state.asset.metadata.confirmedRewardAssessmentRef = { code: "ORIGINAL" };
  const result = await f.experience.finishReview(f.request, {
    submission: f.state.submission,
    asset: f.state.asset,
  });
  assert.equal(
    result.reviewDiagnostic.code,
    "ERR_EWASTE_REWARD_ASSESSMENT_CONFLICT",
  );
  assert.equal(
    f.state.asset.metadata.confirmedRewardAssessmentRef.code,
    "ORIGINAL",
  );
  assert.equal(f.state.ruleReads, 0);
  assert.equal(f.state.remoteCalls, 0);
});

test("malformed saved assessment references do not authorize replacement policy evaluation", async () => {
  for (const reference of [{}, { code: "" }]) {
    const f = fixture();
    f.state.asset.metadata.confirmedRewardAssessmentRef = reference;
    const result = await f.experience.finishReview(f.request, {
      submission: f.state.submission,
      asset: f.state.asset,
    });
    assert.equal(
      result.reviewDiagnostic.code,
      "ERR_EWASTE_REWARD_ASSESSMENT_REQUIRED",
    );
    assert.equal(result.settlementStatus, "BLOCKED");
    assert.deepEqual(
      f.state.asset.metadata.confirmedRewardAssessmentRef,
      reference,
    );
    assert.equal(f.state.ruleReads, 0);
    assert.equal(f.state.remoteCalls, 0);
  }
});

test("unknown review diagnostic fields and private text never pass the authorized projection", () => {
  const f = fixture();
  f.state.submission.metadata.reviewDiagnostic = {
    ...diagnostics.reward("REWARD_ASSESSMENT", {}),
    message: "PRIVATE",
    cause: "PRIVATE",
  };
  const projected = workspace.project(f.state.submission);
  assert(!JSON.stringify(projected).includes("PRIVATE"));
  assert.equal(
    projected.reviewDiagnostic.message,
    diagnostics.statuses[projected.reviewDiagnostic.code].message,
  );
  f.state.submission.metadata.reviewDiagnostic.code = "ERR_UNKNOWN_PRIVATE";
  assert.equal(
    workspace.project(f.state.submission).reviewDiagnostic,
    undefined,
  );
});

test("authorized outcome projection rebuilds nested diagnostics from the real status owner and omits private fields", () => {
  const f = fixture();
  const registered = diagnostics.outcome("DISPATCH", {
    code: "ERR_COMMS_INTEGRATION_CONTEXT",
  });
  f.state.submission.metadata.outcomeDelivery = {
    status: "PENDING",
    message: "PRIVATE-TOP-MESSAGE",
    cause: "PRIVATE-CAUSE",
    recipientId: "PRIVATE-RECIPIENT",
    correlationId: "PRIVATE-KEY",
    diagnostic: {
      ...registered,
      message: "PRIVATE-NESTED-MESSAGE",
      cause: { token: "PRIVATE-TOKEN" },
      unknown: "PRIVATE",
    },
  };
  const original = structuredClone(f.state.submission);
  const projected = workspace.project(f.state.submission).metadata
    .outcomeDelivery;
  assert.deepEqual(projected, {
    status: "PENDING",
    message: registered.message,
    diagnostic: registered,
  });
  assert(!JSON.stringify(projected).includes("PRIVATE"));
  assert.deepEqual(f.state.submission, original);
});

test("unknown or malformed outcome diagnostics never expose source codes, messages or causes", () => {
  const f = fixture();
  for (const diagnostic of [
    { code: "ERR_EWASTE_OUTCOME_UNKNOWN_PRIVATE", stage: "DISPATCH" },
    { code: "ERR_UNKNOWN_PARTNER_DIAGNOSTIC", stage: "DISPATCH" },
    { code: "__proto__", stage: "DISPATCH" },
    { code: "ERR_EWASTE_OUTCOME_ADMISSION_REQUIRED", stage: "PRIVATE-STAGE" },
    null,
  ]) {
    f.state.submission.metadata.outcomeDelivery = {
      status: "PENDING",
      message: "PRIVATE",
      errorCode: "PRIVATE",
      diagnostic: diagnostic && {
        ...diagnostic,
        message: "PRIVATE",
        cause: "PRIVATE",
      },
    };
    assert.deepEqual(
      workspace.project(f.state.submission).metadata.outcomeDelivery,
      { status: "PENDING" },
    );
  }
});

test("generic Waste projection accepts a registered non-eWaste diagnostic without copying partner source text", () => {
  const f = fixture();
  SERVICE.DefaultStatusService.statusMap.ERR_PARTNER_DELIVERY_ADMISSION = {
    code: "403",
    message: "Partner delivery needs owner review.",
  };
  f.state.submission.metadata.outcomeDelivery = {
    status: "PENDING",
    message: "PRIVATE",
    diagnostic: {
      code: "ERR_PARTNER_DELIVERY_ADMISSION",
      stage: "ADMISSION",
      message: "PRIVATE",
      cause: "PRIVATE",
    },
  };
  const result = workspace.project(f.state.submission).metadata.outcomeDelivery;
  assert.equal(result.message, "Partner delivery needs owner review.");
  assert.equal(result.diagnostic.code, "ERR_PARTNER_DELIVERY_ADMISSION");
  assert(!JSON.stringify(result).includes("PRIVATE"));
});

test("safe canonical intent pointers survive projection while malformed delivery fields are omitted", () => {
  const f = fixture();
  f.state.submission.metadata.outcomeDelivery = {
    intentCode: "COMM_synthetic",
    status: "RETRY_PENDING",
    revision: 3,
    attempt: 2,
    nextAttemptAt: new Date("2026-10-13T12:00:00.000Z"),
    renderedContent: "PRIVATE",
  };
  assert.deepEqual(
    workspace.project(f.state.submission).metadata.outcomeDelivery,
    {
      intentCode: "COMM_synthetic",
      status: "RETRY_PENDING",
      revision: 3,
      attempt: 2,
      nextAttemptAt: "2026-10-13T12:00:00.000Z",
    },
  );
  f.state.submission.metadata.outcomeDelivery = {
    status: "DELIVERED",
    intentCode: { value: "PRIVATE" },
    revision: -1,
    attempt: "PRIVATE",
    nextAttemptAt: "PRIVATE",
  };
  assert.deepEqual(
    workspace.project(f.state.submission).metadata.outcomeDelivery,
    { status: "DELIVERED" },
  );
  f.state.submission.metadata.outcomeDelivery.status = "PRIVATE";
  assert.equal(
    workspace.project(f.state.submission).metadata.outcomeDelivery,
    undefined,
  );
});

function communication(f, qualified) {
  const runtime = require("../../../../../../nodics.communication/modules/commsCore/src/service/defaultCommunicationRuntimeService");
  const core = require("../../../../../../nodics.communication/modules/commsCore/src/service/defaultCommunicationCoreService");
  const controller = require("../../../../../../nodics.communication/modules/commsApi/src/controller/defaultCommunicationApiController");
  const facade = require("../../../../../../nodics.communication/modules/commsApi/src/facade/defaultCommunicationApiFacade");
  const route =
    require("../../../../../../nodics.communication/modules/commsApi/src/router/routers")
      .commsApi.internal.requestCommunication;
  const db = new Map();
  f.config.log.requestPrivacy.qualified = qualified;
  f.config.eWaste.outcomeCommunication = {
    enabled: true,
    connectionName: "engagement",
    templateCode: "outcome",
  };
  f.config.communication = {
    ...require("../../../../../../nodics.communication/modules/commsCore/config/properties")
      .communication,
    trustedSourceModules: ["eWaste"],
    templates: {
      outcome: {
        code: "outcome",
        version: 1,
        status: "ACTIVE",
        purpose: "WASTE_REVIEW_OUTCOME",
        channels: ["IN_APP"],
        sourceModules: ["eWaste"],
        declaredVariables: ["submissionCode", "status", "comment"],
        bodyTemplate: "{{comment}}",
      },
    },
  };
  Object.assign(SERVICE, {
    DefaultCommunicationRuntimeService: runtime,
    DefaultCommunicationCoreService: core,
  });
  global.FACADE = { DefaultCommunicationApiFacade: facade };
  for (const schema of [
    "CommsIntent",
    "CommsDeliveryAttempt",
    "CommsInboxMessage",
    "CommsSuppression",
  ]) {
    const rows = new Map();
    db.set(schema, rows);
    SERVICE["Default" + schema + "Service"] = {
      get: async ({ query }) => ({
        code: "SUC_GET_00000",
        result: [...rows.values()]
          .filter((row) =>
            Object.entries(query).every(([key, value]) => row[key] === value),
          )
          .map((row) => structuredClone(row)),
      }),
      save: async ({ model }) => {
        if (rows.has(model.code)) throw Error("duplicate");
        rows.set(model.code, { ...structuredClone(model), revision: 1 });
        return { code: "SUC_SAVE_00000" };
      },
      update: async ({ query, model }) => {
        const row = rows.get(query.code);
        assert.equal(row.revision, query.revision);
        Object.assign(row, structuredClone(model), {
          revision: row.revision + 1,
        });
        return { code: "SUC_UPDATE_00000", result: { matchedCount: 1 } };
      },
    };
  }
  f.experience.remote = async (_r, _m, _c, _p, _v, body) => {
    const http = { body, params: {}, headers: {} };
    return logger.runRequestPrivacy(http, async () => {
      logger.resolveRequestPrivacy(http, true);
      logger.admitPrivateRoute(http);
      const request = {
        tenant: "tenant-a",
        authData: {
          tenant: "tenant-a",
          entCode: "enterprise-a",
          principalType: "service",
          tokenType: "service",
          serviceId: "waste-runtime",
          modules: ["commsApi", "eWaste"],
          permissions: ["communication.request"],
        },
        httpRequest: http,
        router: route,
      };
      logger.inheritRequestPrivacy(request, http);
      return (await controller.requestCommunication(request)).data;
    });
  };
  return db;
}

test("real private admission, facade, durable runtime and rendering deliver one synthetic IN_APP outcome without external providers", async () => {
  const f = fixture(),
    db = communication(f, true);
  const result = await notify.notify(f.request, f.state.submission);
  assert.equal(result.metadata.outcomeDelivery.status, "DELIVERED");
  assert.equal(result.metadata.outcomeDelivery.diagnostic, undefined);
  assert.equal(db.get("CommsIntent").size, 1);
  assert.equal(db.get("CommsInboxMessage").size, 1);
  await notify.notify(f.request, result);
  assert.equal(db.get("CommsIntent").size, 1);
});

test("real unqualified private controller returns registered admission diagnostic with no intent or invented owner status", async () => {
  const f = fixture(),
    db = communication(f, false);
  const result = await notify.notify(f.request, f.state.submission);
  assert.equal(db.get("CommsIntent").size, 0);
  assert.equal(result.metadata.outcomeDelivery.intentCode, undefined);
  assert.equal(result.metadata.outcomeDelivery.status, "PENDING");
  assert.equal(
    result.metadata.outcomeDelivery.diagnostic.code,
    "ERR_EWASTE_OUTCOME_ADMISSION_REQUIRED",
  );
  assert.equal(result.metadata.outcomeDelivery.diagnostic.stage, "ADMISSION");
});

test("failed/malformed owner acknowledgements expose only fixed diagnostics, never error messages", async () => {
  for (const code of ["ERR_COMMS_INTEGRATION_STORAGE", "UNKNOWN", null]) {
    const f = fixture();
    f.config.eWaste.outcomeCommunication = { enabled: true };
    f.experience.remote = async () => {
      if (code)
        throw Object.assign(Error("PRIVATE"), { code, causes: ["PRIVATE"] });
      return {};
    };
    const result = await notify.notify(f.request, f.state.submission);
    assert.equal(result.metadata.outcomeDelivery.intentCode, undefined);
    assert(!JSON.stringify(result).includes("PRIVATE"));
    assert.equal(
      result.metadata.outcomeDelivery.diagnostic.code,
      code === null
        ? "ERR_EWASTE_OUTCOME_ACKNOWLEDGEMENT_UNCONFIRMED"
        : code === "UNKNOWN"
          ? "ERR_EWASTE_OUTCOME_DISPATCH_UNCONFIRMED"
          : "ERR_EWASTE_OUTCOME_STORAGE_UNCONFIRMED",
    );
  }
});
